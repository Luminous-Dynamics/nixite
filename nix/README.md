# Nixite NixOS Integration

This directory contains files for native NixOS integration.

## Installation Methods

### Method 1: NixOS Module (Recommended)

Add to your `configuration.nix`:

```nix
{ config, pkgs, ... }:

{
  imports = [
    /path/to/nixite/nix/module.nix
  ];

  services.nixite = {
    enable = true;
    webPort = 8000;
    enableBridge = true;  # Optional: Enable AI features
    bridgePort = 8890;
    openFirewall = true;  # Allow network access
  };
}
```

Then rebuild:
```bash
sudo nixos-rebuild switch
```

Access at: http://localhost:8000

### Method 2: Nix Flakes

Add to your `flake.nix`:

```nix
{
  inputs = {
    nixite.url = "github:Luminous-Dynamics/nixite";
  };

  outputs = { self, nixpkgs, nixite }: {
    nixosConfigurations.yourhostname = nixpkgs.lib.nixosSystem {
      modules = [
        nixite.nixosModules.default
        {
          services.nixite.enable = true;
        }
      ];
    };
  };
}
```

### Method 3: Nix Package

Install directly:

```bash
nix-env -iA nixpkgs.nixite
```

Or with flakes:

```bash
nix profile install github:Luminous-Dynamics/nixite
```

Run:

```bash
nixite
```

### Method 4: Development Shell

Enter development environment:

```bash
nix develop github:Luminous-Dynamics/nixite
```

Or locally:

```bash
cd nixite
nix develop
```

## Configuration Options

### services.nixite.enable
- **Type**: boolean
- **Default**: false
- **Description**: Enable the Nixite service

### services.nixite.webPort
- **Type**: port number
- **Default**: 8000
- **Description**: Port for web interface

### services.nixite.bridgePort
- **Type**: port number
- **Default**: 8890
- **Description**: Port for AI bridge

### services.nixite.enableBridge
- **Type**: boolean
- **Default**: false
- **Description**: Enable AI-powered features

### services.nixite.host
- **Type**: string
- **Default**: "localhost"
- **Description**: Bind address (use "0.0.0.0" for network access)

### services.nixite.openFirewall
- **Type**: boolean
- **Default**: false
- **Description**: Automatically open firewall ports

### services.nixite.user
- **Type**: string
- **Default**: "nixite"
- **Description**: User to run service as

### services.nixite.dataDir
- **Type**: path
- **Default**: "/var/lib/nixite"
- **Description**: Data directory

## Examples

### Basic Setup

```nix
services.nixite = {
  enable = true;
};
```

### With AI Features

```nix
services.nixite = {
  enable = true;
  enableBridge = true;
  openFirewall = true;
};
```

### Network Access

```nix
services.nixite = {
  enable = true;
  host = "0.0.0.0";
  openFirewall = true;
};
```

### Custom Ports

```nix
services.nixite = {
  enable = true;
  webPort = 3000;
  bridgePort = 3001;
};
```

## Service Management

### Start/Stop Service

```bash
sudo systemctl start nixite-web
sudo systemctl stop nixite-web

# For AI bridge
sudo systemctl start nixite-bridge
sudo systemctl stop nixite-bridge
```

### Check Status

```bash
systemctl status nixite-web
systemctl status nixite-bridge
```

### View Logs

```bash
journalctl -u nixite-web -f
journalctl -u nixite-bridge -f
```

### Enable/Disable

```bash
sudo systemctl enable nixite-web
sudo systemctl disable nixite-web
```

## Troubleshooting

### Port Already in Use

Change the port in your configuration:

```nix
services.nixite.webPort = 8001;
```

### Permission Denied

Ensure the nixite user has proper permissions:

```bash
sudo chown -R nixite:nixite /var/lib/nixite
```

### Service Won't Start

Check logs:

```bash
journalctl -u nixite-web -n 50
```

### Firewall Issues

Manually open port:

```bash
sudo firewall-cmd --add-port=8000/tcp --permanent
sudo firewall-cmd --reload
```

Or in configuration.nix:

```nix
networking.firewall.allowedTCPPorts = [ 8000 ];
```

## Security Considerations

The NixOS module includes security hardening:
- Runs as unprivileged user
- Filesystem isolation (ProtectSystem, ProtectHome)
- No new privileges
- Private tmp directory
- Resource limits (CPU, memory)

For production use:
1. Use HTTPS with a reverse proxy (nginx, caddy)
2. Set `host = "localhost"` and use proxy
3. Enable firewall with `openFirewall = true` only if needed
4. Regularly update to latest version

## Development

To test module locally:

```bash
cd nixite/nix
nix-build -E 'with import <nixpkgs> {}; callPackage ./package.nix {}'
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on improving the NixOS integration.
