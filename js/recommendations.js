/**
 * Nixite Smart Package Recommendation System
 *
 * Generates intelligent package suggestions based on:
 * - User favorites
 * - Installation history
 * - Package relationships (tags, categories)
 * - Similar packages
 * - Popular packages
 * - Complementary packages
 */

class PackageRecommendations {
    constructor() {
        this.weights = {
            sameTags: 3,
            sameCategory: 2,
            similarName: 1,
            popular: 1,
            favorited: 4,
            installed: 5
        };
    }

    /**
     * Get personalized recommendations for a user
     */
    getRecommendations(packages, limit = 10) {
        const favorites = window.favoritesManager?.getFavorites() || [];
        const history = window.installHistory?.getHistory() || [];

        // Get user's installed packages
        const installedIds = new Set(
            history
                .filter(entry => entry.type === 'install' && entry.status === 'success')
                .map(entry => entry.packageId)
        );

        // Get favorite packages
        const favoritePackages = packages.filter(pkg => favorites.includes(pkg.id));
        const installedPackages = packages.filter(pkg => installedIds.has(pkg.id));

        // Score all packages
        const scores = packages.map(pkg => ({
            package: pkg,
            score: this.calculateScore(pkg, favoritePackages, installedPackages, packages)
        }));

        // Filter out already favorited/installed
        const filtered = scores.filter(item =>
            !favorites.includes(item.package.id) &&
            !installedIds.has(item.package.id)
        );

        // Sort by score and return top N
        return filtered
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => ({
                ...item.package,
                recommendationScore: item.score,
                reason: this.getRecommendationReason(item.package, favoritePackages, installedPackages)
            }));
    }

    /**
     * Calculate recommendation score for a package
     */
    calculateScore(pkg, favoritePackages, installedPackages, allPackages) {
        let score = 0;

        // Score based on favorite packages
        favoritePackages.forEach(fav => {
            score += this.calculateSimilarity(pkg, fav);
        });

        // Score based on installed packages
        installedPackages.forEach(installed => {
            score += this.calculateSimilarity(pkg, installed) * 0.8; // Slightly lower weight than favorites
        });

        // Boost score for popular packages (could be based on download counts if available)
        // For now, use a simple heuristic
        if (this.isPopular(pkg)) {
            score += this.weights.popular;
        }

        return score;
    }

    /**
     * Calculate similarity between two packages
     */
    calculateSimilarity(pkg1, pkg2) {
        let similarity = 0;

        // Same category
        if (pkg1.category === pkg2.category) {
            similarity += this.weights.sameCategory;
        }

        // Common tags
        if (pkg1.tags && pkg2.tags) {
            const commonTags = pkg1.tags.filter(tag => pkg2.tags.includes(tag));
            similarity += commonTags.length * this.weights.sameTags;
        }

        // Similar names (simple string similarity)
        const nameSimilarity = this.stringSimiliarity(pkg1.name, pkg2.name);
        if (nameSimilarity > 0.3) {
            similarity += this.weights.similarName;
        }

        return similarity;
    }

    /**
     * Simple string similarity (Jaccard similarity of words)
     */
    stringSimiliarity(str1, str2) {
        const words1 = new Set(str1.toLowerCase().split(/\s+/));
        const words2 = new Set(str2.toLowerCase().split(/\s+/));

        const intersection = new Set([...words1].filter(word => words2.has(word)));
        const union = new Set([...words1, ...words2]);

        return intersection.size / union.size;
    }

    /**
     * Check if package is popular (could be enhanced with real data)
     */
    isPopular(pkg) {
        const popularPackages = [
            'firefox', 'chromium', 'vscode', 'vim', 'emacs',
            'git', 'docker', 'nodejs', 'python3', 'gcc',
            'gimp', 'inkscape', 'blender', 'vlc', 'libreoffice'
        ];
        return popularPackages.some(popular => pkg.id.includes(popular));
    }

    /**
     * Get recommendation reason
     */
    getRecommendationReason(pkg, favoritePackages, installedPackages) {
        // Check for tag matches with favorites
        for (const fav of favoritePackages) {
            if (pkg.category === fav.category && pkg.tags && fav.tags) {
                const commonTags = pkg.tags.filter(tag => fav.tags.includes(tag));
                if (commonTags.length > 0) {
                    return `Similar to ${fav.name} (${commonTags.slice(0, 2).join(', ')})`;
                }
            }
        }

        // Check for category match
        for (const fav of favoritePackages) {
            if (pkg.category === fav.category) {
                return `Same category as ${fav.name}`;
            }
        }

        // Check for installed packages
        for (const installed of installedPackages) {
            if (pkg.category === installed.category) {
                return `Complements ${installed.name}`;
            }
        }

        // Default
        if (this.isPopular(pkg)) {
            return 'Popular package';
        }

        return 'Recommended for you';
    }

    /**
     * Get similar packages to a given package
     */
    getSimilarPackages(targetPackage, allPackages, limit = 5) {
        const scores = allPackages
            .filter(pkg => pkg.id !== targetPackage.id)
            .map(pkg => ({
                package: pkg,
                score: this.calculateSimilarity(pkg, targetPackage)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return scores.map(item => item.package);
    }

    /**
     * Get packages that work well together
     */
    getComplementaryPackages(packageId, allPackages, limit = 5) {
        // Define common package combinations
        const complementary = {
            // Development
            'vscode': ['git', 'nodejs', 'python3', 'docker'],
            'git': ['gh', 'git-lfs', 'tig'],
            'docker': ['docker-compose', 'kubectl', 'k9s'],
            'nodejs': ['yarn', 'npm', 'typescript'],
            'python3': ['pip', 'virtualenv', 'jupyter'],

            // Creative
            'gimp': ['inkscape', 'krita', 'blender'],
            'inkscape': ['gimp', 'scribus', 'imagemagick'],
            'blender': ['gimp', 'inkscape', 'freecad'],
            'audacity': ['lmms', 'ardour', 'hydrogen'],

            // Productivity
            'firefox': ['thunderbird', 'keepassxc', 'syncthing'],
            'libreoffice': ['calibre', 'scribus', 'dia'],

            // Gaming
            'steam': ['lutris', 'wine', 'gamemode'],
            'lutris': ['wine', 'steam', 'gamemode'],

            // System
            'alacritty': ['tmux', 'zsh', 'neovim'],
            'zsh': ['starship', 'fzf', 'ripgrep'],
            'tmux': ['alacritty', 'neovim', 'zsh']
        };

        const complements = complementary[packageId] || [];

        return allPackages
            .filter(pkg => complements.includes(pkg.id))
            .slice(0, limit);
    }

    /**
     * Get trending packages (based on recent installations)
     */
    getTrendingPackages(allPackages, limit = 10) {
        const history = window.installHistory?.getHistory() || [];
        const recentInstalls = history
            .filter(entry =>
                entry.type === 'install' &&
                entry.status === 'success' &&
                this.isRecent(entry.timestamp, 7) // Last 7 days
            );

        // Count installations
        const installCounts = {};
        recentInstalls.forEach(entry => {
            installCounts[entry.packageId] = (installCounts[entry.packageId] || 0) + 1;
        });

        // Sort by count
        const trending = Object.entries(installCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([packageId, count]) => ({
                packageId,
                count
            }));

        // Map to package objects
        return trending
            .map(item => {
                const pkg = allPackages.find(p => p.id === item.packageId);
                return pkg ? { ...pkg, trendScore: item.count } : null;
            })
            .filter(pkg => pkg !== null);
    }

    /**
     * Check if timestamp is recent
     */
    isRecent(timestamp, days) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);
        return diffDays <= days;
    }

    /**
     * Get packages by use case
     */
    getPackagesByUseCase(useCase, allPackages) {
        const useCases = {
            'web-development': {
                categories: ['work'],
                tags: ['web', 'development', 'programming', 'editor', 'browser']
            },
            'graphic-design': {
                categories: ['create'],
                tags: ['graphics', 'design', 'photo', 'vector', 'image']
            },
            'video-editing': {
                categories: ['create'],
                tags: ['video', 'editing', 'media', 'production']
            },
            'data-science': {
                categories: ['work', 'grow'],
                tags: ['data', 'science', 'analysis', 'python', 'jupyter']
            },
            'gaming': {
                categories: ['play'],
                tags: ['gaming', 'game', 'steam', 'wine']
            },
            'security': {
                categories: ['secure'],
                tags: ['security', 'privacy', 'encryption', 'vpn']
            },
            'devops': {
                categories: ['work', 'serve'],
                tags: ['docker', 'kubernetes', 'deployment', 'ci', 'infrastructure']
            }
        };

        const config = useCases[useCase];
        if (!config) return [];

        return allPackages.filter(pkg => {
            // Match category
            const categoryMatch = config.categories.includes(pkg.category);

            // Match tags
            const tagMatch = pkg.tags && pkg.tags.some(tag =>
                config.tags.some(caseTag => tag.includes(caseTag))
            );

            return categoryMatch || tagMatch;
        });
    }

    /**
     * Get recommendations dashboard data
     */
    getRecommendationsDashboard(allPackages) {
        return {
            forYou: this.getRecommendations(allPackages, 6),
            trending: this.getTrendingPackages(allPackages, 6),
            webDev: this.getPackagesByUseCase('web-development', allPackages).slice(0, 6),
            creative: this.getPackagesByUseCase('graphic-design', allPackages).slice(0, 6)
        };
    }
}

// Create global instance
window.packageRecommendations = new PackageRecommendations();

/**
 * UI Helper Functions
 */

/**
 * Render recommendations panel
 */
function renderRecommendationsPanel(packages) {
    const dashboard = window.packageRecommendations.getRecommendationsDashboard(packages);

    return `
        <div class="recommendations-dashboard">
            <section class="rec-section">
                <h3>🎯 Recommended For You</h3>
                <div class="rec-grid">
                    ${dashboard.forYou.map(pkg => renderRecommendationCard(pkg)).join('')}
                </div>
            </section>

            <section class="rec-section">
                <h3>🔥 Trending This Week</h3>
                <div class="rec-grid">
                    ${dashboard.trending.map(pkg => renderRecommendationCard(pkg)).join('')}
                </div>
            </section>

            <section class="rec-section">
                <h3>💻 Web Development</h3>
                <div class="rec-grid">
                    ${dashboard.webDev.map(pkg => renderRecommendationCard(pkg)).join('')}
                </div>
            </section>

            <section class="rec-section">
                <h3>🎨 Creative Tools</h3>
                <div class="rec-grid">
                    ${dashboard.creative.map(pkg => renderRecommendationCard(pkg)).join('')}
                </div>
            </section>
        </div>
    `;
}

/**
 * Render recommendation card
 */
function renderRecommendationCard(pkg) {
    const reason = pkg.reason || pkg.recommendationScore
        ? `Score: ${pkg.recommendationScore?.toFixed(1)}`
        : '';

    return `
        <div class="rec-card">
            <div class="rec-header">
                <div class="rec-name">${pkg.name}</div>
                <div class="rec-category">${pkg.category}</div>
            </div>
            <div class="rec-desc">${pkg.description}</div>
            ${reason ? `<div class="rec-reason">${reason}</div>` : ''}
            <div class="rec-actions">
                ${renderFavoriteButton(pkg.id)}
                ${renderCompareButton(pkg.id)}
                <button class="btn btn-sm btn-primary" onclick="handleInstallPackage('${pkg.id}')">
                    Install
                </button>
            </div>
        </div>
    `;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PackageRecommendations,
        renderRecommendationsPanel,
        renderRecommendationCard
    };
}
