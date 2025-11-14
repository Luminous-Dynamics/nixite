/**
 * Nixite Configuration
 * Centralized configuration for backend services and API endpoints
 */

const NIXITE_CONFIG = {
    // Backend API endpoints
    api: {
        base: 'http://localhost:8888/api',
        installer: 'http://localhost:8889',
        luminousBridge: 'http://localhost:8890'
    },

    // Feature flags
    features: {
        voiceInput: true,
        aiFeedback: true,
        installManager: true,
        luminousBridge: true
    },

    // Timeouts and retry settings
    network: {
        timeout: 30000,           // 30 seconds
        retryAttempts: 3,
        retryDelay: 1000,         // 1 second
        healthCheckTimeout: 500   // 500ms for health checks
    },

    // AI/ML settings
    ai: {
        confidenceThreshold: 0.6,
        fallbackMode: 'knowledge-base',
        enableHRM: true,
        enableGemma: true
    },

    // UI settings
    ui: {
        toastDuration: 3000,      // 3 seconds
        animationSpeed: 'normal',  // 'fast', 'normal', 'slow'
        theme: 'auto'             // 'light', 'dark', 'auto'
    },

    // Development mode
    development: {
        enabled: false,
        verboseLogging: false,
        mockBackend: false
    }
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.NIXITE_CONFIG = NIXITE_CONFIG;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NIXITE_CONFIG;
}
