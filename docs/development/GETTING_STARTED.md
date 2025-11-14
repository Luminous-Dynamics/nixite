# Development Setup Guide

Get started developing Nixite in under 10 minutes.

## Prerequisites

- **Git**: For cloning the repository
- **Python 3.8+**: For the web server
- **Node.js 14+**: For AI features (optional)
- **Text Editor**: VS Code, Vim, Emacs, etc.
- **NixOS or Nix**: For testing installations

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Luminous-Dynamics/nixite.git
cd nixite
```

### 2. Verify Installation

```bash
./verify.sh
```

This checks all dependencies and files.

### 3. Start Development Server

```bash
./start.sh
```

Or manually:
```bash
python3 -m http.server 8000
```

### 4. Open in Browser

Navigate to: http://localhost:8000

## Development Environment

### Recommended Setup

**VS Code** with extensions:
- ESLint
- Prettier
- Live Server
- GitLens

**Browser DevTools**:
- Firefox Developer Edition (recommended)
- Chrome DevTools

### Configuration

Use the development config:
```bash
cp examples/developer-config.js config.js
```

This enables:
- Verbose logging
- All features
- Longer timeouts
- Fast animations

## Project Structure

```
nixite/
├── index.html              # Main application
├── config.js               # Configuration
├── nixite-packages.json    # Package database
│
├── JavaScript Modules
│   ├── install-manager.js
│   ├── nixite-luminous-bridge.js
│   ├── ui-feedback-enhancements.js
│   └── voice-input.js
│
├── tests/                  # Test files
├── docs/                   # Documentation
├── examples/               # Example configurations
├── nix/                    # NixOS integration
└── .github/                # CI/CD workflows
```

## Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

Edit files as needed. The web server will auto-reload for HTML/CSS changes.

For JavaScript changes, refresh the browser.

### 3. Test Your Changes

```bash
# Run tests
npm test

# Verify installation
./verify.sh

# Manual testing
./start.sh
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add your feature"
```

Follow [conventional commits](https://www.conventionalcommits.org/).

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub.

## Common Tasks

### Adding a New Package

Edit `nixite-packages.json`:
```json
{
  "id": "package-name",
  "name": "Display Name",
  "description": "What it does",
  "category": "work"
}
```

Categories: `create`, `connect`, `grow`, `work`, `play`, `secure`, `manage`, `serve`

### Modifying the UI

Main HTML is in `index.html`. CSS is inline (lines 12-790).

For JavaScript, check:
- Inline script (lines 902+)
- External modules (`*.js` files)

### Testing Locally

```bash
# Run all tests
npm test

# Run specific test
npm run test:config
npm run test:packages

# Verify installation
./verify.sh
```

### Debugging

**Browser Console**:
1. Open DevTools (F12)
2. Check Console tab for errors
3. Use `console.log()` for debugging

**Network Tab**:
- Monitor API calls
- Check for failed requests
- Inspect responses

**Application Tab**:
- View localStorage
- Check session data

## Development Workflow

### Typical Flow

1. **Plan**: Understand what you're building
2. **Branch**: Create feature branch
3. **Code**: Make your changes
4. **Test**: Run tests and verify
5. **Commit**: Clear, descriptive commits
6. **PR**: Submit pull request
7. **Review**: Address feedback
8. **Merge**: Celebrate! 🎉

### Best Practices

- **Small commits**: One logical change per commit
- **Test everything**: Before committing
- **Clear messages**: Descriptive commit messages
- **Ask questions**: If unsure, ask!

## Testing

### Running Tests

```bash
npm test                 # All tests
npm run test:config      # Config tests
npm run test:packages    # Package data tests
```

### Writing Tests

Add tests to `tests/` directory:
```javascript
describe('Your Feature', () => {
    it('should work correctly', () => {
        assert.ok(true);
    });
});
```

### Manual Testing

Checklist:
- [ ] Package loading works
- [ ] Search functionality works
- [ ] Categories expand/collapse
- [ ] Installation buttons appear
- [ ] No console errors
- [ ] Responsive on mobile

## Debugging Common Issues

### Port 8000 in use

```bash
# Find what's using it
lsof -i :8000

# Kill it
kill -9 <PID>

# Or use different port
python3 -m http.server 8001
```

### JavaScript not updating

Hard refresh:
- **Windows/Linux**: Ctrl+F5
- **Mac**: Cmd+Shift+R

### Changes not appearing

Check:
1. File saved?
2. Browser cache cleared?
3. Correct file being edited?

## Tools & Resources

### Recommended Tools

- **Browser DevTools**: Inspect, debug, profile
- **Git**: Version control
- **curl**: Test API endpoints
- **jq**: Parse JSON responses

### Learning Resources

- [JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [NixOS Manual](https://nixos.org/manual/nixos/stable/)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)

### Getting Help

- **Documentation**: Check `docs/` directory
- **FAQ**: See [docs/FAQ.md](../FAQ.md)
- **Issues**: GitHub issues
- **Discussions**: GitHub discussions

## Next Steps

Once comfortable with basics:

1. **Read the code**: Understand how it works
2. **Fix a bug**: Start with good first issues
3. **Add a feature**: Something you'd use
4. **Improve docs**: Help others learn
5. **Review PRs**: Help other contributors

## Code Style

### JavaScript

- Use `const` and `let` (not `var`)
- Arrow functions for callbacks
- Descriptive variable names
- Comments for complex logic

### HTML

- Semantic HTML5 elements
- Proper indentation
- Accessibility attributes (ARIA)

### CSS

- Use CSS variables
- Mobile-first approach
- Clear class names

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for detailed guidelines.

---

**Ready to contribute?** Pick an issue and get started! 🚀

*Questions? Open an issue or ask in discussions.*
