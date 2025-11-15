# Advanced NixOS Configuration for Nixite
# Includes reverse proxy, SSL, monitoring, and advanced features

{ config, pkgs, lib, ... }:

{
  # Import the Nixite module
  imports = [ ./nixos-module.nix ];

  # Enable Nixite with advanced options
  services.nixite = {
    enable = true;
    port = 8000;
    bridgePort = 8890;
    user = "nixite";
    group = "nixite";
    dataDir = "/var/lib/nixite";
    enableAI = true;
    enableVoiceInput = true;
    enableInstallManager = true;

    # Don't open firewall - we'll use nginx reverse proxy
    openFirewall = false;
  };

  # Ollama service for AI features
  services.ollama = {
    enable = true;
    acceleration = "cuda";  # Use "rocm" for AMD GPUs, or null for CPU
    models = [ "gemma:2b" ];

    # Resource limits
    environment = {
      OLLAMA_NUM_PARALLEL = "2";
      OLLAMA_MAX_LOADED_MODELS = "1";
    };
  };

  # Nginx reverse proxy with SSL
  services.nginx = {
    enable = true;
    recommendedProxySettings = true;
    recommendedTlsSettings = true;
    recommendedOptimisation = true;
    recommendedGzipSettings = true;

    virtualHosts."nixite.example.com" = {
      # SSL with Let's Encrypt
      enableACME = true;
      forceSSL = true;

      # Rate limiting
      extraConfig = ''
        limit_req_zone $binary_remote_addr zone=nixite_limit:10m rate=10r/s;
        limit_req zone=nixite_limit burst=20 nodelay;
      '';

      locations."/" = {
        proxyPass = "http://127.0.0.1:8000";
        proxyWebsockets = true;

        extraConfig = ''
          # Security headers
          add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
          add_header X-Frame-Options "SAMEORIGIN" always;
          add_header X-Content-Type-Options "nosniff" always;
          add_header X-XSS-Protection "1; mode=block" always;
          add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;

          # Caching for static assets
          location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
          }
        '';
      };

      locations."/api/bridge" = {
        proxyPass = "http://127.0.0.1:8890";
        proxyWebsockets = true;

        extraConfig = ''
          # Longer timeout for AI operations
          proxy_read_timeout 60s;
          proxy_send_timeout 60s;
        '';
      };

      # Health check endpoint
      locations."/health" = {
        extraConfig = ''
          access_log off;
          return 200 "OK\n";
          add_header Content-Type text/plain;
        '';
      };
    };
  };

  # ACME (Let's Encrypt) configuration
  security.acme = {
    acceptTerms = true;
    defaults.email = "admin@example.com";
  };

  # Firewall - only allow HTTP/HTTPS
  networking.firewall = {
    enable = true;
    allowedTCPPorts = [ 80 443 ];
  };

  # Automatic updates for Nixite
  systemd.services.nixite-updater = {
    description = "Update Nixite package data";

    serviceConfig = {
      Type = "oneshot";
      User = "nixite";
      Group = "nixite";
    };

    script = ''
      cd /var/lib/nixite
      # Update logic here (e.g., pull from git, update package data)
    '';
  };

  systemd.timers.nixite-updater = {
    description = "Update Nixite package data daily";
    wantedBy = [ "timers.target" ];

    timerConfig = {
      OnCalendar = "daily";
      Persistent = true;
    };
  };

  # Monitoring with Prometheus
  services.prometheus = {
    enable = true;

    scrapeConfigs = [
      {
        job_name = "nixite";
        static_configs = [{
          targets = [
            "127.0.0.1:8000"
            "127.0.0.1:8890"
          ];
        }];
      }
    ];
  };

  # Logging with journalbeat (optional)
  systemd.services.nixite-web.serviceConfig = {
    StandardOutput = "journal";
    StandardError = "journal";
    SyslogIdentifier = "nixite-web";
  };

  systemd.services.nixite-bridge.serviceConfig = {
    StandardOutput = "journal";
    StandardError = "journal";
    SyslogIdentifier = "nixite-bridge";
  };

  # Backup configuration
  services.restic.backups.nixite = {
    paths = [ "/var/lib/nixite" ];
    repository = "/backup/nixite";
    passwordFile = "/etc/nixos/secrets/restic-password";

    timerConfig = {
      OnCalendar = "daily";
    };
  };

  # Additional security: AppArmor profiles
  security.apparmor.enable = true;

  # Fail2ban for additional protection
  services.fail2ban = {
    enable = true;

    jails.nixite = ''
      enabled = true
      filter = nixite
      logpath = /var/log/nginx/access.log
      maxretry = 10
      findtime = 600
      bantime = 3600
    '';
  };

  # System packages for management
  environment.systemPackages = with pkgs; [
    htop
    iotop
    nethogs
    ncdu
    jq
    curl
    wget
  ];

  # Optional: Grafana for visualization
  services.grafana = {
    enable = true;
    settings = {
      server = {
        http_addr = "127.0.0.1";
        http_port = 3000;
      };
    };
  };

  # Add Grafana to nginx
  services.nginx.virtualHosts."grafana.example.com" = {
    enableACME = true;
    forceSSL = true;

    locations."/" = {
      proxyPass = "http://127.0.0.1:3000";
      proxyWebsockets = true;
    };
  };
}
