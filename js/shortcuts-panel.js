/**
 * Keyboard Shortcuts Help Panel
 *
 * Displays all available keyboard shortcuts in a searchable, categorized panel.
 * Press ? to open the shortcuts help.
 *
 * @version 2.6.0
 * @author Nixite Team
 */

class ShortcutsPanel {
    constructor() {
        this.shortcuts = this.getAllShortcuts();
        this.init();
    }

    init() {
        this.createPanel();
        this.setupEventListeners();
    }

    getAllShortcuts() {
        return {
            general: {
                title: 'General',
                icon: '⚡',
                shortcuts: [
                    { keys: ['?'], description: 'Show keyboard shortcuts', action: 'Help' },
                    { keys: ['Esc'], description: 'Close modal/panel', action: 'Close' },
                    { keys: ['Ctrl', 'K'], description: 'Open command palette', action: 'Command Palette', mac: ['⌘', 'K'] },
                    { keys: ['Ctrl', '/'], description: 'Focus search', action: 'Search', mac: ['⌘', '/'] },
                    { keys: ['Ctrl', 'H'], description: 'Go to home', action: 'Home', mac: ['⌘', 'H'] }
                ]
            },
            search: {
                title: 'Search & Filter',
                icon: '🔍',
                shortcuts: [
                    { keys: ['Ctrl', 'F'], description: 'Open search', action: 'Search', mac: ['⌘', 'F'] },
                    { keys: ['Ctrl', 'Shift', 'F'], description: 'Open filter builder', action: 'Advanced Filter', mac: ['⌘', 'Shift', 'F'] },
                    { keys: ['Enter'], description: 'Execute search', action: 'Search' },
                    { keys: ['Ctrl', 'L'], description: 'Clear search', action: 'Clear', mac: ['⌘', 'L'] },
                    { keys: ['↑', '↓'], description: 'Navigate results', action: 'Navigation' },
                    { keys: ['Tab'], description: 'Next search suggestion', action: 'Suggestions' }
                ]
            },
            packages: {
                title: 'Package Actions',
                icon: '📦',
                shortcuts: [
                    { keys: ['Enter'], description: 'Open package details', action: 'View Details' },
                    { keys: ['F'], description: 'Toggle favorite', action: 'Favorite' },
                    { keys: ['C'], description: 'Add to collection', action: 'Collection' },
                    { keys: ['I'], description: 'View installation commands', action: 'Install' },
                    { keys: ['S'], description: 'Share package', action: 'Share' },
                    { keys: ['Ctrl', 'C'], description: 'Copy package ID', action: 'Copy', mac: ['⌘', 'C'] }
                ]
            },
            panels: {
                title: 'Panels & Views',
                icon: '🎛️',
                shortcuts: [
                    { keys: ['Ctrl', 'B'], description: 'Toggle sidebar', action: 'Sidebar', mac: ['⌘', 'B'] },
                    { keys: ['Ctrl', '1'], description: 'Open favorites panel', action: 'Favorites', mac: ['⌘', '1'] },
                    { keys: ['Ctrl', '2'], description: 'Open collections panel', action: 'Collections', mac: ['⌘', '2'] },
                    { keys: ['Ctrl', '3'], description: 'Open comparison panel', action: 'Compare', mac: ['⌘', '3'] },
                    { keys: ['Ctrl', '4'], description: 'Open history panel', action: 'History', mac: ['⌘', '4'] },
                    { keys: ['Ctrl', '5'], description: 'Open statistics panel', action: 'Stats', mac: ['⌘', '5'] }
                ]
            },
            comparison: {
                title: 'Comparison',
                icon: '⚖️',
                shortcuts: [
                    { keys: ['Ctrl', 'Shift', 'C'], description: 'Add to comparison', action: 'Add', mac: ['⌘', 'Shift', 'C'] },
                    { keys: ['Ctrl', 'Shift', 'V'], description: 'View comparison', action: 'View', mac: ['⌘', 'Shift', 'V'] },
                    { keys: ['Ctrl', 'Shift', 'X'], description: 'Clear comparison', action: 'Clear', mac: ['⌘', 'Shift', 'X'] }
                ]
            },
            data: {
                title: 'Data Management',
                icon: '💾',
                shortcuts: [
                    { keys: ['Ctrl', 'E'], description: 'Export data', action: 'Export', mac: ['⌘', 'E'] },
                    { keys: ['Ctrl', 'I'], description: 'Import data', action: 'Import', mac: ['⌘', 'I'] },
                    { keys: ['Ctrl', 'T'], description: 'Toggle theme panel', action: 'Themes', mac: ['⌘', 'T'] },
                    { keys: ['Ctrl', 'P'], description: 'Print current view', action: 'Print', mac: ['⌘', 'P'] }
                ]
            },
            navigation: {
                title: 'Navigation',
                icon: '🧭',
                shortcuts: [
                    { keys: ['G', 'H'], description: 'Go to home', action: 'Home' },
                    { keys: ['G', 'F'], description: 'Go to favorites', action: 'Favorites' },
                    { keys: ['G', 'C'], description: 'Go to collections', action: 'Collections' },
                    { keys: ['G', 'S'], description: 'Go to statistics', action: 'Stats' },
                    { keys: ['G', 'T'], description: 'Go to settings', action: 'Settings' }
                ]
            },
            accessibility: {
                title: 'Accessibility',
                icon: '♿',
                shortcuts: [
                    { keys: ['Alt', '1'], description: 'Skip to content', action: 'Skip' },
                    { keys: ['Alt', '2'], description: 'Skip to navigation', action: 'Skip Nav' },
                    { keys: ['Ctrl', '+'], description: 'Increase font size', action: 'Zoom In', mac: ['⌘', '+'] },
                    { keys: ['Ctrl', '-'], description: 'Decrease font size', action: 'Zoom Out', mac: ['⌘', '-'] },
                    { keys: ['Ctrl', '0'], description: 'Reset font size', action: 'Reset Zoom', mac: ['⌘', '0'] }
                ]
            }
        };
    }

    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'shortcuts-panel';
        panel.className = 'shortcuts-panel';
        panel.innerHTML = `
            <div class="shortcuts-overlay" onclick="shortcutsPanel.closePanel()"></div>
            <div class="shortcuts-container">
                <div class="shortcuts-header">
                    <div class="header-title">
                        <h2>⌨️ Keyboard Shortcuts</h2>
                        <p class="header-subtitle">Master Nixite with these keyboard shortcuts</p>
                    </div>
                    <button class="btn-close" onclick="shortcutsPanel.closePanel()">×</button>
                </div>

                <div class="shortcuts-search">
                    <input
                        type="text"
                        id="shortcuts-search-input"
                        placeholder="Search shortcuts..."
                        autocomplete="off"
                    >
                    <span class="search-icon">🔍</span>
                </div>

                <div class="shortcuts-body" id="shortcuts-body">
                    ${this.renderAllCategories()}
                </div>

                <div class="shortcuts-footer">
                    <div class="footer-info">
                        <span class="platform-info">${this.getPlatformInfo()}</span>
                        <button class="btn btn-secondary" onclick="shortcutsPanel.printShortcuts()">
                            🖨️ Print Reference
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    }

    renderAllCategories() {
        return Object.entries(this.shortcuts).map(([key, category]) =>
            this.renderCategory(category)
        ).join('');
    }

    renderCategory(category) {
        return `
            <div class="shortcuts-category" data-category="${category.title.toLowerCase()}">
                <h3 class="category-title">
                    <span class="category-icon">${category.icon}</span>
                    ${category.title}
                </h3>
                <div class="shortcuts-grid">
                    ${category.shortcuts.map(s => this.renderShortcut(s)).join('')}
                </div>
            </div>
        `;
    }

    renderShortcut(shortcut) {
        const isMac = this.isMac();
        const keys = isMac && shortcut.mac ? shortcut.mac : shortcut.keys;

        return `
            <div class="shortcut-item" data-action="${shortcut.action.toLowerCase()}">
                <div class="shortcut-keys">
                    ${keys.map(key => `<kbd class="key">${key}</kbd>`).join('<span class="key-separator">+</span>')}
                </div>
                <div class="shortcut-description">${shortcut.description}</div>
            </div>
        `;
    }

    setupEventListeners() {
        // ? key to open panel
        document.addEventListener('keydown', (e) => {
            if (e.key === '?' && !this.isInputFocused()) {
                e.preventDefault();
                this.openPanel();
            }
        });

        // ESC to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePanel();
            }
        });

        // Search functionality
        setTimeout(() => {
            const searchInput = document.getElementById('shortcuts-search-input');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.filterShortcuts(e.target.value);
                });
            }
        }, 100);
    }

    filterShortcuts(query) {
        const lowerQuery = query.toLowerCase();
        const categories = document.querySelectorAll('.shortcuts-category');

        categories.forEach(category => {
            const shortcuts = category.querySelectorAll('.shortcut-item');
            let visibleCount = 0;

            shortcuts.forEach(shortcut => {
                const action = shortcut.dataset.action;
                const description = shortcut.querySelector('.shortcut-description').textContent.toLowerCase();
                const keys = Array.from(shortcut.querySelectorAll('.key'))
                    .map(k => k.textContent.toLowerCase())
                    .join(' ');

                const matches = !query ||
                    action.includes(lowerQuery) ||
                    description.includes(lowerQuery) ||
                    keys.includes(lowerQuery);

                shortcut.style.display = matches ? '' : 'none';
                if (matches) visibleCount++;
            });

            // Hide category if no visible shortcuts
            category.style.display = visibleCount > 0 ? '' : 'none';
        });

        // Show "no results" message
        const body = document.getElementById('shortcuts-body');
        let noResults = body.querySelector('.no-results');

        const hasVisibleCategories = Array.from(categories).some(cat =>
            cat.style.display !== 'none'
        );

        if (!hasVisibleCategories && query) {
            if (!noResults) {
                noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.innerHTML = `
                    <p>No shortcuts found for "${query}"</p>
                    <p class="no-results-hint">Try searching for actions like "search", "favorite", or "export"</p>
                `;
                body.appendChild(noResults);
            }
        } else if (noResults) {
            noResults.remove();
        }
    }

    openPanel() {
        const panel = document.getElementById('shortcuts-panel');
        panel.classList.add('active');

        // Focus search input
        setTimeout(() => {
            const searchInput = document.getElementById('shortcuts-search-input');
            if (searchInput) searchInput.focus();
        }, 100);
    }

    closePanel() {
        const panel = document.getElementById('shortcuts-panel');
        panel.classList.remove('active');

        // Clear search
        const searchInput = document.getElementById('shortcuts-search-input');
        if (searchInput) {
            searchInput.value = '';
            this.filterShortcuts('');
        }
    }

    printShortcuts() {
        const printWindow = window.open('', '_blank');
        const content = this.generatePrintContent();

        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    }

    generatePrintContent() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Nixite Keyboard Shortcuts</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                        padding: 40px;
                        max-width: 900px;
                        margin: 0 auto;
                    }
                    h1 {
                        color: #7c3aed;
                        border-bottom: 3px solid #7c3aed;
                        padding-bottom: 10px;
                    }
                    h2 {
                        color: #1f2937;
                        margin-top: 30px;
                        font-size: 20px;
                    }
                    .shortcuts-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 15px;
                        margin-bottom: 30px;
                    }
                    .shortcut-item {
                        display: flex;
                        justify-content: space-between;
                        padding: 10px;
                        border: 1px solid #e5e7eb;
                        border-radius: 4px;
                    }
                    kbd {
                        background: #f3f4f6;
                        border: 1px solid #d1d5db;
                        border-radius: 3px;
                        padding: 2px 6px;
                        font-family: monospace;
                        font-size: 12px;
                    }
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        color: #6b7280;
                    }
                    @media print {
                        .shortcuts-grid {
                            page-break-inside: avoid;
                        }
                    }
                </style>
            </head>
            <body>
                <h1>⌨️ Nixite Keyboard Shortcuts Reference</h1>
                ${Object.entries(this.shortcuts).map(([key, category]) => `
                    <h2>${category.icon} ${category.title}</h2>
                    <div class="shortcuts-grid">
                        ${category.shortcuts.map(s => {
                            const isMac = this.isMac();
                            const keys = isMac && s.mac ? s.mac : s.keys;
                            return `
                                <div class="shortcut-item">
                                    <span>${s.description}</span>
                                    <span>${keys.map(k => `<kbd>${k}</kbd>`).join(' + ')}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `).join('')}
                <div class="footer">
                    <p>Nixite - NixOS Package Discovery Tool</p>
                    <p>Generated on ${new Date().toLocaleDateString()}</p>
                </div>
            </body>
            </html>
        `;
    }

    isMac() {
        return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    }

    getPlatformInfo() {
        return this.isMac() ?
            '⌘ Command, ⌥ Option, ⌃ Control' :
            'Ctrl, Alt, Shift';
    }

    isInputFocused() {
        const active = document.activeElement;
        return active && (
            active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.isContentEditable
        );
    }
}

// Initialize
let shortcutsPanel;
document.addEventListener('DOMContentLoaded', () => {
    shortcutsPanel = new ShortcutsPanel();
});
