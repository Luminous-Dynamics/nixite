/**
 * Nixite Installation History Tracker
 *
 * Tracks package installations, updates, and removals.
 */

class InstallationHistory {
    constructor() {
        this.storageKey = 'nixite-installation-history';
        this.history = this.loadHistory();
        this.maxEntries = 1000; // Maximum history entries to keep
    }

    /**
     * Load history from localStorage
     */
    loadHistory() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading history:', error);
            return [];
        }
    }

    /**
     * Save history to localStorage
     */
    saveHistory() {
        try {
            // Trim to max entries
            if (this.history.length > this.maxEntries) {
                this.history = this.history.slice(-this.maxEntries);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(this.history));
            this.notifyChange();
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    /**
     * Add installation entry
     */
    addInstallation(packageId, packageName, status = 'success', message = '') {
        const entry = {
            id: this.generateId(),
            type: 'install',
            packageId,
            packageName,
            status, // success, failed, pending
            message,
            timestamp: new Date().toISOString()
        };

        this.history.push(entry);
        this.saveHistory();
        return entry;
    }

    /**
     * Add removal entry
     */
    addRemoval(packageId, packageName, status = 'success', message = '') {
        const entry = {
            id: this.generateId(),
            type: 'remove',
            packageId,
            packageName,
            status,
            message,
            timestamp: new Date().toISOString()
        };

        this.history.push(entry);
        this.saveHistory();
        return entry;
    }

    /**
     * Add update entry
     */
    addUpdate(packageId, packageName, fromVersion, toVersion, status = 'success', message = '') {
        const entry = {
            id: this.generateId(),
            type: 'update',
            packageId,
            packageName,
            fromVersion,
            toVersion,
            status,
            message,
            timestamp: new Date().toISOString()
        };

        this.history.push(entry);
        this.saveHistory();
        return entry;
    }

    /**
     * Update entry status
     */
    updateEntryStatus(entryId, status, message = '') {
        const entry = this.history.find(e => e.id === entryId);
        if (entry) {
            entry.status = status;
            if (message) entry.message = message;
            entry.updatedAt = new Date().toISOString();
            this.saveHistory();
            return entry;
        }
        return null;
    }

    /**
     * Get all history entries
     */
    getHistory() {
        return [...this.history].reverse(); // Most recent first
    }

    /**
     * Get history for a specific package
     */
    getPackageHistory(packageId) {
        return this.history
            .filter(entry => entry.packageId === packageId)
            .reverse();
    }

    /**
     * Get recent installations
     */
    getRecentInstallations(limit = 10) {
        return this.history
            .filter(entry => entry.type === 'install' && entry.status === 'success')
            .slice(-limit)
            .reverse();
    }

    /**
     * Get failed installations
     */
    getFailedInstallations() {
        return this.history
            .filter(entry => entry.status === 'failed')
            .reverse();
    }

    /**
     * Check if package was installed
     */
    wasInstalled(packageId) {
        return this.history.some(entry =>
            entry.packageId === packageId &&
            entry.type === 'install' &&
            entry.status === 'success'
        );
    }

    /**
     * Get last installation attempt for package
     */
    getLastInstallation(packageId) {
        const installations = this.history
            .filter(entry => entry.packageId === packageId && entry.type === 'install')
            .reverse();

        return installations[0] || null;
    }

    /**
     * Get installation statistics
     */
    getStats() {
        const stats = {
            total: this.history.length,
            installs: 0,
            removes: 0,
            updates: 0,
            successful: 0,
            failed: 0,
            pending: 0,
            uniquePackages: new Set(),
            byDate: {},
            byStatus: {},
            byType: {}
        };

        this.history.forEach(entry => {
            // Count by type
            stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
            if (entry.type === 'install') stats.installs++;
            if (entry.type === 'remove') stats.removes++;
            if (entry.type === 'update') stats.updates++;

            // Count by status
            stats.byStatus[entry.status] = (stats.byStatus[entry.status] || 0) + 1;
            if (entry.status === 'success') stats.successful++;
            if (entry.status === 'failed') stats.failed++;
            if (entry.status === 'pending') stats.pending++;

            // Track unique packages
            stats.uniquePackages.add(entry.packageId);

            // Count by date
            const date = entry.timestamp.split('T')[0];
            stats.byDate[date] = (stats.byDate[date] || 0) + 1;
        });

        stats.uniquePackages = stats.uniquePackages.size;

        return stats;
    }

    /**
     * Search history
     */
    searchHistory(query) {
        const lowerQuery = query.toLowerCase();
        return this.history.filter(entry =>
            entry.packageId.toLowerCase().includes(lowerQuery) ||
            entry.packageName.toLowerCase().includes(lowerQuery) ||
            (entry.message && entry.message.toLowerCase().includes(lowerQuery))
        ).reverse();
    }

    /**
     * Filter history by date range
     */
    filterByDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        return this.history.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= start && entryDate <= end;
        }).reverse();
    }

    /**
     * Filter history by type
     */
    filterByType(type) {
        return this.history
            .filter(entry => entry.type === type)
            .reverse();
    }

    /**
     * Filter history by status
     */
    filterByStatus(status) {
        return this.history
            .filter(entry => entry.status === status)
            .reverse();
    }

    /**
     * Clear history
     */
    clearHistory() {
        if (confirm('Are you sure you want to clear all installation history?')) {
            this.history = [];
            this.saveHistory();
            this.showNotification('History cleared', 'success');
            return true;
        }
        return false;
    }

    /**
     * Delete specific entry
     */
    deleteEntry(entryId) {
        const index = this.history.findIndex(e => e.id === entryId);
        if (index > -1) {
            this.history.splice(index, 1);
            this.saveHistory();
            return true;
        }
        return false;
    }

    /**
     * Export history as JSON
     */
    exportAsJSON() {
        return JSON.stringify({
            exported: new Date().toISOString(),
            stats: this.getStats(),
            history: this.history
        }, null, 2);
    }

    /**
     * Export history as CSV
     */
    exportAsCSV() {
        const headers = ['Timestamp', 'Type', 'Package ID', 'Package Name', 'Status', 'Message'];
        const rows = this.history.map(entry => [
            entry.timestamp,
            entry.type,
            entry.packageId,
            entry.packageName,
            entry.status,
            entry.message || ''
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell =>
                `"${String(cell).replace(/"/g, '""')}"`
            ).join(','))
        ].join('\n');

        return csv;
    }

    /**
     * Import history from JSON
     */
    importFromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            if (!data.history || !Array.isArray(data.history)) {
                throw new Error('Invalid history format');
            }

            if (confirm('This will merge with your existing history. Continue?')) {
                this.history = [...this.history, ...data.history];
                this.saveHistory();
                this.showNotification('History imported successfully', 'success');
                return true;
            }
        } catch (error) {
            console.error('Import error:', error);
            this.showNotification('Failed to import history', 'error');
        }
        return false;
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Notify change listeners
     */
    notifyChange() {
        window.dispatchEvent(new CustomEvent('nixite-history-changed', {
            detail: {
                stats: this.getStats(),
                recentCount: Math.min(this.history.length, 10)
            }
        }));
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        window.dispatchEvent(new CustomEvent('nixite-notification', {
            detail: { message, type }
        }));
    }
}

// Create global instance
window.installHistory = new InstallationHistory();

/**
 * UI Helper Functions
 */

/**
 * Render history entry
 */
function renderHistoryEntry(entry) {
    const typeIcons = {
        install: '📥',
        remove: '🗑️',
        update: '🔄'
    };

    const statusClasses = {
        success: 'status-success',
        failed: 'status-failed',
        pending: 'status-pending'
    };

    const icon = typeIcons[entry.type] || '📦';
    const statusClass = statusClasses[entry.status] || '';
    const date = new Date(entry.timestamp).toLocaleString();

    return `
        <div class="history-entry ${statusClass}" data-entry-id="${entry.id}">
            <div class="history-icon">${icon}</div>
            <div class="history-details">
                <div class="history-package">${entry.packageName}</div>
                <div class="history-action">${entry.type} - ${entry.status}</div>
                ${entry.message ? `<div class="history-message">${entry.message}</div>` : ''}
                <div class="history-time">${date}</div>
            </div>
            <button class="btn-delete-entry" data-entry-id="${entry.id}" title="Delete entry">✕</button>
        </div>
    `;
}

/**
 * Render history panel
 */
function renderHistoryPanel() {
    const history = window.installHistory.getHistory();
    const stats = window.installHistory.getStats();

    let html = '<div class="history-panel">';
    html += '<div class="history-header">';
    html += '<h2>Installation History</h2>';
    html += '<div class="history-actions">';
    html += '<button class="btn-export-history" data-format="json">Export JSON</button>';
    html += '<button class="btn-export-history" data-format="csv">Export CSV</button>';
    html += '<button class="btn-clear-history">Clear History</button>';
    html += '</div>';
    html += '</div>';

    // Statistics
    html += '<div class="history-stats">';
    html += `<div class="stat"><span class="stat-label">Total Actions:</span> <span class="stat-value">${stats.total}</span></div>`;
    html += `<div class="stat"><span class="stat-label">Installs:</span> <span class="stat-value">${stats.installs}</span></div>`;
    html += `<div class="stat"><span class="stat-label">Removes:</span> <span class="stat-value">${stats.removes}</span></div>`;
    html += `<div class="stat"><span class="stat-label">Updates:</span> <span class="stat-value">${stats.updates}</span></div>`;
    html += `<div class="stat"><span class="stat-label">Success Rate:</span> <span class="stat-value">${stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0}%</span></div>`;
    html += '</div>';

    // Filters
    html += '<div class="history-filters">';
    html += '<select class="filter-type">';
    html += '<option value="">All Types</option>';
    html += '<option value="install">Installs</option>';
    html += '<option value="remove">Removes</option>';
    html += '<option value="update">Updates</option>';
    html += '</select>';
    html += '<select class="filter-status">';
    html += '<option value="">All Statuses</option>';
    html += '<option value="success">Success</option>';
    html += '<option value="failed">Failed</option>';
    html += '<option value="pending">Pending</option>';
    html += '</select>';
    html += '<input type="search" class="search-history" placeholder="Search history...">';
    html += '</div>';

    // History entries
    html += '<div class="history-list">';
    if (history.length === 0) {
        html += '<p class="empty-state">No installation history yet. Install a package to get started!</p>';
    } else {
        history.forEach(entry => {
            html += renderHistoryEntry(entry);
        });
    }
    html += '</div>';

    html += '</div>';

    return html;
}

/**
 * Initialize history handlers
 */
function initHistoryHandlers() {
    // Delete entry
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete-entry')) {
            const entryId = e.target.dataset.entryId;
            if (confirm('Delete this history entry?')) {
                window.installHistory.deleteEntry(entryId);
                e.target.closest('.history-entry').remove();
            }
        }

        // Clear history
        if (e.target.classList.contains('btn-clear-history')) {
            window.installHistory.clearHistory();
        }

        // Export history
        if (e.target.classList.contains('btn-export-history')) {
            const format = e.target.dataset.format;
            let content, filename, type;

            if (format === 'json') {
                content = window.installHistory.exportAsJSON();
                filename = 'nixite-history.json';
                type = 'application/json';
            } else if (format === 'csv') {
                content = window.installHistory.exportAsCSV();
                filename = 'nixite-history.csv';
                type = 'text/csv';
            }

            // Download file
            const blob = new Blob([content], { type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }
    });

    // Filter handlers
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('filter-type') ||
            e.target.classList.contains('filter-status')) {
            applyHistoryFilters();
        }
    });

    // Search handler
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('search-history')) {
            applyHistoryFilters();
        }
    });
}

/**
 * Apply history filters
 */
function applyHistoryFilters() {
    const typeFilter = document.querySelector('.filter-type')?.value || '';
    const statusFilter = document.querySelector('.filter-status')?.value || '';
    const searchQuery = document.querySelector('.search-history')?.value || '';

    let filtered = window.installHistory.getHistory();

    if (typeFilter) {
        filtered = filtered.filter(e => e.type === typeFilter);
    }

    if (statusFilter) {
        filtered = filtered.filter(e => e.status === statusFilter);
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(e =>
            e.packageId.toLowerCase().includes(query) ||
            e.packageName.toLowerCase().includes(query) ||
            (e.message && e.message.toLowerCase().includes(query))
        );
    }

    // Re-render list
    const listContainer = document.querySelector('.history-list');
    if (listContainer) {
        if (filtered.length === 0) {
            listContainer.innerHTML = '<p class="empty-state">No matching history entries found.</p>';
        } else {
            listContainer.innerHTML = filtered.map(entry => renderHistoryEntry(entry)).join('');
        }
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        InstallationHistory,
        renderHistoryEntry,
        renderHistoryPanel,
        initHistoryHandlers
    };
}
