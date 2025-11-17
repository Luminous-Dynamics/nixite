/**
 * Dependency Graph Visualization
 *
 * Interactive dependency tree viewer for NixOS packages.
 * Pure JavaScript/SVG implementation with no external dependencies.
 *
 * @version 2.8.0
 * @author Nixite Team
 */

class DependencyGraph {
    constructor() {
        this.currentPackage = null;
        this.graphData = null;
        this.zoomLevel = 1;
        this.panX = 0;
        this.panY = 0;
        this.maxDepth = 3;
        this.init();
    }

    init() {
        this.createGraphPanel();
        this.setupEventListeners();
    }

    createGraphPanel() {
        const panel = document.createElement('div');
        panel.id = 'dependency-graph-panel';
        panel.className = 'dependency-graph-panel';
        panel.innerHTML = `
            <div class="graph-overlay" onclick="dependencyGraph.closePanel()"></div>
            <div class="graph-container">
                <div class="graph-header">
                    <div class="header-left">
                        <h2>📦 Dependency Graph</h2>
                        <span class="package-name" id="graph-package-name"></span>
                    </div>
                    <button class="btn-close" onclick="dependencyGraph.closePanel()">×</button>
                </div>

                <div class="graph-toolbar">
                    <div class="toolbar-left">
                        <button class="btn-icon" onclick="dependencyGraph.zoomIn()" title="Zoom In">
                            🔍+
                        </button>
                        <button class="btn-icon" onclick="dependencyGraph.zoomOut()" title="Zoom Out">
                            🔍−
                        </button>
                        <button class="btn-icon" onclick="dependencyGraph.resetView()" title="Reset View">
                            🎯
                        </button>
                        <span class="zoom-level" id="zoom-level">100%</span>
                    </div>
                    <div class="toolbar-center">
                        <label>Max Depth:</label>
                        <select id="depth-select" onchange="dependencyGraph.changeDepth(this.value)">
                            <option value="1">1 Level</option>
                            <option value="2">2 Levels</option>
                            <option value="3" selected>3 Levels</option>
                            <option value="4">4 Levels</option>
                            <option value="5">5 Levels (slow)</option>
                        </select>
                    </div>
                    <div class="toolbar-right">
                        <button class="btn btn-secondary" onclick="dependencyGraph.exportAsImage()">
                            📸 Export Image
                        </button>
                        <button class="btn btn-secondary" onclick="dependencyGraph.exportAsJSON()">
                            📄 Export JSON
                        </button>
                    </div>
                </div>

                <div class="graph-body" id="graph-body">
                    <svg id="dependency-svg" class="dependency-svg"></svg>
                    <div class="graph-legend">
                        <div class="legend-item">
                            <span class="legend-dot direct"></span>
                            <span>Direct Dependencies</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-dot indirect"></span>
                            <span>Indirect Dependencies</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-dot circular"></span>
                            <span>Circular Dependencies</span>
                        </div>
                    </div>
                </div>

                <div class="graph-footer">
                    <div class="stats" id="graph-stats">
                        <span>Loading dependencies...</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    }

    openPanel(packageId) {
        const panel = document.getElementById('dependency-graph-panel');
        const packageNameEl = document.getElementById('graph-package-name');

        this.currentPackage = packageId;
        packageNameEl.textContent = packageId;
        panel.classList.add('active');

        // Fetch and render dependencies
        this.loadDependencies(packageId);
    }

    closePanel() {
        const panel = document.getElementById('dependency-graph-panel');
        panel.classList.remove('active');
        this.currentPackage = null;
    }

    async loadDependencies(packageId) {
        const statsEl = document.getElementById('graph-stats');
        statsEl.textContent = 'Loading dependencies...';

        // In a real implementation, this would fetch from an API
        // For now, we'll generate sample dependency data
        const dependencies = this.generateSampleDependencies(packageId);

        this.graphData = dependencies;
        this.renderGraph();
        this.updateStats();
    }

    generateSampleDependencies(packageId) {
        // Generate sample dependency tree for demonstration
        const dependencies = {
            id: packageId,
            name: packageId,
            version: '1.0.0',
            depth: 0,
            dependencies: []
        };

        // Generate random dependencies (in real app, this comes from API)
        const sampleDeps = [
            'glibc', 'gcc', 'binutils', 'coreutils', 'bash',
            'openssl', 'zlib', 'curl', 'git', 'python3'
        ];

        const numDeps = Math.min(Math.floor(Math.random() * 5) + 2, sampleDeps.length);

        for (let i = 0; i < numDeps; i++) {
            const depName = sampleDeps[Math.floor(Math.random() * sampleDeps.length)];
            if (!dependencies.dependencies.find(d => d.name === depName)) {
                dependencies.dependencies.push(
                    this.generateDependencyNode(depName, 1)
                );
            }
        }

        return dependencies;
    }

    generateDependencyNode(name, depth) {
        const node = {
            id: name,
            name: name,
            version: `${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 30)}`,
            depth: depth,
            dependencies: []
        };

        // Recursively generate dependencies up to maxDepth
        if (depth < this.maxDepth) {
            const sampleDeps = ['glibc', 'gcc', 'zlib', 'openssl', 'bash'];
            const numDeps = Math.floor(Math.random() * 3);

            for (let i = 0; i < numDeps; i++) {
                const depName = sampleDeps[Math.floor(Math.random() * sampleDeps.length)];
                node.dependencies.push(
                    this.generateDependencyNode(depName, depth + 1)
                );
            }
        }

        return node;
    }

    renderGraph() {
        const svg = document.getElementById('dependency-svg');
        const container = document.getElementById('graph-body');

        const width = container.clientWidth;
        const height = container.clientHeight - 60; // Account for legend

        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Clear existing content
        svg.innerHTML = '';

        // Create a group for zoom/pan
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', 'graph-group');
        svg.appendChild(g);

        // Calculate layout
        const layout = this.calculateTreeLayout(this.graphData, width, height);

        // Draw connections first (so they appear behind nodes)
        this.drawConnections(g, layout);

        // Draw nodes
        this.drawNodes(g, layout);

        // Apply initial transform
        this.applyTransform();
    }

    calculateTreeLayout(root, width, height) {
        const levelHeight = 100;
        const nodeWidth = 120;

        // Calculate tree structure
        const nodes = [];
        const links = [];

        const traverse = (node, depth, parentX, siblingsAtDepth) => {
            const level = depth;
            const nodesAtLevel = siblingsAtDepth[level] || 0;

            const x = (width / (nodesAtLevel + 1)) * (nodesAtLevel + 1);
            const y = 80 + level * levelHeight;

            const nodeData = {
                id: node.id,
                name: node.name,
                version: node.version,
                x: x,
                y: y,
                depth: depth,
                dependencies: node.dependencies.length
            };

            nodes.push(nodeData);

            if (parentX !== null) {
                links.push({
                    source: { x: parentX.x, y: parentX.y },
                    target: { x: x, y: y },
                    depth: depth
                });
            }

            siblingsAtDepth[level] = nodesAtLevel + 1;

            node.dependencies.forEach(dep => {
                traverse(dep, depth + 1, nodeData, siblingsAtDepth);
            });
        };

        traverse(root, 0, null, {});

        return { nodes, links };
    }

    drawConnections(g, layout) {
        layout.links.forEach(link => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            // Create curved path
            const midY = (link.source.y + link.target.y) / 2;
            const pathData = `M ${link.source.x} ${link.source.y}
                             C ${link.source.x} ${midY},
                               ${link.target.x} ${midY},
                               ${link.target.x} ${link.target.y}`;

            path.setAttribute('d', pathData);
            path.setAttribute('class', `dependency-link depth-${link.depth}`);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', link.depth === 1 ? '#7c3aed' : '#d1d5db');
            path.setAttribute('stroke-width', '2');

            g.appendChild(path);
        });
    }

    drawNodes(g, layout) {
        layout.nodes.forEach(node => {
            const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            nodeGroup.setAttribute('class', 'dependency-node');
            nodeGroup.setAttribute('transform', `translate(${node.x}, ${node.y})`);
            nodeGroup.style.cursor = 'pointer';

            // Node circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', node.depth === 0 ? '30' : '20');
            circle.setAttribute('fill', this.getNodeColor(node.depth));
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', '2');
            nodeGroup.appendChild(circle);

            // Node label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dy', node.depth === 0 ? '45' : '35');
            text.setAttribute('fill', '#1f2937');
            text.setAttribute('font-size', node.depth === 0 ? '14' : '12');
            text.setAttribute('font-weight', node.depth === 0 ? 'bold' : 'normal');
            text.textContent = this.truncateText(node.name, 15);
            nodeGroup.appendChild(text);

            // Version label
            if (node.version) {
                const versionText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                versionText.setAttribute('text-anchor', 'middle');
                versionText.setAttribute('dy', node.depth === 0 ? '60' : '48');
                versionText.setAttribute('fill', '#6b7280');
                versionText.setAttribute('font-size', '10');
                versionText.textContent = `v${node.version}`;
                nodeGroup.appendChild(versionText);
            }

            // Dependency count badge
            if (node.dependencies > 0) {
                const badge = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                badge.setAttribute('cx', '15');
                badge.setAttribute('cy', '-15');
                badge.setAttribute('r', '10');
                badge.setAttribute('fill', '#ef4444');
                nodeGroup.appendChild(badge);

                const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                badgeText.setAttribute('x', '15');
                badgeText.setAttribute('y', '-15');
                badgeText.setAttribute('text-anchor', 'middle');
                badgeText.setAttribute('dy', '4');
                badgeText.setAttribute('fill', '#fff');
                badgeText.setAttribute('font-size', '10');
                badgeText.setAttribute('font-weight', 'bold');
                badgeText.textContent = node.dependencies;
                nodeGroup.appendChild(badgeText);
            }

            // Click event
            nodeGroup.addEventListener('click', () => {
                this.loadDependencies(node.id);
            });

            // Hover effect
            nodeGroup.addEventListener('mouseenter', () => {
                circle.setAttribute('fill', this.getNodeHoverColor(node.depth));
                this.showNodeTooltip(node, nodeGroup);
            });

            nodeGroup.addEventListener('mouseleave', () => {
                circle.setAttribute('fill', this.getNodeColor(node.depth));
                this.hideNodeTooltip();
            });

            g.appendChild(nodeGroup);
        });
    }

    getNodeColor(depth) {
        const colors = {
            0: '#7c3aed',  // Primary - root
            1: '#3b82f6',  // Blue - direct deps
            2: '#10b981',  // Green - 2nd level
            3: '#f59e0b',  // Orange - 3rd level
            4: '#ef4444'   // Red - 4th level
        };
        return colors[depth] || '#9ca3af';
    }

    getNodeHoverColor(depth) {
        const colors = {
            0: '#6d28d9',
            1: '#2563eb',
            2: '#059669',
            3: '#d97706',
            4: '#dc2626'
        };
        return colors[depth] || '#6b7280';
    }

    showNodeTooltip(node, element) {
        // Implementation would show a tooltip with node details
        console.log('Show tooltip for:', node.name);
    }

    hideNodeTooltip() {
        // Implementation would hide the tooltip
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    updateStats() {
        const statsEl = document.getElementById('graph-stats');
        const count = this.countNodes(this.graphData);

        statsEl.innerHTML = `
            <span><strong>Total Dependencies:</strong> ${count.total}</span>
            <span class="stat-separator">•</span>
            <span><strong>Direct:</strong> ${count.direct}</span>
            <span class="stat-separator">•</span>
            <span><strong>Max Depth:</strong> ${count.maxDepth}</span>
        `;
    }

    countNodes(root) {
        let total = 0;
        let direct = root.dependencies ? root.dependencies.length : 0;
        let maxDepth = 0;

        const traverse = (node, depth) => {
            total++;
            maxDepth = Math.max(maxDepth, depth);
            if (node.dependencies) {
                node.dependencies.forEach(dep => traverse(dep, depth + 1));
            }
        };

        traverse(root, 0);

        return { total, direct, maxDepth };
    }

    zoomIn() {
        this.zoomLevel = Math.min(this.zoomLevel * 1.2, 3);
        this.applyTransform();
        this.updateZoomDisplay();
    }

    zoomOut() {
        this.zoomLevel = Math.max(this.zoomLevel / 1.2, 0.3);
        this.applyTransform();
        this.updateZoomDisplay();
    }

    resetView() {
        this.zoomLevel = 1;
        this.panX = 0;
        this.panY = 0;
        this.applyTransform();
        this.updateZoomDisplay();
    }

    applyTransform() {
        const g = document.getElementById('graph-group');
        if (g) {
            g.setAttribute('transform',
                `translate(${this.panX}, ${this.panY}) scale(${this.zoomLevel})`
            );
        }
    }

    updateZoomDisplay() {
        const zoomLevelEl = document.getElementById('zoom-level');
        if (zoomLevelEl) {
            zoomLevelEl.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        }
    }

    changeDepth(newDepth) {
        this.maxDepth = parseInt(newDepth);
        if (this.currentPackage) {
            this.loadDependencies(this.currentPackage);
        }
    }

    exportAsImage() {
        const svg = document.getElementById('dependency-svg');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        canvas.width = svg.clientWidth;
        canvas.height = svg.clientHeight;

        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${this.currentPackage}-dependencies.png`;
                a.click();
                URL.revokeObjectURL(url);
            });
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }

    exportAsJSON() {
        const json = JSON.stringify(this.graphData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentPackage}-dependencies.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    setupEventListeners() {
        // Pan functionality with mouse drag
        let isPanning = false;
        let startX, startY;

        document.addEventListener('mousedown', (e) => {
            if (e.target.closest('#dependency-svg')) {
                isPanning = true;
                startX = e.clientX - this.panX;
                startY = e.clientY - this.panY;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isPanning) {
                this.panX = e.clientX - startX;
                this.panY = e.clientY - startY;
                this.applyTransform();
            }
        });

        document.addEventListener('mouseup', () => {
            isPanning = false;
        });

        // Zoom with mouse wheel
        document.addEventListener('wheel', (e) => {
            if (e.target.closest('#dependency-svg')) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    this.zoomIn();
                } else {
                    this.zoomOut();
                }
            }
        }, { passive: false });
    }
}

// Initialize
let dependencyGraph;
document.addEventListener('DOMContentLoaded', () => {
    dependencyGraph = new DependencyGraph();
});
