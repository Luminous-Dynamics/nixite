// Nixite Install Manager - Bridge between discovery and installation
// This evolves our static discovery into an active installation system

class NixiteInstallManager {
    constructor() {
        this.installQueue = [];
        this.installed = this.loadInstalled();
        this.installing = new Set();
        this.ws = null;
        
        // Installation methods
        this.methods = {
            USER: 'nix-env',       // User profile installation
            SYSTEM: 'configuration', // System-wide via configuration.nix
            SHELL: 'nix-shell',    // Temporary shell environment
            FLAKE: 'flake',        // Modern flake-based installation
        };
        
        this.defaultMethod = this.detectBestMethod();
    }
    
    // Detect the best installation method for this system
    detectBestMethod() {
        // Check if we're on NixOS
        const isNixOS = this.checkNixOS();
        
        // Check if flakes are enabled
        const hasFlakes = this.checkFlakes();
        
        if (hasFlakes) return this.methods.FLAKE;
        if (isNixOS) return this.methods.SYSTEM;
        return this.methods.USER;
    }
    
    checkNixOS() {
        // In real implementation, check /etc/os-release
        return true; // Assume NixOS for now
    }
    
    checkFlakes() {
        // In real implementation, check nix.conf for experimental-features
        return false; // Assume no flakes for now
    }
    
    // Load list of installed packages
    loadInstalled() {
        // In real implementation, parse nix-env -q output
        const stored = localStorage.getItem('nixite-installed');
        return stored ? JSON.parse(stored) : new Set();
    }
    
    // Save installed packages list
    saveInstalled() {
        localStorage.setItem('nixite-installed', JSON.stringify(Array.from(this.installed)));
    }
    
    // Check if a package is installed
    isInstalled(packageId) {
        return this.installed.has(packageId);
    }
    
    // Generate installation command based on method
    generateInstallCommand(packageId, method = this.defaultMethod) {
        const commands = {
            [this.methods.USER]: `nix-env -iA nixos.${packageId}`,
            [this.methods.SYSTEM]: this.generateSystemConfig(packageId),
            [this.methods.SHELL]: `nix-shell -p ${packageId}`,
            [this.methods.FLAKE]: `nix profile install nixpkgs#${packageId}`,
        };
        
        return commands[method];
    }
    
    // Generate configuration.nix entry
    generateSystemConfig(packageId) {
        return `
# Add to /etc/nixos/configuration.nix:
environment.systemPackages = with pkgs; [
  ${packageId}
];

# Then run:
sudo nixos-rebuild switch`;
    }
    
    // Install a package with progress tracking
    async installPackage(packageId, options = {}) {
        const {
            method = this.defaultMethod,
            onProgress = () => {},
            onComplete = () => {},
            onError = () => {}
        } = options;
        
        // Check if already installed
        if (this.isInstalled(packageId)) {
            onComplete({ 
                status: 'already_installed',
                message: `${packageId} is already installed`
            });
            return;
        }
        
        // Check if currently installing
        if (this.installing.has(packageId)) {
            onError({
                status: 'in_progress',
                message: `${packageId} is currently being installed`
            });
            return;
        }
        
        // Add to installing set
        this.installing.add(packageId);
        
        try {
            // Simulate installation phases
            const phases = [
                { phase: 'resolving', message: 'Resolving dependencies...', progress: 10 },
                { phase: 'downloading', message: 'Downloading packages...', progress: 30 },
                { phase: 'building', message: 'Building from source...', progress: 60 },
                { phase: 'installing', message: 'Installing files...', progress: 90 },
                { phase: 'configuring', message: 'Configuring...', progress: 95 },
                { phase: 'complete', message: 'Installation complete!', progress: 100 }
            ];
            
            for (const phase of phases) {
                onProgress(phase);
                
                // In real implementation, this would monitor actual nix-env output
                await this.delay(1000 + Math.random() * 1000);
            }
            
            // Mark as installed
            this.installed.add(packageId);
            this.saveInstalled();
            
            // Remove from installing
            this.installing.delete(packageId);
            
            onComplete({
                status: 'success',
                message: `Successfully installed ${packageId}`,
                command: this.generateInstallCommand(packageId, method)
            });
            
        } catch (error) {
            this.installing.delete(packageId);
            onError({
                status: 'error',
                message: `Failed to install ${packageId}: ${error.message}`,
                error
            });
        }
    }
    
    // Batch installation
    async installBatch(packageIds, options = {}) {
        const results = {
            success: [],
            failed: [],
            skipped: []
        };
        
        for (const packageId of packageIds) {
            if (this.isInstalled(packageId)) {
                results.skipped.push(packageId);
                continue;
            }
            
            try {
                await this.installPackage(packageId, {
                    ...options,
                    onComplete: (result) => {
                        results.success.push(packageId);
                        if (options.onPackageComplete) {
                            options.onPackageComplete(packageId, result);
                        }
                    },
                    onError: (error) => {
                        results.failed.push({ packageId, error });
                        if (options.onPackageError) {
                            options.onPackageError(packageId, error);
                        }
                    }
                });
            } catch (error) {
                results.failed.push({ packageId, error });
            }
        }
        
        return results;
    }
    
    // Generate a complete profile installation
    async installProfile(profileName) {
        const profiles = {
            developer: [
                'vscode', 'git', 'docker', 'nodejs', 'python3',
                'gcc', 'gnumake', 'tmux', 'neovim', 'zsh'
            ],
            creator: [
                'gimp', 'krita', 'inkscape', 'blender',
                'kdenlive', 'obs-studio', 'audacity'
            ],
            gamer: [
                'steam', 'lutris', 'wine', 'discord',
                'obs-studio', 'mangohud'
            ],
            'home-user': [
                'firefox', 'thunderbird', 'libreoffice',
                'vlc', 'gnucash', 'nextcloud-client'
            ],
            student: [
                'libreoffice', 'anki', 'zotero', 'obsidian',
                'firefox', 'zoom-us', 'teams'
            ],
            'security-conscious': [
                'bitwarden', 'keepassxc', 'tor-browser',
                'signal-desktop', 'veracrypt', 'firejail'
            ]
        };
        
        const packages = profiles[profileName];
        if (!packages) {
            throw new Error(`Unknown profile: ${profileName}`);
        }
        
        return this.installBatch(packages, {
            onPackageComplete: (pkg) => {
                console.log(`✅ Installed ${pkg} for ${profileName} profile`);
            },
            onPackageError: (pkg, error) => {
                console.error(`❌ Failed to install ${pkg}: ${error.message}`);
            }
        });
    }
    
    // Uninstall a package
    async uninstallPackage(packageId, options = {}) {
        const {
            method = this.defaultMethod,
            onComplete = () => {},
            onError = () => {}
        } = options;
        
        if (!this.isInstalled(packageId)) {
            onError({
                status: 'not_installed',
                message: `${packageId} is not installed`
            });
            return;
        }
        
        try {
            // In real implementation, run nix-env -e packageId
            await this.delay(2000);
            
            this.installed.delete(packageId);
            this.saveInstalled();
            
            onComplete({
                status: 'success',
                message: `Successfully uninstalled ${packageId}`
            });
        } catch (error) {
            onError({
                status: 'error',
                message: `Failed to uninstall ${packageId}: ${error.message}`,
                error
            });
        }
    }
    
    // Update a package
    async updatePackage(packageId) {
        // In real implementation, run nix-env -u packageId
        console.log(`Updating ${packageId}...`);
        await this.delay(3000);
        console.log(`✅ ${packageId} updated to latest version`);
    }
    
    // Check for updates
    async checkUpdates() {
        // In real implementation, compare installed versions with available
        const updates = [];
        
        for (const packageId of this.installed) {
            // Simulate checking for updates
            if (Math.random() > 0.7) {
                updates.push({
                    packageId,
                    currentVersion: '1.0.0',
                    newVersion: '1.1.0',
                    changelog: 'Bug fixes and improvements'
                });
            }
        }
        
        return updates;
    }
    
    // Generate installation script for sharing
    generateInstallScript(packageIds) {
        const script = `#!/usr/bin/env bash
# Nixite Installation Script
# Generated: ${new Date().toISOString()}
# Packages: ${packageIds.length}

echo "🚀 Installing ${packageIds.length} packages..."
echo ""

# Method 1: User Profile Installation
install_user() {
${packageIds.map(id => `    nix-env -iA nixos.${id}`).join('\n')}
}

# Method 2: System Configuration
install_system() {
    cat << EOF
Add to /etc/nixos/configuration.nix:

environment.systemPackages = with pkgs; [
${packageIds.map(id => `  ${id}`).join('\n')}
];
EOF
    echo ""
    echo "Then run: sudo nixos-rebuild switch"
}

# Method 3: Nix Shell
install_shell() {
    nix-shell -p ${packageIds.join(' ')} 
}

echo "Choose installation method:"
echo "1) User Profile (nix-env)"
echo "2) System Configuration (configuration.nix)"
echo "3) Temporary Shell (nix-shell)"
echo ""
read -p "Selection (1-3): " choice

case $choice in
    1) install_user ;;
    2) install_system ;;
    3) install_shell ;;
    *) echo "Invalid choice" ;;
esac
`;
        return script;
    }
    
    // Connect to backend for real-time updates
    connectWebSocket(url = 'ws://localhost:8080/nixite') {
        this.ws = new WebSocket(url);
        
        this.ws.onopen = () => {
            console.log('Connected to Nixite backend');
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleBackendMessage(data);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
    
    handleBackendMessage(data) {
        switch (data.type) {
            case 'install_progress':
                console.log(`Installation progress: ${data.progress}%`);
                break;
            case 'install_complete':
                console.log(`✅ Installation complete: ${data.packageId}`);
                this.installed.add(data.packageId);
                this.saveInstalled();
                break;
            case 'install_error':
                console.error(`❌ Installation failed: ${data.error}`);
                break;
        }
    }
    
    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Export configuration for sharing
    exportConfiguration() {
        return {
            version: '1.0',
            timestamp: new Date().toISOString(),
            packages: Array.from(this.installed),
            method: this.defaultMethod,
            profile: this.detectProfile()
        };
    }
    
    // Import configuration from another user
    async importConfiguration(config) {
        const { packages } = config;
        return this.installBatch(packages);
    }
    
    // Detect user profile based on installed packages
    detectProfile() {
        const developerPackages = ['vscode', 'git', 'docker', 'nodejs'];
        const creatorPackages = ['gimp', 'krita', 'blender'];
        const gamerPackages = ['steam', 'lutris', 'discord'];
        
        let scores = {
            developer: 0,
            creator: 0,
            gamer: 0,
            general: 0
        };
        
        for (const pkg of this.installed) {
            if (developerPackages.includes(pkg)) scores.developer++;
            if (creatorPackages.includes(pkg)) scores.creator++;
            if (gamerPackages.includes(pkg)) scores.gamer++;
        }
        
        // Return profile with highest score
        return Object.entries(scores).reduce((a, b) => 
            scores[a[0]] > scores[b[0]] ? a : b
        )[0];
    }
}

// Initialize and export
const nixiteInstaller = new NixiteInstallManager();

// Example usage
if (typeof window !== 'undefined') {
    window.nixiteInstaller = nixiteInstaller;
    
    // Add installation UI handlers
    window.installPackage = async (packageId) => {
        console.log(`🚀 Installing ${packageId}...`);
        
        await nixiteInstaller.installPackage(packageId, {
            onProgress: (phase) => {
                console.log(`📦 ${phase.message} (${phase.progress}%)`);
            },
            onComplete: (result) => {
                console.log(`✅ ${result.message}`);
                alert(`Successfully installed ${packageId}!`);
            },
            onError: (error) => {
                console.error(`❌ ${error.message}`);
                alert(`Failed to install ${packageId}: ${error.message}`);
            }
        });
    };
    
    // Profile installation
    window.installProfile = async (profileName) => {
        console.log(`🎯 Installing ${profileName} profile...`);
        const results = await nixiteInstaller.installProfile(profileName);
        console.log('Installation results:', results);
    };
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NixiteInstallManager;
}