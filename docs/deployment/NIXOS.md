# NixOS Native Deployment

Deploy Nixite natively on NixOS using the included module.

## Quick Start

### Method 1: NixOS Module (Recommended)

Add to your `/etc/nixos/configuration.nix`:

```nix
{ config, pkgs, ... }:

{
  imports = [
    /path/to/nixite/nix/module.nix
  ];

  services.nixite = {
    enable = true;
    webPort = 8000;
    openFirewall = true;
  };
}
```

Rebuild:
```bash
sudo nixos-rebuild switch
```

### Method 2: With AI Bridge

Enable AI-powered features:

```nix
services.nixite = {
  enable = true;
  enableBridge = true;
  webPort = 8000;
  bridgePort = 8890;
  openFirewall = true;
};
```

### Method 3: Network Access

Allow access from other machines:

```nix
services.nixite = {
  enable = true;
  host = "0.0.0.0";  # Bind to all interfaces
  openFirewall = true;
};
```

## Configuration Options

### Basic Configuration

```nix
services.nixite = {
  # Enable the service
  enable = true;

  # Network settings
  webPort = 8000;
  bridgePort = 8890;
  host = "localhost";  # or "0.0.0.0" for network access

  # Features
  enableBridge = false;  # Enable AI features

  # Firewall
  openFirewall = false;  # Auto-open ports

  # Service user
  user = "nixite";
  group = "nixite";

  # Data directory
  dataDir = "/var/lib/nixite";
};
```

### Production Configuration

```nix
services.nixite = {
  enable = true;
  host = "127.0.0.1";  # Only localhost
  webPort = 8000;
  enableBridge = true;
  bridgePort = 8890;

  # Don't open firewall (use reverse proxy)
  openFirewall = false;
};

# Use nginx as reverse proxy
services.nginx = {
  enable = true;
  virtualHosts."nixite.example.com" = {
    enableACME = true;
    forceSSL = true;
    locations."/" = {
      proxyPass = "http://127.0.0.1:8000";
      proxyWebsockets = true;
    };
  };
};

# Enable ACME for SSL
security.acme = {
  acceptTerms = true;
  defaults.email = "admin@example.com";
};
```

### Multiple Instances

Run multiple Nixite instances:

```nix
services.nixite = {
  enable = true;
  webPort = 8000;
};

# Second instance (custom config)
systemd.services.nixite-dev = {
  description = "Nixite Development Instance";
  wantedBy = [ "multi-user.target" ];
  serviceConfig = {
    ExecStart = "${pkgs.python3}/bin/python3 -m http.server 8001 --bind localhost";
    WorkingDirectory = "/home/user/nixite-dev";
    User = "user";
  };
};
```

## Service Management

### Check Status

```bash
systemctl status nixite-web
systemctl status nixite-bridge  # If AI bridge enabled
```

### View Logs

```bash
journalctl -u nixite-web -f
journalctl -u nixite-bridge -f
```

### Restart Service

```bash
sudo systemctl restart nixite-web
```

### Enable/Disable

```bash
sudo systemctl enable nixite-web
sudo systemctl disable nixite-web
```

## Firewall Configuration

### Manual Firewall Rules

If not using `openFirewall = true`:

```nix
networking.firewall = {
  allowedTCPPorts = [ 8000 ];  # Web interface
  # allowedTCPPorts = [ 8000 8890 ];  # With AI bridge
};
```

### Firewall Zones

For more complex setups:

```nix
networking.firewall = {
  interfaces = {
    "eth0" = {
      allowedTCPPorts = [ 8000 ];
    };
  };
};
```

## Security Hardening

The NixOS module includes security hardening by default:

```nix
serviceConfig = {
  NoNewPrivileges = true;
  PrivateTmp = true;
  ProtectSystem = "strict";
  ProtectHome = true;
  ReadWritePaths = [ dataDir ];
  MemoryLimit = "512M";
  CPUQuota = "50%";
};
```

### Additional Hardening

Add extra security measures:

```nix
services.nixite = {
  enable = true;
  # ... other config ...
};

# Additional systemd hardening
systemd.services.nixite-web.serviceConfig = {
  PrivateNetwork = false;
  RestrictAddressFamilies = [ "AF_INET" "AF_INET6" ];
  SystemCallFilter = "@system-service";
  ProtectKernelTunables = true;
  ProtectControlGroups = true;
};
```

## Reverse Proxy Setup

### With nginx

```nix
services.nginx = {
  enable = true;
  recommendedProxySettings = true;
  recommendedTlsSettings = true;
  recommendedOptimisation = true;
  recommendedGzipSettings = true;

  virtualHosts."nixite.example.com" = {
    enableACME = true;
    forceSSL = true;
    locations."/" = {
      proxyPass = "http://127.0.0.1:8000";
      extraConfig = ''
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
      '';
    };
  };
};
```

### With Caddy

```nix
services.caddy = {
  enable = true;
  virtualHosts."nixite.example.com" = {
    extraConfig = ''
      reverse_proxy localhost:8000
    '';
  };
};
```

## Upgrading

### Update Configuration

Edit `/etc/nixos/configuration.nix` and rebuild:

```bash
sudo nixos-rebuild switch
```

### Update Nixite Package

```nix
services.nixite = {
  enable = true;
  package = pkgs.callPackage /path/to/new/nixite {};
};
```

## Troubleshooting

### Service Won't Start

Check logs:
```bash
journalctl -u nixite-web -n 50
```

### Port Already in Use

Change the port:
```nix
services.nixite.webPort = 8001;
```

### Permission Denied

Check data directory permissions:
```bash
sudo ls -la /var/lib/nixite
sudo chown -R nixite:nixite /var/lib/nixite
```

### Firewall Blocking

Verify firewall rules:
```bash
sudo iptables -L -n | grep 8000
```

## Development Setup

For development on NixOS:

```nix
{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    python3
    nodejs
    git
  ];

  shellHook = ''
    echo "Nixite Development Environment"
    export NIXITE_DEV=1
  '';
}
```

Use with:
```bash
nix-shell
./start.sh
```

## Best Practices

1. **Use the module** for consistent configuration
2. **Enable the firewall** with specific ports
3. **Use reverse proxy** for SSL/TLS
4. **Monitor logs** regularly
5. **Keep NixOS updated** for security patches
6. **Backup configuration** regularly

## Examples

### Home Server

```nix
services.nixite = {
  enable = true;
  host = "0.0.0.0";
  openFirewall = true;
};
```

### Production Server

```nix
services.nixite = {
  enable = true;
  host = "127.0.0.1";
  enableBridge = true;
  openFirewall = false;
};

services.nginx.virtualHosts."nixite.company.com" = {
  enableACME = true;
  forceSSL = true;
  locations."/".proxyPass = "http://127.0.0.1:8000";
};
```

### Development Machine

```nix
services.nixite = {
  enable = true;
  webPort = 8000;
  enableBridge = true;
  bridgePort = 8890;
};
```

## Next Steps

- [Reverse Proxy Setup](./REVERSE_PROXY.md)
- [Monitoring](../operations/MONITORING.md)
- [Backup Procedures](../operations/BACKUP.md)

---

**Questions?** See [Troubleshooting](./TROUBLESHOOTING.md) or check the [NixOS manual](https://nixos.org/manual/nixos/stable/).
