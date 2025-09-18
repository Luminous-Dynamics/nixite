/**
 * Voice Input for Nixite - Accessibility Feature
 * Allows Grandma Rose to speak her needs instead of typing
 */

class VoiceInput {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.button = null;
        this.transcript = '';
        this.init();
    }
    
    init() {
        // Check for browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported in this browser');
            this.showFallback();
            return;
        }
        
        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 3;
        
        // Set up event handlers
        this.setupEventHandlers();
        
        // Create UI elements
        this.createVoiceButton();
        this.createTranscriptDisplay();
        this.injectStyles();
    }
    
    setupEventHandlers() {
        // When speech is detected
        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }
            
            this.updateTranscript(finalTranscript || interimTranscript);
            
            if (finalTranscript) {
                this.processVoiceCommand(finalTranscript.trim());
            }
        };
        
        // When recording starts
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateButton(true);
            this.showFeedback('Listening...');
        };
        
        // When recording ends
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateButton(false);
        };
        
        // Handle errors
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.showFeedback(`Error: ${event.error}`, 'error');
            this.isListening = false;
            this.updateButton(false);
        };
    }
    
    createVoiceButton() {
        this.button = document.createElement('button');
        this.button.id = 'voice-input-button';
        this.button.setAttribute('aria-label', 'Start voice input');
        this.button.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            <span class="voice-button-text">Press to speak</span>
        `;
        
        this.button.addEventListener('click', () => this.toggleListening());
        
        // Add keyboard support
        this.button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleListening();
            }
        });
        
        document.body.appendChild(this.button);
    }
    
    createTranscriptDisplay() {
        const display = document.createElement('div');
        display.id = 'voice-transcript-display';
        display.innerHTML = `
            <div class="transcript-header">
                <span class="transcript-title">What you said:</span>
                <button class="transcript-close" aria-label="Close transcript">×</button>
            </div>
            <div class="transcript-text"></div>
            <div class="transcript-suggestions"></div>
        `;
        
        display.querySelector('.transcript-close').addEventListener('click', () => {
            display.classList.remove('active');
        });
        
        document.body.appendChild(display);
    }
    
    injectStyles() {
        const styles = `
            /* Voice Input Button */
            #voice-input-button {
                position: fixed;
                bottom: 80px;
                right: 20px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                z-index: 9998;
            }
            
            #voice-input-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px rgba(0, 0, 0, 0.3);
            }
            
            #voice-input-button:focus {
                outline: 3px solid #764ba2;
                outline-offset: 3px;
            }
            
            #voice-input-button.listening {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                animation: pulse-ring 1.5s ease infinite;
            }
            
            @keyframes pulse-ring {
                0% {
                    box-shadow: 0 0 0 0 rgba(245, 87, 108, 0.7);
                }
                70% {
                    box-shadow: 0 0 0 20px rgba(245, 87, 108, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(245, 87, 108, 0);
                }
            }
            
            #voice-input-button svg {
                width: 28px;
                height: 28px;
                stroke-width: 2;
            }
            
            .voice-button-text {
                position: absolute;
                bottom: -25px;
                white-space: nowrap;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            }
            
            #voice-input-button:hover .voice-button-text {
                opacity: 1;
            }
            
            #voice-input-button.listening .voice-button-text {
                opacity: 1;
                content: 'Listening...';
            }
            
            /* Voice Transcript Display */
            #voice-transcript-display {
                position: fixed;
                bottom: 160px;
                right: 20px;
                width: 300px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                padding: 15px;
                display: none;
                z-index: 9997;
                animation: slideUp 0.3s ease;
            }
            
            #voice-transcript-display.active {
                display: block;
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            .transcript-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .transcript-title {
                font-weight: 600;
                color: #1f2937;
                font-size: 14px;
            }
            
            .transcript-close {
                background: none;
                border: none;
                font-size: 24px;
                color: #6b7280;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .transcript-close:hover {
                color: #1f2937;
            }
            
            .transcript-text {
                background: #f3f4f6;
                border-radius: 6px;
                padding: 10px;
                min-height: 40px;
                color: #1f2937;
                font-size: 14px;
                line-height: 1.5;
                margin-bottom: 10px;
            }
            
            .transcript-text.processing {
                color: #6b7280;
                font-style: italic;
            }
            
            .transcript-suggestions {
                font-size: 12px;
                color: #6b7280;
            }
            
            .transcript-suggestions strong {
                color: #1f2937;
                display: block;
                margin-top: 5px;
            }
            
            /* Voice feedback toast */
            .voice-feedback {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                border-radius: 30px;
                padding: 10px 20px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                animation: fadeInOut 3s ease;
            }
            
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; }
                10%, 90% { opacity: 1; }
            }
            
            .voice-feedback.error {
                background: #fee;
                color: #dc2626;
            }
            
            /* Accessibility improvements */
            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
            
            /* High contrast mode */
            @media (prefers-contrast: high) {
                #voice-input-button {
                    border: 2px solid white;
                }
                
                #voice-transcript-display {
                    border: 2px solid black;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }
    
    startListening() {
        if (!this.recognition) {
            this.showFeedback('Voice input not available', 'error');
            return;
        }
        
        try {
            this.recognition.start();
            this.showTranscriptDisplay();
        } catch (error) {
            console.error('Failed to start recognition:', error);
            this.showFeedback('Failed to start voice input', 'error');
        }
    }
    
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
    
    updateButton(isListening) {
        if (isListening) {
            this.button.classList.add('listening');
            this.button.querySelector('.voice-button-text').textContent = 'Listening...';
        } else {
            this.button.classList.remove('listening');
            this.button.querySelector('.voice-button-text').textContent = 'Press to speak';
        }
    }
    
    updateTranscript(text) {
        const display = document.getElementById('voice-transcript-display');
        const textElement = display.querySelector('.transcript-text');
        
        this.transcript = text;
        textElement.textContent = text || 'Listening...';
        textElement.classList.toggle('processing', !text);
    }
    
    showTranscriptDisplay() {
        const display = document.getElementById('voice-transcript-display');
        display.classList.add('active');
        
        // Clear previous content
        const textElement = display.querySelector('.transcript-text');
        textElement.textContent = 'Listening...';
        textElement.classList.add('processing');
        
        // Show suggestions
        const suggestions = display.querySelector('.transcript-suggestions');
        suggestions.innerHTML = `
            <strong>Try saying:</strong>
            • "I need a web browser"
            • "Install photo editor"
            • "Show me games"
            • "Help me edit documents"
        `;
    }
    
    processVoiceCommand(text) {
        console.log('Processing voice command:', text);
        
        // Show what was understood
        const display = document.getElementById('voice-transcript-display');
        const suggestions = display.querySelector('.transcript-suggestions');
        suggestions.innerHTML = `<strong>Processing:</strong> "${text}"`;
        
        // Send to bridge for processing
        this.sendToBridge(text);
        
        // Simulate AI feedback if window.aiFeedback exists
        if (window.aiFeedback) {
            window.aiFeedback.simulateIntentRecognition(text);
        }
    }
    
    async sendToBridge(text) {
        try {
            const response = await fetch('http://localhost:8890/intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: text })
            });
            
            const result = await response.json();
            console.log('Bridge response:', result);
            
            // Update UI with result
            const display = document.getElementById('voice-transcript-display');
            const suggestions = display.querySelector('.transcript-suggestions');
            
            if (result.package) {
                suggestions.innerHTML = `
                    <strong>Found:</strong> ${result.package}
                    <br><small>Intent: ${result.intent} (${Math.round(result.confidence * 100)}% confidence)</small>
                `;
            } else {
                suggestions.innerHTML = `<strong>Sorry, I didn't understand that.</strong>`;
            }
        } catch (error) {
            console.error('Failed to process voice command:', error);
            this.showFeedback('Failed to process command', 'error');
        }
    }
    
    showFeedback(message, type = 'info') {
        const feedback = document.createElement('div');
        feedback.className = `voice-feedback ${type}`;
        feedback.textContent = message;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 3000);
    }
    
    showFallback() {
        // Create text input fallback for browsers without voice support
        const fallback = document.createElement('div');
        fallback.id = 'voice-fallback';
        fallback.innerHTML = `
            <input type="text" placeholder="Type what you need..." aria-label="Type your request">
            <button>Send</button>
        `;
        
        // Style it to look like voice button area
        fallback.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            display: flex;
            gap: 10px;
            z-index: 9998;
        `;
        
        document.body.appendChild(fallback);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.voiceInput = new VoiceInput();
    });
} else {
    window.voiceInput = new VoiceInput();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceInput;
}