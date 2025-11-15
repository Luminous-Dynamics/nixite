# NixOS Deployment Examples

This directory contains various NixOS configuration examples for deploying Nixite.

## Table of Contents

- [Basic Module](#basic-module)
- [Flake Integration](#flake-integration)
- [Advanced Configuration](#advanced-configuration)
- [Quick Start](#quick-start)
- [Configuration Options](#configuration-options)
- [Security Hardening](#security-hardening)

## Basic Module

### `nixos-module.nix`

Basic NixOS module located in the project root. Use this for simple deployments.

**Usage:**

```nix
# /etc/nixos/configuration.nix
{ config, pkgs, ... }:

{
  imports = [
    /path/to/nixite/nixos-module.nix
  ];

  services.nixite = {
    enable = true;
    port = 8000;
    bridgePort = 8890;
  };
}
```

**Apply configuration:**

```bash
sudo nixos-rebuild switch
```

## Flake Integration

### `flake-integration.nix`

Use Nixite with NixOS Flakes for reproducible deployments.

**Features:**
- Flake-based configuration
- Development shell included
- Nixite as a package
- NixOS module with options
- Systemd service integration

**Setup:**

1. **Enable flakes in your system:**

```nix
# /etc/nixos/configuration.nix
{ config, pkgs, ... }:

{
  nix.settings.experimental-features = [ "nix-command" "flakes" ];
}
```

2. **Create flake configuration:**

```nix
# /etc/nixos/flake.nix
{
  description = "My NixOS Configuration";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixite.url = "github:Luminous-Dynamics/nixite";
  };

  outputs = { self, nixpkgs, nixite }: {
    nixosConfigurations.myhost = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        ./configuration.nix
        nixite.nixosModules.default
      ];
    };
  };
}
```

3. **Configure Nixite in your configuration.nix:**

```nix
# /etc/nixos/configuration.nix
{ config, pkgs, ... }:

{
  services.nixite = {
    enable = true;
    port = 8000;
    bridgePort = 8890;
    enableAIBridge = true;
    openFirewall = true;
  };
}
```

4. **Rebuild system:**

```bash
sudo nixos-rebuild switch --flake /etc/nixos#myhost
```

## Advanced Configuration

### `advanced-config.nix`

Production-ready configuration with:
- Nginx reverse proxy
- SSL/TLS with Let's Encrypt
- Ollama integration for AI features
- Monitoring with Prometheus
- Automatic updates
- Backup configuration
- Security hardening (AppArmor, Fail2ban)
- Grafana for visualization

**Features:**

1. **Reverse Proxy:**
   - Nginx with SSL termination
   - Let's Encrypt automatic SSL
   - Rate limiting
   - Security headers
   - Caching for static assets

2. **AI Integration:**
   - Ollama service
   - GPU acceleration support
   - Resource limits

3. **Monitoring:**
   - Prometheus metrics
   - Grafana dashboards
   - Journald logging

4. **Security:**
   - AppArmor profiles
   - Fail2ban protection
   - Firewall configuration
   - Security headers

5. **Maintenance:**
   - Automatic updates
   - Backup with Restic
   - Log rotation

**Usage:**

```nix
# /etc/nixos/configuration.nix
{ config, pkgs, lib, ... }:

{
  imports = [
    /path/to/nixite/examples/nixos/advanced-config.nix
  ];

  # Customize as needed
  services.nixite.port = 8000;
  security.acme.defaults.email = "your-email@example.com";
}
```

## Quick Start

### Method 1: Direct Import (Simplest)

```nix
# /etc/nixos/configuration.nix
{ config, pkgs, ... }:

{
  imports = [ /path/to/nixite/nixos-module.nix ];

  services.nixite = {
    enable = true;
    port = 8000;
  };
}
```

```bash
sudo nixos-rebuild switch
```

### Method 2: Flakes (Recommended)

```bash
# Add flake input
cd /etc/nixos
nix flake init
# Edit flake.nix to add nixite input

# Rebuild
sudo nixos-rebuild switch --flake .#
```

### Method 3: Local Package

```bash
# Clone repository
cd /opt
sudo git clone https://github.com/Luminous-Dynamics/nixite.git

# Import in configuration.nix
```

```nix
{ config, pkgs, ... }:

{
  imports = [ /opt/nixite/nixos-module.nix ];
  services.nixite.enable = true;
}
```

## Configuration Options

### Basic Options

```nix
services.nixite = {
  # Enable/disable service
  enable = true;

  # Network ports
  port = 8000;           # Web interface port
  bridgePort = 8890;     # AI Bridge port

  # File locations
  dataDir = "/var/lib/nixite";
  packageFile = "/var/lib/nixite/nixite-packages.json";

  # User/group
  user = "nixite";
  group = "nixite";

  # Firewall
  openFirewall = false;  # Set to true to auto-open ports
};
```

### Feature Flags

```nix
services.nixite = {
  # AI features
  enableAI = true;
  enableVoiceInput = true;

  # Package management
  enableInstallManager = true;

  # AI Bridge
  enableAIBridge = true;
};
```

### Advanced Options

```nix
services.nixite = {
  # Package sources
  packageSources = [
    "https://api.example.com/packages"
    "/local/path/to/packages.json"
  ];

  # Update interval
  updateInterval = "daily";

  # Resource limits
  maxMemory = "1G";
  maxCPU = "50%";

  # Environment variables
  environment = {
    NODE_ENV = "production";
    NIXITE_CACHE_TTL = "3600";
  };
};
```

## Security Hardening

### Minimal Permissions

```nix
systemd.services.nixite-web.serviceConfig = {
  # Security
  NoNewPrivileges = true;
  PrivateTmp = true;
  ProtectSystem = "strict";
  ProtectHome = true;
  ReadWritePaths = [ "/var/lib/nixite" ];

  # Resource limits
  MemoryLimit = "1G";
  CPUQuota = "50%";
  TasksMax = 100;
};
```

### Firewall Configuration

```nix
# Only allow nginx, block direct access
networking.firewall = {
  enable = true;
  allowedTCPPorts = [ 80 443 ];  # Only HTTP/HTTPS

  # Don't open Nixite ports directly
  # Access only through reverse proxy
};
```

### SSL/TLS

```nix
services.nginx.virtualHosts."nixite.example.com" = {
  # Automatic SSL with Let's Encrypt
  enableACME = true;
  forceSSL = true;

  # Security headers
  extraConfig = ''
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
  '';
};
```

### AppArmor Profile

```nix
security.apparmor = {
  enable = true;

  profiles = {
    nixite-web = {
      enforce = true;
      profile = ''
        /var/lib/nixite/** r,
        /var/lib/nixite/logs/** w,
      '';
    };
  };
};
```

## Monitoring

### Prometheus Metrics

```nix
services.prometheus = {
  enable = true;

  scrapeConfigs = [{
    job_name = "nixite";
    static_configs = [{
      targets = [ "127.0.0.1:8000" ];
    }];
  }];
};
```

### Grafana Dashboard

```nix
services.grafana = {
  enable = true;

  provision = {
    datasources = [{
      name = "Prometheus";
      type = "prometheus";
      url = "http://localhost:9090";
    }];
  };
};
```

### Log Monitoring

```bash
# View logs in real-time
journalctl -u nixite-web -f
journalctl -u nixite-bridge -f

# View recent errors
journalctl -u nixite-web -p err -n 50

# View logs for date range
journalctl -u nixite-web --since "2024-01-01" --until "2024-01-31"
```

## Backup and Recovery

### Automatic Backups

```nix
services.restic.backups.nixite = {
  paths = [ "/var/lib/nixite" ];
  repository = "/backup/nixite";
  passwordFile = "/etc/nixos/secrets/restic-password";

  timerConfig = {
    OnCalendar = "daily";
    Persistent = true;
  };

  pruneOpts = [
    "--keep-daily 7"
    "--keep-weekly 4"
    "--keep-monthly 6"
  ];
};
```

### Manual Backup

```bash
# Backup data directory
sudo tar -czf nixite-backup-$(date +%Y%m%d).tar.gz /var/lib/nixite

# Restore
sudo tar -xzf nixite-backup-20240115.tar.gz -C /
sudo systemctl restart nixite-web nixite-bridge
```

## Troubleshooting

### Service Not Starting

```bash
# Check service status
systemctl status nixite-web
systemctl status nixite-bridge

# View logs
journalctl -u nixite-web -n 100
journalctl -u nixite-bridge -n 100

# Test configuration
sudo nixos-rebuild test
```

### Port Conflicts

```bash
# Check what's using port 8000
sudo lsof -i :8000
sudo ss -tuln | grep 8000

# Change port in configuration
services.nixite.port = 8080;
```

### Permission Issues

```bash
# Check file ownership
ls -la /var/lib/nixite

# Fix permissions
sudo chown -R nixite:nixite /var/lib/nixite
sudo chmod 755 /var/lib/nixite
```

## Migration from Other Deployments

### From Docker to NixOS

1. Export Docker data:
```bash
docker cp nixite-web:/app/data ./nixite-data
```

2. Import to NixOS:
```bash
sudo cp -r ./nixite-data/* /var/lib/nixite/
sudo chown -R nixite:nixite /var/lib/nixite
```

3. Start NixOS service:
```bash
sudo nixos-rebuild switch
```

### From Manual Install to NixOS

1. Backup current installation:
```bash
tar -czf nixite-backup.tar.gz /opt/nixite
```

2. Configure NixOS module
3. Copy configuration:
```bash
sudo cp /opt/nixite/config.js /var/lib/nixite/
sudo cp /opt/nixite/nixite-packages.json /var/lib/nixite/
```

4. Start services:
```bash
sudo nixos-rebuild switch
```

## Best Practices

1. **Use Flakes** for reproducibility
2. **Enable SSL** with Let's Encrypt
3. **Use reverse proxy** (nginx/Caddy)
4. **Enable monitoring** (Prometheus + Grafana)
5. **Configure backups** (Restic)
6. **Harden security** (AppArmor, Fail2ban)
7. **Set resource limits** (memory, CPU)
8. **Use dedicated user** (don't run as root)
9. **Enable auto-updates** for package data
10. **Monitor logs** regularly

## Additional Resources

- [NixOS Manual](https://nixos.org/manual/nixos/stable/)
- [Nixite Documentation](../../docs/README.md)
- [Troubleshooting Guide](../../docs/TROUBLESHOOTING.md)
- [Security Best Practices](https://nixos.org/manual/nixos/stable/#sec-security)

---

**Need Help?**
- See [SUPPORT.md](../../SUPPORT.md)
- Open an issue on [GitHub](https://github.com/Luminous-Dynamics/nixite/issues)
- Check the [troubleshooting guide](../../docs/TROUBLESHOOTING.md)
