/**
 * NixOS Configuration Generator
 *
 * Generate production-ready configuration.nix files from favorites,
 * collections, and custom selections.
 *
 * @version 2.8.0
 * @author Nixite Team
 */

class ConfigGenerator {
    constructor() {
        this.configTemplate = null;
        this.selectedPackages = [];
        this.configOptions = {
            includeComments: true,
            includeSystemPackages: true,
            includeUserPackages: false,
            generateShellNix: false,
            format: 'configuration.nix'
        };
        this.init();
    }

    init() {
        this.createGeneratorPanel();
    }

    createGeneratorPanel() {
        const panel = document.createElement('div');
        panel.id = 'config-generator-panel';
        panel.className = 'config-generator-panel';
        panel.innerHTML = `
            <div class="generator-overlay" onclick="configGenerator.closePanel()"></div>
            <div class="generator-container">
                <div class="generator-header">
                    <h2>⚙️ Configuration Generator</h2>
                    <button class="btn-close" onclick="configGenerator.closePanel()">×</button>
                </div>

                <div class="generator-body">
                    <div class="generator-sidebar">
                        <h3>Source Selection</h3>
                        <div class="source-options">
                            <button class="btn btn-secondary" onclick="configGenerator.loadFromFavorites()">
                                ⭐ From Favorites
                            </button>
                            <button class="btn btn-secondary" onclick="configGenerator.loadFromCollection()">
                                📚 From Collection
                            </button>
                            <button class="btn btn-secondary" onclick="configGenerator.loadFromComparison()">
                                ⚖️ From Comparison
                            </button>
                        </div>

                        <h3>Selected Packages</h3>
                        <div class="selected-packages-list" id="selected-packages">
                            <p class="empty-state-small">No packages selected</p>
                        </div>

                        <h3>Configuration Options</h3>
                        <div class="config-options">
                            <label class="checkbox-label">
                                <input type="checkbox" id="opt-comments" checked
                                       onchange="configGenerator.updateOption('includeComments', this.checked)">
                                Include explanatory comments
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="opt-system" checked
                                       onchange="configGenerator.updateOption('includeSystemPackages', this.checked)">
                                System packages (nixos)
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="opt-user"
                                       onchange="configGenerator.updateOption('includeUserPackages', this.checked)">
                                User packages (home-manager)
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="opt-shell"
                                       onchange="configGenerator.updateOption('generateShellNix', this.checked)">
                                Generate shell.nix instead
                            </label>
                        </div>

                        <div class="format-select">
                            <label>Output Format:</label>
                            <select id="format-select" onchange="configGenerator.updateFormat(this.value)">
                                <option value="configuration.nix">configuration.nix</option>
                                <option value="shell.nix">shell.nix</option>
                                <option value="flake.nix">flake.nix</option>
                            </select>
                        </div>
                    </div>

                    <div class="generator-preview">
                        <div class="preview-header">
                            <h3>Configuration Preview</h3>
                            <div class="preview-actions">
                                <button class="btn btn-secondary" onclick="configGenerator.copyToClipboard()">
                                    📋 Copy
                                </button>
                                <button class="btn btn-primary" onclick="configGenerator.downloadConfig()">
                                    💾 Download
                                </button>
                            </div>
                        </div>
                        <pre class="config-preview" id="config-preview"><code># Select packages to generate configuration</code></pre>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    }

    openPanel() {
        const panel = document.getElementById('config-generator-panel');
        panel.classList.add('active');
    }

    closePanel() {
        const panel = document.getElementById('config-generator-panel');
        panel.classList.remove('active');
    }

    loadFromFavorites() {
        const favorites = JSON.parse(localStorage.getItem('nixite_favorites') || '[]');
        this.selectedPackages = favorites.map(id => ({ id, name: id }));
        this.updatePackagesList();
        this.generateConfig();
    }

    loadFromCollection() {
        const collections = JSON.parse(localStorage.getItem('nixite_collections') || '{}');
        const collectionNames = Object.keys(collections);

        if (collectionNames.length === 0) {
            alert('No collections found. Create a collection first!');
            return;
        }

        // For now, load from first collection (in real app, show selection dialog)
        const firstCollection = collections[collectionNames[0]];
        this.selectedPackages = firstCollection.packages.map(id => ({ id, name: id }));
        this.updatePackagesList();
        this.generateConfig();
    }

    loadFromComparison() {
        const comparison = JSON.parse(localStorage.getItem('nixite_comparison') || '[]');
        this.selectedPackages = comparison.map(id => ({ id, name: id }));
        this.updatePackagesList();
        this.generateConfig();
    }

    updatePackagesList() {
        const container = document.getElementById('selected-packages');

        if (this.selectedPackages.length === 0) {
            container.innerHTML = '<p class="empty-state-small">No packages selected</p>';
            return;
        }

        container.innerHTML = this.selectedPackages.map((pkg, index) => `
            <div class="selected-package-item">
                <span class="package-name">${pkg.name}</span>
                <button class="btn-remove-small" onclick="configGenerator.removePackage(${index})">
                    ×
                </button>
            </div>
        `).join('');
    }

    removePackage(index) {
        this.selectedPackages.splice(index, 1);
        this.updatePackagesList();
        this.generateConfig();
    }

    updateOption(option, value) {
        this.configOptions[option] = value;
        this.generateConfig();
    }

    updateFormat(format) {
        this.configOptions.format = format;
        if (format === 'shell.nix') {
            this.configOptions.generateShellNix = true;
        }
        this.generateConfig();
    }

    generateConfig() {
        if (this.selectedPackages.length === 0) {
            document.getElementById('config-preview').innerHTML =
                '<code># Select packages to generate configuration</code>';
            return;
        }

        const config = this.configOptions.format === 'shell.nix'
            ? this.generateShellNix()
            : this.configOptions.format === 'flake.nix'
            ? this.generateFlakeNix()
            : this.generateConfigurationNix();

        const preview = document.getElementById('config-preview');
        preview.innerHTML = `<code>${this.escapeHtml(config)}</code>`;
    }

    generateConfigurationNix() {
        const { includeComments, includeSystemPackages } = this.configOptions;
        const packageNames = this.selectedPackages.map(p => p.name).sort();

        let config = includeComments ?
`# Configuration generated by Nixite
# Generated on: ${new Date().toISOString()}
# Packages: ${packageNames.length}

` : '';

        config += `{ config, pkgs, ... }:

{
`;

        if (includeSystemPackages) {
            config += includeComments ?
`  # System-wide packages
  # These packages will be available to all users
` : '';
            config += `  environment.systemPackages = with pkgs; [
`;

            packageNames.forEach(name => {
                config += `    ${name}\n`;
            });

            config += `  ];\n`;
        }

        config += includeComments ?
`
  # Additional system configuration
  # Add your custom configuration here

  # Enable sound
  # sound.enable = true;

  # Enable networking
  # networking.networkmanager.enable = true;

  # Define a user account
  # users.users.yourname = {
  #   isNormalUser = true;
  #   extraGroups = [ "wheel" "networkmanager" ];
  # };
` : '\n';

        config += `}\n`;

        return config;
    }

    generateShellNix() {
        const { includeComments } = this.configOptions;
        const packageNames = this.selectedPackages.map(p => p.name).sort();

        let config = includeComments ?
`# Development environment generated by Nixite
# Generated on: ${new Date().toISOString()}
# Usage: nix-shell

` : '';

        config += `{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
`;

        packageNames.forEach(name => {
            config += `    ${name}\n`;
        });

        config += `  ];

`;

        if (includeComments) {
            config += `  # Shell hook runs when entering the shell
`;
        }

        config += `  shellHook = ''
    echo "Development environment loaded"
    echo "Packages: ${packageNames.length}"
  '';
}\n`;

        return config;
    }

    generateFlakeNix() {
        const { includeComments } = this.configOptions;
        const packageNames = this.selectedPackages.map(p => p.name).sort();

        let config = includeComments ?
`# Flake configuration generated by Nixite
# Generated on: ${new Date().toISOString()}

` : '';

        config += `{
  description = "NixOS configuration with packages from Nixite";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }: {
    nixosConfigurations = {
      hostname = nixpkgs.lib.nixosSystem {
        system = "x86_64-linux";
        modules = [
          ({ config, pkgs, ... }: {
            environment.systemPackages = with pkgs; [
`;

        packageNames.forEach(name => {
            config += `              ${name}\n`;
        });

        config += `            ];
          })
        ];
      };
    };
  };
}\n`;

        return config;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    copyToClipboard() {
        const preview = document.getElementById('config-preview');
        const text = preview.textContent;

        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Configuration copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showNotification('Failed to copy to clipboard', 'error');
        });
    }

    downloadConfig() {
        const preview = document.getElementById('config-preview');
        const text = preview.textContent;
        const filename = this.configOptions.format;

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification(`Configuration downloaded as ${filename}`);
    }

    showNotification(message, type = 'success') {
        if (window.uiIntegration && window.uiIntegration.showNotification) {
            window.uiIntegration.showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
}

// Initialize
let configGenerator;
document.addEventListener('DOMContentLoaded', () => {
    configGenerator = new ConfigGenerator();
});
