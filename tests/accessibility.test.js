#!/usr/bin/env node

/**
 * Nixite Accessibility Testing Suite
 * WCAG 2.1 Level AA compliance testing
 */

const http = require('http');
const { JSDOM } = require('jsdom');

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

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let warnings = 0;

function assert(condition, testName, level = 'error') {
  totalTests++;
  if (condition) {
    passedTests++;
    log(`  ✓ ${testName}`, 'green');
    return true;
  } else {
    if (level === 'warning') {
      warnings++;
      log(`  ⚠ ${testName}`, 'yellow');
    } else {
      failedTests++;
      log(`  ✗ ${testName}`, 'red');
    }
    return false;
  }
}

/**
 * Fetch HTML from local server
 */
async function fetchHTML(path = '/') {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:8000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Test 1: Semantic HTML Structure
 */
async function testSemanticHTML(dom) {
  logHeader('Test 1: Semantic HTML Structure');

  const document = dom.window.document;

  // Check for proper heading hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  assert(headings.length > 0, 'Page has heading elements');

  const h1Count = document.querySelectorAll('h1').length;
  assert(h1Count === 1, 'Page has exactly one h1 element');

  // Check heading order
  let previousLevel = 0;
  let properHierarchy = true;
  headings.forEach(heading => {
    const level = parseInt(heading.tagName[1]);
    if (level - previousLevel > 1) {
      properHierarchy = false;
    }
    previousLevel = level;
  });
  assert(properHierarchy, 'Heading hierarchy is proper (no skipped levels)', 'warning');

  // Check for landmark regions
  assert(document.querySelector('header'), 'Page has <header> landmark');
  assert(document.querySelector('main'), 'Page has <main> landmark');
  assert(document.querySelector('nav'), 'Page has <nav> landmark');

  // Check for semantic elements
  const sections = document.querySelectorAll('section');
  assert(sections.length > 0, 'Page uses <section> elements', 'warning');
}

/**
 * Test 2: Keyboard Navigation
 */
async function testKeyboardNavigation(dom) {
  logHeader('Test 2: Keyboard Navigation');

  const document = dom.window.document;

  // Check for skip links
  const skipLinks = document.querySelectorAll('a[href^="#"]');
  assert(skipLinks.length > 0, 'Page has skip navigation links', 'warning');

  // Check all interactive elements are focusable
  const buttons = document.querySelectorAll('button');
  let allButtonsAccessible = true;
  buttons.forEach(button => {
    if (button.disabled === false && button.tabIndex < 0) {
      allButtonsAccessible = false;
    }
  });
  assert(allButtonsAccessible, 'All enabled buttons are focusable');

  // Check for tab index abuse
  const tabIndexAbuse = document.querySelectorAll('[tabindex]:not([tabindex="-1"]):not([tabindex="0"])');
  assert(tabIndexAbuse.length === 0, 'No positive tabindex values (tab order should be natural)', 'warning');

  // Check links have proper href
  const links = document.querySelectorAll('a');
  let allLinksProper = true;
  links.forEach(link => {
    if (!link.href || link.href === '#' || link.href.endsWith('#')) {
      allLinksProper = false;
    }
  });
  assert(allLinksProper, 'All links have proper href attributes', 'warning');
}

/**
 * Test 3: Images and Alternative Text
 */
async function testImagesAndAltText(dom) {
  logHeader('Test 3: Images and Alternative Text');

  const document = dom.window.document;

  // Check all images have alt text
  const images = document.querySelectorAll('img');
  let allImagesHaveAlt = true;
  let decorativeImagesProper = true;

  images.forEach(img => {
    if (!img.hasAttribute('alt')) {
      allImagesHaveAlt = false;
    }
    // Decorative images should have empty alt
    if (img.alt === '' && img.title) {
      decorativeImagesProper = false;
    }
  });

  assert(allImagesHaveAlt, 'All images have alt attributes');
  assert(decorativeImagesProper, 'Decorative images have empty alt (not title)', 'warning');

  // Check for informative alt text
  let meaningfulAlt = true;
  images.forEach(img => {
    if (img.alt && (
      img.alt.toLowerCase().includes('image') ||
      img.alt.toLowerCase().includes('picture') ||
      img.alt.toLowerCase().includes('photo')
    )) {
      meaningfulAlt = false;
    }
  });
  assert(meaningfulAlt, 'Alt text is meaningful (doesn\'t just say "image")', 'warning');

  // Check SVGs have appropriate labels
  const svgs = document.querySelectorAll('svg');
  let svgsAccessible = true;
  svgs.forEach(svg => {
    if (!svg.getAttribute('role') && !svg.querySelector('title') && !svg.getAttribute('aria-label')) {
      svgsAccessible = false;
    }
  });
  assert(svgsAccessible, 'SVG images have appropriate labels or role', 'warning');
}

/**
 * Test 4: Form Accessibility
 */
async function testFormAccessibility(dom) {
  logHeader('Test 4: Form Accessibility');

  const document = dom.window.document;

  // Check form inputs have labels
  const inputs = document.querySelectorAll('input:not([type="hidden"]), textarea, select');
  let allInputsLabeled = true;

  inputs.forEach(input => {
    const hasLabel = input.labels && input.labels.length > 0;
    const hasAriaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');

    if (!hasLabel && !hasAriaLabel) {
      allInputsLabeled = false;
    }
  });

  assert(allInputsLabeled, 'All form inputs have associated labels');

  // Check for fieldsets in groups
  const radioGroups = document.querySelectorAll('input[type="radio"]');
  const checkboxGroups = document.querySelectorAll('input[type="checkbox"]');

  if (radioGroups.length > 1 || checkboxGroups.length > 1) {
    const fieldsets = document.querySelectorAll('fieldset');
    assert(fieldsets.length > 0, 'Radio/checkbox groups use fieldset with legend', 'warning');
  }

  // Check required fields are marked
  const requiredInputs = document.querySelectorAll('[required]');
  let requiredProperlyMarked = true;

  requiredInputs.forEach(input => {
    if (!input.getAttribute('aria-required') && !input.required) {
      requiredProperlyMarked = false;
    }
  });

  assert(requiredProperlyMarked, 'Required fields are properly marked');

  // Check for autocomplete attributes
  const emailInputs = document.querySelectorAll('input[type="email"]');
  let hasAutocomplete = true;

  emailInputs.forEach(input => {
    if (!input.getAttribute('autocomplete')) {
      hasAutocomplete = false;
    }
  });

  if (emailInputs.length > 0) {
    assert(hasAutocomplete, 'Email inputs have autocomplete attributes', 'warning');
  }
}

/**
 * Test 5: ARIA Usage
 */
async function testARIAUsage(dom) {
  logHeader('Test 5: ARIA Usage');

  const document = dom.window.document;

  // Check for proper ARIA landmarks
  const ariaLandmarks = document.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="contentinfo"]');
  assert(ariaLandmarks.length > 0, 'Page uses ARIA landmark roles', 'warning');

  // Check ARIA labels are meaningful
  const ariaLabels = document.querySelectorAll('[aria-label]');
  let meaningfulLabels = true;

  ariaLabels.forEach(el => {
    if (el.getAttribute('aria-label').trim().length === 0) {
      meaningfulLabels = false;
    }
  });

  assert(meaningfulLabels, 'ARIA labels are non-empty');

  // Check for aria-hidden misuse
  const ariaHidden = document.querySelectorAll('[aria-hidden="true"]');
  let ariaHiddenProper = true;

  ariaHidden.forEach(el => {
    if (el.querySelector('a, button, input, select, textarea')) {
      ariaHiddenProper = false;
    }
  });

  assert(ariaHiddenProper, 'aria-hidden doesn\'t hide focusable elements');

  // Check for invalid ARIA attributes
  const allElements = document.querySelectorAll('[aria-labelledby], [aria-describedby]');
  let validReferences = true;

  allElements.forEach(el => {
    const labelledBy = el.getAttribute('aria-labelledby');
    const describedBy = el.getAttribute('aria-describedby');

    if (labelledBy) {
      const ids = labelledBy.split(' ');
      ids.forEach(id => {
        if (!document.getElementById(id)) {
          validReferences = false;
        }
      });
    }

    if (describedBy) {
      const ids = describedBy.split(' ');
      ids.forEach(id => {
        if (!document.getElementById(id)) {
          validReferences = false;
        }
      });
    }
  });

  assert(validReferences, 'All ARIA references point to existing IDs');
}

/**
 * Test 6: Color and Contrast
 */
async function testColorAndContrast(dom) {
  logHeader('Test 6: Color and Contrast');

  const document = dom.window.document;

  // Note: True contrast testing requires computed styles and color analysis
  // This is a simplified check

  // Check for color-only information
  const styleElements = document.querySelectorAll('[style*="color"]');
  assert(styleElements.length === 0, 'No inline color styles (use CSS classes)', 'warning');

  // Check for proper focus indicators
  const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex="0"]');
  log(`  ℹ Found ${focusableElements.length} focusable elements (should have visible focus styles)`, 'blue');

  // Check for text size
  const body = document.querySelector('body');
  if (body) {
    log('  ℹ Minimum text size should be 16px for body text', 'blue');
  }
}

/**
 * Test 7: Document Language and Text
 */
async function testLanguageAndText(dom) {
  logHeader('Test 7: Document Language and Text');

  const document = dom.window.document;

  // Check html lang attribute
  const html = document.querySelector('html');
  assert(html && html.getAttribute('lang'), 'HTML element has lang attribute');

  // Check page title
  const title = document.querySelector('title');
  assert(title && title.textContent.trim().length > 0, 'Page has a meaningful title');

  // Check for proper text alternatives for icons
  const iconElements = document.querySelectorAll('[class*="icon"]');
  let iconsAccessible = true;

  iconElements.forEach(icon => {
    const hasLabel = icon.getAttribute('aria-label') || icon.getAttribute('title');
    const isDecorative = icon.getAttribute('aria-hidden') === 'true';

    if (!hasLabel && !isDecorative) {
      iconsAccessible = false;
    }
  });

  assert(iconsAccessible, 'Icon elements have labels or are marked decorative', 'warning');
}

/**
 * Test 8: Multimedia and Interactive Content
 */
async function testMultimedia(dom) {
  logHeader('Test 8: Multimedia and Interactive Content');

  const document = dom.window.document;

  // Check videos have controls
  const videos = document.querySelectorAll('video');
  let videosAccessible = true;

  videos.forEach(video => {
    if (!video.hasAttribute('controls')) {
      videosAccessible = false;
    }
  });

  if (videos.length > 0) {
    assert(videosAccessible, 'Video elements have controls');
    log('  ℹ Videos should have captions/transcripts (manual check required)', 'blue');
  }

  // Check audio elements
  const audio = document.querySelectorAll('audio');
  if (audio.length > 0) {
    log('  ℹ Audio elements should have transcripts (manual check required)', 'blue');
  }

  // Check for autoplay
  const autoplayElements = document.querySelectorAll('[autoplay]');
  assert(autoplayElements.length === 0, 'No autoplay on video/audio (WCAG 2.1 requirement)');

  // Check iframes have titles
  const iframes = document.querySelectorAll('iframe');
  let iframesAccessible = true;

  iframes.forEach(iframe => {
    if (!iframe.getAttribute('title')) {
      iframesAccessible = false;
    }
  });

  if (iframes.length > 0) {
    assert(iframesAccessible, 'Iframes have title attributes');
  }
}

/**
 * Test 9: Tables
 */
async function testTables(dom) {
  logHeader('Test 9: Data Tables');

  const document = dom.window.document;

  const tables = document.querySelectorAll('table');

  if (tables.length > 0) {
    let tablesAccessible = true;
    let hasHeaders = true;
    let hasCaption = true;

    tables.forEach(table => {
      // Check for th elements
      if (table.querySelectorAll('th').length === 0) {
        hasHeaders = false;
      }

      // Check for caption or aria-label
      if (!table.querySelector('caption') && !table.getAttribute('aria-label')) {
        hasCaption = false;
      }

      // Check scope on th elements
      const ths = table.querySelectorAll('th');
      ths.forEach(th => {
        if (!th.getAttribute('scope')) {
          tablesAccessible = false;
        }
      });
    });

    assert(hasHeaders, 'Data tables use <th> elements');
    assert(hasCaption, 'Data tables have <caption> or aria-label');
    assert(tablesAccessible, 'Table headers have scope attributes', 'warning');
  } else {
    log('  ℹ No data tables found', 'blue');
  }
}

/**
 * Test 10: Responsive and Mobile Accessibility
 */
async function testResponsiveAccessibility(dom) {
  logHeader('Test 10: Responsive and Mobile Accessibility');

  const document = dom.window.document;

  // Check viewport meta tag
  const viewport = document.querySelector('meta[name="viewport"]');
  assert(viewport !== null, 'Page has viewport meta tag');

  if (viewport) {
    const content = viewport.getAttribute('content');
    const hasUserScalableNo = content && content.includes('user-scalable=no');
    assert(!hasUserScalableNo, 'Viewport allows user scaling (no user-scalable=no)');

    const hasMaxScale = content && content.includes('maximum-scale=1');
    assert(!hasMaxScale, 'Viewport doesn\'t restrict scaling (no maximum-scale=1)');
  }

  // Check touch targets size (simplified check)
  const buttons = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
  log(`  ℹ Found ${buttons.length} interactive elements (should be min 44x44px on mobile)`, 'blue');

  // Check for horizontal scrolling
  const html = document.querySelector('html');
  if (html) {
    log('  ℹ Page should not require horizontal scrolling (manual check required)', 'blue');
  }
}

/**
 * Main test runner
 */
async function runTests() {
  log('\n╔══════════════════════════════════════════════════════════════════╗', 'magenta');
  log('║           NIXITE ACCESSIBILITY TESTING SUITE                    ║', 'magenta');
  log('║                 WCAG 2.1 Level AA Compliance                    ║', 'magenta');
  log('╚══════════════════════════════════════════════════════════════════╝\n', 'magenta');

  try {
    log('Fetching HTML from http://localhost:8000...', 'blue');
    const html = await fetchHTML('/');
    const dom = new JSDOM(html);

    // Run all tests
    await testSemanticHTML(dom);
    await testKeyboardNavigation(dom);
    await testImagesAndAltText(dom);
    await testFormAccessibility(dom);
    await testARIAUsage(dom);
    await testColorAndContrast(dom);
    await testLanguageAndText(dom);
    await testMultimedia(dom);
    await testTables(dom);
    await testResponsiveAccessibility(dom);

    // Summary
    logHeader('Accessibility Test Summary');
    log(`\n  Total Tests:     ${totalTests}`, 'white');
    log(`  Passed:          ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`, 'green');
    log(`  Failed:          ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`, failedTests > 0 ? 'red' : 'white');
    log(`  Warnings:        ${warnings} (${((warnings/totalTests)*100).toFixed(1)}%)`, warnings > 0 ? 'yellow' : 'white');

    // Compliance level
    log('\n  Compliance Level:', 'bold');
    const passRate = (passedTests / totalTests) * 100;
    if (failedTests === 0 && warnings === 0) {
      log('  ✓ WCAG 2.1 Level AA (Excellent)', 'green');
    } else if (failedTests === 0) {
      log('  ✓ WCAG 2.1 Level AA (Good, with warnings)', 'yellow');
    } else if (passRate >= 80) {
      log('  ⚠ Partial compliance (needs improvement)', 'yellow');
    } else {
      log('  ✗ Non-compliant (significant issues)', 'red');
    }

    // Manual testing reminders
    log('\n  Manual Testing Required:', 'bold');
    log('  • Color contrast ratios (use browser dev tools or contrast checker)', 'blue');
    log('  • Keyboard navigation flow (tab through page)', 'blue');
    log('  • Screen reader testing (NVDA, JAWS, VoiceOver)', 'blue');
    log('  • Zoom to 200% (text should reflow)', 'blue');
    log('  • Video captions and audio transcripts', 'blue');
    log('  • Forms error handling and validation messages', 'blue');

    // Tools recommendations
    log('\n  Recommended Tools:', 'bold');
    log('  • axe DevTools (browser extension)', 'cyan');
    log('  • WAVE (Web Accessibility Evaluation Tool)', 'cyan');
    log('  • Lighthouse (Chrome DevTools)', 'cyan');
    log('  • Pa11y (automated testing)', 'cyan');
    log('  • NVDA/JAWS/VoiceOver (screen readers)', 'cyan');

    log('\n' + '═'.repeat(70), 'cyan');
    log('Tests completed at ' + new Date().toISOString(), 'blue');
    log('═'.repeat(70) + '\n', 'cyan');

    process.exit(failedTests > 0 ? 1 : 0);

  } catch (err) {
    log(`\n✗ Tests failed: ${err.message}`, 'red');
    log('Make sure the web server is running on http://localhost:8000', 'yellow');
    console.error(err);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
