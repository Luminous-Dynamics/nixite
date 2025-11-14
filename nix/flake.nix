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
        nixite = pkgs.callPackage ./package.nix {};
      in
      {
        packages = {
          default = nixite;
          nixite = nixite;
        };

        apps = {
          default = {
            type = "app";
            program = "${nixite}/bin/nixite";
          };
        };

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            python3
            nodejs
            nodePackages.npm
          ];

          shellHook = ''
            echo "🚀 Nixite Development Environment"
            echo "================================"
            echo "Run './start.sh' to start Nixite"
            echo "Run 'nix build' to build the package"
            echo "Run 'nix run' to run Nixite"
          '';
        };
      }
    ) // {
      nixosModules.default = import ./module.nix;
      nixosModules.nixite = import ./module.nix;
    };
}
