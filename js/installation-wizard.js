/**
 * Installation Wizard
 *
 * Step-by-step guide for installing packages on NixOS.
 * Helps new users understand different installation methods.
 *
 * @version 2.6.0
 * @author Nixite Team
 */

class InstallationWizard {
    constructor() {
        this.currentStep = 0;
        this.selectedMethod = null;
        this.selectedPackage = null;
        this.userPreferences = this.loadPreferences();
        this.init();
    }

    init() {
        this.createWizard();
        this.checkFirstTime();
    }

    loadPreferences() {
        const saved = localStorage.getItem('nixite_install_preferences');
        return saved ? JSON.parse(saved) : {
            preferredMethod: 'nix-env',
            showWizardOnStartup: true,
            experienceLevel: 'beginner'
        };
    }

    savePreferences() {
        localStorage.setItem('nixite_install_preferences', JSON.stringify(this.userPreferences));
    }

    checkFirstTime() {
        const hasVisited = localStorage.getItem('nixite_has_visited');
        if (!hasVisited && this.userPreferences.showWizardOnStartup) {
            setTimeout(() => {
                this.openWizard();
            }, 2000);
            localStorage.setItem('nixite_has_visited', 'true');
        }
    }

    createWizard() {
        const wizard = document.createElement('div');
        wizard.id = 'installation-wizard';
        wizard.className = 'installation-wizard';
        wizard.innerHTML = `
            <div class="wizard-overlay" onclick="installationWizard.closeWizard()"></div>
            <div class="wizard-container">
                <div class="wizard-header">
                    <div class="wizard-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="wizard-progress"></div>
                        </div>
                        <div class="progress-text" id="wizard-progress-text">Step 1 of 5</div>
                    </div>
                    <button class="btn-close" onclick="installationWizard.closeWizard()">×</button>
                </div>

                <div class="wizard-body" id="wizard-body">
                    ${this.renderStep(0)}
                </div>

                <div class="wizard-footer">
                    <button class="btn btn-secondary" id="wizard-back" onclick="installationWizard.previousStep()">
                        ← Back
                    </button>
                    <div class="footer-center">
                        <label class="wizard-checkbox">
                            <input type="checkbox" id="show-wizard-startup"
                                   ${this.userPreferences.showWizardOnStartup ? 'checked' : ''}
                                   onchange="installationWizard.toggleShowOnStartup()">
                            Don't show this again
                        </label>
                    </div>
                    <button class="btn btn-primary" id="wizard-next" onclick="installationWizard.nextStep()">
                        Next →
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(wizard);
    }

    renderStep(step) {
        const steps = [
            this.renderWelcome(),
            this.renderExperienceLevel(),
            this.renderInstallationMethods(),
            this.renderMethodDetails(),
            this.renderBestPractices()
        ];

        return steps[step] || steps[0];
    }

    renderWelcome() {
        return `
            <div class="wizard-step wizard-welcome">
                <div class="welcome-icon">🧙</div>
                <h2>Welcome to Nixite!</h2>
                <p class="welcome-subtitle">Your NixOS Package Discovery Tool</p>

                <div class="welcome-content">
                    <p>This wizard will guide you through:</p>
                    <ul class="feature-list">
                        <li>
                            <span class="feature-icon">📦</span>
                            <div>
                                <strong>Package Installation</strong>
                                <p>Learn different ways to install NixOS packages</p>
                            </div>
                        </li>
                        <li>
                            <span class="feature-icon">⚙️</span>
                            <div>
                                <strong>Configuration</strong>
                                <p>Understand declarative package management</p>
                            </div>
                        </li>
                        <li>
                            <span class="feature-icon">✨</span>
                            <div>
                                <strong>Best Practices</strong>
                                <p>Tips for managing your NixOS system</p>
                            </div>
                        </li>
                        <li>
                            <span class="feature-icon">🎯</span>
                            <div>
                                <strong>Quick Start</strong>
                                <p>Get up and running in minutes</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="welcome-note">
                    <strong>Note:</strong> You can access this wizard anytime from the command palette (Ctrl+K)
                </div>
            </div>
        `;
    }

    renderExperienceLevel() {
        return `
            <div class="wizard-step wizard-experience">
                <h2>What's your experience level?</h2>
                <p class="step-subtitle">This helps us provide relevant information</p>

                <div class="experience-options">
                    <div class="experience-card ${this.userPreferences.experienceLevel === 'beginner' ? 'selected' : ''}"
                         onclick="installationWizard.selectExperience('beginner')">
                        <div class="experience-icon">🌱</div>
                        <h3>Beginner</h3>
                        <p>New to NixOS or package management</p>
                        <ul>
                            <li>Step-by-step guidance</li>
                            <li>Detailed explanations</li>
                            <li>Safe, tested commands</li>
                        </ul>
                    </div>

                    <div class="experience-card ${this.userPreferences.experienceLevel === 'intermediate' ? 'selected' : ''}"
                         onclick="installationWizard.selectExperience('intermediate')">
                        <div class="experience-icon">🚀</div>
                        <h3>Intermediate</h3>
                        <p>Familiar with NixOS basics</p>
                        <ul>
                            <li>Balanced guidance</li>
                            <li>Advanced options</li>
                            <li>Optimization tips</li>
                        </ul>
                    </div>

                    <div class="experience-card ${this.userPreferences.experienceLevel === 'advanced' ? 'selected' : ''}"
                         onclick="installationWizard.selectExperience('advanced')">
                        <div class="experience-icon">⚡</div>
                        <h3>Advanced</h3>
                        <p>Experienced NixOS user</p>
                        <ul>
                            <li>Concise information</li>
                            <li>Advanced techniques</li>
                            <li>Power user features</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    renderInstallationMethods() {
        return `
            <div class="wizard-step wizard-methods">
                <h2>Installation Methods</h2>
                <p class="step-subtitle">Choose how you want to install packages</p>

                <div class="methods-grid">
                    <div class="method-card ${this.selectedMethod === 'nix-env' ? 'selected' : ''}"
                         onclick="installationWizard.selectMethod('nix-env')">
                        <div class="method-header">
                            <span class="method-icon">🔧</span>
                            <h3>nix-env</h3>
                        </div>
                        <p class="method-description">Imperative package management</p>
                        <div class="method-pros-cons">
                            <div class="pros">
                                <strong>✓ Pros:</strong>
                                <ul>
                                    <li>Quick and easy</li>
                                    <li>No system rebuild needed</li>
                                    <li>Per-user packages</li>
                                </ul>
                            </div>
                            <div class="cons">
                                <strong>✗ Cons:</strong>
                                <ul>
                                    <li>Not reproducible</li>
                                    <li>Manual management</li>
                                </ul>
                            </div>
                        </div>
                        <div class="method-best-for">
                            <strong>Best for:</strong> Testing packages, temporary installs
                        </div>
                    </div>

                    <div class="method-card ${this.selectedMethod === 'configuration.nix' ? 'selected' : ''}"
                         onclick="installationWizard.selectMethod('configuration.nix')">
                        <div class="method-header">
                            <span class="method-icon">⚙️</span>
                            <h3>configuration.nix</h3>
                        </div>
                        <p class="method-description">Declarative system configuration</p>
                        <div class="method-pros-cons">
                            <div class="pros">
                                <strong>✓ Pros:</strong>
                                <ul>
                                    <li>Fully reproducible</li>
                                    <li>Version controlled</li>
                                    <li>System-wide</li>
                                </ul>
                            </div>
                            <div class="cons">
                                <strong>✗ Cons:</strong>
                                <ul>
                                    <li>Requires rebuild</li>
                                    <li>Needs sudo access</li>
                                </ul>
                            </div>
                        </div>
                        <div class="method-best-for">
                            <strong>Best for:</strong> Production systems, reproducibility
                        </div>
                    </div>

                    <div class="method-card ${this.selectedMethod === 'nix-shell' ? 'selected' : ''}"
                         onclick="installationWizard.selectMethod('nix-shell')">
                        <div class="method-header">
                            <span class="method-icon">🐚</span>
                            <h3>nix-shell</h3>
                        </div>
                        <p class="method-description">Temporary development environments</p>
                        <div class="method-pros-cons">
                            <div class="pros">
                                <strong>✓ Pros:</strong>
                                <ul>
                                    <li>Isolated environments</li>
                                    <li>No permanent install</li>
                                    <li>Project-specific</li>
                                </ul>
                            </div>
                            <div class="cons">
                                <strong>✗ Cons:</strong>
                                <ul>
                                    <li>Temporary only</li>
                                    <li>Session-based</li>
                                </ul>
                            </div>
                        </div>
                        <div class="method-best-for">
                            <strong>Best for:</strong> Development, one-off tasks
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderMethodDetails() {
        if (!this.selectedMethod) {
            return `
                <div class="wizard-step">
                    <p class="text-center">Please select an installation method in the previous step.</p>
                </div>
            `;
        }

        const details = {
            'nix-env': {
                title: 'Using nix-env',
                icon: '🔧',
                steps: [
                    {
                        title: 'Install a package',
                        code: 'nix-env -iA nixos.firefox',
                        explanation: 'Installs Firefox for the current user'
                    },
                    {
                        title: 'List installed packages',
                        code: 'nix-env -q',
                        explanation: 'Shows all packages installed with nix-env'
                    },
                    {
                        title: 'Remove a package',
                        code: 'nix-env -e firefox',
                        explanation: 'Uninstalls Firefox from the user profile'
                    },
                    {
                        title: 'Upgrade packages',
                        code: 'nix-env -u',
                        explanation: 'Updates all user packages to latest versions'
                    }
                ]
            },
            'configuration.nix': {
                title: 'Using configuration.nix',
                icon: '⚙️',
                steps: [
                    {
                        title: 'Edit configuration',
                        code: 'sudo nano /etc/nixos/configuration.nix',
                        explanation: 'Open your system configuration file'
                    },
                    {
                        title: 'Add packages',
                        code: `environment.systemPackages = with pkgs; [
  firefox
  git
  vim
];`,
                        explanation: 'Add packages to the systemPackages list'
                    },
                    {
                        title: 'Rebuild system',
                        code: 'sudo nixos-rebuild switch',
                        explanation: 'Apply the configuration changes'
                    },
                    {
                        title: 'Test before switching',
                        code: 'sudo nixos-rebuild test',
                        explanation: 'Test configuration without making it permanent'
                    }
                ]
            },
            'nix-shell': {
                title: 'Using nix-shell',
                icon: '🐚',
                steps: [
                    {
                        title: 'Enter shell with package',
                        code: 'nix-shell -p nodejs python3',
                        explanation: 'Start a shell with Node.js and Python available'
                    },
                    {
                        title: 'Create shell.nix',
                        code: `{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  buildInputs = [ pkgs.nodejs pkgs.python3 ];
}`,
                        explanation: 'Define a project development environment'
                    },
                    {
                        title: 'Use shell.nix',
                        code: 'nix-shell',
                        explanation: 'Enter the environment defined in shell.nix'
                    },
                    {
                        title: 'Run command directly',
                        code: 'nix-shell -p nodejs --run "node --version"',
                        explanation: 'Run a command in a temporary environment'
                    }
                ]
            }
        };

        const methodDetail = details[this.selectedMethod];

        return `
            <div class="wizard-step wizard-details">
                <div class="method-detail-header">
                    <span class="detail-icon">${methodDetail.icon}</span>
                    <h2>${methodDetail.title}</h2>
                </div>

                <div class="steps-list">
                    ${methodDetail.steps.map((step, index) => `
                        <div class="detail-step">
                            <div class="step-number">${index + 1}</div>
                            <div class="step-content">
                                <h4>${step.title}</h4>
                                <div class="code-block">
                                    <code>${step.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
                                    <button class="btn-copy-code" onclick="installationWizard.copyCode(this)">
                                        📋 Copy
                                    </button>
                                </div>
                                <p class="step-explanation">${step.explanation}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="detail-tips">
                    <h4>💡 Pro Tips</h4>
                    <ul>
                        ${this.getProTips(this.selectedMethod).map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    renderBestPractices() {
        return `
            <div class="wizard-step wizard-best-practices">
                <h2>🌟 Best Practices</h2>
                <p class="step-subtitle">Tips for managing your NixOS system effectively</p>

                <div class="practices-grid">
                    <div class="practice-card">
                        <div class="practice-icon">📝</div>
                        <h3>Version Control</h3>
                        <p>Keep your configuration.nix in Git for easy rollbacks and sharing</p>
                        <div class="practice-code">
                            <code>git init /etc/nixos</code>
                        </div>
                    </div>

                    <div class="practice-card">
                        <div class="practice-icon">🔄</div>
                        <h3>Regular Updates</h3>
                        <p>Keep your system up to date with channel updates</p>
                        <div class="practice-code">
                            <code>sudo nix-channel --update<br>sudo nixos-rebuild switch</code>
                        </div>
                    </div>

                    <div class="practice-card">
                        <div class="practice-icon">🧹</div>
                        <h3>Garbage Collection</h3>
                        <p>Clean up old package versions to save disk space</p>
                        <div class="practice-code">
                            <code>nix-collect-garbage -d</code>
                        </div>
                    </div>

                    <div class="practice-card">
                        <div class="practice-icon">⏪</div>
                        <h3>Easy Rollbacks</h3>
                        <p>If something breaks, rollback to a previous generation</p>
                        <div class="practice-code">
                            <code>sudo nixos-rebuild switch --rollback</code>
                        </div>
                    </div>

                    <div class="practice-card">
                        <div class="practice-icon">🔍</div>
                        <h3>Search Packages</h3>
                        <p>Use Nixite or nix search to find packages</p>
                        <div class="practice-code">
                            <code>nix search nixpkgs firefox</code>
                        </div>
                    </div>

                    <div class="practice-card">
                        <div class="practice-icon">📚</div>
                        <h3>Read the Manual</h3>
                        <p>NixOS has excellent documentation</p>
                        <div class="practice-code">
                            <code>nixos-help</code>
                        </div>
                    </div>
                </div>

                <div class="completion-message">
                    <div class="completion-icon">🎉</div>
                    <h3>You're all set!</h3>
                    <p>You now know the basics of NixOS package management. Start exploring packages with Nixite!</p>
                </div>
            </div>
        `;
    }

    getProTips(method) {
        const tips = {
            'nix-env': [
                'Use -A (attribute path) instead of -P (package name) for faster installs',
                'Check available packages with: nix-env -qaP | grep firefox',
                'Keep track of what you install - it\'s not in configuration.nix',
                'Consider switching to configuration.nix for production systems'
            ],
            'configuration.nix': [
                'Always test with "nixos-rebuild test" before "switch"',
                'Comment your configuration for future reference',
                'Use imports to organize large configurations',
                'Keep backups of working configurations'
            ],
            'nix-shell': [
                'Create a shell.nix for each project',
                'Use direnv for automatic environment activation',
                'Combine with --pure for truly isolated environments',
                'Great for CI/CD reproducible builds'
            ]
        };

        return tips[method] || [];
    }

    selectExperience(level) {
        this.userPreferences.experienceLevel = level;
        this.savePreferences();
        this.updateStepContent();
    }

    selectMethod(method) {
        this.selectedMethod = method;
        this.userPreferences.preferredMethod = method;
        this.savePreferences();
        this.updateStepContent();
    }

    updateStepContent() {
        const body = document.getElementById('wizard-body');
        if (body) {
            body.innerHTML = this.renderStep(this.currentStep);
        }
    }

    nextStep() {
        if (this.currentStep < 4) {
            this.currentStep++;
            this.updateStep();
        } else {
            this.completeWizard();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateStep();
        }
    }

    updateStep() {
        const body = document.getElementById('wizard-body');
        const progress = document.getElementById('wizard-progress');
        const progressText = document.getElementById('wizard-progress-text');
        const backBtn = document.getElementById('wizard-back');
        const nextBtn = document.getElementById('wizard-next');

        body.innerHTML = this.renderStep(this.currentStep);

        const percentage = ((this.currentStep + 1) / 5) * 100;
        progress.style.width = percentage + '%';
        progressText.textContent = `Step ${this.currentStep + 1} of 5`;

        backBtn.style.display = this.currentStep === 0 ? 'none' : 'block';
        nextBtn.textContent = this.currentStep === 4 ? 'Finish' : 'Next →';
    }

    completeWizard() {
        this.closeWizard();
        if (window.uiIntegration && window.uiIntegration.showNotification) {
            window.uiIntegration.showNotification('Setup complete! Happy package hunting! 🎉');
        }
    }

    copyCode(button) {
        const codeBlock = button.previousElementSibling;
        const code = codeBlock.textContent;

        navigator.clipboard.writeText(code).then(() => {
            const originalText = button.textContent;
            button.textContent = '✓ Copied!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        });
    }

    toggleShowOnStartup() {
        const checkbox = document.getElementById('show-wizard-startup');
        this.userPreferences.showWizardOnStartup = !checkbox.checked;
        this.savePreferences();
    }

    openWizard() {
        this.currentStep = 0;
        const wizard = document.getElementById('installation-wizard');
        wizard.classList.add('active');
        this.updateStep();
    }

    closeWizard() {
        const wizard = document.getElementById('installation-wizard');
        wizard.classList.remove('active');
    }
}

// Initialize
let installationWizard;
document.addEventListener('DOMContentLoaded', () => {
    installationWizard = new InstallationWizard();
});
