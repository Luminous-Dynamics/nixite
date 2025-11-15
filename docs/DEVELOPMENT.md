# Nixite Development Guide

Complete guide for developers working on Nixite.

## 📋 Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Debugging](#debugging)
- [Building and Packaging](#building-and-packaging)
- [Contributing](#contributing)

## 🚀 Development Environment Setup

### Prerequisites

**Required:**
- Git
- Python 3.8+
- Node.js 14+
- npm 6+
- Text editor/IDE (VS Code recommended)

**Optional:**
- Docker & Docker Compose
- Ollama (for AI features)
- kubectl (for K8s development)
- Terraform (for infrastructure development)

### Quick Setup

```bash
# Clone repository
git clone https://github.com/Luminous-Dynamics/nixite.git
cd nixite

# Create development branch
git checkout -b feature/your-feature-name

# Install development dependencies (if any)
npm install

# Start development servers
npm run dev          # Web interface on :8000
npm run bridge       # AI Bridge on :8890 (optional)
```

### VS Code Setup (Recommended)

1. **Install recommended extensions:**

```bash
# Open VS Code
code .

# Install extensions (auto-prompted)
# Or manually install:
# - ESLint
# - Prettier
# - EditorConfig
# - GitLens
```

2. **VS Code settings are pre-configured:**
   - `.vscode/settings.json` - Editor settings
   - `.vscode/extensions.json` - Recommended extensions
   - `.editorconfig` - Code formatting

3. **Use integrated terminal:**
   - Press `` Ctrl+` `` to open terminal
   - Run development commands directly

### Dev Container Setup (Optional)

For isolated development environment:

```bash
# Open in VS Code
code .

# Reopen in Container
# Command Palette (Ctrl+Shift+P) > "Reopen in Container"

# Everything is pre-configured!
```

The dev container includes:
- Node.js 18
- Python 3.11
- All development tools
- Port forwarding (8000, 8890, 11434)

## 📁 Project Structure

```
nixite/
├── index.html                    # Main web interface
├── nixite-luminous.js            # Frontend JavaScript logic
├── nixite-luminous.css           # Styles and theming
├── nixite-luminous-bridge.js     # AI Bridge backend
├── nixite-packages.json          # Package database
├── config.js                     # Configuration
├── package.json                  # Node.js metadata
│
├── docs/                         # Documentation
│   ├── INDEX.md                  # Documentation index
│   ├── ARCHITECTURE.md           # System architecture
│   ├── AI_BRIDGE.md              # AI component docs
│   ├── DEVELOPMENT.md            # This file
│   ├── TESTING.md                # Testing guide
│   ├── QUICKSTART.md             # Quick start guide
│   ├── INSTALL.md                # Installation guide
│   ├── TROUBLESHOOTING.md        # Problem solving
│   ├── MONITORING.md             # Observability guide
│   ├── RUNBOOK.md                # Operations runbook
│   ├── UPGRADE.md                # Migration guide
│   ├── HIGH_AVAILABILITY.md      # HA patterns
│   ├── CHEATSHEET.md             # Quick reference
│   └── api/
│       └── openapi.yaml          # API specification
│
├── tests/                        # Test suites
│   ├── config.test.js            # Configuration tests
│   ├── packages.test.js          # Package validation
│   ├── integration.test.js       # Integration tests
│   ├── performance.test.js       # Performance benchmarks
│   └── accessibility.test.js     # WCAG compliance
│
├── scripts/                      # Automation scripts
│   ├── health-check.sh           # Health validation
│   ├── stats.sh                  # Project statistics
│   └── setup-labels.sh           # GitHub labels
│
├── examples/                     # Example configurations
│   ├── nixos/                    # NixOS examples
│   │   ├── flake-integration.nix
│   │   ├── advanced-config.nix
│   │   └── README.md
│   └── security/                 # Security hardening
│       ├── nginx-hardened.conf
│       ├── docker-security.yml
│       └── README.md
│
├── k8s/                          # Kubernetes manifests
│   ├── manifests/
│   │   └── nixite.yaml
│   ├── dashboards/
│   │   └── nixite-overview.json
│   ├── prometheus/
│   │   └── alerts.yaml
│   └── README.md
│
├── terraform/                    # Infrastructure as Code
│   ├── aws/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars.example
│   └── README.md
│
├── .github/                      # GitHub configuration
│   ├── workflows/                # CI/CD pipelines
│   │   ├── ci.yml
│   │   ├── release.yml
│   │   └── security.yml
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── labels.json
│   └── README.md
│
├── .devcontainer/                # Dev container config
│   ├── devcontainer.json
│   └── setup.sh
│
├── .vscode/                      # VS Code settings
│   ├── settings.json
│   └── extensions.json
│
├── Dockerfile                    # Container image
├── docker-compose.yml            # Docker Compose config
├── .editorconfig                 # Editor configuration
├── .gitignore                    # Git ignore rules
├── LICENSE                       # MIT License
└── README.md                     # Project overview
```

## 🔄 Development Workflow

### 1. Create Feature Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Naming conventions:
# - feature/feature-name    (new features)
# - fix/bug-description     (bug fixes)
# - docs/topic              (documentation)
# - refactor/component      (code refactoring)
# - test/test-description   (test improvements)
```

### 2. Make Changes

**Frontend Changes (HTML/CSS/JS):**

```bash
# Start web server
npm run dev
# or
python3 -m http.server 8000

# Edit files:
# - index.html
# - nixite-luminous.js
# - nixite-luminous.css

# Changes are live! Just refresh browser
```

**Backend Changes (AI Bridge):**

```bash
# Edit nixite-luminous-bridge.js

# Restart server to see changes
npm run bridge
```

**Package Data:**

```bash
# Edit nixite-packages.json
# Validate JSON:
python3 -m json.tool nixite-packages.json

# Run package tests:
npm run test:packages
```

### 3. Test Changes

```bash
# Run all tests
npm run test:all

# Run specific tests
npm run test:config       # Configuration
npm run test:packages     # Package validation
npm run test:integration  # Integration tests
npm run test:performance  # Performance benchmarks
npm run test:accessibility # WCAG compliance

# Manual testing
# - Test in browser
# - Test different screen sizes
# - Test keyboard navigation
# - Test AI features (if applicable)
```

### 4. Lint and Format

```bash
# Format code (if formatter is set up)
npm run format

# Lint code
npm run lint

# Or manually:
# Check JS syntax
node -c nixite-luminous.js

# Validate JSON
python3 -m json.tool nixite-packages.json > /dev/null
```

### 5. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add dark mode toggle

- Implement theme switcher in header
- Store preference in localStorage
- Add CSS custom properties for colors
- Update documentation

Closes #123"

# Commit message format:
# <type>: <subject>
#
# <body>
#
# <footer>
#
# Types: feat, fix, docs, style, refactor, test, chore
```

### 6. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# - Go to repository
# - Click "Pull Request"
# - Fill out PR template
# - Request review
```

### 7. Address Review Feedback

```bash
# Make requested changes
# ... edit files ...

# Commit changes
git add .
git commit -m "refactor: address PR feedback

- Simplify theme toggle logic
- Add JSDoc comments
- Fix edge case in dark mode detection"

# Push updates
git push origin feature/your-feature-name

# PR automatically updates!
```

## 📏 Coding Standards

### JavaScript

**Style Guide:**
- Use ES6+ features where appropriate
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks
- Use template literals for strings
- 2-space indentation
- Semicolons required
- Max line length: 100 characters

**Example:**

```javascript
// Good
const getPackagesByCategory = (packages, category) => {
  return packages.filter(pkg => pkg.category === category);
};

// Bad
var getPackagesByCategory = function(packages, category) {
    var result = []
    for (var i = 0; i < packages.length; i++) {
        if (packages[i].category == category) result.push(packages[i])
    }
    return result
}
```

**Naming Conventions:**
- Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Functions: `camelCase`
- Classes: `PascalCase`
- Private properties: `_leadingUnderscore`

**Documentation:**

```javascript
/**
 * Search packages using natural language query
 * @param {string} query - User search query
 * @param {Array} packages - Package database
 * @returns {Promise<Array>} Matching packages with relevance scores
 */
async function searchPackagesWithAI(query, packages) {
  // Implementation
}
```

### HTML

- Semantic HTML5 elements
- Proper heading hierarchy (h1 → h2 → h3)
- ARIA labels where needed
- Alt text for all images
- Valid HTML (use validator)

```html
<!-- Good -->
<article class="package-card" role="article">
  <header>
    <h3 class="package-name">Firefox</h3>
  </header>
  <div class="package-description">
    <p>Open-source web browser</p>
  </div>
</article>

<!-- Bad -->
<div class="card">
  <div class="name">Firefox</div>
  <div>Open-source web browser</div>
</div>
```

### CSS

- Mobile-first approach
- Use CSS custom properties for theming
- BEM naming convention (optional)
- Group related properties
- Avoid `!important` unless necessary

```css
/* Good */
:root {
  --color-primary: #4CAF50;
  --color-secondary: #2196F3;
  --spacing-unit: 8px;
}

.package-card {
  padding: calc(var(--spacing-unit) * 2);
  background-color: var(--color-primary);
  border-radius: 4px;
}

/* Bad */
.card {
  padding: 16px !important;
  background-color: #4CAF50;
  border-radius: 4px;
  margin: 10px;
  color: white;
}
```

### JSON

- 2-space indentation
- No trailing commas
- Alphabetical ordering of keys (where logical)
- Validate before committing

```json
{
  "category": "Create",
  "description": "Powerful image editor",
  "name": "GIMP",
  "tags": ["graphics", "photo-editing", "creative"]
}
```

### Git Commit Messages

**Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(ai-bridge): add caching for AI responses

Implement LRU cache for AI search results to improve
performance and reduce Ollama API calls.

- Add cache with 100-item limit
- Set TTL to 5 minutes
- Add cache statistics endpoint

Closes #45
```

```
fix(ui): correct package card alignment on mobile

Package cards were overflowing container on screens
smaller than 480px. Fixed by adjusting grid layout.

Fixes #67
```

## 🧪 Testing

See [TESTING.md](TESTING.md) for detailed testing guide.

**Quick Reference:**

```bash
# Run all tests
npm run test:all

# Run specific test suite
npm run test:config
npm run test:packages
npm run test:integration
npm run test:performance
npm run test:accessibility

# Watch mode (manual)
while true; do npm run test:config; sleep 2; done
```

**Writing Tests:**

```javascript
// tests/my-feature.test.js
#!/usr/bin/env node

const assert = require('assert');

// Test cases
function testMyFeature() {
  const result = myFeature('input');
  assert.strictEqual(result, 'expected');
  console.log('✓ My feature works correctly');
}

// Run tests
try {
  testMyFeature();
  console.log('All tests passed!');
  process.exit(0);
} catch (err) {
  console.error('Test failed:', err.message);
  process.exit(1);
}
```

## 🐛 Debugging

### Browser DevTools

**Open DevTools:**
- Chrome/Edge: `F12` or `Ctrl+Shift+I`
- Firefox: `F12`
- Safari: Enable in Preferences, then `Cmd+Option+I`

**Useful Panels:**
- **Console:** View logs, errors, run commands
- **Network:** Monitor HTTP requests
- **Elements:** Inspect DOM and CSS
- **Sources:** Debug JavaScript with breakpoints
- **Performance:** Profile performance issues

**Debug JavaScript:**

```javascript
// Add breakpoints in code
debugger;

// Log to console
console.log('Debug:', variable);
console.table(arrayOfObjects);
console.group('Group Name');
console.log('Item 1');
console.log('Item 2');
console.groupEnd();
```

### Node.js Debugging

**Using Node Inspector:**

```bash
# Start with inspector
node --inspect nixite-luminous-bridge.js

# Or break on first line
node --inspect-brk nixite-luminous-bridge.js

# Open chrome://inspect in Chrome
# Click "inspect" on your process
```

**Using VS Code Debugger:**

1. Add breakpoint in code (click line number)
2. Press `F5` to start debugging
3. Use debug console to evaluate expressions

**Debug Configuration (.vscode/launch.json):**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug AI Bridge",
      "program": "${workspaceFolder}/nixite-luminous-bridge.js",
      "console": "integratedTerminal"
    }
  ]
}
```

### Logging Best Practices

```javascript
// Different log levels
console.log('Info: Normal operation');
console.warn('Warning: Unexpected condition');
console.error('Error: Something failed');

// Structured logging
const log = (level, message, data = {}) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data
  }));
};

log('info', 'Package search completed', { query: 'firefox', results: 5 });
```

### Performance Debugging

```javascript
// Measure execution time
console.time('search');
const results = searchPackages(query);
console.timeEnd('search');

// Profile with Chrome DevTools
// Performance tab → Record → Perform action → Stop → Analyze
```

## 📦 Building and Packaging

### Docker Build

```bash
# Build web interface image
docker build -t nixite:latest .

# Build AI Bridge image
docker build -t nixite-bridge:latest -f Dockerfile.bridge .

# Test images
docker run -p 8000:8000 nixite:latest
docker run -p 8890:8890 nixite-bridge:latest
```

### Multi-platform Docker Build

```bash
# Set up buildx
docker buildx create --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/luminous-dynamics/nixite:latest \
  --push \
  .
```

### Release Process

1. **Update version:**

```bash
# Update package.json version
npm version patch  # or minor, major
```

2. **Update CHANGELOG:**

```bash
# Add release notes to CHANGELOG.md
## [2.1.1] - 2025-01-15
### Added
- New feature X
### Fixed
- Bug Y
```

3. **Create release:**

```bash
# Tag release
git tag -a v2.1.1 -m "Release v2.1.1"
git push origin v2.1.1

# GitHub Actions will automatically:
# - Build Docker images
# - Create GitHub Release
# - Generate changelog
```

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for complete contribution guidelines.

**Quick Checklist:**

Before submitting PR:
- [ ] Code follows style guide
- [ ] All tests pass (`npm run test:all`)
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commits follow convention
- [ ] PR description is complete
- [ ] No sensitive data in code

## 📚 Additional Resources

**Learning:**
- [MDN Web Docs](https://developer.mozilla.org/) - Web platform documentation
- [Node.js Documentation](https://nodejs.org/docs/) - Node.js API reference
- [NixOS Manual](https://nixos.org/manual/nixos/stable/) - NixOS documentation

**Tools:**
- [VS Code](https://code.visualstudio.com/) - Recommended IDE
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools) - Browser debugging
- [Postman](https://www.postman.com/) - API testing
- [Docker Desktop](https://www.docker.com/products/docker-desktop) - Container development

**Nixite Documentation:**
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [TESTING.md](TESTING.md) - Testing guide
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
- [API Documentation](api/openapi.yaml) - AI Bridge API

## 💡 Development Tips

**Productivity:**
- Use VS Code shortcuts (Ctrl+P for file search, Ctrl+Shift+F for project search)
- Keep browser DevTools open while developing
- Use git aliases for common commands
- Write tests as you code, not after

**Code Quality:**
- Small, focused commits
- Write self-documenting code
- Add comments for complex logic
- Keep functions small and single-purpose
- Use meaningful variable names

**Performance:**
- Profile before optimizing
- Use browser caching
- Minimize DOM manipulations
- Debounce user input handlers
- Lazy load when possible

**Security:**
- Never commit secrets
- Validate all input
- Sanitize user data
- Use HTTPS in production
- Keep dependencies updated

## 🆘 Getting Help

**Stuck? Try these resources:**

1. **Documentation** - Check [INDEX.md](INDEX.md) for all docs
2. **Issues** - Search [GitHub Issues](https://github.com/Luminous-Dynamics/nixite/issues)
3. **Discussions** - Ask in [GitHub Discussions](https://github.com/Luminous-Dynamics/nixite/discussions)
4. **Community** - Join our community channels (see README)

**Before asking for help:**
- Search existing issues and discussions
- Check TROUBLESHOOTING.md
- Try to create minimal reproduction
- Provide full error messages and logs

---

**Happy coding!** 🚀

Remember: Good code is code that other developers can understand and maintain. Write code you'd be happy to debug at 3 AM.
