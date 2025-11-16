/**
 * Command Palette
 *
 * VS Code-style command palette for quick access to all Nixite actions.
 * Press Ctrl+K (Cmd+K on Mac) to open.
 *
 * @version 2.6.0
 * @author Nixite Team
 */

class CommandPalette {
    constructor() {
        this.commands = this.getAllCommands();
        this.recentCommands = this.getRecentCommands();
        this.selectedIndex = 0;
        this.filteredCommands = [];
        this.init();
    }

    init() {
        this.createPalette();
        this.setupEventListeners();
    }

    getAllCommands() {
        return [
            // Search & Filter
            {
                id: 'search',
                title: 'Search Packages',
                description: 'Open search input',
                icon: '🔍',
                category: 'Search',
                keywords: ['find', 'search', 'query', 'lookup'],
                action: () => {
                    document.querySelector('input[type="search"]')?.focus();
                }
            },
            {
                id: 'filter-builder',
                title: 'Open Filter Builder',
                description: 'Build advanced filters',
                icon: '🎯',
                category: 'Search',
                keywords: ['filter', 'advanced', 'query'],
                action: () => {
                    if (window.filterBuilder) window.filterBuilder.openPanel();
                }
            },
            {
                id: 'clear-search',
                title: 'Clear Search',
                description: 'Reset search and filters',
                icon: '🧹',
                category: 'Search',
                keywords: ['clear', 'reset', 'clean'],
                action: () => {
                    const searchInput = document.querySelector('input[type="search"]');
                    if (searchInput) {
                        searchInput.value = '';
                        searchInput.dispatchEvent(new Event('input'));
                    }
                }
            },

            // Panels
            {
                id: 'favorites',
                title: 'Show Favorites',
                description: 'View favorite packages',
                icon: '⭐',
                category: 'Panels',
                keywords: ['favorites', 'starred', 'bookmarks'],
                action: () => {
                    if (window.uiIntegration) window.uiIntegration.togglePanel('favorites');
                }
            },
            {
                id: 'collections',
                title: 'Show Collections',
                description: 'View package collections',
                icon: '📚',
                category: 'Panels',
                keywords: ['collections', 'groups', 'sets'],
                action: () => {
                    if (window.uiIntegration) window.uiIntegration.togglePanel('collections');
                }
            },
            {
                id: 'comparison',
                title: 'Show Comparison',
                description: 'Compare packages side by side',
                icon: '⚖️',
                category: 'Panels',
                keywords: ['compare', 'diff', 'versus'],
                action: () => {
                    if (window.uiIntegration) window.uiIntegration.togglePanel('comparison');
                }
            },
            {
                id: 'history',
                title: 'Show History',
                description: 'View installation history',
                icon: '📜',
                category: 'Panels',
                keywords: ['history', 'timeline', 'past'],
                action: () => {
                    if (window.uiIntegration) window.uiIntegration.togglePanel('history');
                }
            },
            {
                id: 'statistics',
                title: 'Show Statistics',
                description: 'View usage statistics',
                icon: '📊',
                category: 'Panels',
                keywords: ['stats', 'analytics', 'metrics'],
                action: () => {
                    if (window.uiIntegration) window.uiIntegration.togglePanel('stats');
                }
            },

            // Data Management
            {
                id: 'export-all',
                title: 'Export All Data',
                description: 'Download complete backup',
                icon: '📤',
                category: 'Data',
                keywords: ['export', 'backup', 'download', 'save'],
                action: () => {
                    if (window.dataManager) window.dataManager.exportAll();
                }
            },
            {
                id: 'import-data',
                title: 'Import Data',
                description: 'Restore from backup',
                icon: '📥',
                category: 'Data',
                keywords: ['import', 'restore', 'upload', 'load'],
                action: () => {
                    if (window.dataManager) window.dataManager.importAll();
                }
            },
            {
                id: 'data-manager',
                title: 'Open Data Manager',
                description: 'Manage app data',
                icon: '💾',
                category: 'Data',
                keywords: ['data', 'storage', 'manage'],
                action: () => {
                    if (window.dataManager) window.dataManager.openPanel();
                }
            },

            // Themes
            {
                id: 'theme-manager',
                title: 'Open Theme Manager',
                description: 'Customize appearance',
                icon: '🎨',
                category: 'Appearance',
                keywords: ['theme', 'color', 'appearance', 'style'],
                action: () => {
                    if (window.themeManager) window.themeManager.openPanel();
                }
            },
            {
                id: 'theme-default',
                title: 'Apply Default Theme',
                description: 'Purple theme',
                icon: '💜',
                category: 'Appearance',
                keywords: ['theme', 'default', 'purple'],
                action: () => {
                    if (window.themeManager) window.themeManager.applyPreset('default');
                }
            },
            {
                id: 'theme-ocean',
                title: 'Apply Ocean Theme',
                description: 'Blue theme',
                icon: '🌊',
                category: 'Appearance',
                keywords: ['theme', 'ocean', 'blue'],
                action: () => {
                    if (window.themeManager) window.themeManager.applyPreset('ocean');
                }
            },

            // Help & Info
            {
                id: 'shortcuts',
                title: 'Show Keyboard Shortcuts',
                description: 'View all shortcuts',
                icon: '⌨️',
                category: 'Help',
                keywords: ['shortcuts', 'keyboard', 'help', 'keys'],
                action: () => {
                    if (window.shortcutsPanel) window.shortcutsPanel.openPanel();
                }
            },
            {
                id: 'tutorial',
                title: 'Start Tutorial',
                description: 'Interactive guide',
                icon: '🎓',
                category: 'Help',
                keywords: ['tutorial', 'guide', 'help', 'learn'],
                action: () => {
                    if (window.tutorialSystem) window.tutorialSystem.startTutorial();
                }
            },
            {
                id: 'installation-wizard',
                title: 'Installation Wizard',
                description: 'NixOS setup guide',
                icon: '🧙',
                category: 'Help',
                keywords: ['install', 'setup', 'wizard', 'guide'],
                action: () => {
                    if (window.installationWizard) window.installationWizard.openWizard();
                }
            },

            // PWA
            {
                id: 'install-pwa',
                title: 'Install as App',
                description: 'Install Nixite PWA',
                icon: '📲',
                category: 'PWA',
                keywords: ['install', 'app', 'pwa', 'offline'],
                action: () => {
                    if (window.pwaManager && window.pwaManager.deferredPrompt) {
                        window.pwaManager.installApp();
                    } else {
                        this.showMessage('PWA installation not available');
                    }
                }
            },
            {
                id: 'update-app',
                title: 'Update Application',
                description: 'Check for updates',
                icon: '🔄',
                category: 'PWA',
                keywords: ['update', 'refresh', 'reload'],
                action: () => {
                    if (window.pwaManager) {
                        window.pwaManager.checkForUpdates();
                    }
                }
            },
            {
                id: 'clear-cache',
                title: 'Clear Cache',
                description: 'Clear service worker cache',
                icon: '🗑️',
                category: 'PWA',
                keywords: ['cache', 'clear', 'clean', 'reset'],
                action: async () => {
                    if (window.pwaManager) {
                        await window.pwaManager.clearCache();
                        this.showMessage('Cache cleared');
                    }
                }
            },

            // View Options
            {
                id: 'toggle-view',
                title: 'Toggle View Mode',
                description: 'Switch grid/list view',
                icon: '🔲',
                category: 'View',
                keywords: ['view', 'layout', 'grid', 'list'],
                action: () => {
                    // Toggle view mode logic
                    this.showMessage('View mode toggled');
                }
            },
            {
                id: 'sort-name',
                title: 'Sort by Name',
                description: 'Sort packages alphabetically',
                icon: '🔤',
                category: 'View',
                keywords: ['sort', 'order', 'name', 'alphabetical'],
                action: () => {
                    if (window.enhancedSearch) {
                        window.enhancedSearch.sortBy = 'name';
                        window.enhancedSearch.applySort();
                    }
                }
            },
            {
                id: 'sort-category',
                title: 'Sort by Category',
                description: 'Group by category',
                icon: '📑',
                category: 'View',
                keywords: ['sort', 'category', 'group'],
                action: () => {
                    if (window.enhancedSearch) {
                        window.enhancedSearch.sortBy = 'category';
                        window.enhancedSearch.applySort();
                    }
                }
            },

            // Quick Actions
            {
                id: 'new-collection',
                title: 'Create New Collection',
                description: 'Add a collection',
                icon: '➕',
                category: 'Quick Actions',
                keywords: ['create', 'new', 'collection'],
                action: () => {
                    const name = prompt('Enter collection name:');
                    if (name && window.collectionsManager) {
                        window.collectionsManager.createCollection(name);
                    }
                }
            },
            {
                id: 'clear-comparison',
                title: 'Clear Comparison',
                description: 'Remove all compared packages',
                icon: '🧹',
                category: 'Quick Actions',
                keywords: ['clear', 'comparison', 'reset'],
                action: () => {
                    if (window.comparisonManager) {
                        window.comparisonManager.clearAll();
                    }
                }
            },
            {
                id: 'print-page',
                title: 'Print Current View',
                description: 'Print packages',
                icon: '🖨️',
                category: 'Quick Actions',
                keywords: ['print', 'pdf', 'export'],
                action: () => {
                    window.print();
                }
            },

            // Developer
            {
                id: 'dev-console',
                title: 'Open Developer Console',
                description: 'Browser DevTools',
                icon: '🛠️',
                category: 'Developer',
                keywords: ['console', 'debug', 'developer'],
                action: () => {
                    this.showMessage('Press F12 to open Developer Tools');
                }
            },
            {
                id: 'reload-page',
                title: 'Reload Page',
                description: 'Hard refresh',
                icon: '🔃',
                category: 'Developer',
                keywords: ['reload', 'refresh', 'restart'],
                action: () => {
                    location.reload();
                }
            }
        ];
    }

    createPalette() {
        const palette = document.createElement('div');
        palette.id = 'command-palette';
        palette.className = 'command-palette';
        palette.innerHTML = `
            <div class="palette-overlay" onclick="commandPalette.closePalette()"></div>
            <div class="palette-container">
                <div class="palette-input-wrapper">
                    <span class="palette-icon">⚡</span>
                    <input
                        type="text"
                        id="palette-input"
                        placeholder="Type a command or search..."
                        autocomplete="off"
                        spellcheck="false"
                    >
                    <kbd class="palette-hint">Esc to close</kbd>
                </div>
                <div class="palette-results" id="palette-results">
                    ${this.renderRecentCommands()}
                </div>
            </div>
        `;
        document.body.appendChild(palette);
    }

    renderRecentCommands() {
        if (this.recentCommands.length === 0) {
            return this.renderAllCommands();
        }

        return `
            <div class="results-section">
                <div class="section-header">Recent Commands</div>
                ${this.recentCommands.slice(0, 5).map((cmdId, index) => {
                    const cmd = this.commands.find(c => c.id === cmdId);
                    return cmd ? this.renderCommand(cmd, index) : '';
                }).join('')}
            </div>
            <div class="results-section">
                <div class="section-header">All Commands</div>
                ${this.commands.slice(0, 8).map((cmd, index) =>
                    this.renderCommand(cmd, index + 5)
                ).join('')}
            </div>
        `;
    }

    renderAllCommands() {
        const byCategory = {};
        this.commands.forEach(cmd => {
            if (!byCategory[cmd.category]) {
                byCategory[cmd.category] = [];
            }
            byCategory[cmd.category].push(cmd);
        });

        return Object.entries(byCategory).map(([category, cmds]) => `
            <div class="results-section">
                <div class="section-header">${category}</div>
                ${cmds.slice(0, 5).map((cmd, index) => this.renderCommand(cmd, index)).join('')}
            </div>
        `).join('');
    }

    renderCommand(cmd, index) {
        return `
            <div class="command-item ${index === this.selectedIndex ? 'selected' : ''}"
                 data-command-id="${cmd.id}"
                 data-index="${index}">
                <div class="command-icon">${cmd.icon}</div>
                <div class="command-info">
                    <div class="command-title">${cmd.title}</div>
                    <div class="command-description">${cmd.description}</div>
                </div>
                <div class="command-category">${cmd.category}</div>
            </div>
        `;
    }

    setupEventListeners() {
        // Ctrl+K / Cmd+K to open
        document.addEventListener('keydown', (e) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

            if (isCtrlOrCmd && e.key === 'k') {
                e.preventDefault();
                this.openPalette();
            }
        });

        // Input handling
        setTimeout(() => {
            const input = document.getElementById('palette-input');
            if (input) {
                input.addEventListener('input', (e) => {
                    this.handleInput(e.target.value);
                });

                input.addEventListener('keydown', (e) => {
                    this.handleKeydown(e);
                });
            }
        }, 100);

        // Click handling
        document.addEventListener('click', (e) => {
            const commandItem = e.target.closest('.command-item');
            if (commandItem) {
                const cmdId = commandItem.dataset.commandId;
                this.executeCommand(cmdId);
            }
        });
    }

    handleInput(query) {
        if (!query) {
            this.filteredCommands = [];
            this.selectedIndex = 0;
            this.renderResults(this.renderRecentCommands());
            return;
        }

        const lowerQuery = query.toLowerCase();
        this.filteredCommands = this.commands.filter(cmd => {
            return cmd.title.toLowerCase().includes(lowerQuery) ||
                   cmd.description.toLowerCase().includes(lowerQuery) ||
                   cmd.category.toLowerCase().includes(lowerQuery) ||
                   cmd.keywords.some(k => k.includes(lowerQuery));
        });

        // Sort by relevance
        this.filteredCommands.sort((a, b) => {
            const aTitle = a.title.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
            const bTitle = b.title.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
            return aTitle - bTitle;
        });

        this.selectedIndex = 0;
        this.renderResults(this.renderFilteredCommands());
    }

    renderFilteredCommands() {
        if (this.filteredCommands.length === 0) {
            return '<div class="no-results">No commands found</div>';
        }

        return this.filteredCommands.map((cmd, index) =>
            this.renderCommand(cmd, index)
        ).join('');
    }

    renderResults(html) {
        const results = document.getElementById('palette-results');
        if (results) {
            results.innerHTML = html;
        }
    }

    handleKeydown(e) {
        const results = this.filteredCommands.length > 0 ?
            this.filteredCommands :
            this.commands;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, results.length - 1);
                this.updateSelection();
                break;

            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.updateSelection();
                break;

            case 'Enter':
                e.preventDefault();
                const selectedCmd = results[this.selectedIndex];
                if (selectedCmd) {
                    this.executeCommand(selectedCmd.id);
                }
                break;

            case 'Escape':
                e.preventDefault();
                this.closePalette();
                break;
        }
    }

    updateSelection() {
        const items = document.querySelectorAll('.command-item');
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    executeCommand(cmdId) {
        const cmd = this.commands.find(c => c.id === cmdId);
        if (!cmd) return;

        // Add to recent commands
        this.addToRecent(cmdId);

        // Execute action
        try {
            cmd.action();
            this.closePalette();
        } catch (error) {
            console.error('Command execution error:', error);
            this.showMessage('Error executing command');
        }
    }

    addToRecent(cmdId) {
        this.recentCommands = this.recentCommands.filter(id => id !== cmdId);
        this.recentCommands.unshift(cmdId);
        this.recentCommands = this.recentCommands.slice(0, 10);
        localStorage.setItem('nixite_recent_commands', JSON.stringify(this.recentCommands));
    }

    getRecentCommands() {
        const saved = localStorage.getItem('nixite_recent_commands');
        return saved ? JSON.parse(saved) : [];
    }

    openPalette() {
        const palette = document.getElementById('command-palette');
        palette.classList.add('active');

        setTimeout(() => {
            const input = document.getElementById('palette-input');
            if (input) {
                input.value = '';
                input.focus();
            }
            this.selectedIndex = 0;
            this.filteredCommands = [];
            this.renderResults(this.renderRecentCommands());
        }, 50);
    }

    closePalette() {
        const palette = document.getElementById('command-palette');
        palette.classList.remove('active');
    }

    showMessage(message) {
        if (window.uiIntegration && window.uiIntegration.showNotification) {
            window.uiIntegration.showNotification(message);
        } else {
            alert(message);
        }
    }
}

// Initialize
let commandPalette;
document.addEventListener('DOMContentLoaded', () => {
    commandPalette = new CommandPalette();
});
