# Home Manager Integration with Nixite

Complete examples showing how to use Home Manager with packages discovered through Nixite.

## 📋 What is Home Manager?

Home Manager lets you manage your user environment using Nix. It's perfect for:
- Per-user package installation
- Dotfiles management
- Application configuration
- Consistent setup across machines

All packages in these examples were discovered and organized using **Nixite**! 🌟

## 🚀 Quick Start

### 1. Enable Flakes (if not already enabled)

```nix
# In your /etc/nixos/configuration.nix
{
  nix.settings.experimental-features = [ "nix-command" "flakes" ];
}
```

### 2. Initialize Your Configuration

```bash
# Create a directory for your config
mkdir -p ~/nixos-config
cd ~/nixos-config

# Copy our example files
cp /path/to/nixite/examples/home-manager/* .

# Edit to customize
$EDITOR flake.nix
$EDITOR home.nix
```

### 3. Update Configurations

**flake.nix**:
- Replace `my-machine` with your hostname (`hostname` command)
- Update the path to your `configuration.nix`

**home.nix**:
- Replace `youruser` with your username
- Customize packages, programs, and settings

### 4. Apply Configuration

```bash
# First time setup
sudo nixos-rebuild switch --flake .#my-machine

# Subsequent updates
sudo nixos-rebuild switch --flake .
```

## 📦 Package Organization

Packages are organized by Nixite categories:

### Create (Content Creation & Media)
- GIMP, Inkscape, Blender
- Kdenlive, OBS Studio
- Audacity

### Connect (Communication)
- Firefox, Thunderbird
- Slack, Discord, Signal
- Zoom

### Grow (Learning)
- Obsidian, Anki
- Calibre

### Work (Productivity)
- VSCode, IDEs
- Git, Docker, Kubectl
- LibreOffice

### Play (Entertainment)
- VLC, Spotify
- Steam

### Secure (Security)
- KeePassXC, Bitwarden
- GnuPG, VeraCrypt

### Manage (System Administration)
- htop, btop
- ncdu, ranger

## 🛠️ Configured Programs

The example `home.nix` includes full configurations for:

### Git
- User info, aliases, editor
- Pull rebase, pretty logs

### ZSH with Oh-My-Zsh
- Auto-suggestions, syntax highlighting
- Useful aliases for modern tools
- Plugins for docker, kubectl, git, etc.

### Starship Prompt
- Beautiful, informative prompt
- Git integration, nix-shell indicator
- Fast and customizable

### Neovim
- Essential plugins (NERDTree, Fugitive, FZF)
- Reasonable defaults
- Vim/Vi aliases

### Alacritty Terminal
- Modern GPU-accelerated terminal
- Catppuccin theme
- Optimized font rendering

### VSCode
- Popular extensions pre-installed
- Settings optimized for development
- Theme and font configuration

### Firefox
- Privacy-focused settings
- Useful bookmarks (including Nixite!)
- Tracking protection enabled

### Additional Tools
- Direnv (automatic environment loading)
- Bat (better cat with syntax highlighting)
- FZF (fuzzy finder with preview)
- Tmux (terminal multiplexer)
- GPG (encryption and signing)

## 📁 File Structure

```
nixos-config/
├── flake.nix          # Flake definition with inputs
├── flake.lock         # Lock file (auto-generated)
├── configuration.nix  # System configuration (existing)
└── home.nix           # Home Manager configuration
```

## 🔧 Common Customizations

### Add More Packages

```nix
# In home.nix
home.packages = with pkgs; [
  # Existing packages...

  # Add your packages discovered via Nixite
  telegram-desktop
  chromium
  # etc...
];
```

### Configure a Program

```nix
# In home.nix
programs.git = {
  enable = true;
  userName = "Your Name";
  userEmail = "you@example.com";
};
```

### Add Shell Aliases

```nix
# In home.nix
programs.zsh.shellAliases = {
  # Existing aliases...

  # Add your aliases
  myalias = "echo 'Hello!'";
};
```

## 🔄 Update Workflow

### Update Flake Inputs

```bash
# Update all inputs (including nixpkgs and home-manager)
nix flake update

# Update specific input
nix flake lock --update-input nixpkgs
```

### Apply Changes

```bash
# After editing home.nix or adding packages
sudo nixos-rebuild switch --flake .
```

### Rollback if Needed

```bash
# List generations
sudo nix-env --list-generations --profile /nix/var/nix/profiles/system

# Rollback
sudo nixos-rebuild switch --rollback
```

## 💡 Tips

1. **Start Small**: Begin with basic packages and add configurations gradually
2. **Use Nixite**: Discover packages at http://localhost:8000
3. **Commit Often**: Keep your config in git
4. **Test in VM**: Try changes in a VM before applying to your main system
5. **Read Options**: Check Home Manager options documentation

## 🌟 Advanced Examples

### Per-Host Configuration

```nix
# home.nix
{ config, pkgs, lib, ... }:

let
  hostname = builtins.readFile "/etc/hostname";
  isLaptop = lib.hasPrefix "laptop" hostname;
in
{
  home.packages = with pkgs;
    # Base packages
    [ firefox git vscode ]

    # Laptop-specific packages
    ++ lib.optionals isLaptop [
      powertop
      brightnessctl
    ];
}
```

### Multiple Users

```nix
# flake.nix
{
  home-manager.users = {
    alice = import ./alice.nix;
    bob = import ./bob.nix;
  };
}
```

### Sharing Configuration

```nix
# common.nix
{ pkgs, ... }: {
  home.packages = with pkgs; [
    firefox
    git
    htop
  ];
}

# home.nix
{ ... }: {
  imports = [ ./common.nix ];

  # User-specific additions
  home.packages = with pkgs; [
    vscode
  ];
}
```

## 📚 Resources

- [Home Manager Manual](https://nix-community.github.io/home-manager/)
- [Home Manager Options](https://nix-community.github.io/home-manager/options.html)
- [NixOS & Flakes Book](https://nixos-and-flakes.thiscute.world/)
- [Nixite Package Discovery](http://localhost:8000)

## 🆘 Troubleshooting

### "Unfree packages not allowed"

```nix
# In home.nix
nixpkgs.config.allowUnfree = true;
```

### "Collision between packages"

```nix
# Use overlays or explicitly choose one
home.packages = with pkgs; [
  # Only one version
  python311  # Not python39 and python311
];
```

### Changes not applying

```bash
# Force rebuild
sudo nixos-rebuild switch --flake . --recreate-lock-file

# Or clean and rebuild
nix-collect-garbage -d
sudo nixos-rebuild switch --flake .
```

## 🎯 Next Steps

1. **Discover Packages**: Use Nixite to find packages you need
2. **Add to home.nix**: Include them in your configuration
3. **Configure Programs**: Set up program-specific options
4. **Commit to Git**: Version control your dotfiles
5. **Share**: Help others by sharing your configuration!

---

**All packages discovered and organized using Nixite** 🌟

Visit http://localhost:8000 to explore packages by category and find exactly what you need!
