#!/usr/bin/env node

/**
 * Nixite Integration Tests
 * Tests components working together in realistic scenarios
 */

const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  webPort: 8001,
  bridgePort: 8891,
  timeout: 30000,
  retries: 3
};

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

// Test results
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

/**
 * Print colored test output
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

/**
 * Make HTTP request
 */
function httpRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(TEST_CONFIG.timeout);

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

/**
 * Wait for service to be ready
 */
async function waitForService(port, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await httpRequest({
        hostname: 'localhost',
        port: port,
        path: '/',
        method: 'GET'
      });
      return true;
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
}

/**
 * Test runner
 */
async function runTest(name, testFn) {
  testsRun++;
  try {
    await testFn();
    testsPassed++;
    logSuccess(`${name}`);
    return true;
  } catch (err) {
    testsFailed++;
    logError(`${name}`);
    console.error(`  Error: ${err.message}`);
    return false;
  }
}

/**
 * Integration Tests
 */

// Test 1: Configuration Loading
async function testConfigurationLoading() {
  const configPath = path.join(__dirname, '../config.js');

  if (!fs.existsSync(configPath)) {
    throw new Error('config.js not found');
  }

  const config = require(configPath);

  if (!config.NIXITE_CONFIG) {
    throw new Error('NIXITE_CONFIG not defined');
  }

  if (!config.NIXITE_CONFIG.api) {
    throw new Error('NIXITE_CONFIG.api not defined');
  }

  if (!config.NIXITE_CONFIG.features) {
    throw new Error('NIXITE_CONFIG.features not defined');
  }
}

// Test 2: Package Data Integrity
async function testPackageDataIntegrity() {
  const packagesPath = path.join(__dirname, '../nixite-packages.json');

  if (!fs.existsSync(packagesPath)) {
    throw new Error('nixite-packages.json not found');
  }

  const packages = JSON.parse(fs.readFileSync(packagesPath, 'utf8'));

  if (!Array.isArray(packages)) {
    throw new Error('Packages must be an array');
  }

  if (packages.length === 0) {
    throw new Error('No packages found');
  }

  // Validate each package has required fields
  packages.forEach((pkg, index) => {
    if (!pkg.id) throw new Error(`Package ${index} missing id`);
    if (!pkg.name) throw new Error(`Package ${index} missing name`);
    if (!pkg.description) throw new Error(`Package ${index} missing description`);
    if (!pkg.category) throw new Error(`Package ${index} missing category`);
  });

  // Check for duplicates
  const ids = packages.map(p => p.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    throw new Error('Duplicate package IDs found');
  }
}

// Test 3: HTML Structure
async function testHTMLStructure() {
  const indexPath = path.join(__dirname, '../index.html');

  if (!fs.existsSync(indexPath)) {
    throw new Error('index.html not found');
  }

  const html = fs.readFileSync(indexPath, 'utf8');

  // Check for required elements
  const requiredElements = [
    '<html',
    '<head>',
    '<body>',
    'config.js',
    'nixite-packages.json'
  ];

  requiredElements.forEach(element => {
    if (!html.includes(element)) {
      throw new Error(`Missing required element: ${element}`);
    }
  });
}

// Test 4: Script File Existence
async function testScriptFiles() {
  const requiredScripts = [
    'scripts/dev.sh',
    'scripts/deploy.sh',
    'scripts/validate-config.js',
    'scripts/validate-packages.js',
    'scripts/stats.sh',
    'scripts/health-check.sh'
  ];

  requiredScripts.forEach(script => {
    const scriptPath = path.join(__dirname, '..', script);
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Required script not found: ${script}`);
    }

    // Check if executable (on Unix-like systems)
    if (process.platform !== 'win32') {
      const stats = fs.statSync(scriptPath);
      if (!(stats.mode & 0o111)) {
        throw new Error(`Script not executable: ${script}`);
      }
    }
  });
}

// Test 5: Documentation Completeness
async function testDocumentation() {
  const requiredDocs = [
    'README.md',
    'CONTRIBUTING.md',
    'SECURITY.md',
    'SUPPORT.md',
    'docs/TROUBLESHOOTING.md',
    'docs/CHEATSHEET.md',
    'docs/AI_BRIDGE.md'
  ];

  requiredDocs.forEach(doc => {
    const docPath = path.join(__dirname, '..', doc);
    if (!fs.existsSync(docPath)) {
      throw new Error(`Required documentation not found: ${doc}`);
    }

    const content = fs.readFileSync(docPath, 'utf8');
    if (content.length < 100) {
      throw new Error(`Documentation seems incomplete: ${doc}`);
    }
  });
}

// Test 6: Example Files
async function testExampleFiles() {
  const requiredExamples = [
    'examples/developer-config.js',
    'examples/production-config.js',
    'examples/nixos/README.md',
    'examples/nixos/flake-integration.nix',
    'examples/reverse-proxy/nginx.conf',
    'examples/reverse-proxy/Caddyfile'
  ];

  requiredExamples.forEach(example => {
    const examplePath = path.join(__dirname, '..', example);
    if (!fs.existsSync(examplePath)) {
      throw new Error(`Required example not found: ${example}`);
    }
  });
}

// Test 7: Deployment Files
async function testDeploymentFiles() {
  const deploymentFiles = [
    'Dockerfile',
    'docker-compose.yml',
    'nixos-module.nix'
  ];

  deploymentFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Required deployment file not found: ${file}`);
    }
  });
}

// Test 8: GitHub Configuration
async function testGitHubConfiguration() {
  const githubFiles = [
    '.github/labels.json',
    '.github/README.md',
    '.github/workflows/ci.yml'
  ];

  githubFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Required GitHub file not found: ${file}`);
    }
  });

  // Validate labels.json
  const labelsPath = path.join(__dirname, '../.github/labels.json');
  const labels = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));

  if (!Array.isArray(labels) || labels.length === 0) {
    throw new Error('Invalid labels.json structure');
  }

  labels.forEach((label, index) => {
    if (!label.name) throw new Error(`Label ${index} missing name`);
    if (!label.color) throw new Error(`Label ${index} missing color`);
    if (!label.description) throw new Error(`Label ${index} missing description`);
  });
}

// Test 9: VS Code Configuration
async function testVSCodeConfiguration() {
  const vscodeFiles = [
    '.vscode/settings.json',
    '.vscode/extensions.json',
    '.vscode/tasks.json',
    '.vscode/launch.json'
  ];

  vscodeFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Required VS Code file not found: ${file}`);
    }

    // Validate JSON
    try {
      JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      throw new Error(`Invalid JSON in ${file}: ${err.message}`);
    }
  });
}

// Test 10: EditorConfig
async function testEditorConfig() {
  const editorConfigPath = path.join(__dirname, '../.editorconfig');

  if (!fs.existsSync(editorConfigPath)) {
    throw new Error('.editorconfig not found');
  }

  const content = fs.readFileSync(editorConfigPath, 'utf8');

  const requiredSettings = [
    'root = true',
    'charset = utf-8',
    'end_of_line = lf',
    'indent_style'
  ];

  requiredSettings.forEach(setting => {
    if (!content.includes(setting)) {
      throw new Error(`Missing EditorConfig setting: ${setting}`);
    }
  });
}

/**
 * Main test runner
 */
async function main() {
  log('\n╔═══════════════════════════════════════════════════════════════╗', 'blue');
  log('║         NIXITE INTEGRATION TEST SUITE                        ║', 'blue');
  log('╚═══════════════════════════════════════════════════════════════╝\n', 'blue');

  logInfo('Running integration tests...\n');

  // Run all tests
  await runTest('Configuration loading', testConfigurationLoading);
  await runTest('Package data integrity', testPackageDataIntegrity);
  await runTest('HTML structure validation', testHTMLStructure);
  await runTest('Script files existence', testScriptFiles);
  await runTest('Documentation completeness', testDocumentation);
  await runTest('Example files presence', testExampleFiles);
  await runTest('Deployment files validation', testDeploymentFiles);
  await runTest('GitHub configuration', testGitHubConfiguration);
  await runTest('VS Code configuration', testVSCodeConfiguration);
  await runTest('EditorConfig validation', testEditorConfig);

  // Summary
  log('\n' + '═'.repeat(65), 'blue');
  log(`${colors.bold}TEST SUMMARY${colors.reset}`);
  log('═'.repeat(65), 'blue');
  log(`Total:  ${testsRun}`);
  log(`Passed: ${testsPassed}`, 'green');
  log(`Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'reset');
  log('═'.repeat(65) + '\n', 'blue');

  if (testsFailed > 0) {
    logError(`${testsFailed} test(s) failed!`);
    process.exit(1);
  } else {
    logSuccess('All tests passed!');
    process.exit(0);
  }
}

// Run tests
if (require.main === module) {
  main().catch(err => {
    logError(`Fatal error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });
}

module.exports = {
  runTest,
  httpRequest,
  waitForService
};
