/**
 * Nixite Favorites & Collections System
 *
 * Allows users to save favorite packages and organize them into collections.
 * Uses localStorage for persistence.
 */

class FavoritesManager {
    constructor() {
        this.storageKey = 'nixite-favorites';
        this.collectionsKey = 'nixite-collections';
        this.favorites = this.loadFavorites();
        this.collections = this.loadCollections();
    }

    /**
     * Load favorites from localStorage
     */
    loadFavorites() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    /**
     * Save favorites to localStorage
     */
    saveFavorites() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
            this.notifyChange();
        } catch (error) {
            console.error('Error saving favorites:', error);
            this.showError('Failed to save favorites. Your browser may have storage disabled.');
        }
    }

    /**
     * Load collections from localStorage
     */
    loadCollections() {
        try {
            const stored = localStorage.getItem(this.collectionsKey);
            return stored ? JSON.parse(stored) : this.getDefaultCollections();
        } catch (error) {
            console.error('Error loading collections:', error);
            return this.getDefaultCollections();
        }
    }

    /**
     * Save collections to localStorage
     */
    saveCollections() {
        try {
            localStorage.setItem(this.collectionsKey, JSON.stringify(this.collections));
            this.notifyChange();
        } catch (error) {
            console.error('Error saving collections:', error);
            this.showError('Failed to save collections. Your browser may have storage disabled.');
        }
    }

    /**
     * Get default collections
     */
    getDefaultCollections() {
        return [
            {
                id: 'essentials',
                name: 'My Essentials',
                description: 'Must-have packages',
                packages: [],
                created: new Date().toISOString()
            },
            {
                id: 'to-try',
                name: 'To Try',
                description: 'Packages to explore',
                packages: [],
                created: new Date().toISOString()
            }
        ];
    }

    /**
     * Check if package is favorited
     */
    isFavorite(packageId) {
        return this.favorites.includes(packageId);
    }

    /**
     * Add package to favorites
     */
    addFavorite(packageId) {
        if (!this.isFavorite(packageId)) {
            this.favorites.push(packageId);
            this.saveFavorites();
            this.showSuccess(`Added to favorites`);
            return true;
        }
        return false;
    }

    /**
     * Remove package from favorites
     */
    removeFavorite(packageId) {
        const index = this.favorites.indexOf(packageId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.saveFavorites();

            // Also remove from all collections
            this.collections.forEach(collection => {
                const pkgIndex = collection.packages.indexOf(packageId);
                if (pkgIndex > -1) {
                    collection.packages.splice(pkgIndex, 1);
                }
            });
            this.saveCollections();

            this.showSuccess(`Removed from favorites`);
            return true;
        }
        return false;
    }

    /**
     * Toggle favorite status
     */
    toggleFavorite(packageId) {
        if (this.isFavorite(packageId)) {
            return this.removeFavorite(packageId);
        } else {
            return this.addFavorite(packageId);
        }
    }

    /**
     * Get all favorites
     */
    getFavorites() {
        return [...this.favorites];
    }

    /**
     * Get favorite packages with details
     */
    getFavoritePackages(allPackages) {
        return allPackages.filter(pkg => this.isFavorite(pkg.id));
    }

    /**
     * Clear all favorites
     */
    clearFavorites() {
        if (confirm('Are you sure you want to clear all favorites?')) {
            this.favorites = [];
            this.saveFavorites();
            this.showSuccess('Favorites cleared');
            return true;
        }
        return false;
    }

    /**
     * Create a new collection
     */
    createCollection(name, description = '') {
        const id = this.generateId(name);
        const collection = {
            id,
            name,
            description,
            packages: [],
            created: new Date().toISOString()
        };
        this.collections.push(collection);
        this.saveCollections();
        this.showSuccess(`Collection "${name}" created`);
        return collection;
    }

    /**
     * Delete a collection
     */
    deleteCollection(collectionId) {
        const collection = this.getCollection(collectionId);
        if (!collection) return false;

        if (confirm(`Delete collection "${collection.name}"?`)) {
            this.collections = this.collections.filter(c => c.id !== collectionId);
            this.saveCollections();
            this.showSuccess(`Collection "${collection.name}" deleted`);
            return true;
        }
        return false;
    }

    /**
     * Get collection by ID
     */
    getCollection(collectionId) {
        return this.collections.find(c => c.id === collectionId);
    }

    /**
     * Get all collections
     */
    getCollections() {
        return [...this.collections];
    }

    /**
     * Add package to collection
     */
    addToCollection(packageId, collectionId) {
        const collection = this.getCollection(collectionId);
        if (!collection) {
            this.showError('Collection not found');
            return false;
        }

        // Ensure package is favorited first
        if (!this.isFavorite(packageId)) {
            this.addFavorite(packageId);
        }

        if (!collection.packages.includes(packageId)) {
            collection.packages.push(packageId);
            this.saveCollections();
            this.showSuccess(`Added to "${collection.name}"`);
            return true;
        }
        return false;
    }

    /**
     * Remove package from collection
     */
    removeFromCollection(packageId, collectionId) {
        const collection = this.getCollection(collectionId);
        if (!collection) return false;

        const index = collection.packages.indexOf(packageId);
        if (index > -1) {
            collection.packages.splice(index, 1);
            this.saveCollections();
            this.showSuccess(`Removed from "${collection.name}"`);
            return true;
        }
        return false;
    }

    /**
     * Get packages in a collection
     */
    getCollectionPackages(collectionId, allPackages) {
        const collection = this.getCollection(collectionId);
        if (!collection) return [];
        return allPackages.filter(pkg => collection.packages.includes(pkg.id));
    }

    /**
     * Get collections containing a package
     */
    getPackageCollections(packageId) {
        return this.collections.filter(c => c.packages.includes(packageId));
    }

    /**
     * Rename collection
     */
    renameCollection(collectionId, newName) {
        const collection = this.getCollection(collectionId);
        if (!collection) return false;

        collection.name = newName;
        this.saveCollections();
        this.showSuccess(`Collection renamed to "${newName}"`);
        return true;
    }

    /**
     * Update collection description
     */
    updateCollectionDescription(collectionId, description) {
        const collection = this.getCollection(collectionId);
        if (!collection) return false;

        collection.description = description;
        this.saveCollections();
        return true;
    }

    /**
     * Export favorites and collections
     */
    exportData() {
        const data = {
            favorites: this.favorites,
            collections: this.collections,
            exported: new Date().toISOString(),
            version: '1.0'
        };
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import favorites and collections
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            if (!data.favorites || !data.collections) {
                throw new Error('Invalid data format');
            }

            if (confirm('This will replace your current favorites and collections. Continue?')) {
                this.favorites = data.favorites;
                this.collections = data.collections;
                this.saveFavorites();
                this.saveCollections();
                this.showSuccess('Data imported successfully');
                return true;
            }
        } catch (error) {
            console.error('Import error:', error);
            this.showError('Failed to import data. Please check the file format.');
        }
        return false;
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            totalFavorites: this.favorites.length,
            totalCollections: this.collections.length,
            packagesPerCollection: this.collections.map(c => ({
                name: c.name,
                count: c.packages.length
            }))
        };
    }

    /**
     * Generate unique ID from string
     */
    generateId(str) {
        return str.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') + '-' + Date.now();
    }

    /**
     * Notify change listeners
     */
    notifyChange() {
        window.dispatchEvent(new CustomEvent('nixite-favorites-changed', {
            detail: {
                favorites: this.getFavorites(),
                collections: this.getCollections()
            }
        }));
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Dispatch event for UI to handle
        window.dispatchEvent(new CustomEvent('nixite-notification', {
            detail: { message, type }
        }));
    }
}

// Create global instance
window.favoritesManager = new FavoritesManager();

/**
 * UI Helper Functions
 */

/**
 * Render favorites button for a package
 */
function renderFavoriteButton(packageId) {
    const isFav = window.favoritesManager.isFavorite(packageId);
    const icon = isFav ? '★' : '☆';
    const title = isFav ? 'Remove from favorites' : 'Add to favorites';

    return `
        <button class="favorite-btn ${isFav ? 'is-favorite' : ''}"
                data-package-id="${packageId}"
                title="${title}"
                aria-label="${title}">
            ${icon}
        </button>
    `;
}

/**
 * Render collection selector for a package
 */
function renderCollectionSelector(packageId) {
    const collections = window.favoritesManager.getCollections();
    const packageCollections = window.favoritesManager.getPackageCollections(packageId);

    let html = '<select class="collection-selector" data-package-id="' + packageId + '">';
    html += '<option value="">Add to collection...</option>';

    collections.forEach(collection => {
        const isInCollection = packageCollections.some(c => c.id === collection.id);
        const marker = isInCollection ? '✓ ' : '';
        html += `<option value="${collection.id}">${marker}${collection.name}</option>`;
    });

    html += '<option value="_new">+ New Collection</option>';
    html += '</select>';

    return html;
}

/**
 * Initialize favorite button handlers
 */
function initFavoriteHandlers() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('favorite-btn')) {
            const packageId = e.target.dataset.packageId;
            window.favoritesManager.toggleFavorite(packageId);

            // Update button
            const isFav = window.favoritesManager.isFavorite(packageId);
            e.target.textContent = isFav ? '★' : '☆';
            e.target.classList.toggle('is-favorite', isFav);
            e.target.title = isFav ? 'Remove from favorites' : 'Add to favorites';
        }
    });
}

/**
 * Initialize collection selector handlers
 */
function initCollectionHandlers() {
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('collection-selector')) {
            const packageId = e.target.dataset.packageId;
            const collectionId = e.target.value;

            if (collectionId === '_new') {
                const name = prompt('Collection name:');
                if (name) {
                    const collection = window.favoritesManager.createCollection(name);
                    window.favoritesManager.addToCollection(packageId, collection.id);
                }
            } else if (collectionId) {
                window.favoritesManager.addToCollection(packageId, collectionId);
            }

            // Reset selector
            e.target.value = '';
        }
    });
}

/**
 * Show favorites panel
 */
function showFavoritesPanel(allPackages) {
    const favorites = window.favoritesManager.getFavoritePackages(allPackages);
    const collections = window.favoritesManager.getCollections();

    let html = '<div class="favorites-panel">';
    html += '<h2>My Favorites</h2>';

    if (favorites.length === 0) {
        html += '<p class="empty-state">No favorites yet. Click ☆ on any package to add it!</p>';
    } else {
        html += '<div class="favorites-list">';
        favorites.forEach(pkg => {
            html += `
                <div class="favorite-item">
                    <span class="package-name">${pkg.name}</span>
                    <span class="package-category">${pkg.category}</span>
                    ${renderFavoriteButton(pkg.id)}
                </div>
            `;
        });
        html += '</div>';
    }

    html += '<h3>Collections</h3>';
    collections.forEach(collection => {
        const packages = window.favoritesManager.getCollectionPackages(collection.id, allPackages);
        html += `
            <div class="collection">
                <h4>${collection.name} (${packages.length})</h4>
                <p>${collection.description}</p>
            </div>
        `;
    });

    html += '</div>';

    return html;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FavoritesManager,
        renderFavoriteButton,
        renderCollectionSelector,
        initFavoriteHandlers,
        initCollectionHandlers,
        showFavoritesPanel
    };
}
