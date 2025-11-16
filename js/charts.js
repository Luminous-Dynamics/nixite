/**
 * Advanced Charts & Data Visualization
 *
 * Provides beautiful, interactive charts for the statistics dashboard.
 * Pure JavaScript/SVG implementation with no external dependencies.
 *
 * @version 2.6.0
 * @author Nixite Team
 */

class ChartsEngine {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#7c3aed',
            secondary: '#a78bfa',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#3b82f6',
            purple: '#8b5cf6',
            pink: '#ec4899',
            teal: '#14b8a6',
            orange: '#f97316'
        };
        this.chartPalette = [
            '#7c3aed', '#3b82f6', '#10b981', '#f59e0b',
            '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
            '#f97316', '#06b6d4', '#84cc16', '#f43f5e'
        ];
    }

    /**
     * Create a pie chart
     */
    createPieChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = options.width || container.clientWidth || 400;
        const height = options.height || 300;
        const radius = Math.min(width, height) / 2 - 40;
        const centerX = width / 2;
        const centerY = height / 2;

        // Calculate total
        const total = data.reduce((sum, item) => sum + item.value, 0);

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.style.maxWidth = '100%';

        let currentAngle = -90; // Start at top

        data.forEach((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const color = item.color || this.chartPalette[index % this.chartPalette.length];

            // Create slice
            const slice = this.createPieSlice(
                centerX,
                centerY,
                radius,
                currentAngle,
                currentAngle + angle,
                color
            );

            // Add interactivity
            slice.addEventListener('mouseenter', (e) => {
                slice.style.opacity = '0.8';
                this.showTooltip(e, `${item.label}: ${item.value} (${percentage.toFixed(1)}%)`);
            });

            slice.addEventListener('mouseleave', () => {
                slice.style.opacity = '1';
                this.hideTooltip();
            });

            svg.appendChild(slice);
            currentAngle += angle;
        });

        // Add legend
        const legend = this.createLegend(data, this.chartPalette);

        container.innerHTML = '';
        container.appendChild(svg);
        container.appendChild(legend);

        this.charts[containerId] = { type: 'pie', data, svg };
    }

    createPieSlice(cx, cy, radius, startAngle, endAngle, color) {
        const start = this.polarToCartesian(cx, cy, radius, startAngle);
        const end = this.polarToCartesian(cx, cy, radius, endAngle);
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        const pathData = [
            `M ${cx} ${cy}`,
            `L ${start.x} ${start.y}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
            'Z'
        ].join(' ');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', color);
        path.style.transition = 'opacity 0.2s';
        path.style.cursor = 'pointer';

        return path;
    }

    /**
     * Create a bar chart
     */
    createBarChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = options.width || container.clientWidth || 600;
        const height = options.height || 300;
        const padding = { top: 20, right: 20, bottom: 60, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const maxValue = Math.max(...data.map(d => d.value));
        const barWidth = chartWidth / data.length - 10;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.style.maxWidth = '100%';

        // Create grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            const line = this.createSVGElement('line', {
                x1: padding.left,
                y1: y,
                x2: width - padding.right,
                y2: y,
                stroke: '#e5e7eb',
                'stroke-width': 1,
                'stroke-dasharray': '4 4'
            });
            svg.appendChild(line);

            // Y-axis labels
            const value = maxValue * (1 - i / 5);
            const text = this.createSVGElement('text', {
                x: padding.left - 10,
                y: y + 5,
                'text-anchor': 'end',
                fill: '#6b7280',
                'font-size': '12'
            });
            text.textContent = Math.round(value);
            svg.appendChild(text);
        }

        // Create bars
        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = padding.left + index * (chartWidth / data.length) + 5;
            const y = height - padding.bottom - barHeight;

            const color = item.color || this.chartPalette[index % this.chartPalette.length];

            // Bar
            const rect = this.createSVGElement('rect', {
                x: x,
                y: y,
                width: barWidth,
                height: barHeight,
                fill: color,
                rx: 4
            });

            rect.style.transition = 'opacity 0.2s';
            rect.style.cursor = 'pointer';

            rect.addEventListener('mouseenter', (e) => {
                rect.style.opacity = '0.8';
                this.showTooltip(e, `${item.label}: ${item.value}`);
            });

            rect.addEventListener('mouseleave', () => {
                rect.style.opacity = '1';
                this.hideTooltip();
            });

            svg.appendChild(rect);

            // X-axis label
            const label = this.createSVGElement('text', {
                x: x + barWidth / 2,
                y: height - padding.bottom + 20,
                'text-anchor': 'middle',
                fill: '#6b7280',
                'font-size': '12'
            });
            label.textContent = item.label;
            svg.appendChild(label);
        });

        container.innerHTML = '';
        container.appendChild(svg);

        this.charts[containerId] = { type: 'bar', data, svg };
    }

    /**
     * Create a line chart
     */
    createLineChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = options.width || container.clientWidth || 600;
        const height = options.height || 300;
        const padding = { top: 20, right: 20, bottom: 60, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const maxValue = Math.max(...data.map(d => d.value));
        const minValue = Math.min(...data.map(d => d.value), 0);
        const valueRange = maxValue - minValue;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.style.maxWidth = '100%';

        // Create grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            const line = this.createSVGElement('line', {
                x1: padding.left,
                y1: y,
                x2: width - padding.right,
                y2: y,
                stroke: '#e5e7eb',
                'stroke-width': 1,
                'stroke-dasharray': '4 4'
            });
            svg.appendChild(line);

            // Y-axis labels
            const value = maxValue - (valueRange / 5) * i;
            const text = this.createSVGElement('text', {
                x: padding.left - 10,
                y: y + 5,
                'text-anchor': 'end',
                fill: '#6b7280',
                'font-size': '12'
            });
            text.textContent = Math.round(value);
            svg.appendChild(text);
        }

        // Create line path
        const points = data.map((item, index) => {
            const x = padding.left + (chartWidth / (data.length - 1)) * index;
            const y = padding.top + chartHeight - ((item.value - minValue) / valueRange) * chartHeight;
            return { x, y, item };
        });

        const pathData = points.map((p, i) =>
            `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        ).join(' ');

        const path = this.createSVGElement('path', {
            d: pathData,
            stroke: this.colors.primary,
            'stroke-width': 3,
            fill: 'none',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
        });
        svg.appendChild(path);

        // Create area fill
        const areaPath = pathData +
            ` L ${points[points.length - 1].x} ${height - padding.bottom}` +
            ` L ${points[0].x} ${height - padding.bottom} Z`;

        const area = this.createSVGElement('path', {
            d: areaPath,
            fill: this.colors.primary,
            opacity: '0.1'
        });
        svg.insertBefore(area, path);

        // Create points
        points.forEach((p, index) => {
            const circle = this.createSVGElement('circle', {
                cx: p.x,
                cy: p.y,
                r: 5,
                fill: '#fff',
                stroke: this.colors.primary,
                'stroke-width': 2
            });

            circle.style.cursor = 'pointer';
            circle.style.transition = 'r 0.2s';

            circle.addEventListener('mouseenter', (e) => {
                circle.setAttribute('r', 7);
                this.showTooltip(e, `${p.item.label}: ${p.item.value}`);
            });

            circle.addEventListener('mouseleave', () => {
                circle.setAttribute('r', 5);
                this.hideTooltip();
            });

            svg.appendChild(circle);

            // X-axis labels
            if (index % Math.ceil(data.length / 8) === 0 || index === data.length - 1) {
                const label = this.createSVGElement('text', {
                    x: p.x,
                    y: height - padding.bottom + 20,
                    'text-anchor': 'middle',
                    fill: '#6b7280',
                    'font-size': '12'
                });
                label.textContent = p.item.label;
                svg.appendChild(label);
            }
        });

        container.innerHTML = '';
        container.appendChild(svg);

        this.charts[containerId] = { type: 'line', data, svg };
    }

    /**
     * Create a donut chart
     */
    createDonutChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = options.width || container.clientWidth || 400;
        const height = options.height || 300;
        const radius = Math.min(width, height) / 2 - 40;
        const innerRadius = radius * 0.6;
        const centerX = width / 2;
        const centerY = height / 2;

        const total = data.reduce((sum, item) => sum + item.value, 0);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.style.maxWidth = '100%';

        let currentAngle = -90;

        data.forEach((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const color = item.color || this.chartPalette[index % this.chartPalette.length];

            const slice = this.createDonutSlice(
                centerX,
                centerY,
                radius,
                innerRadius,
                currentAngle,
                currentAngle + angle,
                color
            );

            slice.addEventListener('mouseenter', (e) => {
                slice.style.opacity = '0.8';
                this.showTooltip(e, `${item.label}: ${item.value} (${percentage.toFixed(1)}%)`);
            });

            slice.addEventListener('mouseleave', () => {
                slice.style.opacity = '1';
                this.hideTooltip();
            });

            svg.appendChild(slice);
            currentAngle += angle;
        });

        // Add center text
        const centerText = this.createSVGElement('text', {
            x: centerX,
            y: centerY - 10,
            'text-anchor': 'middle',
            fill: '#1f2937',
            'font-size': '24',
            'font-weight': 'bold'
        });
        centerText.textContent = total;
        svg.appendChild(centerText);

        const centerLabel = this.createSVGElement('text', {
            x: centerX,
            y: centerY + 15,
            'text-anchor': 'middle',
            fill: '#6b7280',
            'font-size': '14'
        });
        centerLabel.textContent = options.centerLabel || 'Total';
        svg.appendChild(centerLabel);

        const legend = this.createLegend(data, this.chartPalette);

        container.innerHTML = '';
        container.appendChild(svg);
        container.appendChild(legend);

        this.charts[containerId] = { type: 'donut', data, svg };
    }

    createDonutSlice(cx, cy, outerRadius, innerRadius, startAngle, endAngle, color) {
        const start = this.polarToCartesian(cx, cy, outerRadius, startAngle);
        const end = this.polarToCartesian(cx, cy, outerRadius, endAngle);
        const innerStart = this.polarToCartesian(cx, cy, innerRadius, startAngle);
        const innerEnd = this.polarToCartesian(cx, cy, innerRadius, endAngle);
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        const pathData = [
            `M ${start.x} ${start.y}`,
            `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
            `L ${innerEnd.x} ${innerEnd.y}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
            'Z'
        ].join(' ');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', color);
        path.style.transition = 'opacity 0.2s';
        path.style.cursor = 'pointer';

        return path;
    }

    /**
     * Create a progress ring
     */
    createProgressRing(containerId, value, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const size = options.size || 120;
        const strokeWidth = options.strokeWidth || 10;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const progress = Math.min(Math.max(value, 0), 100);
        const offset = circumference - (progress / 100) * circumference;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

        // Background circle
        const bgCircle = this.createSVGElement('circle', {
            cx: size / 2,
            cy: size / 2,
            r: radius,
            fill: 'none',
            stroke: '#e5e7eb',
            'stroke-width': strokeWidth
        });
        svg.appendChild(bgCircle);

        // Progress circle
        const progressCircle = this.createSVGElement('circle', {
            cx: size / 2,
            cy: size / 2,
            r: radius,
            fill: 'none',
            stroke: options.color || this.colors.primary,
            'stroke-width': strokeWidth,
            'stroke-dasharray': circumference,
            'stroke-dashoffset': offset,
            'stroke-linecap': 'round',
            transform: `rotate(-90 ${size / 2} ${size / 2})`
        });
        progressCircle.style.transition = 'stroke-dashoffset 1s ease';
        svg.appendChild(progressCircle);

        // Center text
        const text = this.createSVGElement('text', {
            x: size / 2,
            y: size / 2 + 5,
            'text-anchor': 'middle',
            fill: '#1f2937',
            'font-size': options.fontSize || '20',
            'font-weight': 'bold'
        });
        text.textContent = `${Math.round(progress)}%`;
        svg.appendChild(text);

        container.innerHTML = '';
        container.appendChild(svg);
    }

    // Helper methods
    polarToCartesian(cx, cy, radius, angle) {
        const radians = (angle * Math.PI) / 180;
        return {
            x: cx + radius * Math.cos(radians),
            y: cy + radius * Math.sin(radians)
        };
    }

    createSVGElement(type, attributes) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', type);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    }

    createLegend(data, palette) {
        const legend = document.createElement('div');
        legend.className = 'chart-legend';
        legend.innerHTML = data.map((item, index) => {
            const color = item.color || palette[index % palette.length];
            return `
                <div class="legend-item">
                    <span class="legend-color" style="background: ${color};"></span>
                    <span class="legend-label">${item.label}</span>
                    <span class="legend-value">${item.value}</span>
                </div>
            `;
        }).join('');
        return legend;
    }

    showTooltip(event, text) {
        let tooltip = document.getElementById('chart-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'chart-tooltip';
            tooltip.className = 'chart-tooltip';
            document.body.appendChild(tooltip);
        }

        tooltip.textContent = text;
        tooltip.style.display = 'block';
        tooltip.style.left = event.pageX + 10 + 'px';
        tooltip.style.top = event.pageY + 10 + 'px';
    }

    hideTooltip() {
        const tooltip = document.getElementById('chart-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    /**
     * Enhanced statistics integration
     */
    enhanceStatsPanel() {
        // Wait for DOM to be ready
        setTimeout(() => {
            this.createCategoryDistributionChart();
            this.createInstallHistoryChart();
            this.createSearchTrendsChart();
            this.createUsageMetricsChart();
        }, 500);
    }

    createCategoryDistributionChart() {
        const packages = window.packageData || [];
        const categories = {};

        packages.forEach(pkg => {
            const cat = pkg.category || 'Uncategorized';
            categories[cat] = (categories[cat] || 0) + 1;
        });

        const data = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([label, value]) => ({ label, value }));

        this.createDonutChart('category-distribution-chart', data, {
            centerLabel: 'Packages'
        });
    }

    createInstallHistoryChart() {
        const history = JSON.parse(localStorage.getItem('nixite_install_history') || '[]');

        // Group by date
        const byDate = {};
        history.forEach(item => {
            const date = new Date(item.timestamp).toLocaleDateString();
            byDate[date] = (byDate[date] || 0) + 1;
        });

        const data = Object.entries(byDate)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .slice(-30)
            .map(([label, value]) => ({ label, value }));

        if (data.length > 0) {
            this.createLineChart('install-history-chart', data);
        }
    }

    createSearchTrendsChart() {
        const searches = JSON.parse(localStorage.getItem('nixite_search_history') || '[]');

        const terms = {};
        searches.slice(-100).forEach(search => {
            const term = search.query.toLowerCase();
            terms[term] = (terms[term] || 0) + 1;
        });

        const data = Object.entries(terms)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([label, value]) => ({ label, value }));

        if (data.length > 0) {
            this.createBarChart('search-trends-chart', data);
        }
    }

    createUsageMetricsChart() {
        const favorites = JSON.parse(localStorage.getItem('nixite_favorites') || '[]').length;
        const collections = Object.keys(JSON.parse(localStorage.getItem('nixite_collections') || '{}')).length;
        const history = JSON.parse(localStorage.getItem('nixite_install_history') || '[]').length;
        const searches = JSON.parse(localStorage.getItem('nixite_search_history') || '[]').length;

        const data = [
            { label: 'Favorites', value: favorites },
            { label: 'Collections', value: collections },
            { label: 'Installations', value: history },
            { label: 'Searches', value: searches }
        ];

        this.createBarChart('usage-metrics-chart', data);
    }
}

// Initialize
let chartsEngine;
document.addEventListener('DOMContentLoaded', () => {
    chartsEngine = new ChartsEngine();
});
