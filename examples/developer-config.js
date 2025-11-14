/**
 * Nixite Configuration for Developers
 * Optimized for development workflow
 */

const NIXITE_CONFIG = {
    // API endpoints
    api: {
        base: 'http://localhost:8888/api',
        installer: 'http://localhost:8889',
        luminousBridge: 'http://localhost:8890'
    },

    // Enable all features for development
    features: {
        voiceInput: true,
        aiFeedback: true,
        installManager: true,
        luminousBridge: true
    },

    // Network settings - longer timeouts for debugging
    network: {
        timeout: 60000,           // 60 seconds for debugging
        retryAttempts: 3,
        retryDelay: 2000,         // 2 seconds between retries
        healthCheckTimeout: 1000  // 1 second for health checks
    },

    // AI settings - lower threshold for testing
    ai: {
        confidenceThreshold: 0.5,  // Lower for testing
        fallbackMode: 'knowledge-base',
        enableHRM: true,
        enableGemma: true
    },

    // UI settings
    ui: {
        toastDuration: 5000,      // Longer to read error messages
        animationSpeed: 'fast',   // Fast for development
        theme: 'auto'
    },

    // Development mode enabled
    development: {
        enabled: true,
        verboseLogging: true,      // Detailed logs
        mockBackend: false         // Use real backend
    }
};

if (typeof window !== 'undefined') {
    window.NIXITE_CONFIG = NIXITE_CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NIXITE_CONFIG;
}
