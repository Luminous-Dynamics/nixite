/**
 * UI Feedback Enhancements for Nixite
 * Provides visual feedback when AI is processing queries
 */

class AIFeedback {
    constructor() {
        this.overlay = null;
        this.statusBar = null;
        this.init();
    }
    
    init() {
        // Create overlay for processing feedback
        this.createOverlay();
        this.createStatusBar();
        this.injectStyles();
    }
    
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'ai-processing-overlay';
        this.overlay.innerHTML = `
            <div class="ai-processing-content">
                <div class="ai-spinner"></div>
                <div class="ai-status-text">AI is thinking...</div>
                <div class="ai-progress-bar">
                    <div class="ai-progress-fill"></div>
                </div>
                <div class="ai-details"></div>
            </div>
        `;
        document.body.appendChild(this.overlay);
    }
    
    createStatusBar() {
        this.statusBar = document.createElement('div');
        this.statusBar.id = 'ai-status-bar';
        this.statusBar.innerHTML = `
            <div class="status-indicator"></div>
            <span class="status-text">AI Ready</span>
            <span class="status-accuracy">98% NixOS · 95% General</span>
        `;
        document.body.appendChild(this.statusBar);
    }
    
    injectStyles() {
        const styles = `
            /* AI Processing Overlay */
            #ai-processing-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            #ai-processing-overlay.active {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .ai-processing-content {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                color: white;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-width: 400px;
            }
            
            .ai-spinner {
                width: 60px;
                height: 60px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .ai-status-text {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
                animation: pulse 2s ease infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            .ai-progress-bar {
                height: 6px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 20px;
            }
            
            .ai-progress-fill {
                height: 100%;
                background: white;
                border-radius: 3px;
                width: 0%;
                animation: progress 2s ease forwards;
            }
            
            @keyframes progress {
                to { width: 90%; }
            }
            
            .ai-details {
                font-size: 14px;
                opacity: 0.8;
                min-height: 20px;
            }
            
            /* Status Bar */
            #ai-status-bar {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                border-radius: 30px;
                padding: 10px 20px;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                z-index: 9999;
                transition: all 0.3s ease;
            }
            
            #ai-status-bar:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 30px rgba(0, 0, 0, 0.15);
            }
            
            .status-indicator {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #10b981;
                animation: breathe 2s ease infinite;
            }
            
            .status-indicator.processing {
                background: #f59e0b;
                animation: blink 0.5s ease infinite;
            }
            
            .status-indicator.error {
                background: #ef4444;
                animation: none;
            }
            
            @keyframes breathe {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
            }
            
            .status-text {
                font-weight: 600;
                color: #1f2937;
            }
            
            .status-accuracy {
                font-size: 12px;
                color: #6b7280;
                margin-left: auto;
            }
            
            /* Toast Notifications */
            .ai-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 10px;
                padding: 15px 20px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10001;
                animation: slideIn 0.3s ease, slideOut 0.3s ease 2.7s;
                animation-fill-mode: forwards;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
            
            .ai-toast.success {
                border-left: 4px solid #10b981;
            }
            
            .ai-toast.info {
                border-left: 4px solid #3b82f6;
            }
            
            .ai-toast.warning {
                border-left: 4px solid #f59e0b;
            }
            
            .ai-toast.error {
                border-left: 4px solid #ef4444;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    // Show processing overlay
    showProcessing(message = 'AI is thinking...', details = '') {
        const overlay = document.getElementById('ai-processing-overlay');
        const statusText = overlay.querySelector('.ai-status-text');
        const detailsText = overlay.querySelector('.ai-details');
        const progressFill = overlay.querySelector('.ai-progress-fill');
        
        statusText.textContent = message;
        detailsText.textContent = details;
        progressFill.style.animation = 'none';
        setTimeout(() => {
            progressFill.style.animation = 'progress 2s ease forwards';
        }, 10);
        
        overlay.classList.add('active');
        this.updateStatus('processing', 'AI Processing...');
    }
    
    // Hide processing overlay
    hideProcessing() {
        const overlay = document.getElementById('ai-processing-overlay');
        overlay.classList.remove('active');
        this.updateStatus('ready', 'AI Ready');
    }
    
    // Update status bar
    updateStatus(state, text) {
        const indicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');
        
        // Update indicator
        indicator.className = 'status-indicator';
        if (state === 'processing') {
            indicator.classList.add('processing');
        } else if (state === 'error') {
            indicator.classList.add('error');
        }
        
        // Update text
        statusText.textContent = text;
    }
    
    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `ai-toast ${type}`;
        
        const icon = {
            success: '✅',
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌'
        }[type] || 'ℹ️';
        
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Remove after animation
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3000);
    }
    
    // Simulate different AI states
    simulateIntentRecognition(query) {
        this.showProcessing('Understanding your request...', `"${query}"`);
        setTimeout(() => {
            this.hideProcessing();
            this.showToast('Intent recognized: Install package', 'success');
        }, 1500);
    }
    
    simulateSearch(query) {
        this.showProcessing('Searching packages...', `Looking for "${query}"`);
        setTimeout(() => {
            this.hideProcessing();
            this.showToast('Found 5 matching packages', 'success');
        }, 1000);
    }
    
    simulateInstallation(packageName) {
        this.showProcessing('Installing package...', `Setting up ${packageName}`);
        
        // Simulate progress updates
        setTimeout(() => {
            const details = document.querySelector('.ai-details');
            details.textContent = 'Downloading package...';
        }, 500);
        
        setTimeout(() => {
            const details = document.querySelector('.ai-details');
            details.textContent = 'Configuring...';
        }, 1500);
        
        setTimeout(() => {
            this.hideProcessing();
            this.showToast(`${packageName} installed successfully!`, 'success');
        }, 3000);
    }
    
    simulateFallback() {
        this.updateStatus('warning', 'Using Fallback');
        this.showToast('HRM unavailable, using knowledge base (70% accuracy)', 'warning');
    }
    
    simulateError(error) {
        this.updateStatus('error', 'AI Error');
        this.showToast(error, 'error');
        setTimeout(() => {
            this.updateStatus('ready', 'AI Ready');
        }, 3000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.aiFeedback = new AIFeedback();
    });
} else {
    window.aiFeedback = new AIFeedback();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIFeedback;
}