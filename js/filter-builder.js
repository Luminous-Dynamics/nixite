/**
 * Visual Filter Builder
 *
 * Provides an advanced visual interface for building complex package filters.
 * Features drag-and-drop, logical operators, filter templates, and export/import.
 *
 * @version 2.6.0
 * @author Nixite Team
 */

class FilterBuilder {
    constructor() {
        this.filters = [];
        this.filterTemplates = this.getDefaultTemplates();
        this.currentFilter = null;
        this.operators = {
            text: ['contains', 'equals', 'starts_with', 'ends_with', 'regex'],
            number: ['equals', 'greater_than', 'less_than', 'between'],
            list: ['contains', 'not_contains', 'in', 'not_in'],
            boolean: ['is', 'is_not']
        };
        this.fields = this.getAvailableFields();
        this.init();
    }

    init() {
        this.loadSavedFilters();
        this.createFilterBuilderPanel();
        this.setupEventListeners();
    }

    getAvailableFields() {
        return [
            { id: 'name', label: 'Package Name', type: 'text' },
            { id: 'description', label: 'Description', type: 'text' },
            { id: 'category', label: 'Category', type: 'list', options: [] },
            { id: 'tags', label: 'Tags', type: 'list', options: [] },
            { id: 'license', label: 'License', type: 'list', options: [] },
            { id: 'platform', label: 'Platform', type: 'list', options: [] },
            { id: 'version', label: 'Version', type: 'text' },
            { id: 'popularity', label: 'Popularity', type: 'number' },
            { id: 'size', label: 'Size', type: 'number' },
            { id: 'isFavorite', label: 'Is Favorite', type: 'boolean' },
            { id: 'inCollections', label: 'In Collections', type: 'boolean' },
            { id: 'installHistory', label: 'Previously Installed', type: 'boolean' }
        ];
    }

    getDefaultTemplates() {
        return {
            favorites: {
                name: 'My Favorites',
                description: 'Show only favorite packages',
                filters: [
                    { field: 'isFavorite', operator: 'is', value: true }
                ]
            },
            popular: {
                name: 'Popular Packages',
                description: 'Highly popular packages',
                filters: [
                    { field: 'popularity', operator: 'greater_than', value: 80 }
                ]
            },
            development: {
                name: 'Development Tools',
                description: 'Development and programming packages',
                filters: [
                    {
                        logic: 'OR',
                        conditions: [
                            { field: 'category', operator: 'contains', value: 'development' },
                            { field: 'category', operator: 'contains', value: 'programming' },
                            { field: 'tags', operator: 'contains', value: 'dev' }
                        ]
                    }
                ]
            },
            recent: {
                name: 'Recently Installed',
                description: 'Packages in installation history',
                filters: [
                    { field: 'installHistory', operator: 'is', value: true }
                ]
            },
            lightweight: {
                name: 'Lightweight Packages',
                description: 'Small package size',
                filters: [
                    { field: 'size', operator: 'less_than', value: 10 }
                ]
            }
        };
    }

    createFilterBuilderPanel() {
        const panel = document.createElement('div');
        panel.id = 'filter-builder-panel';
        panel.className = 'filter-builder-panel';
        panel.innerHTML = `
            <div class="filter-builder-overlay" onclick="filterBuilder.closePanel()"></div>
            <div class="filter-builder-container">
                <div class="filter-builder-header">
                    <h2>🔍 Visual Filter Builder</h2>
                    <button class="btn-close" onclick="filterBuilder.closePanel()">×</button>
                </div>

                <div class="filter-builder-body">
                    <!-- Templates Section -->
                    <div class="filter-templates">
                        <h3>Quick Templates</h3>
                        <div class="template-grid" id="template-grid"></div>
                    </div>

                    <!-- Filter Construction Area -->
                    <div class="filter-construction">
                        <div class="construction-header">
                            <h3>Build Custom Filter</h3>
                            <div class="construction-actions">
                                <button class="btn btn-secondary" onclick="filterBuilder.addCondition()">
                                    + Add Condition
                                </button>
                                <button class="btn btn-secondary" onclick="filterBuilder.addGroup()">
                                    + Add Group
                                </button>
                            </div>
                        </div>
                        <div class="filter-conditions" id="filter-conditions">
                            <div class="empty-state">
                                <p>No conditions yet. Add a condition to start building your filter.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Saved Filters -->
                    <div class="saved-filters">
                        <h3>Saved Filters</h3>
                        <div class="saved-filters-list" id="saved-filters-list"></div>
                    </div>
                </div>

                <div class="filter-builder-footer">
                    <div class="footer-left">
                        <button class="btn btn-secondary" onclick="filterBuilder.clearAll()">
                            Clear All
                        </button>
                        <button class="btn btn-secondary" onclick="filterBuilder.exportFilter()">
                            📤 Export
                        </button>
                        <button class="btn btn-secondary" onclick="filterBuilder.importFilter()">
                            📥 Import
                        </button>
                    </div>
                    <div class="footer-right">
                        <button class="btn btn-secondary" onclick="filterBuilder.saveFilter()">
                            💾 Save Filter
                        </button>
                        <button class="btn btn-primary" onclick="filterBuilder.applyFilter()">
                            Apply Filter
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        this.renderTemplates();
        this.renderSavedFilters();
    }

    renderTemplates() {
        const grid = document.getElementById('template-grid');
        grid.innerHTML = Object.entries(this.filterTemplates).map(([key, template]) => `
            <div class="template-card" onclick="filterBuilder.applyTemplate('${key}')">
                <div class="template-name">${template.name}</div>
                <div class="template-description">${template.description}</div>
            </div>
        `).join('');
    }

    renderSavedFilters() {
        const list = document.getElementById('saved-filters-list');
        const saved = this.getSavedFilters();

        if (saved.length === 0) {
            list.innerHTML = '<p class="empty-state-small">No saved filters yet.</p>';
            return;
        }

        list.innerHTML = saved.map((filter, index) => `
            <div class="saved-filter-item">
                <div class="saved-filter-info">
                    <div class="saved-filter-name">${filter.name}</div>
                    <div class="saved-filter-conditions">${filter.conditions.length} condition(s)</div>
                </div>
                <div class="saved-filter-actions">
                    <button class="btn-icon" onclick="filterBuilder.loadSavedFilter(${index})" title="Load">
                        📂
                    </button>
                    <button class="btn-icon" onclick="filterBuilder.deleteSavedFilter(${index})" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    addCondition(group = null) {
        const container = document.getElementById('filter-conditions');
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        const conditionId = 'condition-' + Date.now();
        const condition = document.createElement('div');
        condition.className = 'filter-condition';
        condition.id = conditionId;
        condition.innerHTML = `
            <div class="condition-drag-handle" title="Drag to reorder">⋮⋮</div>
            <div class="condition-fields">
                <select class="condition-field" onchange="filterBuilder.updateOperators('${conditionId}')">
                    <option value="">Select field...</option>
                    ${this.fields.map(f => `<option value="${f.id}">${f.label}</option>`).join('')}
                </select>
                <select class="condition-operator" id="${conditionId}-operator">
                    <option value="">Select operator...</option>
                </select>
                <input type="text" class="condition-value" placeholder="Value..." id="${conditionId}-value">
            </div>
            <button class="btn-remove" onclick="filterBuilder.removeCondition('${conditionId}')" title="Remove">
                ×
            </button>
        `;

        if (group) {
            group.appendChild(condition);
        } else {
            container.appendChild(condition);
        }

        this.makeDraggable(condition);
    }

    addGroup() {
        const container = document.getElementById('filter-conditions');
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        const groupId = 'group-' + Date.now();
        const group = document.createElement('div');
        group.className = 'filter-group';
        group.id = groupId;
        group.innerHTML = `
            <div class="group-header">
                <div class="group-logic">
                    <label>Match:</label>
                    <select class="group-logic-select">
                        <option value="AND">All (AND)</option>
                        <option value="OR">Any (OR)</option>
                    </select>
                </div>
                <button class="btn-remove" onclick="filterBuilder.removeGroup('${groupId}')" title="Remove Group">
                    × Remove Group
                </button>
            </div>
            <div class="group-conditions" id="${groupId}-conditions">
                <button class="btn-add-condition" onclick="filterBuilder.addConditionToGroup('${groupId}')">
                    + Add Condition to Group
                </button>
            </div>
        `;
        container.appendChild(group);
    }

    addConditionToGroup(groupId) {
        const groupConditions = document.getElementById(`${groupId}-conditions`);
        const btn = groupConditions.querySelector('.btn-add-condition');

        const conditionId = 'condition-' + Date.now();
        const condition = document.createElement('div');
        condition.className = 'filter-condition';
        condition.id = conditionId;
        condition.innerHTML = `
            <div class="condition-drag-handle" title="Drag to reorder">⋮⋮</div>
            <div class="condition-fields">
                <select class="condition-field" onchange="filterBuilder.updateOperators('${conditionId}')">
                    <option value="">Select field...</option>
                    ${this.fields.map(f => `<option value="${f.id}">${f.label}</option>`).join('')}
                </select>
                <select class="condition-operator" id="${conditionId}-operator">
                    <option value="">Select operator...</option>
                </select>
                <input type="text" class="condition-value" placeholder="Value..." id="${conditionId}-value">
            </div>
            <button class="btn-remove" onclick="filterBuilder.removeCondition('${conditionId}')" title="Remove">
                ×
            </button>
        `;

        groupConditions.insertBefore(condition, btn);
        this.makeDraggable(condition);
    }

    updateOperators(conditionId) {
        const condition = document.getElementById(conditionId);
        const fieldSelect = condition.querySelector('.condition-field');
        const operatorSelect = document.getElementById(`${conditionId}-operator`);
        const valueInput = document.getElementById(`${conditionId}-value`);

        const field = this.fields.find(f => f.id === fieldSelect.value);
        if (!field) {
            operatorSelect.innerHTML = '<option value="">Select operator...</option>';
            return;
        }

        const operators = this.operators[field.type];
        operatorSelect.innerHTML = operators.map(op =>
            `<option value="${op}">${this.formatOperatorLabel(op)}</option>`
        ).join('');

        // Update input type based on field type
        if (field.type === 'number') {
            valueInput.type = 'number';
        } else if (field.type === 'boolean') {
            valueInput.type = 'checkbox';
            valueInput.style.width = 'auto';
        } else {
            valueInput.type = 'text';
        }

        // If field has options, create datalist
        if (field.options && field.options.length > 0) {
            const datalistId = `${conditionId}-datalist`;
            valueInput.setAttribute('list', datalistId);
            let datalist = document.getElementById(datalistId);
            if (!datalist) {
                datalist = document.createElement('datalist');
                datalist.id = datalistId;
                valueInput.parentNode.appendChild(datalist);
            }
            datalist.innerHTML = field.options.map(opt => `<option value="${opt}">`).join('');
        }
    }

    formatOperatorLabel(operator) {
        return operator.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    removeCondition(conditionId) {
        const condition = document.getElementById(conditionId);
        const parent = condition.parentNode;
        condition.remove();

        // Check if parent is now empty
        if (parent.id === 'filter-conditions' && parent.children.length === 0) {
            parent.innerHTML = '<div class="empty-state"><p>No conditions yet. Add a condition to start building your filter.</p></div>';
        }
    }

    removeGroup(groupId) {
        document.getElementById(groupId).remove();
        const container = document.getElementById('filter-conditions');
        if (container.children.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No conditions yet. Add a condition to start building your filter.</p></div>';
        }
    }

    makeDraggable(element) {
        const handle = element.querySelector('.condition-drag-handle');
        let isDragging = false;
        let startY;
        let startTop;

        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.clientY;
            startTop = element.offsetTop;
            element.classList.add('dragging');
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaY = e.clientY - startY;
            element.style.transform = `translateY(${deltaY}px)`;
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            element.classList.remove('dragging');
            element.style.transform = '';
        });
    }

    applyTemplate(templateKey) {
        const template = this.filterTemplates[templateKey];
        if (!template) return;

        this.clearAll(false);

        // For simple templates, add conditions directly
        if (template.filters && !template.filters[0].logic) {
            template.filters.forEach(() => this.addCondition());
            // Populate the conditions (simplified for now)
        }

        this.showNotification(`Applied template: ${template.name}`);
    }

    clearAll(confirm = true) {
        if (confirm && !window.confirm('Clear all conditions?')) return;

        const container = document.getElementById('filter-conditions');
        container.innerHTML = '<div class="empty-state"><p>No conditions yet. Add a condition to start building your filter.</p></div>';
    }

    buildFilterObject() {
        const container = document.getElementById('filter-conditions');
        const conditions = [];

        container.querySelectorAll('.filter-condition').forEach(conditionEl => {
            if (conditionEl.closest('.filter-group')) return; // Skip group conditions for now

            const fieldSelect = conditionEl.querySelector('.condition-field');
            const operatorSelect = conditionEl.querySelector('.condition-operator');
            const valueInput = conditionEl.querySelector('.condition-value');

            if (fieldSelect.value && operatorSelect.value) {
                conditions.push({
                    field: fieldSelect.value,
                    operator: operatorSelect.value,
                    value: valueInput.type === 'checkbox' ? valueInput.checked : valueInput.value
                });
            }
        });

        // Handle groups
        container.querySelectorAll('.filter-group').forEach(groupEl => {
            const logic = groupEl.querySelector('.group-logic-select').value;
            const groupConditions = [];

            groupEl.querySelectorAll('.filter-condition').forEach(conditionEl => {
                const fieldSelect = conditionEl.querySelector('.condition-field');
                const operatorSelect = conditionEl.querySelector('.condition-operator');
                const valueInput = conditionEl.querySelector('.condition-value');

                if (fieldSelect.value && operatorSelect.value) {
                    groupConditions.push({
                        field: fieldSelect.value,
                        operator: operatorSelect.value,
                        value: valueInput.type === 'checkbox' ? valueInput.checked : valueInput.value
                    });
                }
            });

            if (groupConditions.length > 0) {
                conditions.push({
                    logic: logic,
                    conditions: groupConditions
                });
            }
        });

        return conditions;
    }

    applyFilter() {
        const filterObj = this.buildFilterObject();

        if (filterObj.length === 0) {
            this.showNotification('No filter conditions defined', 'warning');
            return;
        }

        // Apply the filter to the package display
        if (window.enhancedSearch) {
            window.enhancedSearch.applyAdvancedFilter(filterObj);
        }

        this.showNotification('Filter applied successfully!');
        this.closePanel();
    }

    saveFilter() {
        const filterObj = this.buildFilterObject();

        if (filterObj.length === 0) {
            this.showNotification('No filter conditions to save', 'warning');
            return;
        }

        const name = prompt('Enter a name for this filter:');
        if (!name) return;

        const saved = this.getSavedFilters();
        saved.push({
            name: name,
            conditions: filterObj,
            created: new Date().toISOString()
        });

        localStorage.setItem('nixite_saved_filters', JSON.stringify(saved));
        this.renderSavedFilters();
        this.showNotification('Filter saved!');
    }

    getSavedFilters() {
        const saved = localStorage.getItem('nixite_saved_filters');
        return saved ? JSON.parse(saved) : [];
    }

    loadSavedFilter(index) {
        const saved = this.getSavedFilters();
        const filter = saved[index];
        if (!filter) return;

        this.clearAll(false);

        // Recreate conditions (simplified)
        filter.conditions.forEach(() => this.addCondition());

        this.showNotification(`Loaded filter: ${filter.name}`);
    }

    deleteSavedFilter(index) {
        if (!confirm('Delete this saved filter?')) return;

        const saved = this.getSavedFilters();
        saved.splice(index, 1);
        localStorage.setItem('nixite_saved_filters', JSON.stringify(saved));
        this.renderSavedFilters();
        this.showNotification('Filter deleted');
    }

    exportFilter() {
        const filterObj = this.buildFilterObject();

        if (filterObj.length === 0) {
            this.showNotification('No filter conditions to export', 'warning');
            return;
        }

        const exportData = {
            version: '1.0',
            exported: new Date().toISOString(),
            filter: filterObj
        };

        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nixite-filter-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Filter exported!');
    }

    importFilter() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (!data.filter) {
                        throw new Error('Invalid filter file');
                    }

                    this.clearAll(false);
                    // Recreate conditions from import (simplified)
                    data.filter.forEach(() => this.addCondition());

                    this.showNotification('Filter imported!');
                } catch (error) {
                    this.showNotification('Error importing filter: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    loadSavedFilters() {
        // Load from localStorage
        this.filters = this.getSavedFilters();
    }

    openPanel() {
        document.getElementById('filter-builder-panel').classList.add('active');
    }

    closePanel() {
        document.getElementById('filter-builder-panel').classList.remove('active');
    }

    setupEventListeners() {
        // Keyboard shortcut to open filter builder (Ctrl+Shift+F)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                this.openPanel();
            }
        });
    }

    showNotification(message, type = 'success') {
        // Reuse existing notification system if available
        if (window.uiIntegration && window.uiIntegration.showNotification) {
            window.uiIntegration.showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
}

// Initialize on page load
let filterBuilder;
document.addEventListener('DOMContentLoaded', () => {
    filterBuilder = new FilterBuilder();
});
