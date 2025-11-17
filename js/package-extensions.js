/**
 * Package Management Extensions
 *
 * Advanced package management features:
 * - Package notes and annotations
 * - Package health scoring
 * - Collection sharing
 * - Package ratings and reviews
 *
 * @version 2.8.0
 * @author Nixite Team
 */

class PackageExtensions {
    constructor() {
        this.packageNotes = this.loadNotes();
        this.packageRatings = this.loadRatings();
        this.init();
    }

    init() {
        this.createNotesPanel();
        this.createSharingPanel();
    }

    // ============================================
    // PACKAGE NOTES & ANNOTATIONS
    // ============================================

    loadNotes() {
        const saved = localStorage.getItem('nixite_package_notes');
        return saved ? JSON.parse(saved) : {};
    }

    saveNotes() {
        localStorage.setItem('nixite_package_notes', JSON.stringify(this.packageNotes));
    }

    loadRatings() {
        const saved = localStorage.getItem('nixite_package_ratings');
        return saved ? JSON.parse(saved) : {};
    }

    saveRatings() {
        localStorage.setItem('nixite_package_ratings', JSON.stringify(this.packageRatings));
    }

    createNotesPanel() {
        const panel = document.createElement('div');
        panel.id = 'package-notes-panel';
        panel.className = 'package-notes-panel';
        panel.innerHTML = `
            <div class="notes-overlay" onclick="packageExtensions.closeNotesPanel()"></div>
            <div class="notes-container">
                <div class="notes-header">
                    <h2>📝 Package Notes</h2>
                    <span class="package-name" id="notes-package-name"></span>
                    <button class="btn-close" onclick="packageExtensions.closeNotesPanel()">×</button>
                </div>

                <div class="notes-body">
                    <!-- Rating Section -->
                    <div class="rating-section">
                        <label>Your Rating:</label>
                        <div class="star-rating" id="star-rating">
                            ${[1, 2, 3, 4, 5].map(i => `
                                <span class="star" data-rating="${i}" onclick="packageExtensions.setRating(${i})">
                                    ⭐
                                </span>
                            `).join('')}
                        </div>
                        <span class="rating-text" id="rating-text">Not rated</span>
                    </div>

                    <!-- Tags Section -->
                    <div class="tags-section">
                        <label>Tags:</label>
                        <div class="tags-container" id="package-tags">
                            <input type="text" id="tag-input" placeholder="Add tag..."
                                   onkeypress="if(event.key==='Enter') packageExtensions.addTag()">
                            <button class="btn-add-tag" onclick="packageExtensions.addTag()">+ Add</button>
                        </div>
                        <div class="tags-list" id="tags-list"></div>
                    </div>

                    <!-- Notes Section -->
                    <div class="notes-section">
                        <label>Installation Notes:</label>
                        <textarea id="installation-notes" placeholder="Add notes about installation experience, configuration, tips, etc."></textarea>
                    </div>

                    <!-- Experience Section -->
                    <div class="experience-section">
                        <label>Experience:</label>
                        <select id="experience-select">
                            <option value="">Select experience...</option>
                            <option value="excellent">😍 Excellent - Works perfectly</option>
                            <option value="good">😊 Good - Minor issues</option>
                            <option value="okay">😐 Okay - Some problems</option>
                            <option value="poor">😞 Poor - Major issues</option>
                            <option value="broken">❌ Broken - Doesn't work</option>
                        </select>
                    </div>

                    <!-- Last Updated -->
                    <div class="metadata-section">
                        <small id="notes-metadata">No notes saved yet</small>
                    </div>
                </div>

                <div class="notes-footer">
                    <button class="btn btn-secondary" onclick="packageExtensions.clearNotes()">
                        Clear All
                    </button>
                    <button class="btn btn-primary" onclick="packageExtensions.saveCurrentNotes()">
                        💾 Save Notes
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    }

    openNotesPanel(packageId) {
        const panel = document.getElementById('package-notes-panel');
        const packageNameEl = document.getElementById('notes-package-name');
        this.currentPackage = packageId;

        packageNameEl.textContent = packageId;
        this.loadCurrentNotes(packageId);
        panel.classList.add('active');
    }

    closeNotesPanel() {
        const panel = document.getElementById('package-notes-panel');
        panel.classList.remove('active');
        this.currentPackage = null;
    }

    loadCurrentNotes(packageId) {
        const notes = this.packageNotes[packageId] || {
            rating: 0,
            tags: [],
            notes: '',
            experience: '',
            lastUpdated: null
        };

        // Load rating
        this.updateStarDisplay(notes.rating);
        document.getElementById('rating-text').textContent =
            notes.rating > 0 ? `${notes.rating}/5 stars` : 'Not rated';

        // Load tags
        this.renderTags(notes.tags);

        // Load notes
        document.getElementById('installation-notes').value = notes.notes || '';

        // Load experience
        document.getElementById('experience-select').value = notes.experience || '';

        // Load metadata
        if (notes.lastUpdated) {
            document.getElementById('notes-metadata').textContent =
                `Last updated: ${new Date(notes.lastUpdated).toLocaleString()}`;
        } else {
            document.getElementById('notes-metadata').textContent = 'No notes saved yet';
        }
    }

    setRating(rating) {
        this.updateStarDisplay(rating);
        document.getElementById('rating-text').textContent = `${rating}/5 stars`;
    }

    updateStarDisplay(rating) {
        const stars = document.querySelectorAll('#star-rating .star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
                star.textContent = '⭐';
            } else {
                star.classList.remove('active');
                star.textContent = '☆';
            }
        });
    }

    addTag() {
        const input = document.getElementById('tag-input');
        const tag = input.value.trim();

        if (!tag) return;

        const currentNotes = this.packageNotes[this.currentPackage] || { tags: [] };
        if (!currentNotes.tags) currentNotes.tags = [];

        if (!currentNotes.tags.includes(tag)) {
            currentNotes.tags.push(tag);
            this.renderTags(currentNotes.tags);
            input.value = '';
        }
    }

    removeTag(tag) {
        const currentNotes = this.packageNotes[this.currentPackage] || { tags: [] };
        currentNotes.tags = currentNotes.tags.filter(t => t !== tag);
        this.renderTags(currentNotes.tags);
    }

    renderTags(tags) {
        const container = document.getElementById('tags-list');
        container.innerHTML = tags.map(tag => `
            <span class="tag-item">
                ${tag}
                <button class="tag-remove" onclick="packageExtensions.removeTag('${tag}')">×</button>
            </span>
        `).join('');
    }

    saveCurrentNotes() {
        if (!this.currentPackage) return;

        const stars = document.querySelectorAll('#star-rating .star.active');
        const rating = stars.length;
        const notes = document.getElementById('installation-notes').value;
        const experience = document.getElementById('experience-select').value;
        const currentNotes = this.packageNotes[this.currentPackage] || { tags: [] };

        this.packageNotes[this.currentPackage] = {
            rating: rating,
            tags: currentNotes.tags || [],
            notes: notes,
            experience: experience,
            lastUpdated: new Date().toISOString()
        };

        this.saveNotes();

        if (rating > 0) {
            this.packageRatings[this.currentPackage] = rating;
            this.saveRatings();
        }

        this.showNotification('Notes saved successfully!');
        this.closeNotesPanel();
    }

    clearNotes() {
        if (!confirm('Clear all notes for this package?')) return;

        if (this.currentPackage) {
            delete this.packageNotes[this.currentPackage];
            delete this.packageRatings[this.currentPackage];
            this.saveNotes();
            this.saveRatings();
            this.loadCurrentNotes(this.currentPackage);
            this.showNotification('Notes cleared');
        }
    }

    // ============================================
    // PACKAGE HEALTH SCORING
    // ============================================

    calculateHealthScore(pkg) {
        // Multi-factor health score (0-100)
        let score = 0;
        const factors = {};

        // Factor 1: Popularity (0-25 points)
        const popularity = pkg.popularity || 0;
        factors.popularity = Math.min(25, popularity / 4);
        score += factors.popularity;

        // Factor 2: Maintenance (0-25 points)
        // Based on update frequency, last update, etc.
        const daysSinceUpdate = pkg.daysSinceUpdate || 365;
        if (daysSinceUpdate < 30) factors.maintenance = 25;
        else if (daysSinceUpdate < 90) factors.maintenance = 20;
        else if (daysSinceUpdate < 180) factors.maintenance = 15;
        else if (daysSinceUpdate < 365) factors.maintenance = 10;
        else factors.maintenance = 5;
        score += factors.maintenance;

        // Factor 3: Documentation (0-20 points)
        const hasDescription = pkg.description && pkg.description.length > 20;
        const hasLongDescription = pkg.longDescription && pkg.longDescription.length > 100;
        factors.documentation = (hasDescription ? 10 : 0) + (hasLongDescription ? 10 : 0);
        score += factors.documentation;

        // Factor 4: License (0-15 points)
        const goodLicenses = ['mit', 'apache', 'bsd', 'gpl', 'lgpl'];
        const license = (pkg.license || '').toLowerCase();
        factors.license = goodLicenses.some(l => license.includes(l)) ? 15 : 5;
        score += factors.license;

        // Factor 5: Security (0-15 points)
        // In real app, would check CVE database
        const hasKnownVulnerabilities = false; // Placeholder
        factors.security = hasKnownVulnerabilities ? 0 : 15;
        score += factors.security;

        return {
            score: Math.round(score),
            factors: factors,
            grade: this.getHealthGrade(score)
        };
    }

    getHealthGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'F';
    }

    getHealthColor(score) {
        if (score >= 80) return '#10b981'; // Green
        if (score >= 60) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    }

    // ============================================
    // COLLECTION SHARING
    // ============================================

    createSharingPanel() {
        const panel = document.createElement('div');
        panel.id = 'collection-sharing-panel';
        panel.className = 'collection-sharing-panel';
        panel.innerHTML = `
            <div class="sharing-overlay" onclick="packageExtensions.closeSharingPanel()"></div>
            <div class="sharing-container">
                <div class="sharing-header">
                    <h2>🔗 Share Collection</h2>
                    <button class="btn-close" onclick="packageExtensions.closeSharingPanel()">×</button>
                </div>

                <div class="sharing-body">
                    <div class="share-section">
                        <h3>Share Link</h3>
                        <div class="share-link-container">
                            <input type="text" id="share-link" readonly>
                            <button class="btn btn-secondary" onclick="packageExtensions.copyShareLink()">
                                📋 Copy
                            </button>
                        </div>
                    </div>

                    <div class="share-section">
                        <h3>QR Code</h3>
                        <div class="qr-code-container" id="qr-code">
                            <p class="empty-state-small">QR code will appear here</p>
                        </div>
                    </div>

                    <div class="share-section">
                        <h3>Import Collection</h3>
                        <input type="text" id="import-link" placeholder="Paste share link here...">
                        <button class="btn btn-primary" onclick="packageExtensions.importCollection()">
                            📥 Import
                        </button>
                    </div>

                    <div class="share-section">
                        <h3>Collection Templates</h3>
                        <div class="template-grid">
                            ${this.getCollectionTemplates().map(template => `
                                <div class="template-card-small" onclick="packageExtensions.applyTemplate('${template.id}')">
                                    <div class="template-icon">${template.icon}</div>
                                    <div class="template-name">${template.name}</div>
                                    <div class="template-count">${template.packages.length} packages</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    }

    openSharingPanel(collectionName) {
        const panel = document.getElementById('collection-sharing-panel');
        this.currentCollection = collectionName;

        const collections = JSON.parse(localStorage.getItem('nixite_collections') || '{}');
        const collection = collections[collectionName];

        if (collection) {
            const shareData = {
                name: collectionName,
                packages: collection.packages,
                created: new Date().toISOString()
            };

            const encoded = btoa(JSON.stringify(shareData));
            const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encoded}`;

            document.getElementById('share-link').value = shareUrl;
            this.generateQRCode(shareUrl);
        }

        panel.classList.add('active');
    }

    closeSharingPanel() {
        const panel = document.getElementById('collection-sharing-panel');
        panel.classList.remove('active');
    }

    copyShareLink() {
        const link = document.getElementById('share-link');
        link.select();
        navigator.clipboard.writeText(link.value).then(() => {
            this.showNotification('Share link copied!');
        });
    }

    generateQRCode(url) {
        // Simple ASCII QR code placeholder
        // In production, would use a real QR code library
        const container = document.getElementById('qr-code');
        container.innerHTML = `
            <div class="qr-placeholder">
                <p>QR Code for:</p>
                <p style="font-size: 12px; word-break: break-all;">${url}</p>
                <p style="margin-top: 10px;"><em>(QR generation would be implemented here)</em></p>
            </div>
        `;
    }

    importCollection() {
        const link = document.getElementById('import-link').value.trim();

        if (!link) {
            this.showNotification('Please enter a share link', 'warning');
            return;
        }

        try {
            const urlParams = new URLSearchParams(new URL(link).search);
            const shareData = urlParams.get('share');

            if (!shareData) {
                throw new Error('Invalid share link');
            }

            const collection = JSON.parse(atob(shareData));

            // Import collection
            const collections = JSON.parse(localStorage.getItem('nixite_collections') || '{}');
            collections[collection.name] = {
                packages: collection.packages,
                created: new Date().toISOString(),
                imported: true
            };
            localStorage.setItem('nixite_collections', JSON.stringify(collections));

            this.showNotification(`Collection "${collection.name}" imported successfully!`);
            this.closeSharingPanel();

        } catch (error) {
            console.error('Import error:', error);
            this.showNotification('Failed to import collection. Invalid link.', 'error');
        }
    }

    getCollectionTemplates() {
        return [
            {
                id: 'web-dev',
                name: 'Web Development',
                icon: '🌐',
                packages: ['nodejs', 'yarn', 'git', 'vscode', 'firefox', 'chromium']
            },
            {
                id: 'data-science',
                name: 'Data Science',
                icon: '📊',
                packages: ['python3', 'jupyter', 'numpy', 'pandas', 'matplotlib', 'scipy']
            },
            {
                id: 'devops',
                name: 'DevOps',
                icon: '🚀',
                packages: ['docker', 'kubernetes', 'terraform', 'ansible', 'git', 'vim']
            },
            {
                id: 'creative',
                name: 'Creative Suite',
                icon: '🎨',
                packages: ['gimp', 'inkscape', 'blender', 'kdenlive', 'audacity']
            }
        ];
    }

    applyTemplate(templateId) {
        const template = this.getCollectionTemplates().find(t => t.id === templateId);

        if (!template) return;

        if (!confirm(`Import "${template.name}" template with ${template.packages.length} packages?`)) {
            return;
        }

        const collections = JSON.parse(localStorage.getItem('nixite_collections') || '{}');
        collections[template.name] = {
            packages: template.packages,
            created: new Date().toISOString(),
            template: true
        };
        localStorage.setItem('nixite_collections', JSON.stringify(collections));

        this.showNotification(`Template "${template.name}" imported!`);
        this.closeSharingPanel();
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    showNotification(message, type = 'success') {
        if (window.uiIntegration && window.uiIntegration.showNotification) {
            window.uiIntegration.showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
}

// Initialize
let packageExtensions;
document.addEventListener('DOMContentLoaded', () => {
    packageExtensions = new PackageExtensions();
});
