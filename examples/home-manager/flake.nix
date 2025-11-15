{
  description = "NixOS configuration with Home Manager - Packages discovered via Nixite";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    home-manager = {
      url = "github:nix-community/home-manager";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, home-manager }: {
    nixosConfigurations = {
      # Replace with your hostname
      my-machine = nixpkgs.lib.nixosSystem {
        system = "x86_64-linux";
        modules = [
          # Your system configuration
          ./configuration.nix

          # Home Manager module
          home-manager.nixosModules.home-manager
          {
            home-manager.useGlobalPkgs = true;
            home-manager.useUserPackages = true;

            # Import user configurations
            home-manager.users.youruser = import ./home.nix;

            # Optionally, use home-manager.extraSpecialArgs to pass arguments
            # home-manager.extraSpecialArgs = { inherit inputs; };
          }
        ];
      };
    };
  };
}
