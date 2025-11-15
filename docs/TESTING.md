# Nixite Testing Guide

Comprehensive testing strategy and procedures for Nixite.

## 📋 Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Suites](#test-suites)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Continuous Integration](#continuous-integration)
- [Performance Testing](#performance-testing)
- [Accessibility Testing](#accessibility-testing)
- [Manual Testing](#manual-testing)

## 🎯 Testing Philosophy

**Our Testing Principles:**

1. **Comprehensive Coverage** - Test all critical paths and edge cases
2. **Fast Feedback** - Tests should run quickly for rapid development
3. **Reliable** - Tests should be deterministic and not flaky
4. **Maintainable** - Tests should be easy to understand and update
5. **Automated** - Manual testing only where automation isn't feasible

**Testing Pyramid:**

```
        /\
       /  \      E2E Tests (Few)
      /____\     - Full workflow tests
     /      \
    /________\   Integration Tests (Some)
   /          \  - Component integration
  /____________\ Unit Tests (Many)
                 - Individual functions
```

## 🧪 Test Suites

### 1. Configuration Tests (`tests/config.test.js`)

**Purpose:** Validate configuration files and settings

**What's Tested:**
- Config file exists and is valid JSON
- All required configuration keys present
- Default values are sensible
- Environment variable overrides work

**Run:**
```bash
npm run test:config
```

**Example Output:**
```
✓ Configuration file exists
✓ Configuration is valid JSON
✓ All required keys are present
✓ Default values are valid

Tests passed: 4/4
```

### 2. Package Tests (`tests/packages.test.js`)

**Purpose:** Validate package data integrity

**What's Tested:**
- Package JSON is valid
- All packages have required fields
- No duplicate package names
- Categories are valid
- Tags follow conventions
- Descriptions are meaningful

**Run:**
```bash
npm run test:packages
```

**Example Output:**
```
✓ Package file exists and is valid JSON
✓ All packages have required fields
✓ No duplicate packages found
✓ All categories are valid
✓ Package tags are properly formatted
✓ Descriptions are meaningful

Analyzed 150 packages across 8 categories
Tests passed: 6/6
```

### 3. Integration Tests (`tests/integration.test.js`)

**Purpose:** Test component integration and system behavior

**What's Tested:**
- HTML structure is valid
- JavaScript files load correctly
- CSS files exist and are valid
- Documentation is complete
- GitHub configuration is correct
- Example files are valid

**Run:**
```bash
npm run test:integration
```

**Example Output:**
```
✓ HTML structure is valid
✓ Main JavaScript loads successfully
✓ CSS files exist and are valid
✓ All documentation files exist
✓ GitHub workflows are valid YAML
✓ Example configurations are valid

Tests passed: 10/10
```

### 4. Performance Tests (`tests/performance.test.js`)

**Purpose:** Measure and validate system performance

**What's Tested:**
- HTTP response times (p50, p95, p99)
- Throughput (requests/second)
- Concurrent request handling
- Memory usage
- Load testing scenarios

**Run:**
```bash
npm run test:performance
# or
npm run benchmark
```

**Example Output:**
```
🚀 Performance Benchmark Results:

HTTP Response Times:
  Average:  45ms
  Median:   42ms
  P95:      89ms
  P99:      125ms

Throughput:
  Requests/sec: 250
  Total requests: 1000
  Duration: 4.2s

Load Test (10 concurrent):
  Success rate: 100%
  Avg response: 68ms

Performance Grade: A+
```

### 5. Accessibility Tests (`tests/accessibility.test.js`)

**Purpose:** Ensure WCAG 2.1 Level AA compliance

**What's Tested:**
- Semantic HTML structure
- Keyboard navigation
- Images and alt text
- Form accessibility
- ARIA usage
- Color and contrast
- Document language
- Multimedia elements
- Data tables
- Responsive accessibility

**Run:**
```bash
npm run test:accessibility
```

**Requires:** Web server running on http://localhost:8000

**Example Output:**
```
═══════════════════════════════════════════════
  WCAG 2.1 Level AA Compliance Testing
═══════════════════════════════════════════════

Test 1: Semantic HTML Structure
  ✓ Page has heading elements
  ✓ Page has exactly one h1 element
  ⚠ Heading hierarchy is proper

Test 2: Keyboard Navigation
  ✓ Page has skip navigation links
  ✓ All enabled buttons are focusable

...

Summary:
  Total Tests: 45
  Passed: 42 (93.3%)
  Failed: 0 (0%)
  Warnings: 3 (6.7%)

Compliance Level: ✓ WCAG 2.1 Level AA (Good)
```

## ▶️ Running Tests

### Run All Tests

```bash
# Run complete test suite
npm run test:all

# Combines:
# - Config tests
# - Package tests
# - Integration tests
```

### Run Specific Test Suite

```bash
npm run test:config        # Configuration only
npm run test:packages      # Package validation only
npm run test:integration   # Integration tests only
npm run test:performance   # Performance benchmarks only
npm run test:accessibility # WCAG compliance only
```

### Run Individual Test File

```bash
# Directly execute test file
node tests/config.test.js
node tests/packages.test.js
```

### Watch Mode

For continuous testing during development:

```bash
# Simple watch loop
while true; do
  clear
  npm run test:config
  sleep 2
done

# Or use nodemon (if installed)
nodemon --exec "npm run test:all" --watch . --ext js,json,html
```

### CI/CD Testing

Tests run automatically on:
- Every push to any branch
- Every pull request
- Scheduled daily runs (security)

See [.github/workflows/ci.yml](../.github/workflows/ci.yml)

## ✍️ Writing Tests

### Test Structure

```javascript
#!/usr/bin/env node

/**
 * Test Suite: [Name]
 * Purpose: [What this tests]
 */

const assert = require('assert');
const fs = require('fs');

// Test counters
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Helper functions
function test(description, testFn) {
  totalTests++;
  try {
    testFn();
    passedTests++;
    console.log(`✓ ${description}`);
  } catch (err) {
    failedTests++;
    console.error(`✗ ${description}`);
    console.error(`  ${err.message}`);
  }
}

// Test cases
function testSomething() {
  test('Should do X correctly', () => {
    const result = functionToTest();
    assert.strictEqual(result, expectedValue);
  });

  test('Should handle edge case Y', () => {
    const result = functionToTest(edgeCase);
    assert.ok(result);
  });
}

// Run tests
function runTests() {
  console.log('Running test suite...\n');

  testSomething();

  // Summary
  console.log(`\nTests passed: ${passedTests}/${totalTests}`);

  if (failedTests > 0) {
    console.error(`\n❌ ${failedTests} test(s) failed`);
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

// Execute
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
```

### Assertion Examples

```javascript
const assert = require('assert');

// Equality
assert.strictEqual(actual, expected);
assert.notStrictEqual(actual, unexpected);

// Deep equality (objects/arrays)
assert.deepStrictEqual(actualObj, expectedObj);

// Truthiness
assert.ok(value);  // truthy
assert.ok(!value); // falsy

// Type checking
assert.strictEqual(typeof value, 'string');

// Arrays
assert.strictEqual(array.length, 5);
assert.ok(array.includes(value));

// Objects
assert.ok(obj.hasOwnProperty('key'));
assert.strictEqual(obj.key, value);

// Throws
assert.throws(() => {
  functionThatShouldThrow();
}, Error);

// Async
async function testAsync() {
  const result = await asyncFunction();
  assert.strictEqual(result, expected);
}
```

### Test Best Practices

**DO:**
- ✅ Test one thing per test
- ✅ Use descriptive test names
- ✅ Test edge cases and error conditions
- ✅ Keep tests independent
- ✅ Use setup/teardown when needed
- ✅ Test public interfaces, not implementation details

**DON'T:**
- ❌ Test multiple things in one test
- ❌ Depend on test execution order
- ❌ Use random data without seeding
- ❌ Ignore flaky tests
- ❌ Mock everything
- ❌ Write tests that depend on external services

### Example Test

```javascript
// tests/search.test.js
#!/usr/bin/env node

const assert = require('assert');
const { searchPackages } = require('../nixite-luminous.js');

function testSearchPackages() {
  // Test exact match
  test('Should find exact package name match', () => {
    const results = searchPackages('firefox');
    assert.ok(results.length > 0);
    assert.strictEqual(results[0].name.toLowerCase(), 'firefox');
  });

  // Test partial match
  test('Should find partial matches', () => {
    const results = searchPackages('fire');
    assert.ok(results.some(pkg => pkg.name.toLowerCase().includes('fire')));
  });

  // Test case insensitivity
  test('Should be case-insensitive', () => {
    const lower = searchPackages('firefox');
    const upper = searchPackages('FIREFOX');
    assert.strictEqual(lower.length, upper.length);
  });

  // Test empty query
  test('Should handle empty query', () => {
    const results = searchPackages('');
    assert.ok(Array.isArray(results));
  });

  // Test non-existent package
  test('Should return empty for non-existent package', () => {
    const results = searchPackages('nonexistentpackage12345');
    assert.strictEqual(results.length, 0);
  });
}

runTests();
```

## 🔄 Continuous Integration

### GitHub Actions Workflow

Tests run automatically via GitHub Actions:

**On Every Push/PR:**
```yaml
# .github/workflows/ci.yml
- Configuration tests
- Package validation
- Integration tests
- Code linting
- Build verification
```

**Daily Security Scan:**
```yaml
# .github/workflows/security.yml
- Dependency audit
- Container scanning
- Secret detection
- SAST analysis
```

**On Release:**
```yaml
# .github/workflows/release.yml
- All test suites
- Performance benchmarks
- Build & publish containers
- Create GitHub release
```

### Running CI Tests Locally

```bash
# Simulate CI environment
docker run --rm -v $(pwd):/app -w /app node:18 npm run test:all

# Or use act (GitHub Actions locally)
act push
```

### CI Test Requirements

For PR to be merged:
- [ ] All tests must pass
- [ ] No security vulnerabilities
- [ ] Code coverage > 80% (if applicable)
- [ ] Performance benchmarks meet targets
- [ ] Documentation updated

## ⚡ Performance Testing

### Quick Performance Check

```bash
npm run test:performance
```

### Custom Performance Test

```javascript
#!/usr/bin/env node

const http = require('http');

// Measure response time
async function measureResponseTime(url, iterations = 100) {
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await fetch(url);
    const duration = Date.now() - start;
    times.push(duration);
  }

  times.sort((a, b) => a - b);

  return {
    avg: times.reduce((a, b) => a + b) / times.length,
    min: times[0],
    max: times[times.length - 1],
    median: times[Math.floor(times.length / 2)],
    p95: times[Math.floor(times.length * 0.95)],
    p99: times[Math.floor(times.length * 0.99)]
  };
}

// Run
measureResponseTime('http://localhost:8000').then(stats => {
  console.log('Response Time Statistics:');
  console.log(`  Average: ${stats.avg.toFixed(2)}ms`);
  console.log(`  Median:  ${stats.median}ms`);
  console.log(`  P95:     ${stats.p95}ms`);
  console.log(`  P99:     ${stats.p99}ms`);
});
```

### Performance Targets

**Response Times:**
- P50: < 50ms
- P95: < 100ms
- P99: < 200ms

**Throughput:**
- Min: 100 req/s (single server)
- Target: 250 req/s
- Goal: 500 req/s

**Resources:**
- Memory: < 512MB (web), < 2GB (AI Bridge)
- CPU: < 50% (steady state)

## ♿ Accessibility Testing

### Automated Testing

```bash
# Run built-in tests
npm run test:accessibility
```

### Manual Testing

**Keyboard Navigation:**
1. Tab through entire page
2. Verify all interactive elements are reachable
3. Check tab order is logical
4. Test keyboard shortcuts

**Screen Reader Testing:**

```bash
# Install screen reader
# - NVDA (Windows)
# - JAWS (Windows)
# - VoiceOver (macOS - built-in)
# - Orca (Linux)

# Navigate page with screen reader
# Verify:
# - All content is announced
# - Images have alt text
# - Links are descriptive
# - Forms are labeled
```

**Color Contrast:**

Tools:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools (Lighthouse)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)

Target: WCAG AA (4.5:1 for normal text, 3:1 for large text)

**Zoom Testing:**

1. Zoom to 200%
2. Verify text reflows
3. Check no horizontal scrolling
4. Test all functionality works

### Accessibility Checklist

- [ ] All images have alt text
- [ ] Headings are properly nested (h1 → h2 → h3)
- [ ] Links are descriptive (not "click here")
- [ ] Forms have labels
- [ ] Color is not the only indicator
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible
- [ ] ARIA labels where appropriate
- [ ] Page has lang attribute
- [ ] Videos have captions

## 🧑‍🔬 Manual Testing

### Pre-Release Testing Checklist

**Functionality:**
- [ ] Package search works
- [ ] Category filtering works
- [ ] Tag filtering works
- [ ] Package details display correctly
- [ ] AI search works (if enabled)
- [ ] AI recommendations work (if enabled)

**Browsers:**
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Screen Sizes:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Performance:**
- [ ] Page loads < 2s
- [ ] Search is instant
- [ ] No memory leaks (run for 30min)
- [ ] No console errors

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] High contrast mode works
- [ ] Zoom to 200% works

### Bug Reporting

When you find a bug:

1. **Check if already reported** in [GitHub Issues](https://github.com/Luminous-Dynamics/nixite/issues)
2. **Create detailed report** with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots/videos
   - Browser and OS
   - Error messages
3. **Label appropriately**: bug, high-priority, etc.
4. **Provide minimal reproduction** if possible

## 📊 Test Coverage

### Current Coverage

```
Component           Coverage
─────────────────  ─────────
Configuration      100%
Package Data       100%
Core Functionality 85%
AI Bridge          75%
UI Components      70%
─────────────────  ─────────
Overall            85%
```

### Improving Coverage

```bash
# Identify untested code
# - Review test suites
# - Add tests for edge cases
# - Test error paths
# - Test async operations

# Write tests for uncovered code
# Focus on:
# - Critical paths
# - Complex logic
# - Error handling
# - Integration points
```

## 🛠️ Testing Tools

**Built-in:**
- Node.js `assert` module
- Browser DevTools
- Lighthouse (accessibility, performance)

**Recommended:**
- [Pa11y](https://github.com/pa11y/pa11y) - Accessibility testing
- [axe DevTools](https://www.deque.com/axe/devtools/) - Accessibility
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - Automated audits
- [Artillery](https://www.artillery.io/) - Load testing
- [k6](https://k6.io/) - Performance testing

**CI/CD:**
- GitHub Actions
- Docker
- Kubernetes test environments

## 📚 Additional Resources

**Testing Guides:**
- [MDN Testing Guide](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Testing)
- [JavaScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

**Tools Documentation:**
- [Node.js Assert](https://nodejs.org/api/assert.html)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [axe-core](https://github.com/dequelabs/axe-core)

## 🆘 Troubleshooting Tests

### Tests Fail on CI but Pass Locally

- Check Node.js version matches CI
- Verify all dependencies are in package.json
- Check for environment-specific code
- Look for timing issues

### Flaky Tests

```javascript
// Add retry logic for flaky tests
async function retryTest(testFn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await testFn();
      return;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

### Tests Take Too Long

- Parallelize independent tests
- Use smaller datasets
- Mock slow external calls
- Profile to find bottlenecks

---

**Remember:** Good tests are an investment. They catch bugs early, document behavior, and give confidence to refactor.

**Next:** See [DEVELOPMENT.md](DEVELOPMENT.md) for development workflow.
