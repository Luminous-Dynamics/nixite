{ config, pkgs, ... }:

{
  # Home Manager needs a bit of information about you and the
  # paths it should manage.
  home.username = "youruser";
  home.homeDirectory = "/home/youruser";

  # This value determines the Home Manager release that your
  # configuration is compatible with.
  home.stateVersion = "23.11";

  # Let Home Manager install and manage itself.
  programs.home-manager.enable = true;

  # Packages discovered via Nixite - organized by category
  home.packages = with pkgs; [
    # Create (Content Creation & Media)
    gimp
    inkscape
    blender
    kdenlive
    audacity
    obs-studio

    # Connect (Communication & Collaboration)
    firefox
    thunderbird
    slack
    discord
    signal-desktop
    zoom-us

    # Grow (Learning & Development)
    obsidian
    anki
    calibre

    # Work (Productivity & Business)
    libreoffice
    vscode
    jetbrains.idea-community
    git
    docker
    kubectl

    # Play (Gaming & Entertainment)
    vlc
    spotify
    steam

    # Secure (Security & Privacy)
    keepassxc
    bitwarden
    gnupg
    veracrypt

    # Manage (System Administration)
    htop
    btop
    ncdu
    tree
    ranger

    # Utilities
    ripgrep
    fd
    bat
    eza
    fzf
    jq
    httpie
    tldr
  ];

  # Git configuration
  programs.git = {
    enable = true;
    userName = "Your Name";
    userEmail = "your@email.com";

    aliases = {
      co = "checkout";
      br = "branch";
      ci = "commit";
      st = "status";
      unstage = "reset HEAD --";
      last = "log -1 HEAD";
      lg = "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit";
    };

    extraConfig = {
      init.defaultBranch = "main";
      pull.rebase = true;
      core.editor = "nvim";
      diff.tool = "vimdiff";
    };
  };

  # ZSH configuration
  programs.zsh = {
    enable = true;
    enableCompletion = true;
    enableAutosuggestions = true;
    syntaxHighlighting.enable = true;

    shellAliases = {
      # Modern replacements
      ll = "eza -l";
      la = "eza -la";
      cat = "bat";
      grep = "rg";
      find = "fd";

      # Git shortcuts
      g = "git";
      gs = "git status";
      ga = "git add";
      gc = "git commit";
      gp = "git push";
      gl = "git pull";

      # Docker shortcuts
      d = "docker";
      dc = "docker compose";
      dps = "docker ps";

      # NixOS shortcuts
      rebuild = "sudo nixos-rebuild switch --flake .";
      update = "nix flake update";
      clean = "sudo nix-collect-garbage -d";
    };

    oh-my-zsh = {
      enable = true;
      plugins = [
        "git"
        "docker"
        "docker-compose"
        "kubectl"
        "npm"
        "python"
        "rust"
        "systemd"
      ];
      theme = "robbyrussell";
    };

    initExtra = ''
      # Custom functions
      mkcd() {
        mkdir -p "$1" && cd "$1"
      }

      # Quick search with fzf and ripgrep
      fs() {
        rg -l "$1" | fzf --preview "bat --color=always {}"
      }
    '';
  };

  # Starship prompt
  programs.starship = {
    enable = true;
    settings = {
      add_newline = false;

      format = "$username$hostname$directory$git_branch$git_status$nix_shell$nodejs$python$rust$docker_context$character";

      username = {
        show_always = true;
        format = "[$user]($style)@";
      };

      hostname = {
        ssh_only = false;
        format = "[$hostname]($style) ";
      };

      directory = {
        truncation_length = 3;
        truncate_to_repo = true;
      };

      character = {
        success_symbol = "[➜](bold green)";
        error_symbol = "[➜](bold red)";
      };

      git_branch = {
        format = "[$symbol$branch]($style) ";
      };

      nix_shell = {
        format = "via [$symbol$state]($style) ";
      };
    };
  };

  # Neovim configuration
  programs.neovim = {
    enable = true;
    viAlias = true;
    vimAlias = true;

    plugins = with pkgs.vimPlugins; [
      vim-nix
      vim-fugitive
      fzf-vim
      nerdtree
      vim-airline
      vim-polyglot
    ];

    extraConfig = ''
      set number
      set relativenumber
      set expandtab
      set tabstop=2
      set shiftwidth=2
      set smartindent
      set mouse=a
      syntax on
    '';
  };

  # Alacritty terminal
  programs.alacritty = {
    enable = true;
    settings = {
      window = {
        opacity = 0.95;
        padding = {
          x = 10;
          y = 10;
        };
      };

      font = {
        normal.family = "FiraCode Nerd Font";
        size = 12;
      };

      colors = {
        primary = {
          background = "0x1e1e2e";
          foreground = "0xcdd6f4";
        };
        normal = {
          black = "0x45475a";
          red = "0xf38ba8";
          green = "0xa6e3a1";
          yellow = "0xf9e2af";
          blue = "0x89b4fa";
          magenta = "0xf5c2e7";
          cyan = "0x94e2d5";
          white = "0xbac2de";
        };
      };
    };
  };

  # VSCode configuration
  programs.vscode = {
    enable = true;
    extensions = with pkgs.vscode-extensions; [
      # Language support
      bbenoist.nix
      ms-python.python
      rust-lang.rust-analyzer
      bradlc.vscode-tailwindcss

      # Tools
      esbenp.prettier-vscode
      dbaeumer.vscode-eslint
      eamodio.gitlens
      ms-azuretools.vscode-docker

      # Themes
      catppuccin.catppuccin-vsc
    ];

    userSettings = {
      "editor.fontSize" = 14;
      "editor.fontFamily" = "'FiraCode Nerd Font', monospace";
      "editor.fontLigatures" = true;
      "editor.formatOnSave" = true;
      "editor.rulers" = [ 80 120 ];
      "workbench.colorTheme" = "Catppuccin Mocha";
      "terminal.integrated.fontFamily" = "'FiraCode Nerd Font'";
      "files.autoSave" = "afterDelay";
      "git.autofetch" = true;
    };
  };

  # Firefox configuration
  programs.firefox = {
    enable = true;

    profiles.default = {
      name = "Default";
      isDefault = true;

      settings = {
        "browser.startup.homepage" = "https://nixos.org";
        "privacy.trackingprotection.enabled" = true;
        "privacy.donottrackheader.enabled" = true;
        "browser.newtabpage.activity-stream.feeds.section.topstories" = false;
      };

      bookmarks = [
        {
          name = "NixOS";
          tags = [ "nix" ];
          keyword = "nix";
          url = "https://nixos.org";
        }
        {
          name = "Nixite";
          tags = [ "nix" "packages" ];
          url = "http://localhost:8000";
        }
      ];
    };
  };

  # Direnv for automatic environment loading
  programs.direnv = {
    enable = true;
    nix-direnv.enable = true;
  };

  # Bat (better cat) configuration
  programs.bat = {
    enable = true;
    config = {
      theme = "Catppuccin-mocha";
      style = "numbers,changes,header";
    };
  };

  # FZF configuration
  programs.fzf = {
    enable = true;
    enableZshIntegration = true;
    defaultCommand = "fd --type f";
    defaultOptions = [
      "--height 40%"
      "--border"
      "--preview 'bat --color=always {}'"
    ];
  };

  # Tmux configuration
  programs.tmux = {
    enable = true;
    terminal = "screen-256color";
    historyLimit = 10000;
    keyMode = "vi";

    extraConfig = ''
      # Split panes
      bind | split-window -h
      bind - split-window -v

      # Easy config reload
      bind r source-file ~/.tmux.conf

      # Mouse mode
      set -g mouse on

      # Status bar
      set -g status-position bottom
      set -g status-bg colour234
      set -g status-fg colour137
    '';
  };

  # GPG configuration
  programs.gpg.enable = true;
  services.gpg-agent = {
    enable = true;
    enableSshSupport = true;
    pinentryFlavor = "gtk2";
  };

  # File associations
  xdg.mimeApps = {
    enable = true;
    defaultApplications = {
      "text/html" = "firefox.desktop";
      "x-scheme-handler/http" = "firefox.desktop";
      "x-scheme-handler/https" = "firefox.desktop";
      "application/pdf" = "org.pwmt.zathura.desktop";
      "image/png" = "feh.desktop";
      "image/jpeg" = "feh.desktop";
    };
  };

  # Environment variables
  home.sessionVariables = {
    EDITOR = "nvim";
    VISUAL = "nvim";
    BROWSER = "firefox";
    TERMINAL = "alacritty";
  };

  # XDG directories
  xdg.userDirs = {
    enable = true;
    createDirectories = true;
    desktop = "$HOME/Desktop";
    documents = "$HOME/Documents";
    download = "$HOME/Downloads";
    music = "$HOME/Music";
    pictures = "$HOME/Pictures";
    videos = "$HOME/Videos";
  };
}
