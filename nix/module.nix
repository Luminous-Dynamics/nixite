# NixOS Module for Nixite
# Add this to your configuration.nix or import it as a module

{ config, lib, pkgs, ... }:

with lib;

let
  cfg = config.services.nixite;
in

{
  options.services.nixite = {
    enable = mkEnableOption "Nixite - Visual Package Discovery for NixOS";

    package = mkOption {
      type = types.package;
      default = pkgs.callPackage ./package.nix {};
      description = "The Nixite package to use";
    };

    webPort = mkOption {
      type = types.port;
      default = 8000;
      description = "Port for the web interface";
    };

    bridgePort = mkOption {
      type = types.port;
      default = 8890;
      description = "Port for the AI bridge";
    };

    enableBridge = mkOption {
      type = types.bool;
      default = false;
      description = "Enable AI-powered bridge (requires Node.js)";
    };

    host = mkOption {
      type = types.str;
      default = "localhost";
      description = "Host to bind to (use 0.0.0.0 for network access)";
    };

    user = mkOption {
      type = types.str;
      default = "nixite";
      description = "User to run Nixite as";
    };

    group = mkOption {
      type = types.str;
      default = "nixite";
      description = "Group to run Nixite as";
    };

    dataDir = mkOption {
      type = types.path;
      default = "/var/lib/nixite";
      description = "Directory for Nixite data";
    };

    openFirewall = mkOption {
      type = types.bool;
      default = false;
      description = "Open firewall ports for Nixite";
    };
  };

  config = mkIf cfg.enable {
    # Create user and group
    users.users.${cfg.user} = {
      isSystemUser = true;
      group = cfg.group;
      description = "Nixite service user";
      home = cfg.dataDir;
      createHome = true;
    };

    users.groups.${cfg.group} = {};

    # Systemd service for web interface
    systemd.services.nixite-web = {
      description = "Nixite Web Interface";
      wantedBy = [ "multi-user.target" ];
      after = [ "network.target" ];

      serviceConfig = {
        Type = "simple";
        User = cfg.user;
        Group = cfg.group;
        WorkingDirectory = "${cfg.package}/share/nixite";

        ExecStart = "${pkgs.python3}/bin/python3 -m http.server ${toString cfg.webPort} --bind ${cfg.host}";

        Restart = "on-failure";
        RestartSec = "10s";

        # Security hardening
        NoNewPrivileges = true;
        PrivateTmp = true;
        ProtectSystem = "strict";
        ProtectHome = true;
        ReadWritePaths = [ cfg.dataDir ];

        # Resource limits
        MemoryLimit = "512M";
        CPUQuota = "50%";
      };
    };

    # Systemd service for AI bridge (optional)
    systemd.services.nixite-bridge = mkIf cfg.enableBridge {
      description = "Nixite AI Bridge";
      wantedBy = [ "multi-user.target" ];
      after = [ "network.target" "nixite-web.service" ];
      requires = [ "nixite-web.service" ];

      serviceConfig = {
        Type = "simple";
        User = cfg.user;
        Group = cfg.group;
        WorkingDirectory = "${cfg.package}/share/nixite";

        ExecStart = "${pkgs.nodejs}/bin/node ${cfg.package}/share/nixite/nixite-luminous-bridge.js";

        Environment = [
          "NODE_ENV=production"
          "BRIDGE_PORT=${toString cfg.bridgePort}"
        ];

        Restart = "on-failure";
        RestartSec = "10s";

        # Security hardening
        NoNewPrivileges = true;
        PrivateTmp = true;
        ProtectSystem = "strict";
        ProtectHome = true;
        ReadWritePaths = [ cfg.dataDir ];

        # Resource limits
        MemoryLimit = "1G";
        CPUQuota = "75%";
      };
    };

    # Firewall configuration
    networking.firewall = mkIf cfg.openFirewall {
      allowedTCPPorts = [ cfg.webPort ] ++ optional cfg.enableBridge cfg.bridgePort;
    };

    # Environment packages (optional - adds nixite CLI tools)
    environment.systemPackages = [ cfg.package ];
  };
}
