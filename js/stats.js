/**
 * Nixite Package Statistics Dashboard
 *
 * Provides insights into the package database and user activity.
 */

class PackageStats {
    constructor(packages = []) {
        this.packages = packages;
    }

    /**
     * Update packages data
     */
    setPackages(packages) {
        this.packages = packages;
    }

    /**
     * Get total package count
     */
    getTotalPackages() {
        return this.packages.length;
    }

    /**
     * Get packages by category
     */
    getByCategory() {
        const categories = {};

        this.packages.forEach(pkg => {
            if (!categories[pkg.category]) {
                categories[pkg.category] = {
                    count: 0,
                    packages: []
                };
            }
            categories[pkg.category].count++;
            categories[pkg.category].packages.push(pkg);
        });

        return categories;
    }

    /**
     * Get category distribution
     */
    getCategoryDistribution() {
        const byCategory = this.getByCategory();
        const total = this.getTotalPackages();

        return Object.entries(byCategory).map(([category, data]) => ({
            category,
            count: data.count,
            percentage: total > 0 ? (data.count / total * 100).toFixed(1) : 0
        })).sort((a, b) => b.count - a.count);
    }

    /**
     * Get all tags with counts
     */
    getAllTags() {
        const tagCounts = {};

        this.packages.forEach(pkg => {
            if (pkg.tags && Array.isArray(pkg.tags)) {
                pkg.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);
    }

    /**
     * Get popular tags (top N)
     */
    getPopularTags(limit = 10) {
        return this.getAllTags().slice(0, limit);
    }

    /**
     * Get packages without tags
     */
    getPackagesWithoutTags() {
        return this.packages.filter(pkg => !pkg.tags || pkg.tags.length === 0);
    }

    /**
     * Get packages without homepage
     */
    getPackagesWithoutHomepage() {
        return this.packages.filter(pkg => !pkg.homepage);
    }

    /**
     * Get packages without license
     */
    getPackagesWithoutLicense() {
        return this.packages.filter(pkg => !pkg.license);
    }

    /**
     * Get data completeness stats
     */
    getCompletenessStats() {
        const total = this.getTotalPackages();

        return {
            total,
            withTags: total - this.getPackagesWithoutTags().length,
            withHomepage: total - this.getPackagesWithoutHomepage().length,
            withLicense: total - this.getPackagesWithoutLicense().length,
            percentages: {
                tags: total > 0 ? ((total - this.getPackagesWithoutTags().length) / total * 100).toFixed(1) : 0,
                homepage: total > 0 ? ((total - this.getPackagesWithoutHomepage().length) / total * 100).toFixed(1) : 0,
                license: total > 0 ? ((total - this.getPackagesWithoutLicense().length) / total * 100).toFixed(1) : 0
            }
        };
    }

    /**
     * Get license distribution
     */
    getLicenseDistribution() {
        const licenses = {};

        this.packages.forEach(pkg => {
            const license = pkg.license || 'Unknown';
            licenses[license] = (licenses[license] || 0) + 1;
        });

        return Object.entries(licenses)
            .map(([license, count]) => ({ license, count }))
            .sort((a, b) => b.count - a.count);
    }

    /**
     * Get platform distribution
     */
    getPlatformDistribution() {
        const platforms = {};

        this.packages.forEach(pkg => {
            if (pkg.platforms && Array.isArray(pkg.platforms)) {
                pkg.platforms.forEach(platform => {
                    platforms[platform] = (platforms[platform] || 0) + 1;
                });
            }
        });

        return Object.entries(platforms)
            .map(([platform, count]) => ({ platform, count }))
            .sort((a, b) => b.count - a.count);
    }

    /**
     * Get description length stats
     */
    getDescriptionStats() {
        const lengths = this.packages
            .map(pkg => pkg.description ? pkg.description.split(' ').length : 0);

        return {
            average: lengths.length > 0 ? (lengths.reduce((a, b) => a + b, 0) / lengths.length).toFixed(1) : 0,
            min: Math.min(...lengths),
            max: Math.max(...lengths),
            median: this.getMedian(lengths)
        };
    }

    /**
     * Get median value
     */
    getMedian(arr) {
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ?
            (sorted[mid - 1] + sorted[mid]) / 2 :
            sorted[mid];
    }

    /**
     * Search statistics
     */
    getSearchStats(query) {
        const results = this.searchPackages(query);

        return {
            query,
            totalResults: results.length,
            byCategory: this.groupByCategory(results),
            tags: this.extractTags(results)
        };
    }

    /**
     * Search packages (simple implementation)
     */
    searchPackages(query) {
        const lowerQuery = query.toLowerCase();
        return this.packages.filter(pkg =>
            pkg.name.toLowerCase().includes(lowerQuery) ||
            pkg.id.toLowerCase().includes(lowerQuery) ||
            pkg.description.toLowerCase().includes(lowerQuery) ||
            (pkg.tags && pkg.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
        );
    }

    /**
     * Group packages by category
     */
    groupByCategory(packages) {
        const groups = {};
        packages.forEach(pkg => {
            groups[pkg.category] = (groups[pkg.category] || 0) + 1;
        });
        return groups;
    }

    /**
     * Extract unique tags from packages
     */
    extractTags(packages) {
        const tags = new Set();
        packages.forEach(pkg => {
            if (pkg.tags) pkg.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags);
    }

    /**
     * Get quality metrics
     */
    getQualityMetrics() {
        const total = this.getTotalPackages();
        const completeness = this.getCompletenessStats();
        const descStats = this.getDescriptionStats();

        // Quality score calculation
        const score = (
            (completeness.percentages.tags / 100 * 0.3) +
            (completeness.percentages.homepage / 100 * 0.3) +
            (completeness.percentages.license / 100 * 0.2) +
            (descStats.average >= 5 && descStats.average <= 15 ? 0.2 : 0.1)
        ) * 100;

        return {
            score: score.toFixed(1),
            grade: this.scoreToGrade(score),
            breakdown: {
                tags: completeness.percentages.tags,
                homepage: completeness.percentages.homepage,
                license: completeness.percentages.license,
                descriptions: descStats.average >= 5 && descStats.average <= 15 ? 100 : 50
            }
        };
    }

    /**
     * Convert score to letter grade
     */
    scoreToGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    /**
     * Get comprehensive stats summary
     */
    getSummary() {
        return {
            total: this.getTotalPackages(),
            categories: this.getCategoryDistribution(),
            tags: this.getPopularTags(10),
            completeness: this.getCompletenessStats(),
            licenses: this.getLicenseDistribution(),
            platforms: this.getPlatformDistribution(),
            descriptions: this.getDescriptionStats(),
            quality: this.getQualityMetrics()
        };
    }

    /**
     * Export stats as JSON
     */
    exportAsJSON() {
        return JSON.stringify({
            generated: new Date().toISOString(),
            summary: this.getSummary()
        }, null, 2);
    }

    /**
     * Export stats as markdown
     */
    exportAsMarkdown() {
        const summary = this.getSummary();

        let md = '# Nixite Package Statistics\n\n';
        md += `Generated: ${new Date().toLocaleString()}\n\n`;

        // Overview
        md += '## Overview\n\n';
        md += `- **Total Packages:** ${summary.total}\n`;
        md += `- **Quality Score:** ${summary.quality.score}% (Grade ${summary.quality.grade})\n\n`;

        // Category Distribution
        md += '## Category Distribution\n\n';
        md += '| Category | Count | Percentage |\n';
        md += '|----------|-------|------------|\n';
        summary.categories.forEach(cat => {
            md += `| ${cat.category} | ${cat.count} | ${cat.percentage}% |\n`;
        });
        md += '\n';

        // Popular Tags
        md += '## Popular Tags\n\n';
        md += '| Tag | Usage Count |\n';
        md += '|-----|-------------|\n';
        summary.tags.forEach(tag => {
            md += `| ${tag.tag} | ${tag.count} |\n`;
        });
        md += '\n';

        // Completeness
        md += '## Data Completeness\n\n';
        md += `- **With Tags:** ${summary.completeness.withTags}/${summary.total} (${summary.completeness.percentages.tags}%)\n`;
        md += `- **With Homepage:** ${summary.completeness.withHomepage}/${summary.total} (${summary.completeness.percentages.homepage}%)\n`;
        md += `- **With License:** ${summary.completeness.withLicense}/${summary.total} (${summary.completeness.percentages.license}%)\n\n`;

        // Description Stats
        md += '## Description Statistics\n\n';
        md += `- **Average Length:** ${summary.descriptions.average} words\n`;
        md += `- **Range:** ${summary.descriptions.min} - ${summary.descriptions.max} words\n`;
        md += `- **Median:** ${summary.descriptions.median} words\n\n`;

        return md;
    }
}

// Create global instance
window.packageStats = new PackageStats();

/**
 * UI Helper Functions
 */

/**
 * Render stats dashboard
 */
function renderStatsDashboard(packages) {
    window.packageStats.setPackages(packages);
    const summary = window.packageStats.getSummary();

    let html = '<div class="stats-dashboard">';
    html += '<h2>Package Statistics</h2>';

    // Overview Cards
    html += '<div class="stats-overview">';
    html += `<div class="stat-card">
        <div class="stat-label">Total Packages</div>
        <div class="stat-value">${summary.total}</div>
    </div>`;
    html += `<div class="stat-card">
        <div class="stat-label">Categories</div>
        <div class="stat-value">${summary.categories.length}</div>
    </div>`;
    html += `<div class="stat-card">
        <div class="stat-label">Quality Score</div>
        <div class="stat-value">${summary.quality.score}%</div>
        <div class="stat-grade">Grade: ${summary.quality.grade}</div>
    </div>`;
    html += `<div class="stat-card">
        <div class="stat-label">Avg Description</div>
        <div class="stat-value">${summary.descriptions.average}</div>
        <div class="stat-unit">words</div>
    </div>`;
    html += '</div>';

    // Category Distribution
    html += '<div class="stats-section">';
    html += '<h3>Category Distribution</h3>';
    html += '<div class="category-chart">';
    summary.categories.forEach(cat => {
        html += `
            <div class="category-bar">
                <div class="category-label">${cat.category}</div>
                <div class="category-progress">
                    <div class="category-fill" style="width: ${cat.percentage}%"></div>
                </div>
                <div class="category-stats">${cat.count} (${cat.percentage}%)</div>
            </div>
        `;
    });
    html += '</div>';
    html += '</div>';

    // Popular Tags
    html += '<div class="stats-section">';
    html += '<h3>Popular Tags</h3>';
    html += '<div class="tags-cloud">';
    summary.tags.forEach(tag => {
        const size = Math.min(100 + tag.count * 10, 200);
        html += `<span class="tag-cloud-item" style="font-size: ${size}%">${tag.tag} (${tag.count})</span>`;
    });
    html += '</div>';
    html += '</div>';

    // Completeness
    html += '<div class="stats-section">';
    html += '<h3>Data Completeness</h3>';
    html += '<div class="completeness-grid">';
    html += `
        <div class="completeness-item">
            <div class="completeness-label">Tags</div>
            <div class="completeness-bar">
                <div class="completeness-fill" style="width: ${summary.completeness.percentages.tags}%"></div>
            </div>
            <div class="completeness-value">${summary.completeness.percentages.tags}%</div>
        </div>
    `;
    html += `
        <div class="completeness-item">
            <div class="completeness-label">Homepage</div>
            <div class="completeness-bar">
                <div class="completeness-fill" style="width: ${summary.completeness.percentages.homepage}%"></div>
            </div>
            <div class="completeness-value">${summary.completeness.percentages.homepage}%</div>
        </div>
    `;
    html += `
        <div class="completeness-item">
            <div class="completeness-label">License</div>
            <div class="completeness-bar">
                <div class="completeness-fill" style="width: ${summary.completeness.percentages.license}%"></div>
            </div>
            <div class="completeness-value">${summary.completeness.percentages.license}%</div>
        </div>
    `;
    html += '</div>';
    html += '</div>';

    // Export Actions
    html += '<div class="stats-actions">';
    html += '<button class="btn-export-stats" data-format="json">Export JSON</button>';
    html += '<button class="btn-export-stats" data-format="markdown">Export Markdown</button>';
    html += '</div>';

    html += '</div>';

    return html;
}

/**
 * Initialize stats handlers
 */
function initStatsHandlers() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-export-stats')) {
            const format = e.target.dataset.format;
            let content, filename, type;

            if (format === 'json') {
                content = window.packageStats.exportAsJSON();
                filename = 'nixite-stats.json';
                type = 'application/json';
            } else if (format === 'markdown') {
                content = window.packageStats.exportAsMarkdown();
                filename = 'nixite-stats.md';
                type = 'text/markdown';
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
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PackageStats,
        renderStatsDashboard,
        initStatsHandlers
    };
}
