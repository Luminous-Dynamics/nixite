/**
 * Nixite Configuration for Production
 * Optimized for reliability and performance
 */

const NIXITE_CONFIG = {
    // API endpoints - use environment variables in production
    api: {
        base: process.env.NIXITE_API_BASE || 'http://localhost:8888/api',
        installer: process.env.NIXITE_INSTALLER || 'http://localhost:8889',
        luminousBridge: process.env.NIXITE_BRIDGE || 'http://localhost:8890'
    },

    // Feature flags - disable optional features for stability
    features: {
        voiceInput: false,         // Disable for production stability
        aiFeedback: true,
        installManager: true,
        luminousBridge: false      // Only enable if needed
    },

    // Network settings - production values
    network: {
        timeout: 30000,            // 30 seconds
        retryAttempts: 3,
        retryDelay: 1000,
        healthCheckTimeout: 500
    },

    // AI settings - higher confidence for production
    ai: {
        confidenceThreshold: 0.7,  // Higher threshold
        fallbackMode: 'knowledge-base',
        enableHRM: false,          // Disable if not needed
        enableGemma: false
    },

    // UI settings
    ui: {
        toastDuration: 3000,       // Standard duration
        animationSpeed: 'normal',
        theme: 'auto'
    },

    // Development mode disabled
    development: {
        enabled: false,
        verboseLogging: false,
        mockBackend: false
    }
};

if (typeof window !== 'undefined') {
    window.NIXITE_CONFIG = NIXITE_CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NIXITE_CONFIG;
}
