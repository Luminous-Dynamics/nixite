/**
 * Tests for config.js
 * Validates configuration structure and defaults
 */

const config = require('../config.js');
const assert = require('assert');

describe('Configuration', () => {
    describe('Structure', () => {
        it('should have api configuration', () => {
            assert.ok(config.api, 'api configuration missing');
            assert.ok(config.api.base, 'api.base missing');
            assert.ok(config.api.installer, 'api.installer missing');
            assert.ok(config.api.luminousBridge, 'api.luminousBridge missing');
        });

        it('should have features configuration', () => {
            assert.ok(config.features, 'features configuration missing');
            assert.strictEqual(typeof config.features.voiceInput, 'boolean');
            assert.strictEqual(typeof config.features.aiFeedback, 'boolean');
            assert.strictEqual(typeof config.features.installManager, 'boolean');
            assert.strictEqual(typeof config.features.luminousBridge, 'boolean');
        });

        it('should have network configuration', () => {
            assert.ok(config.network, 'network configuration missing');
            assert.ok(config.network.timeout, 'network.timeout missing');
            assert.ok(config.network.retryAttempts, 'network.retryAttempts missing');
            assert.ok(config.network.retryDelay, 'network.retryDelay missing');
        });

        it('should have ai configuration', () => {
            assert.ok(config.ai, 'ai configuration missing');
            assert.ok(config.ai.confidenceThreshold, 'ai.confidenceThreshold missing');
        });

        it('should have ui configuration', () => {
            assert.ok(config.ui, 'ui configuration missing');
            assert.ok(config.ui.toastDuration, 'ui.toastDuration missing');
            assert.ok(config.ui.theme, 'ui.theme missing');
        });
    });

    describe('API Endpoints', () => {
        it('should have valid HTTP URLs', () => {
            const urlPattern = /^https?:\/\//;
            assert.ok(urlPattern.test(config.api.base), 'api.base is not a valid HTTP URL');
            assert.ok(urlPattern.test(config.api.installer), 'api.installer is not a valid HTTP URL');
            assert.ok(urlPattern.test(config.api.luminousBridge), 'api.luminousBridge is not a valid HTTP URL');
        });

        it('should use localhost for local development', () => {
            assert.ok(config.api.base.includes('localhost'), 'api.base should use localhost');
        });
    });

    describe('Network Settings', () => {
        it('should have reasonable timeout', () => {
            assert.ok(config.network.timeout > 0, 'timeout should be positive');
            assert.ok(config.network.timeout <= 60000, 'timeout should not exceed 1 minute');
        });

        it('should have reasonable retry settings', () => {
            assert.ok(config.network.retryAttempts >= 0, 'retryAttempts should be non-negative');
            assert.ok(config.network.retryAttempts <= 10, 'retryAttempts should be reasonable');
            assert.ok(config.network.retryDelay > 0, 'retryDelay should be positive');
        });
    });

    describe('AI Settings', () => {
        it('should have valid confidence threshold', () => {
            assert.ok(config.ai.confidenceThreshold >= 0, 'confidenceThreshold should be >= 0');
            assert.ok(config.ai.confidenceThreshold <= 1, 'confidenceThreshold should be <= 1');
        });

        it('should have fallback mode', () => {
            assert.ok(config.ai.fallbackMode, 'fallbackMode should be defined');
            assert.strictEqual(typeof config.ai.fallbackMode, 'string');
        });
    });

    describe('UI Settings', () => {
        it('should have valid toast duration', () => {
            assert.ok(config.ui.toastDuration > 0, 'toastDuration should be positive');
        });

        it('should have valid theme', () => {
            const validThemes = ['light', 'dark', 'auto'];
            assert.ok(validThemes.includes(config.ui.theme), `theme should be one of: ${validThemes.join(', ')}`);
        });
    });

    describe('Feature Flags', () => {
        it('should have all feature flags as booleans', () => {
            Object.keys(config.features).forEach(feature => {
                assert.strictEqual(
                    typeof config.features[feature],
                    'boolean',
                    `${feature} should be a boolean`
                );
            });
        });
    });
});

// Run tests if executed directly
if (require.main === module) {
    console.log('Running config tests...\n');

    let passed = 0;
    let failed = 0;

    // Simple test runner
    const runTests = (suiteName, tests) => {
        console.log(`\n${suiteName}:`);
        Object.keys(tests).forEach(testName => {
            try {
                tests[testName]();
                console.log(`  ✓ ${testName}`);
                passed++;
            } catch (error) {
                console.log(`  ✗ ${testName}`);
                console.log(`    ${error.message}`);
                failed++;
            }
        });
    };

    try {
        // Run all test suites
        console.log('='.repeat(50));
        console.log('Testing Configuration Module');
        console.log('='.repeat(50));

        // Structure tests
        runTests('Structure', {
            'has api config': () => assert.ok(config.api),
            'has features config': () => assert.ok(config.features),
            'has network config': () => assert.ok(config.network),
            'has ai config': () => assert.ok(config.ai),
            'has ui config': () => assert.ok(config.ui)
        });

        console.log('\n' + '='.repeat(50));
        console.log(`Results: ${passed} passed, ${failed} failed`);
        console.log('='.repeat(50));

        process.exit(failed > 0 ? 1 : 0);
    } catch (error) {
        console.error('Test execution failed:', error);
        process.exit(1);
    }
}
