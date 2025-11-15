# Real-World NixOS Configuration Examples

Practical, production-ready NixOS configurations that showcase packages discovered through Nixite.

## 📋 Table of Contents

- [Developer Workstation](#developer-workstation)
- [Content Creator Setup](#content-creator-setup)
- [Home Server](#home-server)
- [Gaming Rig](#gaming-rig)
- [Privacy-Focused System](#privacy-focused-system)
- [Minimalist Setup](#minimalist-setup)

## 💻 Developer Workstation

Complete development environment with all essential tools.

### configuration.nix

```nix
{ config, pkgs, ... }:

{
  # Packages discovered via Nixite - Create & Work categories
  environment.systemPackages = with pkgs; [
    # Development Tools
    vscode
    git
    docker
    docker-compose
    nodejs
    python3
    rustc
    cargo

    # Terminals & Shells
    alacritty
    zsh
    starship

    # Editors & IDEs
    neovim
    jetbrains.idea-community

    # Version Control
    gh  # GitHub CLI
    lazygit

    # Container Tools
    kubectl
    k9s
    helm

    # Database Tools
    postgresql
    redis

    # API Testing
    postman

    # Documentation
    obsidian

    # Communication (from Nixite Connect)
    slack
    discord

    # Utilities
    htop
    btop
    ripgrep
    fd
    bat
    eza
    fzf
  ];

  # Docker support
  virtualisation.docker.enable = true;
  users.users.youruser.extraGroups = [ "docker" ];

  # Enable ZSH
  programs.zsh.enable = true;
  users.users.youruser.shell = pkgs.zsh;

  # VSCode with extensions
  programs.vscode = {
    enable = true;
    extensions = with pkgs.vscode-extensions; [
      bbenoist.nix
      ms-python.python
      rust-lang.rust-analyzer
      esbenp.prettier-vscode
    ];
  };

  # Git configuration
  programs.git = {
    enable = true;
    config = {
      user.name = "Your Name";
      user.email = "your@email.com";
      init.defaultBranch = "main";
      pull.rebase = true;
    };
  };

  # Development services
  services.postgresql = {
    enable = true;
    package = pkgs.postgresql_15;
    enableTCPIP = true;
  };

  services.redis.servers."" = {
    enable = true;
    port = 6379;
  };
}
```

### home.nix (Home Manager)

```nix
{ config, pkgs, ... }:

{
  home.packages = with pkgs; [
    # CLI Tools discovered via Nixite
    jq
    yq
    httpie
    tldr

    # Node.js tools
    yarn
    pnpm

    # Python tools
    poetry
    black

    # Rust tools
    cargo-watch
    cargo-edit
  ];

  # ZSH configuration
  programs.zsh = {
    enable = true;
    enableCompletion = true;
    enableAutosuggestions = true;
    syntaxHighlighting.enable = true;

    shellAliases = {
      ll = "eza -l";
      la = "eza -la";
      cat = "bat";
      grep = "rg";
      find = "fd";
    };

    oh-my-zsh = {
      enable = true;
      plugins = [ "git" "docker" "kubectl" "rust" ];
      theme = "robbyrussell";
    };
  };

  # Starship prompt
  programs.starship = {
    enable = true;
    settings = {
      add_newline = false;
      character = {
        success_symbol = "[➜](bold green)";
        error_symbol = "[➜](bold red)";
      };
    };
  };

  # Git aliases
  programs.git.aliases = {
    co = "checkout";
    br = "branch";
    ci = "commit";
    st = "status";
    unstage = "reset HEAD --";
    last = "log -1 HEAD";
  };

  # Alacritty terminal
  programs.alacritty = {
    enable = true;
    settings = {
      font.size = 12;
      window.opacity = 0.95;
      colors.primary = {
        background = "0x1e1e2e";
        foreground = "0xcdd6f4";
      };
    };
  };
}
```

## 🎨 Content Creator Setup

Perfect for video editing, graphics, and content production.

### configuration.nix

```nix
{ config, pkgs, ... }:

{
  # Packages from Nixite - Create category
  environment.systemPackages = with pkgs; [
    # Video Editing
    kdenlive
    davinci-resolve
    obs-studio

    # Graphics & Photo
    gimp
    krita
    inkscape
    darktable

    # Audio Production
    audacity
    ardour

    # 3D Modeling
    blender

    # Screen Recording
    simplescreenrecorder
    peek

    # Asset Management
    digikam

    # Utilities
    ffmpeg-full
    imagemagick

    # Communication
    discord
    zoom-us

    # Cloud Storage
    rclone
    nextcloud-client
  ];

  # Enable hardware acceleration for video editing
  nixpkgs.config.allowUnfree = true;
  hardware.opengl = {
    enable = true;
    driSupport = true;
    driSupport32Bit = true;
  };

  # OBS Studio with plugins
  programs.obs-studio = {
    enable = true;
    plugins = with pkgs.obs-studio-plugins; [
      obs-backgroundremoval
      obs-pipewire-audio-capture
    ];
  };

  # PipeWire for professional audio
  services.pipewire = {
    enable = true;
    alsa.enable = true;
    alsa.support32Bit = true;
    pulse.enable = true;
    jack.enable = true;
  };
}
```

## 🖥️ Home Server

Self-hosted services and media server setup.

### configuration.nix

```nix
{ config, pkgs, ... }:

{
  # Packages from Nixite - Serve & Manage categories
  environment.systemPackages = with pkgs; [
    # Monitoring
    htop
    btop
    nethogs
    iotop

    # Network Tools
    curl
    wget
    rsync

    # Container Management
    docker
    docker-compose
    portainer
  ];

  # Docker for containerized services
  virtualisation.docker.enable = true;

  # Nextcloud (discovered via Nixite)
  services.nextcloud = {
    enable = true;
    package = pkgs.nextcloud28;
    hostName = "cloud.example.com";
    config = {
      adminpassFile = "/etc/nextcloud-admin-pass";
      dbtype = "pgsql";
    };
  };

  # Jellyfin Media Server
  services.jellyfin = {
    enable = true;
    openFirewall = true;
  };

  # Nginx reverse proxy
  services.nginx = {
    enable = true;
    recommendedProxySettings = true;
    recommendedTlsSettings = true;

    virtualHosts."cloud.example.com" = {
      enableACME = true;
      forceSSL = true;
      locations."/" = {
        proxyPass = "http://127.0.0.1:${toString config.services.nextcloud.port}";
      };
    };
  };

  # Automatic updates
  system.autoUpgrade = {
    enable = true;
    allowReboot = false;
  };

  # Backups with Restic
  services.restic.backups = {
    daily = {
      paths = [ "/var/lib/nextcloud" "/home" ];
      repository = "s3:s3.amazonaws.com/my-backup-bucket";
      passwordFile = "/etc/restic-password";
      timerConfig = {
        OnCalendar = "daily";
      };
    };
  };
}
```

## 🎮 Gaming Rig

Optimized for gaming with Steam, Lutris, and performance tweaks.

### configuration.nix

```nix
{ config, pkgs, ... }:

{
  # Packages from Nixite - Play category
  environment.systemPackages = with pkgs; [
    # Gaming Platforms
    steam
    lutris
    heroic

    # Emulators
    retroarch
    dolphin-emu
    pcsx2

    # Game Tools
    mangohud
    goverlay
    gamemode

    # Communication
    discord
    teamspeak_client

    # Utilities
    wine
    winetricks
  ];

  # Steam configuration
  programs.steam = {
    enable = true;
    remotePlay.openFirewall = true;
    dedicatedServer.openFirewall = true;
  };

  # GameMode for performance
  programs.gamemode.enable = true;

  # Graphics drivers (NVIDIA example)
  services.xserver.videoDrivers = [ "nvidia" ];
  hardware.nvidia = {
    modesetting.enable = true;
    powerManagement.enable = false;
    open = false;
    nvidiaSettings = true;
  };

  # Enable 32-bit support for games
  hardware.opengl.driSupport32Bit = true;
  hardware.pulseaudio.support32Bit = true;

  # Performance tweaks
  boot.kernel.sysctl = {
    "vm.swappiness" = 10;
    "vm.vfs_cache_pressure" = 50;
  };
}
```

## 🔒 Privacy-Focused System

Maximum privacy and security configuration.

### configuration.nix

```nix
{ config, pkgs, ... }:

{
  # Packages from Nixite - Secure & Connect categories
  environment.systemPackages = with pkgs; [
    # Browsers
    firefox
    tor-browser-bundle-bin
    brave

    # Communication
    signal-desktop
    element-desktop

    # VPN
    mullvad-vpn
    wireguard-tools

    # Password Management
    keepassxc
    bitwarden

    # Encryption
    veracrypt
    gnupg

    # Privacy Tools
    torbrowser
    i2pd

    # Network Security
    ufw
    fail2ban
  ];

  # Firefox hardening
  programs.firefox = {
    enable = true;
    preferences = {
      "privacy.trackingprotection.enabled" = true;
      "privacy.trackingprotection.socialtracking.enabled" = true;
      "privacy.donottrackheader.enabled" = true;
    };
  };

  # Mullvad VPN
  services.mullvad-vpn.enable = true;

  # Firewall
  networking.firewall = {
    enable = true;
    allowedTCPPorts = [ ];
    allowedUDPPorts = [ ];
  };

  # Fail2ban
  services.fail2ban = {
    enable = true;
    maxretry = 3;
    bantime = "1h";
  };

  # AppArmor
  security.apparmor.enable = true;

  # Disable unnecessary services
  services.printing.enable = false;
  services.avahi.enable = false;
  hardware.bluetooth.enable = false;

  # Kernel hardening
  boot.kernelParams = [
    "slab_nomerge"
    "init_on_alloc=1"
    "init_on_free=1"
    "page_alloc.shuffle=1"
  ];
}
```

## 🌱 Minimalist Setup

Lightweight, efficient system with only essentials.

### configuration.nix

```nix
{ config, pkgs, ... }:

{
  # Minimal package set from Nixite
  environment.systemPackages = with pkgs; [
    # Essential Tools
    firefox
    alacritty
    neovim
    git

    # Utilities
    htop
    wget
    curl
    ripgrep
    fd

    # File Manager
    ranger

    # Documents
    zathura  # PDF viewer
  ];

  # i3 Window Manager
  services.xserver = {
    enable = true;
    displayManager.lightdm.enable = true;
    windowManager.i3.enable = true;
  };

  # Minimal system services
  services.printing.enable = false;
  services.avahi.enable = false;

  # Power management
  services.tlp.enable = true;

  # Automatic garbage collection
  nix.gc = {
    automatic = true;
    dates = "weekly";
    options = "--delete-older-than 7d";
  };

  # Optimize store
  nix.settings.auto-optimise-store = true;
}
```

## 🔧 Common Patterns

### Automatic Package Updates

```nix
{
  # Auto-upgrade system packages
  system.autoUpgrade = {
    enable = true;
    allowReboot = false;
    dates = "weekly";
    flake = "github:yourusername/nixos-config";
  };
}
```

### User-Specific Packages (Home Manager)

```nix
{
  # Per-user package installation
  home-manager.users.alice = {
    home.packages = with pkgs; [
      # Alice's development tools
      vscode
      git
    ];
  };

  home-manager.users.bob = {
    home.packages = with pkgs; [
      # Bob's creative tools
      gimp
      inkscape
    ];
  };
}
```

### Conditional Package Installation

```nix
{ config, pkgs, lib, ... }:

{
  environment.systemPackages = with pkgs;
    # Base packages
    [ firefox git htop ]

    # Laptop-specific
    ++ lib.optionals (config.networking.hostName == "laptop") [
      powertop
      tlp
    ]

    # Desktop-specific
    ++ lib.optionals (config.networking.hostName == "desktop") [
      steam
      discord
    ];
}
```

## 📚 Tips for Using These Examples

1. **Start Small**: Begin with one category that matches your needs
2. **Customize**: Adjust package lists to your preferences
3. **Test First**: Try in a VM before applying to production
4. **Use Nixite**: Discover more packages at http://nixite.luminousdynamics.org
5. **Read Docs**: Check NixOS manual for package-specific options
6. **Commit Often**: Keep your configuration in git

## 🔗 Related Resources

- [NixOS Options Search](https://search.nixos.org/options)
- [Home Manager Options](https://nix-community.github.io/home-manager/options.html)
- [Nixite Package Discovery](http://localhost:8000)
- [NixOS Manual](https://nixos.org/manual/nixos/stable/)

## 💡 Next Steps

1. Copy relevant sections to your `configuration.nix`
2. Run `sudo nixos-rebuild switch` to apply
3. Use Nixite to discover more packages
4. Share your configuration with the community!

---

**All packages in these examples were discovered and organized using Nixite** 🌟

Use Nixite to explore packages by category and find exactly what you need for your perfect NixOS system!
