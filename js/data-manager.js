/**
 * Nixite Data Manager
 *
 * Complete data export/import system for backing up and restoring all user data
 */

class DataManager {
    constructor() {
        this.version = '2.4.0';
    }

    /**
     * Export all user data
     */
    exportAll() {
        const data = {
            version: this.version,
            exported: new Date().toISOString(),
            data: {
                favorites: this.exportFavorites(),
                collections: this.exportCollections(),
                comparison: this.exportComparison(),
                history: this.exportHistory(),
                searches: this.exportSearches(),
                theme: this.exportTheme(),
                settings: this.exportSettings()
            }
        };

        const json = JSON.stringify(data, null, 2);
        const filename = `nixite-backup-${this.formatDate()}.json`;

        this.downloadFile(filename, json);
        this.showNotification('All data exported successfully', 'success');

        return data;
    }

    /**
     * Import all user data
     */
    async importAll() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';

        return new Promise((resolve, reject) => {
            input.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) {
                    reject(new Error('No file selected'));
                    return;
                }

                try {
                    const text = await file.text();
                    const backup = JSON.parse(text);

                    if (!backup.version || !backup.data) {
                        throw new Error('Invalid backup file format');
                    }

                    const confirmed = confirm(
                        `Import backup from ${new Date(backup.exported).toLocaleString()}?\n\n` +
                        `This will replace your current data. Continue?`
                    );

                    if (!confirmed) {
                        reject(new Error('Import cancelled by user'));
                        return;
                    }

                    // Import all data
                    this.importFavorites(backup.data.favorites);
                    this.importCollections(backup.data.collections);
                    this.importComparison(backup.data.comparison);
                    this.importHistory(backup.data.history);
                    this.importSearches(backup.data.searches);
                    this.importTheme(backup.data.theme);
                    this.importSettings(backup.data.settings);

                    this.showNotification('Data imported successfully! Reloading...', 'success');

                    // Reload page to apply changes
                    setTimeout(() => window.location.reload(), 1500);

                    resolve(backup);
                } catch (error) {
                    console.error('Import failed:', error);
                    this.showNotification(`Import failed: ${error.message}`, 'error');
                    reject(error);
                }
            });

            input.click();
        });
    }

    /**
     * Export favorites
     */
    exportFavorites() {
        if (!window.favoritesManager) return [];
        return window.favoritesManager.getFavorites();
    }

    /**
     * Import favorites
     */
    importFavorites(favorites) {
        if (!window.favoritesManager || !favorites) return;

        favorites.forEach(packageId => {
            window.favoritesManager.addFavorite(packageId);
        });
    }

    /**
     * Export collections
     */
    exportCollections() {
        if (!window.favoritesManager) return [];
        return window.favoritesManager.getCollections();
    }

    /**
     * Import collections
     */
    importCollections(collections) {
        if (!window.favoritesManager || !collections) return;

        localStorage.setItem('nixite-collections', JSON.stringify(collections));
    }

    /**
     * Export comparison list
     */
    exportComparison() {
        if (!window.packageComparison) return [];
        return window.packageComparison.getCompareList();
    }

    /**
     * Import comparison list
     */
    importComparison(compareList) {
        if (!window.packageComparison || !compareList) return;

        localStorage.setItem('nixite-comparison', JSON.stringify(compareList));
    }

    /**
     * Export installation history
     */
    exportHistory() {
        if (!window.installHistory) return [];
        return window.installHistory.getHistory();
    }

    /**
     * Import installation history
     */
    importHistory(history) {
        if (!window.installHistory || !history) return;

        localStorage.setItem('nixite-installation-history', JSON.stringify(history));
    }

    /**
     * Export saved searches
     */
    exportSearches() {
        if (!window.enhancedSearch) return { saved: [], history: [] };

        return {
            saved: window.enhancedSearch.getSavedSearches(),
            history: window.enhancedSearch.searchHistory
        };
    }

    /**
     * Import saved searches
     */
    importSearches(searches) {
        if (!window.enhancedSearch || !searches) return;

        if (searches.saved) {
            localStorage.setItem('nixite-saved-searches', JSON.stringify(searches.saved));
        }

        if (searches.history) {
            localStorage.setItem('nixite-search-history', JSON.stringify(searches.history));
        }
    }

    /**
     * Export theme
     */
    exportTheme() {
        if (!window.themeManager) return null;
        return window.themeManager.getCurrentTheme();
    }

    /**
     * Import theme
     */
    importTheme(theme) {
        if (!window.themeManager || !theme) return;

        localStorage.setItem('nixite-theme', JSON.stringify(theme));
    }

    /**
     * Export settings
     */
    exportSettings() {
        return {
            darkMode: localStorage.getItem('theme') || 'light',
            accessibility: localStorage.getItem('nixite-accessibility-prefs') || '{}'
        };
    }

    /**
     * Import settings
     */
    importSettings(settings) {
        if (!settings) return;

        if (settings.darkMode) {
            localStorage.setItem('theme', settings.darkMode);
        }

        if (settings.accessibility) {
            localStorage.setItem('nixite-accessibility-prefs', settings.accessibility);
        }
    }

    /**
     * Get storage usage stats
     */
    getStorageStats() {
        const stats = {
            favorites: this.getStorageSize('nixite-favorites'),
            collections: this.getStorageSize('nixite-collections'),
            comparison: this.getStorageSize('nixite-comparison'),
            history: this.getStorageSize('nixite-installation-history'),
            searches: this.getStorageSize('nixite-saved-searches'),
            searchHistory: this.getStorageSize('nixite-search-history'),
            theme: this.getStorageSize('nixite-theme')
        };

        stats.total = Object.values(stats).reduce((a, b) => a + b, 0);

        return stats;
    }

    /**
     * Get storage size for a key
     */
    getStorageSize(key) {
        const item = localStorage.getItem(key);
        return item ? new Blob([item]).size : 0;
    }

    /**
     * Clear all data
     */
    clearAllData() {
        const confirmed = confirm(
            'This will delete ALL your Nixite data including:\n\n' +
            '• Favorites and collections\n' +
            '• Package comparisons\n' +
            '• Installation history\n' +
            '• Saved searches\n' +
            '• Theme customizations\n' +
            '• All settings\n\n' +
            'This action cannot be undone. Continue?'
        );

        if (!confirmed) return false;

        const doubleCheck = confirm('Are you absolutely sure? This cannot be undone!');

        if (!doubleCheck) return false;

        // Clear all localStorage items
        const keys = [
            'nixite-favorites',
            'nixite-collections',
            'nixite-comparison',
            'nixite-installation-history',
            'nixite-saved-searches',
            'nixite-search-history',
            'nixite-theme',
            'nixite-accessibility-prefs',
            'theme'
        ];

        keys.forEach(key => localStorage.removeItem(key));

        this.showNotification('All data cleared. Reloading...', 'success');

        setTimeout(() => window.location.reload(), 1500);

        return true;
    }

    /**
     * Create data management panel
     */
    openDataPanel() {
        const stats = this.getStorageStats();

        const panel = document.createElement('div');
        panel.className = 'data-panel-overlay';
        panel.innerHTML = `
            <div class="data-panel">
                <div class="data-panel-header">
                    <h2>💾 Data Management</h2>
                    <button class="data-panel-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</button>
                </div>
                <div class="data-panel-body">
                    ${this.renderStorageStats(stats)}
                    ${this.renderDataActions()}
                    ${this.renderIndividualExports()}
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
     * Render storage statistics
     */
    renderStorageStats(stats) {
        return `
            <div class="data-section">
                <h3>Storage Usage</h3>
                <div class="storage-stats">
                    ${Object.entries(stats).map(([key, size]) => `
                        <div class="storage-item">
                            <span class="storage-label">${this.formatStorageLabel(key)}:</span>
                            <span class="storage-size">${this.formatBytes(size)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render main data actions
     */
    renderDataActions() {
        return `
            <div class="data-section">
                <h3>Backup & Restore</h3>
                <div class="data-actions">
                    <button class="btn btn-primary btn-block" onclick="dataManager.exportAll()">
                        📦 Export All Data
                    </button>
                    <button class="btn btn-secondary btn-block" onclick="dataManager.importAll()">
                        📥 Import Data
                    </button>
                    <button class="btn btn-danger btn-block" onclick="dataManager.clearAllData()">
                        🗑️ Clear All Data
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render individual export options
     */
    renderIndividualExports() {
        return `
            <div class="data-section">
                <h3>Individual Exports</h3>
                <div class="individual-exports">
                    <button class="btn btn-sm btn-secondary" onclick="dataManager.exportIndividual('favorites')">
                        Export Favorites
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="dataManager.exportIndividual('history')">
                        Export History
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="dataManager.exportIndividual('theme')">
                        Export Theme
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="dataManager.exportIndividual('searches')">
                        Export Searches
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Export individual data type
     */
    exportIndividual(type) {
        let data, filename;

        switch (type) {
            case 'favorites':
                data = { favorites: this.exportFavorites(), collections: this.exportCollections() };
                filename = `nixite-favorites-${this.formatDate()}.json`;
                break;
            case 'history':
                data = this.exportHistory();
                filename = `nixite-history-${this.formatDate()}.json`;
                break;
            case 'theme':
                data = this.exportTheme();
                filename = `nixite-theme-${this.formatDate()}.json`;
                break;
            case 'searches':
                data = this.exportSearches();
                filename = `nixite-searches-${this.formatDate()}.json`;
                break;
            default:
                return;
        }

        const json = JSON.stringify(data, null, 2);
        this.downloadFile(filename, json);
        this.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} exported`, 'success');
    }

    /**
     * Format storage label
     */
    formatStorageLabel(key) {
        const labels = {
            favorites: 'Favorites',
            collections: 'Collections',
            comparison: 'Comparisons',
            history: 'History',
            searches: 'Saved Searches',
            searchHistory: 'Search History',
            theme: 'Theme',
            total: 'Total'
        };
        return labels[key] || key;
    }

    /**
     * Format bytes to human readable
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Format date for filename
     */
    formatDate() {
        const now = new Date();
        return now.toISOString().split('T')[0];
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
}

// Create global instance
window.dataManager = new DataManager();

// Add CSS styles for data panel
const style = document.createElement('style');
style.textContent = `
    .data-panel-overlay {
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

    .data-panel {
        background: white;
        border-radius: 20px;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
    }

    .data-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        border-bottom: 2px solid var(--gray-200);
    }

    .data-panel-header h2 {
        font-size: 1.5rem;
        color: var(--gray-900);
    }

    .data-panel-close {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        background: var(--gray-100);
        font-size: 1.25rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .data-panel-close:hover {
        background: var(--gray-200);
        transform: rotate(90deg);
    }

    .data-panel-body {
        padding: 24px;
    }

    .data-section {
        margin-bottom: 32px;
    }

    .data-section h3 {
        font-size: 1.25rem;
        margin-bottom: 16px;
        color: var(--gray-900);
    }

    .storage-stats {
        background: var(--gray-50);
        padding: 16px;
        border-radius: 12px;
    }

    .storage-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--gray-200);
    }

    .storage-item:last-child {
        border-bottom: 2px solid var(--primary);
        font-weight: 600;
        padding-top: 12px;
        margin-top: 4px;
    }

    .storage-label {
        color: var(--gray-700);
    }

    .storage-size {
        color: var(--primary);
        font-weight: 600;
    }

    .data-actions {
        display: grid;
        gap: 12px;
    }

    .individual-exports {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }

    .btn-block {
        width: 100%;
    }

    .btn-danger {
        background: var(--danger);
        color: white;
    }

    .btn-danger:hover {
        background: #dc2626;
    }

    .btn-sm {
        padding: 8px 16px;
        font-size: 0.875rem;
    }

    @media (max-width: 768px) {
        .individual-exports {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataManager };
}
