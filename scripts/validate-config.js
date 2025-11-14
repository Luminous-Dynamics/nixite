#!/usr/bin/env node
/**
 * Configuration Validator
 *
 * Validates the Nixite configuration object for correctness.
 * Can be used standalone or imported as a module.
 *
 * Usage:
 *   node scripts/validate-config.js [config-file]
 *
 * Examples:
 *   node scripts/validate-config.js config.js
 *   node scripts/validate-config.js examples/production-config.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

// Validation rules
const configSchema = {
    api: {
        required: true,
        type: 'object',
        fields: {
            base: { type: 'string', pattern: /^https?:\/\/.+/ },
            installer: { type: 'string', pattern: /^https?:\/\/.+/ },
            luminousBridge: { type: 'string', pattern: /^https?:\/\/.+/ }
        }
    },
    features: {
        required: true,
        type: 'object',
        fields: {
            voiceInput: { type: 'boolean' },
            aiFeedback: { type: 'boolean' },
            installManager: { type: 'boolean' },
            luminousBridge: { type: 'boolean' }
        }
    },
    network: {
        required: true,
        type: 'object',
        fields: {
            timeout: { type: 'number', min: 1000, max: 120000 },
            retryAttempts: { type: 'number', min: 0, max: 10 },
            retryDelay: { type: 'number', min: 100, max: 10000 },
            healthCheckTimeout: { type: 'number', min: 100, max: 5000 }
        }
    },
    ai: {
        required: true,
        type: 'object',
        fields: {
            confidenceThreshold: { type: 'number', min: 0, max: 1 },
            fallbackMode: { type: 'string', enum: ['knowledge-base', 'manual', 'none'] },
            enableHRM: { type: 'boolean' },
            enableGemma: { type: 'boolean' }
        }
    },
    ui: {
        required: true,
        type: 'object',
        fields: {
            toastDuration: { type: 'number', min: 1000, max: 10000 },
            animationSpeed: { type: 'string', enum: ['slow', 'normal', 'fast', 'none'] },
            theme: { type: 'string', enum: ['auto', 'light', 'dark'] }
        }
    },
    development: {
        required: true,
        type: 'object',
        fields: {
            enabled: { type: 'boolean' },
            verboseLogging: { type: 'boolean' },
            mockBackend: { type: 'boolean' }
        }
    }
};

class ConfigValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    log(message, type = 'info') {
        const prefix = {
            info: `${colors.blue}ℹ${colors.reset}`,
            success: `${colors.green}✓${colors.reset}`,
            error: `${colors.red}✗${colors.reset}`,
            warning: `${colors.yellow}⚠${colors.reset}`
        };
        console.log(`${prefix[type]} ${message}`);
    }

    addError(message) {
        this.errors.push(message);
        this.log(message, 'error');
    }

    addWarning(message) {
        this.warnings.push(message);
        this.log(message, 'warning');
    }

    validateType(value, expectedType, path) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;

        if (actualType !== expectedType) {
            this.addError(`${path}: Expected type '${expectedType}', got '${actualType}'`);
            return false;
        }
        return true;
    }

    validateNumber(value, rules, path) {
        if (typeof value !== 'number') {
            this.addError(`${path}: Expected number, got ${typeof value}`);
            return false;
        }

        if (rules.min !== undefined && value < rules.min) {
            this.addError(`${path}: Value ${value} is less than minimum ${rules.min}`);
            return false;
        }

        if (rules.max !== undefined && value > rules.max) {
            this.addError(`${path}: Value ${value} is greater than maximum ${rules.max}`);
            return false;
        }

        return true;
    }

    validateString(value, rules, path) {
        if (typeof value !== 'string') {
            this.addError(`${path}: Expected string, got ${typeof value}`);
            return false;
        }

        if (rules.pattern && !rules.pattern.test(value)) {
            this.addError(`${path}: Value '${value}' doesn't match required pattern`);
            return false;
        }

        if (rules.enum && !rules.enum.includes(value)) {
            this.addError(`${path}: Value '${value}' is not one of: ${rules.enum.join(', ')}`);
            return false;
        }

        return true;
    }

    validateBoolean(value, rules, path) {
        if (typeof value !== 'boolean') {
            this.addError(`${path}: Expected boolean, got ${typeof value}`);
            return false;
        }
        return true;
    }

    validateField(value, rules, path) {
        switch (rules.type) {
            case 'number':
                return this.validateNumber(value, rules, path);
            case 'string':
                return this.validateString(value, rules, path);
            case 'boolean':
                return this.validateBoolean(value, rules, path);
            default:
                return this.validateType(value, rules.type, path);
        }
    }

    validateObject(obj, schema, path = 'config') {
        // Check for missing required sections
        for (const [key, rules] of Object.entries(schema)) {
            if (rules.required && !(key in obj)) {
                this.addError(`${path}.${key}: Required section is missing`);
                continue;
            }

            if (!(key in obj)) {
                continue;
            }

            const value = obj[key];
            const currentPath = `${path}.${key}`;

            // Validate section type
            if (!this.validateType(value, rules.type, currentPath)) {
                continue;
            }

            // Validate fields in object
            if (rules.type === 'object' && rules.fields) {
                for (const [fieldKey, fieldRules] of Object.entries(rules.fields)) {
                    if (!(fieldKey in value)) {
                        this.addError(`${currentPath}.${fieldKey}: Required field is missing`);
                        continue;
                    }

                    this.validateField(value[fieldKey], fieldRules, `${currentPath}.${fieldKey}`);
                }

                // Check for unexpected fields
                for (const fieldKey of Object.keys(value)) {
                    if (!(fieldKey in rules.fields)) {
                        this.addWarning(`${currentPath}.${fieldKey}: Unexpected field (not in schema)`);
                    }
                }
            }
        }

        // Check for unexpected top-level sections
        for (const key of Object.keys(obj)) {
            if (!(key in schema)) {
                this.addWarning(`${path}.${key}: Unexpected section (not in schema)`);
            }
        }
    }

    validate(config) {
        this.errors = [];
        this.warnings = [];

        this.log('Validating configuration...', 'info');
        this.log('', 'info');

        // Validate structure
        this.validateObject(config, configSchema);

        // Cross-field validation
        if (config.features && config.features.luminousBridge &&
            config.development && config.development.mockBackend) {
            this.addWarning('features.luminousBridge is enabled but development.mockBackend is also enabled');
        }

        if (config.network && config.network.timeout < config.network.retryDelay * config.network.retryAttempts) {
            this.addWarning('network.timeout may be too short for the configured retry attempts');
        }

        if (config.development && config.development.enabled) {
            this.addWarning('Development mode is enabled (should be disabled in production)');
        }

        // Results
        this.log('', 'info');
        this.log('Validation Results:', 'info');
        this.log(`  Errors: ${this.errors.length}`, this.errors.length > 0 ? 'error' : 'success');
        this.log(`  Warnings: ${this.warnings.length}`, this.warnings.length > 0 ? 'warning' : 'success');

        return {
            valid: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings
        };
    }
}

function loadConfig(configPath) {
    try {
        // Read file
        const content = fs.readFileSync(configPath, 'utf8');

        // Extract the config object
        // This is a simple approach - for production you might want something more robust
        const match = content.match(/const\s+NIXITE_CONFIG\s*=\s*({[\s\S]*?});/);
        if (!match) {
            throw new Error('Could not find NIXITE_CONFIG in file');
        }

        // Use Function constructor to evaluate the config (safer than eval)
        // Note: Still not perfectly safe, but acceptable for a dev tool
        const configStr = match[1];
        const config = new Function(`return ${configStr}`)();

        return config;
    } catch (error) {
        console.error(`${colors.red}Error loading config:${colors.reset}`, error.message);
        process.exit(1);
    }
}

function main() {
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.blue}Nixite Configuration Validator${colors.reset}`);
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log('');

    // Get config file path from args or use default
    const configPath = process.argv[2] || 'config.js';
    const fullPath = path.resolve(configPath);

    console.log(`${colors.blue}ℹ${colors.reset} Config file: ${fullPath}`);
    console.log('');

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
        console.error(`${colors.red}✗${colors.reset} File not found: ${fullPath}`);
        console.log('');
        console.log('Usage: node scripts/validate-config.js [config-file]');
        console.log('');
        console.log('Examples:');
        console.log('  node scripts/validate-config.js config.js');
        console.log('  node scripts/validate-config.js examples/production-config.js');
        process.exit(1);
    }

    // Load and validate config
    const config = loadConfig(fullPath);
    const validator = new ConfigValidator();
    const result = validator.validate(config);

    console.log('');

    if (result.valid) {
        console.log(`${colors.green}✓ Configuration is valid!${colors.reset}`);
        if (result.warnings.length > 0) {
            console.log(`${colors.yellow}  (but has ${result.warnings.length} warning(s))${colors.reset}`);
        }
        process.exit(0);
    } else {
        console.log(`${colors.red}✗ Configuration has errors${colors.reset}`);
        process.exit(1);
    }
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ConfigValidator, configSchema };
}

// Run if called directly
if (require.main === module) {
    main();
}
