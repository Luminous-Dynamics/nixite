/**
 * Nixite Theme Manager
 *
 * Allows users to customize the appearance with preset themes and custom colors
 */

class ThemeManager {
    constructor() {
        this.storageKey = 'nixite-theme';
        this.currentTheme = this.loadTheme();
        this.presetThemes = this.getPresetThemes();
    }

    /**
     * Initialize theme manager
     */
    initialize() {
        this.applyTheme(this.currentTheme);
        this.createThemePanel();
        console.log('✓ Theme Manager initialized');
    }

    /**
     * Get preset themes
     */
    getPresetThemes() {
        return {
            default: {
                name: 'Default Purple',
                colors: {
                    primary: '#7c3aed',
                    primaryDark: '#6d28d9',
                    primaryLight: '#a78bfa',
                    secondary: '#06b6d4',
                    accent: '#f59e0b'
                }
            },
            ocean: {
                name: 'Ocean Blue',
                colors: {
                    primary: '#0ea5e9',
                    primaryDark: '#0284c7',
                    primaryLight: '#38bdf8',
                    secondary: '#06b6d4',
                    accent: '#14b8a6'
                }
            },
            forest: {
                name: 'Forest Green',
                colors: {
                    primary: '#10b981',
                    primaryDark: '#059669',
                    primaryLight: '#34d399',
                    secondary: '#14b8a6',
                    accent: '#f59e0b'
                }
            },
            sunset: {
                name: 'Sunset Orange',
                colors: {
                    primary: '#f97316',
                    primaryDark: '#ea580c',
                    primaryLight: '#fb923c',
                    secondary: '#f59e0b',
                    accent: '#ef4444'
                }
            },
            rose: {
                name: 'Rose Pink',
                colors: {
                    primary: '#ec4899',
                    primaryDark: '#db2777',
                    primaryLight: '#f472b6',
                    secondary: '#f43f5e',
                    accent: '#f59e0b'
                }
            },
            midnight: {
                name: 'Midnight Purple',
                colors: {
                    primary: '#8b5cf6',
                    primaryDark: '#7c3aed',
                    primaryLight: '#a78bfa',
                    secondary: '#6366f1',
                    accent: '#ec4899'
                }
            },
            crimson: {
                name: 'Crimson Red',
                colors: {
                    primary: '#dc2626',
                    primaryDark: '#b91c1c',
                    primaryLight: '#ef4444',
                    secondary: '#f97316',
                    accent: '#f59e0b'
                }
            },
            teal: {
                name: 'Teal Dream',
                colors: {
                    primary: '#14b8a6',
                    primaryDark: '#0d9488',
                    primaryLight: '#2dd4bf',
                    secondary: '#06b6d4',
                    accent: '#10b981'
                }
            }
        };
    }

    /**
     * Load theme from storage
     */
    loadTheme() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {
                preset: 'default',
                custom: false,
                colors: this.presetThemes.default.colors
            };
        } catch (error) {
            console.error('Error loading theme:', error);
            return {
                preset: 'default',
                custom: false,
                colors: this.presetThemes.default.colors
            };
        }
    }

    /**
     * Save theme to storage
     */
    saveTheme() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.currentTheme));
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    }

    /**
     * Apply theme
     */
    applyTheme(theme) {
        const root = document.documentElement;

        root.style.setProperty('--primary', theme.colors.primary);
        root.style.setProperty('--primary-dark', theme.colors.primaryDark);
        root.style.setProperty('--primary-light', theme.colors.primaryLight);
        root.style.setProperty('--secondary', theme.colors.secondary);
        root.style.setProperty('--accent', theme.colors.accent);

        this.currentTheme = theme;
        this.saveTheme();

        // Update meta theme color for mobile browsers
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', theme.colors.primary);
        }
    }

    /**
     * Set preset theme
     */
    setPreset(presetName) {
        const preset = this.presetThemes[presetName];
        if (!preset) return;

        this.applyTheme({
            preset: presetName,
            custom: false,
            colors: preset.colors
        });

        this.showNotification(`Theme changed to ${preset.name}`, 'success');
    }

    /**
     * Set custom theme
     */
    setCustom(colors) {
        this.applyTheme({
            preset: null,
            custom: true,
            colors
        });

        this.showNotification('Custom theme applied', 'success');
    }

    /**
     * Reset to default theme
     */
    resetToDefault() {
        this.setPreset('default');
    }

    /**
     * Create theme customization panel
     */
    createThemePanel() {
        // Panel will be opened via modal system
        window.openThemePanel = () => {
            this.openThemePanel();
        };
    }

    /**
     * Open theme customization panel
     */
    openThemePanel() {
        const panel = document.createElement('div');
        panel.className = 'theme-panel-overlay';
        panel.innerHTML = `
            <div class="theme-panel">
                <div class="theme-panel-header">
                    <h2>🎨 Customize Theme</h2>
                    <button class="theme-panel-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</button>
                </div>
                <div class="theme-panel-body">
                    ${this.renderPresetThemes()}
                    ${this.renderCustomTheme()}
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        // Close on overlay click
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                panel.remove();
            }
        });
    }

    /**
     * Render preset themes
     */
    renderPresetThemes() {
        return `
            <div class="theme-section">
                <h3>Preset Themes</h3>
                <div class="theme-grid">
                    ${Object.entries(this.presetThemes).map(([key, theme]) => `
                        <div class="theme-card ${this.currentTheme.preset === key ? 'active' : ''}"
                             onclick="themeManager.setPreset('${key}')">
                            <div class="theme-preview">
                                <div class="theme-color" style="background: ${theme.colors.primary}"></div>
                                <div class="theme-color" style="background: ${theme.colors.secondary}"></div>
                                <div class="theme-color" style="background: ${theme.colors.accent}"></div>
                            </div>
                            <div class="theme-name">${theme.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render custom theme editor
     */
    renderCustomTheme() {
        const colors = this.currentTheme.colors;

        return `
            <div class="theme-section">
                <h3>Custom Colors</h3>
                <div class="color-pickers">
                    <div class="color-picker-item">
                        <label for="color-primary">Primary Color</label>
                        <input type="color" id="color-primary" value="${colors.primary}">
                    </div>
                    <div class="color-picker-item">
                        <label for="color-secondary">Secondary Color</label>
                        <input type="color" id="color-secondary" value="${colors.secondary}">
                    </div>
                    <div class="color-picker-item">
                        <label for="color-accent">Accent Color</label>
                        <input type="color" id="color-accent" value="${colors.accent}">
                    </div>
                </div>
                <div class="theme-actions">
                    <button class="btn btn-secondary" onclick="themeManager.applyCustomColors()">
                        Apply Custom Theme
                    </button>
                    <button class="btn btn-ghost" onclick="themeManager.resetToDefault()">
                        Reset to Default
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Apply custom colors from picker
     */
    applyCustomColors() {
        const primary = document.getElementById('color-primary')?.value;
        const secondary = document.getElementById('color-secondary')?.value;
        const accent = document.getElementById('color-accent')?.value;

        if (!primary || !secondary || !accent) return;

        // Generate light and dark variants
        const colors = {
            primary,
            primaryDark: this.darkenColor(primary, 10),
            primaryLight: this.lightenColor(primary, 20),
            secondary,
            accent
        };

        this.setCustom(colors);
    }

    /**
     * Darken a hex color
     */
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }

    /**
     * Lighten a hex color
     */
    lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R : 255) * 0x10000 +
            (G < 255 ? G : 255) * 0x100 +
            (B < 255 ? B : 255))
            .toString(16).slice(1);
    }

    /**
     * Export theme
     */
    exportTheme() {
        const theme = {
            name: prompt('Theme name:') || 'My Custom Theme',
            colors: this.currentTheme.colors,
            created: new Date().toISOString()
        };

        const json = JSON.stringify(theme, null, 2);
        this.downloadFile('nixite-theme.json', json);
    }

    /**
     * Import theme
     */
    importTheme() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const theme = JSON.parse(text);

                if (theme.colors) {
                    this.setCustom(theme.colors);
                    this.showNotification(`Theme "${theme.name || 'Imported'}" applied`, 'success');
                }
            } catch (error) {
                console.error('Import failed:', error);
                this.showNotification('Failed to import theme', 'error');
            }
        });

        input.click();
    }

    /**
     * Download file
     */
    downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        if (window.nixiteUI && window.nixiteUI.showNotification) {
            window.nixiteUI.showNotification('', message, type);
        }
    }

    /**
     * Get current theme info
     */
    getCurrentTheme() {
        return {
            ...this.currentTheme,
            presetName: this.currentTheme.preset ? this.presetThemes[this.currentTheme.preset]?.name : 'Custom'
        };
    }
}

// Create global instance
window.themeManager = new ThemeManager();

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager.initialize();
    });
} else {
    window.themeManager.initialize();
}

// Add CSS styles for theme panel
const style = document.createElement('style');
style.textContent = `
    .theme-panel-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    }

    .theme-panel {
        background: white;
        border-radius: 20px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
    }

    .theme-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        border-bottom: 2px solid var(--gray-200);
    }

    .theme-panel-header h2 {
        font-size: 1.5rem;
        color: var(--gray-900);
    }

    .theme-panel-close {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        background: var(--gray-100);
        font-size: 1.25rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .theme-panel-close:hover {
        background: var(--gray-200);
        transform: rotate(90deg);
    }

    .theme-panel-body {
        padding: 24px;
    }

    .theme-section {
        margin-bottom: 32px;
    }

    .theme-section h3 {
        font-size: 1.25rem;
        margin-bottom: 16px;
        color: var(--gray-900);
    }

    .theme-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 16px;
    }

    .theme-card {
        cursor: pointer;
        border: 3px solid var(--gray-200);
        border-radius: 12px;
        padding: 12px;
        transition: all 0.2s;
    }

    .theme-card:hover {
        border-color: var(--gray-300);
        transform: translateY(-2px);
    }

    .theme-card.active {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }

    .theme-preview {
        display: flex;
        gap: 4px;
        margin-bottom: 8px;
        height: 60px;
    }

    .theme-color {
        flex: 1;
        border-radius: 6px;
    }

    .theme-name {
        font-size: 0.875rem;
        font-weight: 600;
        text-align: center;
        color: var(--gray-700);
    }

    .color-pickers {
        display: grid;
        gap: 16px;
        margin-bottom: 20px;
    }

    .color-picker-item {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .color-picker-item label {
        flex: 1;
        font-weight: 600;
        color: var(--gray-700);
    }

    .color-picker-item input[type="color"] {
        width: 80px;
        height: 40px;
        border: 2px solid var(--gray-300);
        border-radius: 8px;
        cursor: pointer;
    }

    .theme-actions {
        display: flex;
        gap: 12px;
    }

    @media (max-width: 768px) {
        .theme-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .color-picker-item {
            flex-direction: column;
            align-items: flex-start;
        }

        .theme-actions {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(style);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThemeManager };
}
