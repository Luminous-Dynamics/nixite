#!/usr/bin/env node

/**
 * Nixite Performance Benchmarking Suite
 * Measures response times, throughput, and resource usage
 */

const http = require('http');
const { performance } = require('perf_hooks');
const { spawn } = require('child_process');

// Test configuration
const BENCHMARK_CONFIG = {
  webPort: 8000,
  bridgePort: 8890,
  iterations: 100,
  concurrency: 10,
  warmupRequests: 10
};

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '═'.repeat(70), 'cyan');
  log(`  ${message}`, 'bold');
  log('═'.repeat(70), 'cyan');
}

/**
 * Make HTTP request and measure time
 */
function httpRequest(options) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const endTime = performance.now();
        resolve({
          statusCode: res.statusCode,
          responseTime: endTime - startTime,
          bodySize: data.length,
          headers: res.headers
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Run benchmark for endpoint
 */
async function benchmarkEndpoint(name, options, iterations = BENCHMARK_CONFIG.iterations) {
  log(`\nBenchmarking: ${name}`, 'cyan');
  log(`Iterations: ${iterations}`, 'blue');

  const results = [];
  let failures = 0;

  // Warmup
  log('Warming up...', 'yellow');
  for (let i = 0; i < BENCHMARK_CONFIG.warmupRequests; i++) {
    try {
      await httpRequest(options);
    } catch (err) {
      // Ignore warmup errors
    }
  }

  // Run benchmark
  log('Running benchmark...', 'yellow');
  const benchmarkStart = performance.now();

  for (let i = 0; i < iterations; i++) {
    try {
      const result = await httpRequest(options);
      results.push(result);

      if (result.statusCode !== 200) {
        failures++;
      }
    } catch (err) {
      failures++;
    }
  }

  const benchmarkEnd = performance.now();
  const totalTime = benchmarkEnd - benchmarkStart;

  // Calculate statistics
  const responseTimes = results.map(r => r.responseTime);
  const bodySizes = results.map(r => r.bodySize);

  const stats = {
    totalRequests: iterations,
    successfulRequests: results.length,
    failedRequests: failures,
    totalTime: totalTime,
    requestsPerSecond: (iterations / totalTime) * 1000,
    avgResponseTime: avg(responseTimes),
    minResponseTime: Math.min(...responseTimes),
    maxResponseTime: Math.max(...responseTimes),
    medianResponseTime: median(responseTimes),
    p95ResponseTime: percentile(responseTimes, 95),
    p99ResponseTime: percentile(responseTimes, 99),
    avgBodySize: avg(bodySizes),
    totalDataTransferred: sum(bodySizes)
  };

  // Print results
  log('\n📊 Results:', 'bold');
  log(`  Total Requests:        ${stats.totalRequests}`, 'white');
  log(`  Successful:            ${stats.successfulRequests} (${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2)}%)`, 'green');
  log(`  Failed:                ${stats.failedRequests} (${((stats.failedRequests / stats.totalRequests) * 100).toFixed(2)}%)`, failures > 0 ? 'red' : 'white');
  log(`  Total Time:            ${stats.totalTime.toFixed(2)} ms`, 'white');
  log(`  Requests/sec:          ${stats.requestsPerSecond.toFixed(2)}`, 'cyan');
  log('\n⏱️  Response Times:', 'bold');
  log(`  Average:               ${stats.avgResponseTime.toFixed(2)} ms`, 'white');
  log(`  Min:                   ${stats.minResponseTime.toFixed(2)} ms`, 'green');
  log(`  Max:                   ${stats.maxResponseTime.toFixed(2)} ms`, 'yellow');
  log(`  Median:                ${stats.medianResponseTime.toFixed(2)} ms`, 'white');
  log(`  95th percentile:       ${stats.p95ResponseTime.toFixed(2)} ms`, 'cyan');
  log(`  99th percentile:       ${stats.p99ResponseTime.toFixed(2)} ms`, 'magenta');
  log('\n📦 Data Transfer:', 'bold');
  log(`  Avg Body Size:         ${formatBytes(stats.avgBodySize)}`, 'white');
  log(`  Total Transferred:     ${formatBytes(stats.totalDataTransferred)}`, 'cyan');

  return stats;
}

/**
 * Concurrent request benchmark
 */
async function benchmarkConcurrent(name, options, concurrency = BENCHMARK_CONFIG.concurrency, totalRequests = BENCHMARK_CONFIG.iterations) {
  log(`\nConcurrent Benchmark: ${name}`, 'cyan');
  log(`Concurrency: ${concurrency}`, 'blue');
  log(`Total Requests: ${totalRequests}`, 'blue');

  const results = [];
  const startTime = performance.now();

  // Create request batches
  const batchSize = Math.ceil(totalRequests / concurrency);
  const batches = [];

  for (let i = 0; i < concurrency; i++) {
    batches.push(
      (async () => {
        for (let j = 0; j < batchSize && (i * batchSize + j) < totalRequests; j++) {
          try {
            const result = await httpRequest(options);
            results.push(result);
          } catch (err) {
            // Track failure
          }
        }
      })()
    );
  }

  await Promise.all(batches);

  const endTime = performance.now();
  const totalTime = endTime - startTime;

  const responseTimes = results.map(r => r.responseTime);

  log('\n📊 Concurrent Results:', 'bold');
  log(`  Total Time:            ${totalTime.toFixed(2)} ms`, 'white');
  log(`  Requests/sec:          ${((totalRequests / totalTime) * 1000).toFixed(2)}`, 'cyan');
  log(`  Avg Response Time:     ${avg(responseTimes).toFixed(2)} ms`, 'white');
  log(`  95th percentile:       ${percentile(responseTimes, 95).toFixed(2)} ms`, 'cyan');

  return {
    totalTime,
    requestsPerSecond: (totalRequests / totalTime) * 1000,
    avgResponseTime: avg(responseTimes)
  };
}

/**
 * Load test - sustained traffic
 */
async function loadTest(name, options, duration = 30000, rps = 10) {
  log(`\nLoad Test: ${name}`, 'cyan');
  log(`Duration: ${duration}ms (${duration / 1000}s)`, 'blue');
  log(`Target RPS: ${rps}`, 'blue');

  const results = [];
  const startTime = performance.now();
  const interval = 1000 / rps;
  let requestCount = 0;

  while ((performance.now() - startTime) < duration) {
    const requestStart = performance.now();

    try {
      const result = await httpRequest(options);
      results.push(result);
      requestCount++;
    } catch (err) {
      // Track failure
    }

    const elapsed = performance.now() - requestStart;
    const waitTime = Math.max(0, interval - elapsed);
    await sleep(waitTime);
  }

  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const actualRPS = (requestCount / totalTime) * 1000;

  const responseTimes = results.map(r => r.responseTime);

  log('\n📊 Load Test Results:', 'bold');
  log(`  Duration:              ${totalTime.toFixed(2)} ms`, 'white');
  log(`  Total Requests:        ${requestCount}`, 'white');
  log(`  Target RPS:            ${rps}`, 'white');
  log(`  Actual RPS:            ${actualRPS.toFixed(2)}`, actualRPS >= rps * 0.9 ? 'green' : 'yellow');
  log(`  Avg Response Time:     ${avg(responseTimes).toFixed(2)} ms`, 'white');
  log(`  95th percentile:       ${percentile(responseTimes, 95).toFixed(2)} ms`, 'cyan');
  log(`  99th percentile:       ${percentile(responseTimes, 99).toFixed(2)} ms`, 'magenta');

  return {
    requestCount,
    actualRPS,
    avgResponseTime: avg(responseTimes)
  };
}

// Utility functions
function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function median(arr) {
  const sorted = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function percentile(arr, p) {
  const sorted = arr.slice().sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[index];
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main benchmark suite
 */
async function main() {
  log('\n╔══════════════════════════════════════════════════════════════════╗', 'magenta');
  log('║        NIXITE PERFORMANCE BENCHMARKING SUITE                    ║', 'magenta');
  log('╚══════════════════════════════════════════════════════════════════╝\n', 'magenta');

  const benchmarkResults = {};

  // Benchmark 1: Static file serving (index.html)
  logHeader('Benchmark 1: Static File Serving');
  benchmarkResults.staticFile = await benchmarkEndpoint(
    'GET /index.html',
    {
      hostname: 'localhost',
      port: BENCHMARK_CONFIG.webPort,
      path: '/index.html',
      method: 'GET'
    }
  );

  // Benchmark 2: Package data loading
  logHeader('Benchmark 2: Package Data Loading');
  benchmarkResults.packageData = await benchmarkEndpoint(
    'GET /nixite-packages.json',
    {
      hostname: 'localhost',
      port: BENCHMARK_CONFIG.webPort,
      path: '/nixite-packages.json',
      method: 'GET'
    }
  );

  // Benchmark 3: Configuration loading
  logHeader('Benchmark 3: Configuration Loading');
  benchmarkResults.config = await benchmarkEndpoint(
    'GET /config.js',
    {
      hostname: 'localhost',
      port: BENCHMARK_CONFIG.webPort,
      path: '/config.js',
      method: 'GET'
    }
  );

  // Benchmark 4: Concurrent requests
  logHeader('Benchmark 4: Concurrent Requests');
  benchmarkResults.concurrent = await benchmarkConcurrent(
    'Concurrent GET /index.html',
    {
      hostname: 'localhost',
      port: BENCHMARK_CONFIG.webPort,
      path: '/index.html',
      method: 'GET'
    }
  );

  // Benchmark 5: Load test (optional, commented out by default)
  // logHeader('Benchmark 5: Load Test (30s)');
  // benchmarkResults.loadTest = await loadTest(
  //   '30s sustained load',
  //   {
  //     hostname: 'localhost',
  //     port: BENCHMARK_CONFIG.webPort,
  //     path: '/index.html',
  //     method: 'GET'
  //   },
  //   30000,
  //   10
  // );

  // Final summary
  logHeader('Performance Summary');

  log('\n✅ All benchmarks completed!', 'green');
  log('\n📈 Key Metrics:', 'bold');
  log(`  Static File RPS:       ${benchmarkResults.staticFile.requestsPerSecond.toFixed(2)}`, 'cyan');
  log(`  Package Data RPS:      ${benchmarkResults.packageData.requestsPerSecond.toFixed(2)}`, 'cyan');
  log(`  Config RPS:            ${benchmarkResults.config.requestsPerSecond.toFixed(2)}`, 'cyan');
  log(`  Concurrent RPS:        ${benchmarkResults.concurrent.requestsPerSecond.toFixed(2)}`, 'cyan');

  log('\n⏱️  Average Response Times:', 'bold');
  log(`  Static File:           ${benchmarkResults.staticFile.avgResponseTime.toFixed(2)} ms`, 'white');
  log(`  Package Data:          ${benchmarkResults.packageData.avgResponseTime.toFixed(2)} ms`, 'white');
  log(`  Config:                ${benchmarkResults.config.avgResponseTime.toFixed(2)} ms`, 'white');
  log(`  Concurrent:            ${benchmarkResults.concurrent.avgResponseTime.toFixed(2)} ms`, 'white');

  // Performance grade
  const avgRPS = (
    benchmarkResults.staticFile.requestsPerSecond +
    benchmarkResults.packageData.requestsPerSecond +
    benchmarkResults.config.requestsPerSecond
  ) / 3;

  log('\n🏆 Performance Grade:', 'bold');
  if (avgRPS > 1000) {
    log('  Grade: A+ (Excellent)', 'green');
  } else if (avgRPS > 500) {
    log('  Grade: A (Very Good)', 'green');
  } else if (avgRPS > 100) {
    log('  Grade: B (Good)', 'yellow');
  } else {
    log('  Grade: C (Needs Improvement)', 'red');
  }

  log('\n' + '═'.repeat(70), 'cyan');
  log('Benchmark completed at ' + new Date().toISOString(), 'blue');
  log('═'.repeat(70) + '\n', 'cyan');

  process.exit(0);
}

// Run benchmarks
if (require.main === module) {
  main().catch(err => {
    log(`\n❌ Benchmark failed: ${err.message}`, 'red');
    console.error(err.stack);
    process.exit(1);
  });
}

module.exports = {
  benchmarkEndpoint,
  benchmarkConcurrent,
  loadTest
};
