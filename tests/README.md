# Nixite Tests

Comprehensive test suite for Nixite to ensure quality and reliability.

## Running Tests

### All Tests
```bash
npm test
```

### Individual Test Files
```bash
node tests/config.test.js
node tests/packages.test.js
```

### With CI
Tests are automatically run on every commit via GitHub Actions. See `.github/workflows/ci.yml`.

## Test Structure

### Unit Tests
- `config.test.js` - Configuration validation
- `packages.test.js` - Package data integrity

### Integration Tests
- Coming soon: API endpoint tests
- Coming soon: Installation flow tests

### What We Test

#### Configuration (config.test.js)
- ✅ Configuration structure
- ✅ API endpoint validity
- ✅ Network settings
- ✅ AI configuration
- ✅ UI settings
- ✅ Feature flags

#### Package Data (packages.test.js)
- ✅ File structure and format
- ✅ Required fields present
- ✅ Valid categories
- ✅ Unique package IDs
- ✅ Description quality
- ✅ Category coverage
- ✅ Popular package inclusion

## Test Coverage Goals

- **Current**: ~60% (core modules)
- **Target v2.1**: 80% (critical paths)
- **Target v2.2**: 90% (comprehensive)

## Writing Tests

### Guidelines
1. **Descriptive names**: Test names should clearly state what they test
2. **Assertions**: Use clear, specific assertions
3. **Isolation**: Tests should not depend on each other
4. **Speed**: Keep tests fast (< 1s per test)

### Example Test
```javascript
describe('Package Validation', () => {
    it('should have valid category', () => {
        const pkg = { id: 'test', category: 'work' };
        assert.ok(VALID_CATEGORIES.includes(pkg.category));
    });
});
```

## Test Categories

### 🟢 Passing (Core)
- Configuration validation
- Package data structure
- JSON syntax validation
- File existence checks

### 🟡 Planned (v2.1)
- API endpoint tests
- Installation simulation
- Error handling verification
- Performance benchmarks

### 🔴 Future (v2.2+)
- E2E browser tests
- Voice input tests
- AI bridge integration tests
- Load testing

## CI/CD Integration

Tests run automatically on:
- Every commit to main branches
- Every pull request
- Manual workflow dispatch

See `.github/workflows/ci.yml` for configuration.

## Continuous Improvement

We're always improving test coverage. To add tests:

1. Create test file in `tests/` directory
2. Follow naming convention: `*.test.js`
3. Add to CI workflow if needed
4. Document in this README

## Resources

- [Node.js Assert Documentation](https://nodejs.org/api/assert.html)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [CI/CD with GitHub Actions](https://docs.github.com/en/actions)

---

**Questions?** Open an issue or check [CONTRIBUTING.md](../CONTRIBUTING.md)
