/**
 * Nix UI Integration for Phase 11 & 12 Features
 *
 * Wires up:
 * - Favorites & Collections
 * - Package Comparison
 * - Installation History
 * - Statistics Dashboard
 * - Keyboard Shortcuts
 * - Enhanced Search
 */

(function() {
    'use strict';

    // Wait for all Phase 11 modules to load
    function waitForModules(callback) {
        const checkModules = setInterval(() => {
            if (window.favoritesManager &&
                window.packageComparison &&
                window.installHistory &&
                window.packageStats) {
                clearInterval(checkModules);
                callback();
            }
        }, 100);
    }

    // Initialize all UI integrations
    function initializeUI() {
        console.log('🚀 Initializing Phase 11 & 12 UI Features...');

        // Store global reference to packages
        window.allPackages = [];

        // Initialize modal system
        initModals();

        // Initialize favorites UI
        initFavoritesUI();

        // Initialize comparison UI
        initComparisonUI();

        // Initialize history UI
        initHistoryUI();

        // Initialize stats UI
        initStatsUI();

        // Initialize keyboard shortcuts
        initKeyboardShortcuts();

        // Initialize notifications
        initNotifications();

        // Enhance package rendering
        enhancePackageRendering();

        console.log('✅ Phase 11 & 12 Features Initialized Successfully!');
    }

    // ========== MODAL SYSTEM ==========

    function initModals() {
        const overlay = document.getElementById('modalOverlay');
        const panels = {
            favorites: document.getElementById('favoritesPanel'),
            compare: document.getElementById('comparePanel'),
            history: document.getElementById('historyPanel'),
            stats: document.getElementById('statsPanel')
        };

        // Close modal on overlay click
        overlay.addEventListener('click', closeAllModals);

        // Close modal on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });

        window.openModal = function(panelId) {
            const panel = panels[panelId];
            if (!panel) return;

            // Close all other panels
            Object.values(panels).forEach(p => p.classList.remove('active'));

            // Open requested panel
            panel.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Update panel content
            updatePanelContent(panelId);
        };

        window.closeAllModals = function() {
            overlay.classList.remove('active');
            Object.values(panels).forEach(p => p.classList.remove('active'));
            document.body.style.overflow = '';
        };
    }

    function updatePanelContent(panelId) {
        const panel = document.getElementById(`${panelId}Panel`);
        let content = '';

        switch(panelId) {
            case 'favorites':
                content = renderFavoritesPanel(window.allPackages);
                break;
            case 'compare':
                content = renderComparisonPanel(window.allPackages);
                break;
            case 'history':
                content = renderHistoryPanel();
                break;
            case 'stats':
                content = renderStatsDashboard(window.allPackages);
                break;
        }

        panel.innerHTML = `
            <div class="modal-header">
                <div class="modal-title">${getPanelTitle(panelId)}</div>
                <button class="modal-close" onclick="closeAllModals()" aria-label="Close">✕</button>
            </div>
            <div class="modal-content">
                ${content}
            </div>
        `;
    }

    function getPanelTitle(panelId) {
        const titles = {
            favorites: '★ Favorites & Collections',
            compare: '⚖️ Package Comparison',
            history: '📜 Installation History',
            stats: '📊 Package Statistics'
        };
        return titles[panelId] || '';
    }

    // ========== FAVORITES UI ==========

    function initFavoritesUI() {
        const favBtn = document.getElementById('favoritesBtn');
        if (!favBtn) return;

        favBtn.addEventListener('click', () => {
            openModal('favorites');
        });

        // Listen for favorites changes to update badge
        window.addEventListener('nixite-favorites-changed', (e) => {
            updateFavoritesBadge(e.detail.favorites.length);
        });

        // Initialize handlers
        initFavoriteHandlers();
        initCollectionHandlers();

        console.log('✓ Favorites UI initialized');
    }

    function updateFavoritesBadge(count) {
        const favBtn = document.getElementById('favoritesBtn');
        if (!favBtn) return;

        // Remove existing badge
        const existingBadge = favBtn.querySelector('.badge');
        if (existingBadge) existingBadge.remove();

        // Add new badge if count > 0
        if (count > 0) {
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = count;
            badge.style.cssText = `
                position: absolute;
                top: -4px;
                right: -4px;
                background: var(--accent);
                color: white;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                font-size: 0.7rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            `;
            favBtn.style.position = 'relative';
            favBtn.appendChild(badge);
        }
    }

    // ========== COMPARISON UI ==========

    function initComparisonUI() {
        const compareBtn = document.getElementById('compareBtn');
        if (!compareBtn) return;

        compareBtn.addEventListener('click', () => {
            openModal('compare');
        });

        // Listen for comparison changes to update badge
        window.addEventListener('nixite-comparison-changed', (e) => {
            updateComparisonBadge(e.detail.count);
        });

        // Initialize handlers
        initComparisonHandlers();

        console.log('✓ Comparison UI initialized');
    }

    function updateComparisonBadge(count) {
        const compareBtn = document.getElementById('compareBtn');
        if (!compareBtn) return;

        // Remove existing badge
        const existingBadge = compareBtn.querySelector('.badge');
        if (existingBadge) existingBadge.remove();

        // Add new badge if count > 0
        if (count > 0) {
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = count;
            badge.style.cssText = `
                position: absolute;
                top: -4px;
                right: -4px;
                background: var(--secondary);
                color: white;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                font-size: 0.7rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            `;
            compareBtn.style.position = 'relative';
            compareBtn.appendChild(badge);
        }
    }

    // ========== HISTORY UI ==========

    function initHistoryUI() {
        const historyBtn = document.getElementById('historyBtn');
        if (!historyBtn) return;

        historyBtn.addEventListener('click', () => {
            openModal('history');
        });

        // Listen for history changes to update badge
        window.addEventListener('nixite-history-changed', (e) => {
            updateHistoryBadge(e.detail.recentCount);
        });

        // Initialize handlers
        initHistoryHandlers();

        console.log('✓ History UI initialized');
    }

    function updateHistoryBadge(count) {
        const historyBtn = document.getElementById('historyBtn');
        if (!historyBtn) return;

        // Show indicator if there are recent entries
        if (count > 0) {
            historyBtn.style.position = 'relative';
        }
    }

    // ========== STATISTICS UI ==========

    function initStatsUI() {
        const statsBtn = document.getElementById('statsBtn');
        if (!statsBtn) return;

        statsBtn.addEventListener('click', () => {
            openModal('stats');
        });

        // Initialize handlers
        initStatsHandlers();

        console.log('✓ Statistics UI initialized');
    }

    // ========== KEYBOARD SHORTCUTS ==========

    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Keyboard shortcuts (with Ctrl/Cmd modifier)
            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 'f':
                        e.preventDefault();
                        openModal('favorites');
                        break;
                    case 'k':
                        e.preventDefault();
                        openModal('compare');
                        break;
                    case 'h':
                        e.preventDefault();
                        openModal('history');
                        break;
                    case 's':
                        e.preventDefault();
                        openModal('stats');
                        break;
                }
            }

            // Shortcuts without modifier
            switch(e.key) {
                case '/':
                    e.preventDefault();
                    document.getElementById('searchInput')?.focus();
                    break;
                case '?':
                    e.preventDefault();
                    showKeyboardShortcuts();
                    break;
            }
        });

        console.log('✓ Keyboard shortcuts initialized');
        console.log('  • Ctrl+F: Favorites');
        console.log('  • Ctrl+K: Comparison');
        console.log('  • Ctrl+H: History');
        console.log('  • Ctrl+S: Statistics');
        console.log('  • /: Focus search');
        console.log('  • ?: Show shortcuts');
        console.log('  • ESC: Close modals');
    }

    function showKeyboardShortcuts() {
        const shortcuts = `
            <h3>⌨️ Keyboard Shortcuts</h3>
            <ul style="list-style: none; padding: 0;">
                <li><kbd>Ctrl+F</kbd> Open Favorites</li>
                <li><kbd>Ctrl+K</kbd> Open Comparison</li>
                <li><kbd>Ctrl+H</kbd> Open History</li>
                <li><kbd>Ctrl+S</kbd> Open Statistics</li>
                <li><kbd>/</kbd> Focus Search</li>
                <li><kbd>ESC</kbd> Close Modals</li>
                <li><kbd>?</kbd> Show This Help</li>
            </ul>
        `;
        showNotification('Keyboard Shortcuts', shortcuts, 'info');
    }

    // ========== NOTIFICATIONS ==========

    function initNotifications() {
        // Listen for nixite-notification events from Phase 11 modules
        window.addEventListener('nixite-notification', (e) => {
            const { message, type } = e.detail;
            showNotification('', message, type);
        });

        console.log('✓ Notifications initialized');
    }

    function showNotification(title, message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type} fade-in`;
        notification.innerHTML = `
            ${title ? `<div style="font-weight: 600; margin-bottom: 4px;">${title}</div>` : ''}
            <div>${message}</div>
        `;

        container.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ========== ENHANCED PACKAGE RENDERING ==========

    function enhancePackageRendering() {
        // Store original renderPackage function
        const originalRenderPackage = window.renderPackage;

        // Override with enhanced version
        window.renderPackage = function(pkg) {
            const isInstalled = window.state?.installedPackages?.has(pkg.id);
            const isFavorite = window.favoritesManager?.isFavorite(pkg.id);
            const isInCompare = window.packageComparison?.isInCompare(pkg.id);

            return `
                <div class="package-item">
                    <div class="package-info">
                        <div class="package-name">${pkg.name}</div>
                        <div class="package-desc">${pkg.description}</div>
                    </div>
                    <div class="package-actions">
                        ${renderFavoriteButton(pkg.id)}
                        ${renderCompareButton(pkg.id)}
                        <button
                            class="install-btn ${isInstalled ? 'installed' : ''}"
                            onclick="handleInstallPackage('${pkg.id}')"
                            ${isInstalled ? 'disabled' : ''}
                        >
                            ${isInstalled ? '✓ Installed' : 'Install'}
                        </button>
                    </div>
                </div>
            `;
        };

        // Enhanced install handler that tracks history
        window.handleInstallPackage = async function(packageId) {
            const pkg = window.state?.packages?.find(p => p.id === packageId);
            if (!pkg) return;

            // Record installation attempt in history
            const entry = window.installHistory.addInstallation(
                packageId,
                pkg.name,
                'pending',
                'Installation in progress...'
            );

            // Call original install function
            try {
                await window.installPackage(packageId);

                // Update history on success
                window.installHistory.updateEntryStatus(entry.id, 'success', 'Package installed successfully');
            } catch (error) {
                // Update history on failure
                window.installHistory.updateEntryStatus(entry.id, 'failed', error.message || 'Installation failed');
            }
        };

        console.log('✓ Package rendering enhanced');
    }

    // ========== UPDATE PACKAGES DATA ==========

    // Hook into loadPackages to update our modules
    const originalLoadPackages = window.loadPackages;
    if (originalLoadPackages) {
        window.loadPackages = async function() {
            await originalLoadPackages.call(this);

            // Update global packages reference
            window.allPackages = window.state?.packages || [];

            // Update stats module
            if (window.packageStats) {
                window.packageStats.setPackages(window.allPackages);
            }

            console.log(`📦 Loaded ${window.allPackages.length} packages`);
        };
    }

    // ========== INITIALIZATION ==========

    // Wait for DOM and modules to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            waitForModules(initializeUI);
        });
    } else {
        waitForModules(initializeUI);
    }

})();

// Export for use in other scripts
window.nixiteUI = {
    openModal: (panelId) => window.openModal(panelId),
    closeAllModals: () => window.closeAllModals(),
    showNotification: (title, message, type) => window.showNotification(title, message, type)
};
