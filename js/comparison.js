/**
 * Nixite Package Comparison System
 *
 * Allows users to compare multiple packages side-by-side.
 */

class PackageComparison {
    constructor() {
        this.storageKey = 'nixite-comparison';
        this.maxPackages = 4; // Maximum packages to compare at once
        this.compareList = this.loadCompareList();
    }

    /**
     * Load comparison list from localStorage
     */
    loadCompareList() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading comparison list:', error);
            return [];
        }
    }

    /**
     * Save comparison list to localStorage
     */
    saveCompareList() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.compareList));
            this.notifyChange();
        } catch (error) {
            console.error('Error saving comparison list:', error);
        }
    }

    /**
     * Add package to comparison
     */
    addToCompare(packageId) {
        if (this.compareList.includes(packageId)) {
            this.showNotification('Package already in comparison', 'info');
            return false;
        }

        if (this.compareList.length >= this.maxPackages) {
            this.showNotification(`Maximum ${this.maxPackages} packages can be compared`, 'warning');
            return false;
        }

        this.compareList.push(packageId);
        this.saveCompareList();
        this.showNotification('Added to comparison', 'success');
        return true;
    }

    /**
     * Remove package from comparison
     */
    removeFromCompare(packageId) {
        const index = this.compareList.indexOf(packageId);
        if (index > -1) {
            this.compareList.splice(index, 1);
            this.saveCompareList();
            this.showNotification('Removed from comparison', 'success');
            return true;
        }
        return false;
    }

    /**
     * Check if package is in comparison
     */
    isInCompare(packageId) {
        return this.compareList.includes(packageId);
    }

    /**
     * Toggle package in comparison
     */
    toggleCompare(packageId) {
        if (this.isInCompare(packageId)) {
            return this.removeFromCompare(packageId);
        } else {
            return this.addToCompare(packageId);
        }
    }

    /**
     * Get comparison list
     */
    getCompareList() {
        return [...this.compareList];
    }

    /**
     * Clear comparison list
     */
    clearCompareList() {
        this.compareList = [];
        this.saveCompareList();
        this.showNotification('Comparison cleared', 'success');
    }

    /**
     * Get packages being compared
     */
    getComparePackages(allPackages) {
        return allPackages.filter(pkg => this.compareList.includes(pkg.id));
    }

    /**
     * Compare packages and return detailed comparison
     */
    comparePackages(packages) {
        if (packages.length < 2) {
            return null;
        }

        const comparison = {
            packages: packages,
            commonalities: this.findCommonalities(packages),
            differences: this.findDifferences(packages),
            categories: this.compareCategories(packages),
            tags: this.compareTags(packages)
        };

        return comparison;
    }

    /**
     * Find common features between packages
     */
    findCommonalities(packages) {
        const commonalities = [];

        // Check common category
        const categories = packages.map(p => p.category);
        const allSameCategory = categories.every(c => c === categories[0]);
        if (allSameCategory) {
            commonalities.push({
                type: 'category',
                value: categories[0],
                description: `All packages are in the "${categories[0]}" category`
            });
        }

        // Check common tags
        if (packages.every(p => p.tags && p.tags.length > 0)) {
            const tagSets = packages.map(p => new Set(p.tags));
            const commonTags = [...tagSets[0]].filter(tag =>
                tagSets.every(set => set.has(tag))
            );

            if (commonTags.length > 0) {
                commonalities.push({
                    type: 'tags',
                    value: commonTags,
                    description: `Shared tags: ${commonTags.join(', ')}`
                });
            }
        }

        return commonalities;
    }

    /**
     * Find differences between packages
     */
    findDifferences(packages) {
        const differences = [];

        // Category differences
        const categories = [...new Set(packages.map(p => p.category))];
        if (categories.length > 1) {
            differences.push({
                type: 'category',
                description: `Different categories: ${categories.join(', ')}`
            });
        }

        // Tag differences
        const allTags = new Set();
        packages.forEach(p => {
            if (p.tags) p.tags.forEach(tag => allTags.add(tag));
        });

        const uniqueTags = {};
        packages.forEach(pkg => {
            const pkgTags = new Set(pkg.tags || []);
            const unique = [...allTags].filter(tag => {
                const count = packages.filter(p =>
                    p.tags && p.tags.includes(tag)
                ).length;
                return count === 1 && pkgTags.has(tag);
            });

            if (unique.length > 0) {
                uniqueTags[pkg.id] = unique;
            }
        });

        if (Object.keys(uniqueTags).length > 0) {
            differences.push({
                type: 'tags',
                description: 'Unique tags per package',
                details: uniqueTags
            });
        }

        return differences;
    }

    /**
     * Compare categories
     */
    compareCategories(packages) {
        const categoryCount = {};
        packages.forEach(pkg => {
            categoryCount[pkg.category] = (categoryCount[pkg.category] || 0) + 1;
        });

        return {
            distribution: categoryCount,
            dominant: Object.keys(categoryCount).reduce((a, b) =>
                categoryCount[a] > categoryCount[b] ? a : b
            )
        };
    }

    /**
     * Compare tags
     */
    compareTags(packages) {
        const tagCount = {};
        packages.forEach(pkg => {
            if (pkg.tags) {
                pkg.tags.forEach(tag => {
                    tagCount[tag] = (tagCount[tag] || 0) + 1;
                });
            }
        });

        const sortedTags = Object.entries(tagCount)
            .sort((a, b) => b[1] - a[1])
            .map(([tag, count]) => ({ tag, count }));

        return {
            all: sortedTags,
            common: sortedTags.filter(t => t.count > 1),
            unique: sortedTags.filter(t => t.count === 1)
        };
    }

    /**
     * Generate comparison matrix
     */
    generateComparisonMatrix(packages) {
        const fields = [
            { key: 'name', label: 'Package Name', type: 'text' },
            { key: 'id', label: 'Package ID', type: 'code' },
            { key: 'description', label: 'Description', type: 'text' },
            { key: 'category', label: 'Category', type: 'badge' },
            { key: 'tags', label: 'Tags', type: 'tags' },
            { key: 'homepage', label: 'Homepage', type: 'link' },
            { key: 'license', label: 'License', type: 'text' },
            { key: 'platforms', label: 'Platforms', type: 'list' }
        ];

        const matrix = fields.map(field => {
            const row = {
                field: field.label,
                type: field.type,
                values: {}
            };

            packages.forEach(pkg => {
                row.values[pkg.id] = pkg[field.key];
            });

            return row;
        });

        return matrix;
    }

    /**
     * Export comparison as markdown
     */
    exportAsMarkdown(packages) {
        let md = '# Package Comparison\n\n';
        md += `Generated: ${new Date().toLocaleString()}\n\n`;

        // Package names
        md += '## Packages\n\n';
        packages.forEach((pkg, i) => {
            md += `${i + 1}. **${pkg.name}** (${pkg.id})\n`;
        });
        md += '\n';

        // Comparison matrix
        md += '## Comparison Matrix\n\n';
        const matrix = this.generateComparisonMatrix(packages);

        // Create markdown table
        md += '| Field | ' + packages.map(p => p.name).join(' | ') + ' |\n';
        md += '|-------|' + packages.map(() => '------').join('|') + '|\n';

        matrix.forEach(row => {
            md += `| ${row.field} | `;
            packages.forEach(pkg => {
                const value = row.values[pkg.id];
                if (Array.isArray(value)) {
                    md += value.join(', ');
                } else if (value) {
                    md += value;
                } else {
                    md += '-';
                }
                md += ' | ';
            });
            md += '\n';
        });

        // Commonalities
        const comparison = this.comparePackages(packages);
        if (comparison.commonalities.length > 0) {
            md += '\n## Commonalities\n\n';
            comparison.commonalities.forEach(common => {
                md += `- ${common.description}\n`;
            });
        }

        // Differences
        if (comparison.differences.length > 0) {
            md += '\n## Differences\n\n';
            comparison.differences.forEach(diff => {
                md += `- ${diff.description}\n`;
            });
        }

        return md;
    }

    /**
     * Export comparison as JSON
     */
    exportAsJSON(packages) {
        const comparison = this.comparePackages(packages);
        return JSON.stringify({
            generated: new Date().toISOString(),
            packages: packages,
            comparison: comparison,
            matrix: this.generateComparisonMatrix(packages)
        }, null, 2);
    }

    /**
     * Notify change listeners
     */
    notifyChange() {
        window.dispatchEvent(new CustomEvent('nixite-comparison-changed', {
            detail: {
                compareList: this.getCompareList(),
                count: this.compareList.length
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
window.packageComparison = new PackageComparison();

/**
 * UI Helper Functions
 */

/**
 * Render compare button
 */
function renderCompareButton(packageId) {
    const isInCompare = window.packageComparison.isInCompare(packageId);
    const title = isInCompare ? 'Remove from comparison' : 'Add to comparison';

    return `
        <button class="compare-btn ${isInCompare ? 'in-compare' : ''}"
                data-package-id="${packageId}"
                title="${title}"
                aria-label="${title}">
            ${isInCompare ? '✓ Compare' : 'Compare'}
        </button>
    `;
}

/**
 * Render comparison panel
 */
function renderComparisonPanel(allPackages) {
    const packages = window.packageComparison.getComparePackages(allPackages);

    if (packages.length === 0) {
        return `
            <div class="comparison-panel">
                <h2>Package Comparison</h2>
                <p class="empty-state">
                    No packages selected for comparison.<br>
                    Click "Compare" on any package to add it.
                </p>
            </div>
        `;
    }

    const matrix = window.packageComparison.generateComparisonMatrix(packages);
    const comparison = window.packageComparison.comparePackages(packages);

    let html = '<div class="comparison-panel">';
    html += '<div class="comparison-header">';
    html += '<h2>Comparing ' + packages.length + ' Packages</h2>';
    html += '<button class="btn-clear-compare">Clear All</button>';
    html += '<button class="btn-export-compare" data-format="markdown">Export MD</button>';
    html += '<button class="btn-export-compare" data-format="json">Export JSON</button>';
    html += '</div>';

    // Comparison table
    html += '<table class="comparison-table">';
    html += '<thead><tr>';
    html += '<th>Property</th>';
    packages.forEach(pkg => {
        html += `<th>${pkg.name}<br><button class="btn-remove-from-compare" data-package-id="${pkg.id}">✕</button></th>`;
    });
    html += '</tr></thead>';

    html += '<tbody>';
    matrix.forEach(row => {
        html += '<tr>';
        html += `<td class="row-label">${row.field}</td>`;
        packages.forEach(pkg => {
            const value = row.values[pkg.id];
            html += '<td>';
            if (row.type === 'tags' && Array.isArray(value)) {
                html += value.map(tag => `<span class="tag">${tag}</span>`).join(' ');
            } else if (row.type === 'badge') {
                html += `<span class="category-badge">${value}</span>`;
            } else if (row.type === 'link' && value) {
                html += `<a href="${value}" target="_blank">View</a>`;
            } else if (row.type === 'list' && Array.isArray(value)) {
                html += value.join(', ');
            } else if (row.type === 'code') {
                html += `<code>${value || '-'}</code>`;
            } else {
                html += value || '-';
            }
            html += '</td>';
        });
        html += '</tr>';
    });
    html += '</tbody></table>';

    // Insights
    if (comparison) {
        html += '<div class="comparison-insights">';
        html += '<h3>Insights</h3>';

        if (comparison.commonalities.length > 0) {
            html += '<h4>Commonalities</h4>';
            html += '<ul>';
            comparison.commonalities.forEach(common => {
                html += `<li>${common.description}</li>`;
            });
            html += '</ul>';
        }

        if (comparison.differences.length > 0) {
            html += '<h4>Differences</h4>';
            html += '<ul>';
            comparison.differences.forEach(diff => {
                html += `<li>${diff.description}</li>`;
            });
            html += '</ul>';
        }

        html += '</div>';
    }

    html += '</div>';

    return html;
}

/**
 * Initialize comparison handlers
 */
function initComparisonHandlers() {
    // Toggle compare
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('compare-btn')) {
            const packageId = e.target.dataset.packageId;
            window.packageComparison.toggleCompare(packageId);

            // Update button
            const isInCompare = window.packageComparison.isInCompare(packageId);
            e.target.textContent = isInCompare ? '✓ Compare' : 'Compare';
            e.target.classList.toggle('in-compare', isInCompare);
        }

        // Clear comparison
        if (e.target.classList.contains('btn-clear-compare')) {
            window.packageComparison.clearCompareList();
        }

        // Remove from comparison
        if (e.target.classList.contains('btn-remove-from-compare')) {
            const packageId = e.target.dataset.packageId;
            window.packageComparison.removeFromCompare(packageId);
        }

        // Export comparison
        if (e.target.classList.contains('btn-export-compare')) {
            const format = e.target.dataset.format;
            const packages = window.packageComparison.getComparePackages(window.allPackages || []);

            let content, filename, type;
            if (format === 'markdown') {
                content = window.packageComparison.exportAsMarkdown(packages);
                filename = 'package-comparison.md';
                type = 'text/markdown';
            } else if (format === 'json') {
                content = window.packageComparison.exportAsJSON(packages);
                filename = 'package-comparison.json';
                type = 'application/json';
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
        PackageComparison,
        renderCompareButton,
        renderComparisonPanel,
        initComparisonHandlers
    };
}
