/**
 * Nixite Package Details Modal
 *
 * Displays comprehensive information about a package in a beautiful modal
 */

class PackageDetailsModal {
    constructor() {
        this.currentPackage = null;
        this.allPackages = [];
    }

    /**
     * Initialize the modal
     */
    initialize(packages) {
        this.allPackages = packages;
        this.createModal();
        console.log('✓ Package Details Modal initialized');
    }

    /**
     * Create modal HTML structure
     */
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'package-details-modal';
        modal.className = 'package-modal';
        modal.innerHTML = `
            <div class="package-modal-overlay"></div>
            <div class="package-modal-content">
                <button class="package-modal-close" aria-label="Close">✕</button>
                <div class="package-modal-body"></div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('.package-modal-overlay').addEventListener('click', () => this.close());
        modal.querySelector('.package-modal-close').addEventListener('click', () => this.close());

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    /**
     * Show package details
     */
    show(packageId) {
        const pkg = this.allPackages.find(p => p.id === packageId);
        if (!pkg) {
            console.error('Package not found:', packageId);
            return;
        }

        this.currentPackage = pkg;
        this.render();

        const modal = document.getElementById('package-details-modal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Announce to screen readers
        if (window.accessibilityManager) {
            window.accessibilityManager.announce(`Viewing details for ${pkg.name}`);
        }
    }

    /**
     * Close modal
     */
    close() {
        const modal = document.getElementById('package-details-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentPackage = null;
    }

    /**
     * Render package details
     */
    render() {
        const pkg = this.currentPackage;
        if (!pkg) return;

        const body = document.querySelector('.package-modal-body');
        const isFavorite = window.favoritesManager?.isFavorite(pkg.id) || false;
        const isInCompare = window.packageComparison?.isInCompare(pkg.id) || false;
        const history = this.getPackageHistory(pkg.id);
        const similar = this.getSimilarPackages(pkg);

        body.innerHTML = `
            <div class="package-details-header">
                <div class="package-details-icon">${this.getPackageIcon(pkg.category)}</div>
                <div class="package-details-title">
                    <h2>${pkg.name}</h2>
                    <code class="package-id">${pkg.id}</code>
                </div>
                <div class="package-details-actions">
                    <button class="btn-icon ${isFavorite ? 'is-favorite' : ''}"
                            onclick="packageDetailsModal.toggleFavorite()"
                            title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                        ${isFavorite ? '★' : '☆'}
                    </button>
                    <button class="btn-icon ${isInCompare ? 'in-compare' : ''}"
                            onclick="packageDetailsModal.toggleCompare()"
                            title="${isInCompare ? 'Remove from comparison' : 'Add to comparison'}">
                        ⚖️
                    </button>
                </div>
            </div>

            <div class="package-details-meta">
                <span class="meta-badge category-badge">${pkg.category}</span>
                ${pkg.tags ? pkg.tags.map(tag => `<span class="meta-badge tag-badge">#${tag}</span>`).join('') : ''}
            </div>

            <div class="package-details-description">
                <h3>Description</h3>
                <p>${pkg.description}</p>
            </div>

            ${this.renderInformation(pkg)}
            ${this.renderInstallation(pkg)}
            ${history ? this.renderHistory(history) : ''}
            ${similar.length > 0 ? this.renderSimilar(similar) : ''}
            ${this.renderActions(pkg)}
        `;
    }

    /**
     * Render package information section
     */
    renderInformation(pkg) {
        return `
            <div class="package-details-section">
                <h3>📋 Package Information</h3>
                <div class="info-grid">
                    ${pkg.homepage ? `
                        <div class="info-item">
                            <span class="info-label">Homepage:</span>
                            <span class="info-value">
                                <a href="${pkg.homepage}" target="_blank" rel="noopener noreferrer">
                                    ${pkg.homepage}
                                </a>
                            </span>
                        </div>
                    ` : ''}
                    ${pkg.license ? `
                        <div class="info-item">
                            <span class="info-label">License:</span>
                            <span class="info-value">${pkg.license}</span>
                        </div>
                    ` : ''}
                    ${pkg.platforms ? `
                        <div class="info-item">
                            <span class="info-label">Platforms:</span>
                            <span class="info-value">${pkg.platforms.join(', ')}</span>
                        </div>
                    ` : ''}
                    <div class="info-item">
                        <span class="info-label">Category:</span>
                        <span class="info-value">${this.getCategoryName(pkg.category)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render installation section
     */
    renderInstallation(pkg) {
        return `
            <div class="package-details-section">
                <h3>🚀 Installation</h3>
                <div class="install-options">
                    <div class="install-option">
                        <h4>Quick Install (GUI)</h4>
                        <button class="btn btn-primary btn-block" onclick="handleInstallPackage('${pkg.id}')">
                            Install ${pkg.name}
                        </button>
                    </div>
                    <div class="install-option">
                        <h4>Command Line</h4>
                        <div class="code-block">
                            <code>nix-env -iA nixos.${pkg.id}</code>
                            <button class="btn-copy" onclick="packageDetailsModal.copyToClipboard('nix-env -iA nixos.${pkg.id}')" title="Copy">
                                📋
                            </button>
                        </div>
                    </div>
                    <div class="install-option">
                        <h4>NixOS Configuration</h4>
                        <div class="code-block">
                            <code>environment.systemPackages = [ pkgs.${pkg.id} ];</code>
                            <button class="btn-copy" onclick="packageDetailsModal.copyToClipboard('environment.systemPackages = [ pkgs.${pkg.id} ];')" title="Copy">
                                📋
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render installation history
     */
    renderHistory(history) {
        const lastInstall = history[0];
        const installCount = history.filter(h => h.type === 'install').length;

        return `
            <div class="package-details-section">
                <h3>📜 Your History</h3>
                <div class="history-summary">
                    <div class="history-stat">
                        <span class="stat-number">${installCount}</span>
                        <span class="stat-label">Install${installCount !== 1 ? 's' : ''}</span>
                    </div>
                    ${lastInstall ? `
                        <div class="history-last">
                            <span class="history-label">Last action:</span>
                            <span class="history-value">${lastInstall.type} - ${lastInstall.status}</span>
                            <span class="history-time">${this.formatDate(lastInstall.timestamp)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render similar packages
     */
    renderSimilar(similar) {
        return `
            <div class="package-details-section">
                <h3>🔍 Similar Packages</h3>
                <div class="similar-packages">
                    ${similar.map(pkg => `
                        <div class="similar-package" onclick="packageDetailsModal.show('${pkg.id}')">
                            <div class="similar-icon">${this.getPackageIcon(pkg.category)}</div>
                            <div class="similar-info">
                                <div class="similar-name">${pkg.name}</div>
                                <div class="similar-desc">${pkg.description}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render action buttons
     */
    renderActions(pkg) {
        return `
            <div class="package-details-actions-footer">
                <button class="btn btn-secondary" onclick="packageDetailsModal.addToCollection()">
                    Add to Collection
                </button>
                <button class="btn btn-secondary" onclick="packageDetailsModal.share()">
                    Share Package
                </button>
                <button class="btn btn-primary" onclick="handleInstallPackage('${pkg.id}'); packageDetailsModal.close();">
                    Install Now
                </button>
            </div>
        `;
    }

    /**
     * Get package icon based on category
     */
    getPackageIcon(category) {
        const icons = {
            'create': '🎨',
            'connect': '💬',
            'grow': '🌱',
            'work': '💼',
            'play': '🎮',
            'secure': '🔐',
            'manage': '📊',
            'serve': '🌐'
        };
        return icons[category] || '📦';
    }

    /**
     * Get category name
     */
    getCategoryName(category) {
        const names = {
            'create': 'Create (Content Creation & Media)',
            'connect': 'Connect (Communication & Collaboration)',
            'grow': 'Grow (Learning & Development)',
            'work': 'Work (Productivity & Business)',
            'play': 'Play (Gaming & Entertainment)',
            'secure': 'Secure (Security & Privacy)',
            'manage': 'Manage (System Administration)',
            'serve': 'Serve (Server & Infrastructure)'
        };
        return names[category] || category;
    }

    /**
     * Get package history
     */
    getPackageHistory(packageId) {
        if (!window.installHistory) return null;
        const history = window.installHistory.getPackageHistory(packageId);
        return history.length > 0 ? history : null;
    }

    /**
     * Get similar packages
     */
    getSimilarPackages(pkg) {
        if (!window.packageRecommendations) return [];
        return window.packageRecommendations.getSimilarPackages(pkg, this.allPackages, 3);
    }

    /**
     * Toggle favorite
     */
    toggleFavorite() {
        if (!this.currentPackage || !window.favoritesManager) return;
        window.favoritesManager.toggleFavorite(this.currentPackage.id);
        this.render(); // Re-render to update button state
    }

    /**
     * Toggle compare
     */
    toggleCompare() {
        if (!this.currentPackage || !window.packageComparison) return;
        window.packageComparison.toggleCompare(this.currentPackage.id);
        this.render(); // Re-render to update button state
    }

    /**
     * Add to collection
     */
    addToCollection() {
        if (!this.currentPackage || !window.favoritesManager) return;

        const collections = window.favoritesManager.getCollections();
        const collectionName = prompt('Select or create a collection:\n\n' +
            collections.map(c => `- ${c.name}`).join('\n') +
            '\n\nEnter collection name:');

        if (collectionName) {
            let collection = collections.find(c => c.name === collectionName);
            if (!collection) {
                collection = window.favoritesManager.createCollection(collectionName);
            }
            window.favoritesManager.addToCollection(this.currentPackage.id, collection.id);
        }
    }

    /**
     * Share package
     */
    async share() {
        if (!this.currentPackage) return;

        const shareData = {
            title: `${this.currentPackage.name} - Nixite`,
            text: `Check out ${this.currentPackage.name}: ${this.currentPackage.description}`,
            url: window.location.href + `?package=${this.currentPackage.id}`
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: copy to clipboard
                await this.copyToClipboard(shareData.url);
                alert('Package link copied to clipboard!');
            }
        } catch (error) {
            console.error('Share failed:', error);
        }
    }

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showCopyFeedback();
        } catch (error) {
            console.error('Copy failed:', error);
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showCopyFeedback();
        }
    }

    /**
     * Show copy feedback
     */
    showCopyFeedback() {
        if (window.nixiteUI && window.nixiteUI.showNotification) {
            window.nixiteUI.showNotification('', 'Copied to clipboard!', 'success');
        }
    }

    /**
     * Format date
     */
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return date.toLocaleDateString();
    }
}

// Create global instance
window.packageDetailsModal = new PackageDetailsModal();

// Add CSS styles for the modal
const style = document.createElement('style');
style.textContent = `
    .package-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: none;
    }

    .package-modal.active {
        display: block;
    }

    .package-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        animation: fadeIn 0.3s ease;
    }

    .package-modal-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 800px;
        max-height: 90vh;
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        overflow-y: auto;
        animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translate(-50%, -40%);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
    }

    .package-modal-close {
        position: sticky;
        top: 20px;
        right: 20px;
        float: right;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: rgba(0, 0, 0, 0.1);
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.2s;
        z-index: 10;
    }

    .package-modal-close:hover {
        background: rgba(0, 0, 0, 0.2);
        transform: rotate(90deg);
    }

    .package-modal-body {
        padding: 40px;
    }

    .package-details-header {
        display: flex;
        align-items: flex-start;
        gap: 20px;
        margin-bottom: 20px;
    }

    .package-details-icon {
        font-size: 4rem;
        flex-shrink: 0;
    }

    .package-details-title {
        flex: 1;
    }

    .package-details-title h2 {
        font-size: 2rem;
        margin-bottom: 8px;
        color: var(--gray-900);
    }

    .package-id {
        background: var(--gray-100);
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 0.875rem;
        color: var(--gray-600);
    }

    .package-details-actions {
        display: flex;
        gap: 8px;
    }

    .package-details-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 24px;
    }

    .meta-badge {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 600;
    }

    .category-badge {
        background: var(--primary);
        color: white;
    }

    .tag-badge {
        background: var(--gray-200);
        color: var(--gray-700);
    }

    .package-details-description {
        margin-bottom: 32px;
    }

    .package-details-description h3 {
        font-size: 1.25rem;
        margin-bottom: 12px;
        color: var(--gray-900);
    }

    .package-details-description p {
        font-size: 1.125rem;
        line-height: 1.6;
        color: var(--gray-700);
    }

    .package-details-section {
        margin-bottom: 32px;
        padding: 24px;
        background: var(--gray-50);
        border-radius: 12px;
    }

    .package-details-section h3 {
        font-size: 1.25rem;
        margin-bottom: 16px;
        color: var(--gray-900);
    }

    .info-grid {
        display: grid;
        gap: 12px;
    }

    .info-item {
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 12px;
    }

    .info-label {
        font-weight: 600;
        color: var(--gray-600);
    }

    .info-value {
        color: var(--gray-900);
    }

    .info-value a {
        color: var(--primary);
        text-decoration: none;
    }

    .info-value a:hover {
        text-decoration: underline;
    }

    .install-options {
        display: grid;
        gap: 16px;
    }

    .install-option h4 {
        font-size: 1rem;
        margin-bottom: 12px;
        color: var(--gray-700);
    }

    .code-block {
        position: relative;
        background: var(--gray-900);
        color: #00ff00;
        padding: 16px;
        border-radius: 8px;
        font-family: var(--font-mono);
        font-size: 0.875rem;
        overflow-x: auto;
    }

    .btn-copy {
        position: absolute;
        top: 12px;
        right: 12px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        padding: 6px 10px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s;
    }

    .btn-copy:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .btn-block {
        width: 100%;
    }

    .history-summary {
        display: flex;
        gap: 24px;
        align-items: center;
    }

    .history-stat {
        text-align: center;
    }

    .stat-number {
        display: block;
        font-size: 2rem;
        font-weight: 700;
        color: var(--primary);
    }

    .stat-label {
        display: block;
        font-size: 0.875rem;
        color: var(--gray-600);
    }

    .history-last {
        flex: 1;
    }

    .history-label {
        font-weight: 600;
        color: var(--gray-600);
        margin-right: 8px;
    }

    .history-time {
        display: block;
        font-size: 0.875rem;
        color: var(--gray-500);
        margin-top: 4px;
    }

    .similar-packages {
        display: grid;
        gap: 12px;
    }

    .similar-package {
        display: flex;
        gap: 16px;
        padding: 16px;
        background: white;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .similar-package:hover {
        transform: translateX(4px);
        box-shadow: var(--shadow-md);
    }

    .similar-icon {
        font-size: 2rem;
        flex-shrink: 0;
    }

    .similar-name {
        font-weight: 600;
        color: var(--gray-900);
        margin-bottom: 4px;
    }

    .similar-desc {
        font-size: 0.875rem;
        color: var(--gray-600);
    }

    .package-details-actions-footer {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 32px;
        padding-top: 24px;
        border-top: 2px solid var(--gray-200);
    }

    @media (max-width: 768px) {
        .package-modal-body {
            padding: 24px;
        }

        .package-details-header {
            flex-direction: column;
        }

        .info-item {
            grid-template-columns: 1fr;
        }

        .history-summary {
            flex-direction: column;
            align-items: flex-start;
        }

        .package-details-actions-footer {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(style);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PackageDetailsModal };
}
