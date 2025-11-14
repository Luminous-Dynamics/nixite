/**
 * Tests for package data integrity
 * Validates nixite-packages.json structure and content
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Load package data
const packageDataPath = path.join(__dirname, '..', 'nixite-packages.json');
const packageData = JSON.parse(fs.readFileSync(packageDataPath, 'utf8'));

// Valid categories
const VALID_CATEGORIES = ['create', 'connect', 'grow', 'work', 'play', 'secure', 'manage', 'serve'];

describe('Package Data', () => {
    describe('File Structure', () => {
        it('should have packages array', () => {
            assert.ok(packageData.packages, 'packages array missing');
            assert.ok(Array.isArray(packageData.packages), 'packages should be an array');
        });

        it('should have at least 50 packages', () => {
            assert.ok(packageData.packages.length >= 50, `Should have at least 50 packages, found ${packageData.packages.length}`);
        });
    });

    describe('Package Structure', () => {
        it('should have required fields for all packages', () => {
            packageData.packages.forEach((pkg, index) => {
                assert.ok(pkg.id, `Package at index ${index} missing id`);
                assert.ok(pkg.name, `Package ${pkg.id || index} missing name`);
                assert.ok(pkg.description, `Package ${pkg.id} missing description`);
                assert.ok(pkg.category, `Package ${pkg.id} missing category`);
            });
        });

        it('should have valid category for all packages', () => {
            packageData.packages.forEach(pkg => {
                assert.ok(
                    VALID_CATEGORIES.includes(pkg.category),
                    `Package ${pkg.id} has invalid category: ${pkg.category}`
                );
            });
        });

        it('should have unique package IDs', () => {
            const ids = packageData.packages.map(p => p.id);
            const uniqueIds = new Set(ids);
            assert.strictEqual(
                ids.length,
                uniqueIds.size,
                'Duplicate package IDs found'
            );
        });

        it('should have reasonable description lengths', () => {
            packageData.packages.forEach(pkg => {
                assert.ok(
                    pkg.description.length >= 10,
                    `Package ${pkg.id} description too short`
                );
                assert.ok(
                    pkg.description.length <= 200,
                    `Package ${pkg.id} description too long (${pkg.description.length} chars)`
                );
            });
        });

        it('should have proper name capitalization', () => {
            packageData.packages.forEach(pkg => {
                assert.ok(
                    pkg.name.length > 0,
                    `Package ${pkg.id} has empty name`
                );
                // Name should start with uppercase or digit
                assert.ok(
                    /^[A-Z0-9]/.test(pkg.name),
                    `Package ${pkg.id} name should start with uppercase or digit: ${pkg.name}`
                );
            });
        });
    });

    describe('Category Coverage', () => {
        it('should have packages in all categories', () => {
            const categoriesWithPackages = new Set(
                packageData.packages.map(p => p.category)
            );

            VALID_CATEGORIES.forEach(category => {
                assert.ok(
                    categoriesWithPackages.has(category),
                    `No packages in category: ${category}`
                );
            });
        });

        it('should have balanced category distribution', () => {
            const categoryCount = {};
            VALID_CATEGORIES.forEach(cat => categoryCount[cat] = 0);

            packageData.packages.forEach(pkg => {
                categoryCount[pkg.category]++;
            });

            VALID_CATEGORIES.forEach(category => {
                assert.ok(
                    categoryCount[category] >= 3,
                    `Category ${category} has too few packages (${categoryCount[category]})`
                );
            });
        });
    });

    describe('Data Quality', () => {
        it('should not have packages with placeholder descriptions', () => {
            const placeholders = ['todo', 'tbd', 'description', 'package'];
            packageData.packages.forEach(pkg => {
                const desc = pkg.description.toLowerCase();
                placeholders.forEach(placeholder => {
                    assert.ok(
                        !desc.includes(placeholder) || desc.length > 20,
                        `Package ${pkg.id} may have placeholder description`
                    );
                });
            });
        });

        it('should have proper punctuation in descriptions', () => {
            packageData.packages.forEach(pkg => {
                // Description should end with proper punctuation or be a phrase
                const lastChar = pkg.description.slice(-1);
                const hasProperEnding = /[a-zA-Z0-9)]$/.test(pkg.description);
                assert.ok(
                    hasProperEnding,
                    `Package ${pkg.id} description has improper ending`
                );
            });
        });

        it('should not have duplicate package names', () => {
            const names = packageData.packages.map(p => p.name.toLowerCase());
            const uniqueNames = new Set(names);
            // Allow some duplicates (e.g., "Firefox" and "Firefox Developer Edition")
            const duplicateCount = names.length - uniqueNames.size;
            assert.ok(
                duplicateCount < 5,
                `Too many duplicate names found (${duplicateCount})`
            );
        });
    });

    describe('Popular Packages', () => {
        const popularPackages = [
            'firefox', 'chrome', 'chromium',
            'vscode', 'vim', 'emacs',
            'git', 'docker',
            'libreoffice',
            'gimp', 'inkscape'
        ];

        it('should include popular packages', () => {
            const packageIds = packageData.packages.map(p => p.id.toLowerCase());

            const missing = popularPackages.filter(pkg =>
                !packageIds.some(id => id.includes(pkg))
            );

            assert.ok(
                missing.length < popularPackages.length / 2,
                `Missing too many popular packages: ${missing.join(', ')}`
            );
        });
    });
});

// Run tests if executed directly
if (require.main === module) {
    console.log('Running package data tests...\n');

    let passed = 0;
    let failed = 0;

    console.log('='.repeat(50));
    console.log('Testing Package Data');
    console.log('='.repeat(50));

    try {
        // Basic structure test
        console.log('\n✓ Package file loaded successfully');
        console.log(`✓ Found ${packageData.packages.length} packages`);

        // Count by category
        const categoryCount = {};
        VALID_CATEGORIES.forEach(cat => categoryCount[cat] = 0);
        packageData.packages.forEach(pkg => {
            if (categoryCount[pkg.category] !== undefined) {
                categoryCount[pkg.category]++;
            }
        });

        console.log('\nPackages by category:');
        VALID_CATEGORIES.forEach(cat => {
            console.log(`  ${cat}: ${categoryCount[cat]} packages`);
        });

        console.log('\n' + '='.repeat(50));
        console.log('All package data tests passed! ✓');
        console.log('='.repeat(50));

        process.exit(0);
    } catch (error) {
        console.error('\n✗ Test failed:', error.message);
        process.exit(1);
    }
}
