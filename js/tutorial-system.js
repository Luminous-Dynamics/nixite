/**
 * Interactive Tutorial System
 *
 * Provides contextual tips, feature tours, and interactive tutorials
 * to help users discover and learn Nixite features.
 *
 * @version 2.6.0
 * @author Nixite Team
 */

class TutorialSystem {
    constructor() {
        this.tutorials = this.getAllTutorials();
        this.currentTutorial = null;
        this.currentStep = 0;
        this.completedTutorials = this.getCompletedTutorials();
        this.tipsEnabled = this.getTipsPreference();
        this.init();
    }

    init() {
        this.createTutorialOverlay();
        this.createTipContainer();
        this.showContextualTips();
    }

    getAllTutorials() {
        return {
            quickStart: {
                id: 'quickStart',
                title: '🚀 Quick Start Tour',
                description: 'Learn the basics of Nixite in 2 minutes',
                duration: '2 min',
                steps: [
                    {
                        target: 'input[type="search"]',
                        title: 'Search for Packages',
                        content: 'Start by typing in the search box to find NixOS packages. Try searching for "firefox" or "vim".',
                        position: 'bottom',
                        highlight: true,
                        action: 'Wait for user to type in search'
                    },
                    {
                        target: '.package-card',
                        title: 'Package Cards',
                        content: 'Each package shows key information: name, description, category, and quick actions. Click on a package to see more details.',
                        position: 'top',
                        highlight: true
                    },
                    {
                        target: '[data-action="favorite"]',
                        title: 'Add to Favorites',
                        content: 'Click the star icon to save packages to your favorites for quick access later.',
                        position: 'left',
                        highlight: true
                    },
                    {
                        target: '#command-palette-trigger',
                        title: 'Command Palette',
                        content: 'Press Ctrl+K (Cmd+K on Mac) to open the command palette for quick access to all features.',
                        position: 'bottom',
                        highlight: false,
                        tip: 'Try it now: Press Ctrl+K'
                    },
                    {
                        target: '#shortcuts-help',
                        title: 'Keyboard Shortcuts',
                        content: 'Press ? to see all available keyboard shortcuts and become a power user!',
                        position: 'left',
                        highlight: false
                    }
                ]
            },

            features: {
                id: 'features',
                title: '✨ Feature Tour',
                description: 'Explore all Nixite features',
                duration: '5 min',
                steps: [
                    {
                        target: '#favorites-panel',
                        title: 'Favorites Panel',
                        content: 'All your starred packages in one place. Great for packages you use frequently!',
                        position: 'right',
                        highlight: true
                    },
                    {
                        target: '#collections-panel',
                        title: 'Collections',
                        content: 'Organize packages into custom collections. Perfect for project-specific packages or themes.',
                        position: 'right',
                        highlight: true
                    },
                    {
                        target: '#comparison-panel',
                        title: 'Package Comparison',
                        content: 'Compare multiple packages side-by-side to make informed decisions.',
                        position: 'right',
                        highlight: true
                    },
                    {
                        target: '#history-panel',
                        title: 'Installation History',
                        content: 'Track what you\'ve installed and when. Never forget which packages you tried!',
                        position: 'right',
                        highlight: true
                    },
                    {
                        target: '#statistics-panel',
                        title: 'Statistics',
                        content: 'View insights about your package usage with beautiful charts and graphs.',
                        position: 'right',
                        highlight: true
                    },
                    {
                        target: '#theme-button',
                        title: 'Themes',
                        content: 'Customize Nixite\'s appearance with 8 preset themes or create your own!',
                        position: 'bottom',
                        highlight: true
                    }
                ]
            },

            advanced: {
                id: 'advanced',
                title: '⚡ Advanced Features',
                description: 'Master advanced Nixite capabilities',
                duration: '4 min',
                steps: [
                    {
                        target: '#filter-builder-button',
                        title: 'Visual Filter Builder',
                        content: 'Build complex filters with drag-and-drop. Combine multiple conditions with AND/OR logic.',
                        position: 'bottom',
                        highlight: true
                    },
                    {
                        target: '#data-export',
                        title: 'Data Export/Import',
                        content: 'Backup all your favorites, collections, and settings. Easily migrate between devices!',
                        position: 'left',
                        highlight: true
                    },
                    {
                        target: '#recommendations',
                        title: 'Smart Recommendations',
                        content: 'Get personalized package suggestions based on your interests and usage patterns.',
                        position: 'top',
                        highlight: true
                    },
                    {
                        target: '#pwa-install',
                        title: 'Install as App',
                        content: 'Install Nixite as a standalone app with offline support. Works like a native application!',
                        position: 'bottom',
                        highlight: true
                    }
                ]
            },

            installation: {
                id: 'installation',
                title: '📦 Package Installation',
                description: 'Learn different ways to install packages',
                duration: '3 min',
                steps: [
                    {
                        target: '.install-commands',
                        title: 'Installation Commands',
                        content: 'Click on any package to see installation commands for different methods.',
                        position: 'top',
                        highlight: true
                    },
                    {
                        target: '.copy-command',
                        title: 'One-Click Copy',
                        content: 'Copy installation commands to clipboard with a single click.',
                        position: 'left',
                        highlight: true
                    },
                    {
                        target: '#installation-wizard',
                        title: 'Installation Wizard',
                        content: 'New to NixOS? The wizard provides step-by-step guidance for each installation method.',
                        position: 'center',
                        highlight: false
                    }
                ]
            }
        };
    }

    createTutorialOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.className = 'tutorial-overlay';
        overlay.innerHTML = `
            <div class="tutorial-spotlight"></div>
            <div class="tutorial-tooltip">
                <div class="tooltip-header">
                    <h3 class="tooltip-title"></h3>
                    <button class="btn-close-tutorial" onclick="tutorialSystem.skipTutorial()">×</button>
                </div>
                <div class="tooltip-content"></div>
                <div class="tooltip-footer">
                    <div class="tutorial-progress"></div>
                    <div class="tutorial-actions">
                        <button class="btn btn-secondary" onclick="tutorialSystem.skipTutorial()">
                            Skip Tour
                        </button>
                        <div class="navigation-buttons">
                            <button class="btn btn-secondary" id="tutorial-back" onclick="tutorialSystem.previousStep()">
                                ← Back
                            </button>
                            <button class="btn btn-primary" id="tutorial-next" onclick="tutorialSystem.nextStep()">
                                Next →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    createTipContainer() {
        const container = document.createElement('div');
        container.id = 'contextual-tips';
        container.className = 'contextual-tips';
        document.body.appendChild(container);
    }

    startTutorial(tutorialId) {
        const tutorial = this.tutorials[tutorialId];
        if (!tutorial) return;

        this.currentTutorial = tutorial;
        this.currentStep = 0;
        this.showTutorialStep();
    }

    showTutorialStep() {
        if (!this.currentTutorial) return;

        const step = this.currentTutorial.steps[this.currentStep];
        if (!step) {
            this.completeTutorial();
            return;
        }

        const overlay = document.getElementById('tutorial-overlay');
        const tooltip = overlay.querySelector('.tutorial-tooltip');
        const spotlight = overlay.querySelector('.tutorial-spotlight');

        // Show overlay
        overlay.classList.add('active');

        // Update tooltip content
        tooltip.querySelector('.tooltip-title').textContent = step.title;
        tooltip.querySelector('.tooltip-content').innerHTML = `
            <p>${step.content}</p>
            ${step.tip ? `<div class="tutorial-tip">💡 ${step.tip}</div>` : ''}
        `;

        // Update progress
        const progress = tooltip.querySelector('.tutorial-progress');
        progress.innerHTML = `
            <div class="progress-dots">
                ${this.currentTutorial.steps.map((_, i) => `
                    <span class="dot ${i === this.currentStep ? 'active' : ''} ${i < this.currentStep ? 'completed' : ''}"></span>
                `).join('')}
            </div>
            <span class="progress-text">
                ${this.currentStep + 1} of ${this.currentTutorial.steps.length}
            </span>
        `;

        // Update navigation buttons
        const backBtn = document.getElementById('tutorial-back');
        const nextBtn = document.getElementById('tutorial-next');
        backBtn.style.display = this.currentStep === 0 ? 'none' : 'inline-block';
        nextBtn.textContent = this.currentStep === this.currentTutorial.steps.length - 1 ? 'Finish' : 'Next →';

        // Position tooltip and spotlight
        if (step.target) {
            const target = document.querySelector(step.target);
            if (target) {
                this.positionTooltip(tooltip, target, step.position);
                if (step.highlight) {
                    this.highlightElement(spotlight, target);
                } else {
                    spotlight.style.display = 'none';
                }
            } else {
                // Target not found, position tooltip in center
                this.positionTooltipCenter(tooltip);
                spotlight.style.display = 'none';
            }
        } else {
            this.positionTooltipCenter(tooltip);
            spotlight.style.display = 'none';
        }
    }

    positionTooltip(tooltip, target, position) {
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let top, left;

        switch (position) {
            case 'top':
                top = rect.top - tooltipRect.height - 20;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = rect.bottom + 20;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - 20;
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + 20;
                break;
            default:
                top = rect.bottom + 20;
                left = rect.left;
        }

        tooltip.style.position = 'fixed';
        tooltip.style.top = Math.max(20, Math.min(top, window.innerHeight - tooltipRect.height - 20)) + 'px';
        tooltip.style.left = Math.max(20, Math.min(left, window.innerWidth - tooltipRect.width - 20)) + 'px';
        tooltip.classList.remove('centered');
    }

    positionTooltipCenter(tooltip) {
        tooltip.style.position = 'fixed';
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
        tooltip.classList.add('centered');
    }

    highlightElement(spotlight, target) {
        const rect = target.getBoundingClientRect();
        const padding = 8;

        spotlight.style.display = 'block';
        spotlight.style.top = (rect.top - padding) + 'px';
        spotlight.style.left = (rect.left - padding) + 'px';
        spotlight.style.width = (rect.width + padding * 2) + 'px';
        spotlight.style.height = (rect.height + padding * 2) + 'px';

        // Scroll element into view
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    nextStep() {
        if (this.currentStep < this.currentTutorial.steps.length - 1) {
            this.currentStep++;
            this.showTutorialStep();
        } else {
            this.completeTutorial();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showTutorialStep();
        }
    }

    completeTutorial() {
        if (this.currentTutorial) {
            this.markTutorialComplete(this.currentTutorial.id);
        }
        this.closeTutorial();
        this.showCompletionMessage();
    }

    skipTutorial() {
        this.closeTutorial();
    }

    closeTutorial() {
        const overlay = document.getElementById('tutorial-overlay');
        overlay.classList.remove('active');
        this.currentTutorial = null;
        this.currentStep = 0;
    }

    showCompletionMessage() {
        if (window.uiIntegration && window.uiIntegration.showNotification) {
            window.uiIntegration.showNotification('Tutorial completed! 🎉');
        }
    }

    markTutorialComplete(tutorialId) {
        if (!this.completedTutorials.includes(tutorialId)) {
            this.completedTutorials.push(tutorialId);
            localStorage.setItem('nixite_completed_tutorials', JSON.stringify(this.completedTutorials));
        }
    }

    getCompletedTutorials() {
        const saved = localStorage.getItem('nixite_completed_tutorials');
        return saved ? JSON.parse(saved) : [];
    }

    getTipsPreference() {
        const saved = localStorage.getItem('nixite_tips_enabled');
        return saved === null ? true : saved === 'true';
    }

    toggleTips() {
        this.tipsEnabled = !this.tipsEnabled;
        localStorage.setItem('nixite_tips_enabled', this.tipsEnabled.toString());
    }

    showContextualTips() {
        if (!this.tipsEnabled) return;

        const tips = [
            {
                id: 'search-tip',
                trigger: 'input[type="search"]',
                event: 'focus',
                once: true,
                content: '💡 Tip: Use keywords like "browser", "editor", or "dev" to find packages',
                position: 'bottom',
                delay: 500
            },
            {
                id: 'favorite-tip',
                trigger: '[data-action="favorite"]',
                event: 'click',
                once: true,
                content: '⭐ Great! Access favorites anytime with Ctrl+1',
                position: 'top',
                delay: 0
            },
            {
                id: 'comparison-tip',
                trigger: '[data-action="compare"]',
                event: 'click',
                once: true,
                content: '⚖️ You can compare up to 5 packages side-by-side',
                position: 'top',
                delay: 0
            }
        ];

        tips.forEach(tip => {
            this.setupContextualTip(tip);
        });
    }

    setupContextualTip(tip) {
        const shown = localStorage.getItem(`tip_shown_${tip.id}`);
        if (tip.once && shown) return;

        document.addEventListener(tip.event, (e) => {
            if (tip.trigger && !e.target.matches(tip.trigger)) return;

            setTimeout(() => {
                this.showTip(tip.content, e.target, tip.position);
                if (tip.once) {
                    localStorage.setItem(`tip_shown_${tip.id}`, 'true');
                }
            }, tip.delay);
        }, { capture: true });
    }

    showTip(content, target, position = 'top') {
        const container = document.getElementById('contextual-tips');
        const tip = document.createElement('div');
        tip.className = 'contextual-tip';
        tip.innerHTML = `
            <div class="tip-content">${content}</div>
            <button class="tip-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(tip);

        // Position tip
        if (target) {
            const rect = target.getBoundingClientRect();
            const tipRect = tip.getBoundingClientRect();

            let top, left;
            switch (position) {
                case 'top':
                    top = rect.top - tipRect.height - 10;
                    left = rect.left + (rect.width - tipRect.width) / 2;
                    break;
                case 'bottom':
                    top = rect.bottom + 10;
                    left = rect.left + (rect.width - tipRect.width) / 2;
                    break;
                default:
                    top = rect.bottom + 10;
                    left = rect.left;
            }

            tip.style.top = top + 'px';
            tip.style.left = left + 'px';
        }

        // Auto-remove after 5 seconds
        setTimeout(() => {
            tip.classList.add('fade-out');
            setTimeout(() => tip.remove(), 300);
        }, 5000);
    }

    // Tutorial selector modal
    showTutorialSelector() {
        const modal = document.createElement('div');
        modal.className = 'tutorial-selector-modal active';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h2>📚 Choose a Tutorial</h2>
                    <button class="btn-close" onclick="this.closest('.tutorial-selector-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="tutorials-grid">
                        ${Object.entries(this.tutorials).map(([key, tutorial]) => `
                            <div class="tutorial-card ${this.completedTutorials.includes(tutorial.id) ? 'completed' : ''}"
                                 onclick="tutorialSystem.startTutorial('${key}'); this.closest('.tutorial-selector-modal').remove();">
                                <div class="tutorial-card-header">
                                    <h3>${tutorial.title}</h3>
                                    ${this.completedTutorials.includes(tutorial.id) ? '<span class="completed-badge">✓ Completed</span>' : ''}
                                </div>
                                <p>${tutorial.description}</p>
                                <div class="tutorial-meta">
                                    <span class="duration">⏱️ ${tutorial.duration}</span>
                                    <span class="steps">${tutorial.steps.length} steps</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

// Initialize
let tutorialSystem;
document.addEventListener('DOMContentLoaded', () => {
    tutorialSystem = new TutorialSystem();
});
