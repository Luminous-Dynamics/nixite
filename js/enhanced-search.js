/**
 * Nixite Enhanced Search & Filtering System
 *
 * Features:
 * - Multi-criteria filtering
 * - Regex search support
 * - Saved searches
 * - Search history
 * - Smart suggestions
 * - Tag-based filtering
 * - Category filtering
 */

class EnhancedSearch {
    constructor() {
        this.storageKey = 'nixite-saved-searches';
        this.historyKey = 'nixite-search-history';
        this.savedSearches = this.loadSavedSearches();
        this.searchHistory = this.loadSearchHistory();
        this.maxHistory = 20;
    }

    /**
     * Load saved searches from localStorage
     */
    loadSavedSearches() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading saved searches:', error);
            return [];
        }
    }

    /**
     * Save searches to localStorage
     */
    saveSavedSearches() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.savedSearches));
        } catch (error) {
            console.error('Error saving searches:', error);
        }
    }

    /**
     * Load search history from localStorage
     */
    loadSearchHistory() {
        try {
            const stored = localStorage.getItem(this.historyKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading search history:', error);
            return [];
        }
    }

    /**
     * Save search history to localStorage
     */
    saveSearchHistory() {
        try {
            localStorage.setItem(this.historyKey, JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    }

    /**
     * Advanced search with multiple criteria
     */
    search(packages, criteria) {
        let results = [...packages];

        // Text search
        if (criteria.query && criteria.query.length > 0) {
            const query = criteria.query.toLowerCase();
            const useRegex = criteria.regex || false;

            results = results.filter(pkg => {
                if (useRegex) {
                    try {
                        const regex = new RegExp(query, 'i');
                        return regex.test(pkg.name) ||
                               regex.test(pkg.id) ||
                               regex.test(pkg.description);
                    } catch (e) {
                        // Invalid regex, fall back to simple search
                        return this.simpleTextMatch(pkg, query);
                    }
                } else {
                    return this.simpleTextMatch(pkg, query);
                }
            });
        }

        // Category filter
        if (criteria.categories && criteria.categories.length > 0) {
            results = results.filter(pkg =>
                criteria.categories.includes(pkg.category)
            );
        }

        // Tag filter
        if (criteria.tags && criteria.tags.length > 0) {
            results = results.filter(pkg => {
                if (!pkg.tags) return false;
                return criteria.tags.some(tag => pkg.tags.includes(tag));
            });
        }

        // License filter
        if (criteria.licenses && criteria.licenses.length > 0) {
            results = results.filter(pkg =>
                criteria.licenses.includes(pkg.license)
            );
        }

        // Platform filter
        if (criteria.platforms && criteria.platforms.length > 0) {
            results = results.filter(pkg => {
                if (!pkg.platforms) return false;
                return criteria.platforms.some(platform =>
                    pkg.platforms.includes(platform)
                );
            });
        }

        // Sort results
        if (criteria.sortBy) {
            results = this.sortResults(results, criteria.sortBy, criteria.sortOrder || 'asc');
        }

        // Record search in history
        if (criteria.query) {
            this.addToHistory(criteria);
        }

        return results;
    }

    /**
     * Simple text matching
     */
    simpleTextMatch(pkg, query) {
        return pkg.name.toLowerCase().includes(query) ||
               pkg.id.toLowerCase().includes(query) ||
               pkg.description.toLowerCase().includes(query) ||
               (pkg.tags && pkg.tags.some(tag => tag.toLowerCase().includes(query)));
    }

    /**
     * Sort search results
     */
    sortResults(results, sortBy, order = 'asc') {
        const sorted = [...results].sort((a, b) => {
            let aVal, bVal;

            switch(sortBy) {
                case 'name':
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                    break;
                case 'category':
                    aVal = a.category;
                    bVal = b.category;
                    break;
                case 'relevance':
                    // Could implement TF-IDF or similar
                    return 0;
                default:
                    return 0;
            }

            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }

    /**
     * Get search suggestions based on query
     */
    getSuggestions(query, packages, limit = 10) {
        if (!query || query.length < 2) {
            return this.getRecentSearches(5);
        }

        const lowerQuery = query.toLowerCase();
        const suggestions = [];

        // Add package matches
        const packageMatches = packages
            .filter(pkg =>
                pkg.name.toLowerCase().includes(lowerQuery) ||
                pkg.id.toLowerCase().includes(lowerQuery) ||
                pkg.description.toLowerCase().includes(lowerQuery)
            )
            .slice(0, limit)
            .map(pkg => ({
                type: 'package',
                text: pkg.name,
                subtext: pkg.description,
                value: pkg.id,
                category: pkg.category
            }));

        suggestions.push(...packageMatches);

        // Add tag matches
        const allTags = new Set();
        packages.forEach(pkg => {
            if (pkg.tags) pkg.tags.forEach(tag => allTags.add(tag));
        });

        const tagMatches = Array.from(allTags)
            .filter(tag => tag.toLowerCase().includes(lowerQuery))
            .slice(0, 3)
            .map(tag => ({
                type: 'tag',
                text: `#${tag}`,
                subtext: 'Search by tag',
                value: tag
            }));

        suggestions.push(...tagMatches);

        // Add category matches
        const categories = ['create', 'connect', 'grow', 'work', 'play', 'secure', 'manage', 'serve'];
        const categoryMatches = categories
            .filter(cat => cat.toLowerCase().includes(lowerQuery))
            .map(cat => ({
                type: 'category',
                text: cat,
                subtext: 'Browse category',
                value: cat
            }));

        suggestions.push(...categoryMatches);

        return suggestions.slice(0, limit);
    }

    /**
     * Add search to history
     */
    addToHistory(criteria) {
        const historyItem = {
            query: criteria.query,
            timestamp: new Date().toISOString(),
            filters: {
                categories: criteria.categories || [],
                tags: criteria.tags || [],
                regex: criteria.regex || false
            }
        };

        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(item =>
            item.query !== criteria.query
        );

        // Add to beginning
        this.searchHistory.unshift(historyItem);

        // Limit history size
        if (this.searchHistory.length > this.maxHistory) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistory);
        }

        this.saveSearchHistory();
    }

    /**
     * Get recent searches
     */
    getRecentSearches(limit = 10) {
        return this.searchHistory.slice(0, limit).map(item => ({
            type: 'history',
            text: item.query,
            subtext: 'Recent search',
            value: item.query,
            timestamp: item.timestamp
        }));
    }

    /**
     * Clear search history
     */
    clearHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
    }

    /**
     * Save search query
     */
    saveSearch(name, criteria) {
        const search = {
            id: Date.now().toString(),
            name,
            criteria,
            created: new Date().toISOString()
        };

        this.savedSearches.push(search);
        this.saveSavedSearches();
        return search;
    }

    /**
     * Delete saved search
     */
    deleteSavedSearch(id) {
        this.savedSearches = this.savedSearches.filter(s => s.id !== id);
        this.saveSavedSearches();
    }

    /**
     * Get all saved searches
     */
    getSavedSearches() {
        return [...this.savedSearches];
    }

    /**
     * Get saved search by ID
     */
    getSavedSearch(id) {
        return this.savedSearches.find(s => s.id === id);
    }

    /**
     * Extract filters from packages
     */
    extractFilters(packages) {
        const filters = {
            categories: new Set(),
            tags: new Set(),
            licenses: new Set(),
            platforms: new Set()
        };

        packages.forEach(pkg => {
            if (pkg.category) filters.categories.add(pkg.category);
            if (pkg.license) filters.licenses.add(pkg.license);
            if (pkg.tags) pkg.tags.forEach(tag => filters.tags.add(tag));
            if (pkg.platforms) pkg.platforms.forEach(platform => filters.platforms.add(platform));
        });

        return {
            categories: Array.from(filters.categories).sort(),
            tags: Array.from(filters.tags).sort(),
            licenses: Array.from(filters.licenses).sort(),
            platforms: Array.from(filters.platforms).sort()
        };
    }

    /**
     * Get search statistics
     */
    getSearchStats() {
        const stats = {
            totalSearches: this.searchHistory.length,
            totalSaved: this.savedSearches.length,
            mostSearched: [],
            recentSearches: this.getRecentSearches(5)
        };

        // Calculate most searched terms
        const queryCounts = {};
        this.searchHistory.forEach(item => {
            queryCounts[item.query] = (queryCounts[item.query] || 0) + 1;
        });

        stats.mostSearched = Object.entries(queryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([query, count]) => ({ query, count }));

        return stats;
    }
}

// Create global instance
window.enhancedSearch = new EnhancedSearch();

/**
 * UI Helper Functions
 */

/**
 * Render advanced search filters
 */
function renderAdvancedFilters(packages) {
    const filters = window.enhancedSearch.extractFilters(packages);

    return `
        <div class="advanced-filters">
            <h3>Advanced Filters</h3>

            <div class="filter-group">
                <label>Categories</label>
                <div class="filter-options">
                    ${filters.categories.map(cat => `
                        <label class="filter-checkbox">
                            <input type="checkbox" name="category" value="${cat}">
                            <span>${cat}</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <div class="filter-group">
                <label>Popular Tags</label>
                <div class="filter-tags">
                    ${filters.tags.slice(0, 20).map(tag => `
                        <button class="tag-filter" data-tag="${tag}">#${tag}</button>
                    `).join('')}
                </div>
            </div>

            <div class="filter-group">
                <label>
                    <input type="checkbox" id="regexSearch">
                    Use Regular Expressions
                </label>
            </div>

            <div class="filter-actions">
                <button class="btn btn-secondary" id="clearFilters">Clear</button>
                <button class="btn btn-primary" id="applyFilters">Apply Filters</button>
            </div>
        </div>
    `;
}

/**
 * Render saved searches
 */
function renderSavedSearches() {
    const saved = window.enhancedSearch.getSavedSearches();

    if (saved.length === 0) {
        return '<p class="empty-state">No saved searches yet.</p>';
    }

    return `
        <div class="saved-searches">
            <h3>Saved Searches</h3>
            ${saved.map(search => `
                <div class="saved-search-item">
                    <div class="saved-search-info">
                        <div class="saved-search-name">${search.name}</div>
                        <div class="saved-search-query">${search.criteria.query}</div>
                    </div>
                    <div class="saved-search-actions">
                        <button class="btn-icon" onclick="loadSavedSearch('${search.id}')" title="Load">
                            🔍
                        </button>
                        <button class="btn-icon" onclick="deleteSavedSearch('${search.id}')" title="Delete">
                            🗑️
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Load saved search
 */
function loadSavedSearch(id) {
    const search = window.enhancedSearch.getSavedSearch(id);
    if (!search) return;

    // Apply the search criteria
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = search.criteria.query;
        // Trigger search
        const event = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(event);
    }
}

/**
 * Delete saved search
 */
function deleteSavedSearch(id) {
    if (confirm('Delete this saved search?')) {
        window.enhancedSearch.deleteSavedSearch(id);
        // Refresh UI if in modal
        if (document.getElementById('searchModal')) {
            updateSearchModal();
        }
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EnhancedSearch,
        renderAdvancedFilters,
        renderSavedSearches
    };
}
