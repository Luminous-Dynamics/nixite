#!/usr/bin/env node
/**
 * Package Data Validator
 *
 * Validates nixite-packages.json for correctness and quality.
 * Checks structure, required fields, uniqueness, and data quality.
 *
 * Usage:
 *   node scripts/validate-packages.js [package-file]
 *
 * Examples:
 *   node scripts/validate-packages.js nixite-packages.json
 *   node scripts/validate-packages.js path/to/packages.json
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

// Valid categories
const VALID_CATEGORIES = [
    'create',
    'connect',
    'grow',
    'work',
    'play',
    'secure',
    'manage',
    'serve'
];

// Validation rules
const RULES = {
    id: {
        required: true,
        type: 'string',
        minLength: 1,
        maxLength: 50,
        pattern: /^[a-z0-9\-\.]+$/,
        description: 'Package ID (lowercase, alphanumeric, dash, dot)'
    },
    name: {
        required: true,
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: 'Display name'
    },
    description: {
        required: true,
        type: 'string',
        minLength: 10,
        maxLength: 200,
        description: 'Package description'
    },
    category: {
        required: true,
        type: 'string',
        enum: VALID_CATEGORIES,
        description: 'Package category'
    }
};

class PackageValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.stats = {
            totalPackages: 0,
            byCategory: {},
            duplicateIds: [],
            missingFields: []
        };
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

    addError(message, pkgId = null) {
        const fullMessage = pkgId ? `[${pkgId}] ${message}` : message;
        this.errors.push(fullMessage);
        this.log(fullMessage, 'error');
    }

    addWarning(message, pkgId = null) {
        const fullMessage = pkgId ? `[${pkgId}] ${message}` : message;
        this.warnings.push(fullMessage);
        this.log(fullMessage, 'warning');
    }

    validateField(pkg, fieldName, rules) {
        const value = pkg[fieldName];
        const pkgId = pkg.id || 'unknown';

        // Check required
        if (rules.required && (value === undefined || value === null || value === '')) {
            this.addError(`Missing required field: ${fieldName}`, pkgId);
            this.stats.missingFields.push(pkgId);
            return false;
        }

        if (value === undefined || value === null) {
            return true; // Optional field not present
        }

        // Check type
        if (typeof value !== rules.type) {
            this.addError(`${fieldName}: Expected ${rules.type}, got ${typeof value}`, pkgId);
            return false;
        }

        // Check string length
        if (rules.type === 'string') {
            if (rules.minLength && value.length < rules.minLength) {
                this.addError(`${fieldName}: Too short (min ${rules.minLength} chars)`, pkgId);
                return false;
            }
            if (rules.maxLength && value.length > rules.maxLength) {
                this.addError(`${fieldName}: Too long (max ${rules.maxLength} chars)`, pkgId);
                return false;
            }
            if (rules.pattern && !rules.pattern.test(value)) {
                this.addError(`${fieldName}: Invalid format (should match ${rules.pattern})`, pkgId);
                return false;
            }
        }

        // Check enum
        if (rules.enum && !rules.enum.includes(value)) {
            this.addError(`${fieldName}: Invalid value '${value}' (must be one of: ${rules.enum.join(', ')})`, pkgId);
            return false;
        }

        return true;
    }

    validateDescription(pkg) {
        const desc = pkg.description;
        const pkgId = pkg.id || 'unknown';

        if (!desc) return;

        // Check for common issues
        if (desc.startsWith('.') || desc.startsWith(',')) {
            this.addWarning('Description starts with punctuation', pkgId);
        }

        if (desc.endsWith('.') && !desc.match(/\w\.$/)) {
            // It's ok to end with period, but warn if it looks like incomplete sentence
        }

        if (desc.toUpperCase() === desc) {
            this.addWarning('Description is all caps', pkgId);
        }

        if (desc.includes('  ')) {
            this.addWarning('Description has double spaces', pkgId);
        }

        // Check for quality
        const words = desc.split(/\s+/).length;
        if (words < 3) {
            this.addWarning('Description is very short (< 3 words)', pkgId);
        }

        if (words > 30) {
            this.addWarning('Description is very long (> 30 words)', pkgId);
        }

        // Check for vague descriptions
        const vagueTerms = ['tool', 'program', 'application', 'software'];
        const isVague = vagueTerms.some(term =>
            desc.toLowerCase().split(/\s+/).includes(term) && words < 6
        );
        if (isVague) {
            this.addWarning('Description may be too vague', pkgId);
        }
    }

    validatePackage(pkg, index) {
        // Validate all required fields
        for (const [fieldName, rules] of Object.entries(RULES)) {
            this.validateField(pkg, fieldName, rules);
        }

        // Additional validation
        this.validateDescription(pkg);

        // Check for unexpected fields
        const expectedFields = Object.keys(RULES);
        for (const field of Object.keys(pkg)) {
            if (!expectedFields.includes(field)) {
                this.addWarning(`Unexpected field: ${field}`, pkg.id);
            }
        }
    }

    checkDuplicates(packages) {
        const ids = new Map();
        const names = new Map();

        for (let i = 0; i < packages.length; i++) {
            const pkg = packages[i];

            // Check duplicate IDs
            if (ids.has(pkg.id)) {
                this.addError(`Duplicate ID at index ${i} (also at ${ids.get(pkg.id)})`, pkg.id);
                this.stats.duplicateIds.push(pkg.id);
            } else {
                ids.set(pkg.id, i);
            }

            // Check duplicate names (warning only)
            if (names.has(pkg.name)) {
                this.addWarning(`Duplicate name at index ${i} (also at ${names.get(pkg.name)})`, pkg.id);
            } else {
                names.set(pkg.name, i);
            }
        }
    }

    calculateStats(packages) {
        this.stats.totalPackages = packages.length;

        // Count by category
        for (const category of VALID_CATEGORIES) {
            this.stats.byCategory[category] = packages.filter(p => p.category === category).length;
        }
    }

    printStats() {
        this.log('', 'info');
        this.log('Package Statistics:', 'info');
        this.log(`  Total packages: ${this.stats.totalPackages}`, 'info');
        this.log('', 'info');
        this.log('  By category:', 'info');

        for (const category of VALID_CATEGORIES) {
            const count = this.stats.byCategory[category] || 0;
            const percentage = this.stats.totalPackages > 0
                ? ((count / this.stats.totalPackages) * 100).toFixed(1)
                : 0;
            this.log(`    ${category.padEnd(8)}: ${count.toString().padStart(3)} (${percentage}%)`, 'info');
        }

        const uncategorized = this.stats.totalPackages -
            Object.values(this.stats.byCategory).reduce((a, b) => a + b, 0);
        if (uncategorized > 0) {
            this.log(`    ${'other'.padEnd(8)}: ${uncategorized.toString().padStart(3)}`, 'warning');
        }
    }

    validate(data) {
        this.errors = [];
        this.warnings = [];
        this.stats = {
            totalPackages: 0,
            byCategory: {},
            duplicateIds: [],
            missingFields: []
        };

        this.log('Validating package data...', 'info');
        this.log('', 'info');

        // Check root structure
        if (!data || typeof data !== 'object') {
            this.addError('Invalid data: Expected object');
            return { valid: false, errors: this.errors, warnings: this.warnings };
        }

        if (!data.packages) {
            this.addError('Missing "packages" array in root');
            return { valid: false, errors: this.errors, warnings: this.warnings };
        }

        if (!Array.isArray(data.packages)) {
            this.addError('"packages" must be an array');
            return { valid: false, errors: this.errors, warnings: this.warnings };
        }

        const packages = data.packages;

        if (packages.length === 0) {
            this.addWarning('No packages found');
        }

        // Validate each package
        for (let i = 0; i < packages.length; i++) {
            this.validatePackage(packages[i], i);
        }

        // Check for duplicates
        this.checkDuplicates(packages);

        // Calculate statistics
        this.calculateStats(packages);

        // Print stats
        this.printStats();

        // Results
        this.log('', 'info');
        this.log('Validation Results:', 'info');
        this.log(`  Errors: ${this.errors.length}`, this.errors.length > 0 ? 'error' : 'success');
        this.log(`  Warnings: ${this.warnings.length}`, this.warnings.length > 0 ? 'warning' : 'success');

        return {
            valid: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings,
            stats: this.stats
        };
    }
}

function loadPackages(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.error(`${colors.red}✗ JSON Parse Error:${colors.reset}`, error.message);
        } else {
            console.error(`${colors.red}✗ Error loading file:${colors.reset}`, error.message);
        }
        process.exit(1);
    }
}

function main() {
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.blue}Nixite Package Data Validator${colors.reset}`);
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log('');

    // Get package file path from args or use default
    const packagePath = process.argv[2] || 'nixite-packages.json';
    const fullPath = path.resolve(packagePath);

    console.log(`${colors.blue}ℹ${colors.reset} Package file: ${fullPath}`);
    console.log('');

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
        console.error(`${colors.red}✗${colors.reset} File not found: ${fullPath}`);
        console.log('');
        console.log('Usage: node scripts/validate-packages.js [package-file]');
        console.log('');
        console.log('Examples:');
        console.log('  node scripts/validate-packages.js nixite-packages.json');
        console.log('  node scripts/validate-packages.js path/to/packages.json');
        process.exit(1);
    }

    // Load and validate packages
    const data = loadPackages(fullPath);
    const validator = new PackageValidator();
    const result = validator.validate(data);

    console.log('');

    if (result.valid) {
        console.log(`${colors.green}✓ Package data is valid!${colors.reset}`);
        if (result.warnings.length > 0) {
            console.log(`${colors.yellow}  (but has ${result.warnings.length} warning(s))${colors.reset}`);
        }
        process.exit(0);
    } else {
        console.log(`${colors.red}✗ Package data has errors${colors.reset}`);
        process.exit(1);
    }
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PackageValidator, RULES, VALID_CATEGORIES };
}

// Run if called directly
if (require.main === module) {
    main();
}
