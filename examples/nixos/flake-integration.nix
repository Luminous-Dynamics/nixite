# Nixite Flake Integration Example
# For use with NixOS Flakes-based configurations

{
  description = "Nixite - Visual Package Discovery for NixOS";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        # Development shell
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            python3
            ollama
            jq
            curl
          ];

          shellHook = ''
            echo "Nixite Development Environment"
            echo "Node.js version: $(node --version)"
            echo "Python version: $(python3 --version)"
            echo ""
            echo "Quick start:"
            echo "  ./scripts/dev.sh setup"
            echo "  ./scripts/dev.sh start"
          '';
        };

        # Nixite package
        packages.default = pkgs.stdenv.mkDerivation {
          pname = "nixite";
          version = "2.1.0";

          src = ./.;

          buildInputs = with pkgs; [
            nodejs
            python3
          ];

          installPhase = ''
            mkdir -p $out/{bin,share/nixite}

            # Copy application files
            cp -r * $out/share/nixite/

            # Create wrapper scripts
            cat > $out/bin/nixite-web <<EOF
            #!${pkgs.bash}/bin/bash
            cd $out/share/nixite
            exec ${pkgs.python3}/bin/python3 -m http.server 8000
            EOF

            cat > $out/bin/nixite-bridge <<EOF
            #!${pkgs.bash}/bin/bash
            cd $out/share/nixite
            exec ${pkgs.nodejs}/bin/node nixite-luminous-bridge.js
            EOF

            chmod +x $out/bin/*
          '';

          meta = with pkgs.lib; {
            description = "Visual Package Discovery for NixOS";
            homepage = "https://github.com/Luminous-Dynamics/nixite";
            license = licenses.mit;
            maintainers = with maintainers; [ ];
            platforms = platforms.all;
          };
        };

        # NixOS module
        nixosModules.default = { config, lib, pkgs, ... }:
          with lib;
          let
            cfg = config.services.nixite;
          in
          {
            options.services.nixite = {
              enable = mkEnableOption "Nixite visual package discovery";

              port = mkOption {
                type = types.port;
                default = 8000;
                description = "Port for web interface";
              };

              bridgePort = mkOption {
                type = types.port;
                default = 8890;
                description = "Port for AI Bridge";
              };

              dataDir = mkOption {
                type = types.path;
                default = "/var/lib/nixite";
                description = "Data directory for Nixite";
              };

              user = mkOption {
                type = types.str;
                default = "nixite";
                description = "User to run Nixite as";
              };

              group = mkOption {
                type = types.str;
                default = "nixite";
                description = "Group for Nixite user";
              };

              enableAIBridge = mkOption {
                type = types.bool;
                default = true;
                description = "Enable AI Bridge (requires Ollama)";
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
                home = cfg.dataDir;
                createHome = true;
                description = "Nixite service user";
              };

              users.groups.${cfg.group} = {};

              # Install package
              environment.systemPackages = [ self.packages.${system}.default ];

              # Systemd services
              systemd.services.nixite-web = {
                description = "Nixite Web Server";
                after = [ "network.target" ];
                wantedBy = [ "multi-user.target" ];

                serviceConfig = {
                  Type = "simple";
                  User = cfg.user;
                  Group = cfg.group;
                  WorkingDirectory = "${self.packages.${system}.default}/share/nixite";
                  ExecStart = "${pkgs.python3}/bin/python3 -m http.server ${toString cfg.port}";
                  Restart = "on-failure";
                  RestartSec = "10s";

                  # Security hardening
                  NoNewPrivileges = true;
                  PrivateTmp = true;
                  ProtectSystem = "strict";
                  ProtectHome = true;
                  ReadWritePaths = [ cfg.dataDir ];
                };
              };

              systemd.services.nixite-bridge = mkIf cfg.enableAIBridge {
                description = "Nixite AI Bridge";
                after = [ "network.target" "ollama.service" ];
                wants = [ "ollama.service" ];
                wantedBy = [ "multi-user.target" ];

                serviceConfig = {
                  Type = "simple";
                  User = cfg.user;
                  Group = cfg.group;
                  WorkingDirectory = "${self.packages.${system}.default}/share/nixite";
                  ExecStart = "${pkgs.nodejs}/bin/node nixite-luminous-bridge.js";
                  Restart = "on-failure";
                  RestartSec = "10s";

                  # Environment
                  Environment = [
                    "PORT=${toString cfg.bridgePort}"
                    "NODE_ENV=production"
                  ];

                  # Security hardening
                  NoNewPrivileges = true;
                  PrivateTmp = true;
                  ProtectSystem = "strict";
                  ProtectHome = true;
                  ReadWritePaths = [ cfg.dataDir ];
                };
              };

              # Firewall
              networking.firewall.allowedTCPPorts = mkIf cfg.openFirewall [
                cfg.port
                cfg.bridgePort
              ];
            };
          };
      }
    );
}
