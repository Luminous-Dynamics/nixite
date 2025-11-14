# Frequently Asked Questions (FAQ)

Common questions and answers about Nixite.

## General Questions

### What is Nixite?

Nixite is a visual package discovery tool for NixOS that makes finding and installing software easy and intuitive. It's designed to be accessible to everyone, including those new to NixOS.

### Who is Nixite for?

- **New NixOS users** who want an easy way to discover packages
- **Experienced users** who want a visual interface for browsing
- **Anyone** who prefers visual discovery over command-line searching

### Do I need NixOS to use Nixite?

Yes, Nixite is designed for NixOS. However, the web interface works on any OS - you just won't be able to install packages without NixOS.

### Is Nixite free?

Yes! Nixite is open source under the MIT License. It's completely free to use, modify, and distribute.

## Installation & Setup

### How do I install Nixite?

Choose your preferred method:
1. **Quick Start**: `./start.sh`
2. **Docker**: `docker-compose up`
3. **NixOS Module**: Add to `configuration.nix`
4. **Systemd**: Copy service files

See [README.md](../README.md) for detailed instructions.

### What are the system requirements?

- **Python 3.8+** (for web server)
- **Node.js 14+** (optional, for AI features)
- **Modern web browser** (Firefox, Chrome, etc.)
- **NixOS or Nix** (for package installation)

### Do I need to install anything?

Minimal installation required:
- Python 3 (usually pre-installed)
- Optional: Node.js for AI features
- That's it!

### Can I run Nixite without Node.js?

Yes! Node.js is only needed for AI-powered features. The core functionality works with just Python.

## Usage Questions

### How do I search for packages?

Three ways:
1. **Browse categories** - Click any category to explore
2. **Use search bar** - Type what you're looking for
3. **Voice input** - Click mic button and speak

### How does voice input work?

Voice input uses your browser's built-in speech recognition. Click the microphone icon and say what you need (e.g., "I need a web browser").

Browser support:
- ✅ Chrome/Chromium
- ✅ Edge
- ⚠️ Firefox (limited)
- ❌ Safari (not supported)

### Can I install multiple packages at once?

Currently, packages must be installed one at a time. Batch installation is planned for a future release.

### How do I uninstall packages?

Nixite currently focuses on discovery and installation. To uninstall:
```bash
nix-env -e package-name
```

### Where are my installed packages stored?

Packages are installed to your Nix profile:
- User packages: `~/.nix-profile/`
- System packages: `/nix/store/`

## Technical Questions

### What port does Nixite use?

Default ports:
- **8000**: Web interface
- **8890**: AI bridge (optional)

You can change these in `config.js` or via command-line arguments.

### Can I access Nixite from another computer?

Yes! Two options:
1. **Change bind address**: Edit `start.sh` to use `0.0.0.0`
2. **Use reverse proxy**: Setup nginx/caddy for secure access

See [docs/deployment/REVERSE_PROXY.md](./deployment/REVERSE_PROXY.md)

### Is my data sent anywhere?

No! Nixite runs entirely locally:
- No cloud services
- No external API calls
- No data collection
- No analytics (unless you enable them)

### How does the AI work?

The AI bridge uses:
- **HRM (Hierarchical Relationship Model)** for intent recognition
- **Gemma embeddings** for semantic understanding
- **Local processing** - nothing sent to external servers

It's optional and can run entirely offline.

### Can I customize the package list?

Yes! Edit `nixite-packages.json` to add/remove packages. See [docs/development/ADDING_PACKAGES.md](./development/ADDING_PACKAGES.md)

## Troubleshooting

### The web server won't start

Common fixes:
1. **Check port**: Is 8000 already in use?
   ```bash
   lsof -i :8000
   ```
2. **Check Python**: Is Python 3 installed?
   ```bash
   python3 --version
   ```
3. **Check permissions**: Can you write to the directory?

### I get "Package not found" errors

This means the package name doesn't match NixOS packages. Check the actual package name:
```bash
nix search nixpkgs packagename
```

### Voice input doesn't work

Voice input requires:
1. **HTTPS or localhost** (browser security requirement)
2. **Microphone permission** (browser will ask)
3. **Supported browser** (Chrome/Edge recommended)

### Installation fails

Common causes:
1. **Not on NixOS**: Nixite requires NixOS for installation
2. **Package name wrong**: Check actual NixOS package name
3. **Network issues**: Check internet connection
4. **Permission denied**: May need sudo for system packages

### The AI bridge won't connect

Check:
1. **Node.js installed**: `node --version`
2. **Bridge running**: `systemctl status nixite-bridge`
3. **Correct port**: Default is 8890
4. **Firewall**: Port not blocked

## Customization

### Can I change the theme?

Yes! The UI supports light/dark mode based on system preferences. Custom themes coming in v2.2.

### Can I add my own packages?

Yes! Edit `nixite-packages.json`:
```json
{
  "id": "my-package",
  "name": "My Package",
  "description": "What it does",
  "category": "work"
}
```

### Can I change the categories?

Categories are currently hard-coded, but customization is planned for v2.2.

### Can I use my own branding?

Yes! Nixite is MIT licensed. You can modify and rebrand as needed.

## Contributing

### How can I contribute?

Many ways to help:
1. **Report bugs**: Open an issue
2. **Suggest features**: Use feature request template
3. **Add packages**: Submit PRs with new packages
4. **Improve docs**: Documentation PRs welcome
5. **Translate**: Help internationalize Nixite

See [CONTRIBUTING.md](../CONTRIBUTING.md)

### I found a bug, what should I do?

1. **Check existing issues**: Maybe it's already reported
2. **Use bug template**: Provides all needed info
3. **Include details**: OS, browser, steps to reproduce
4. **Be patient**: We're volunteers!

### Can I request a package?

Yes! Use the package request template. Include:
- Package name
- What it does
- Why it's useful
- NixOS package name (if known)

## Security & Privacy

### Is Nixite secure?

Nixite follows security best practices:
- No external data transmission
- Input validation
- Sandboxed execution
- Regular security updates

See [SECURITY.md](../SECURITY.md)

### Do you collect any data?

No! Nixite:
- Doesn't track users
- Doesn't send analytics
- Doesn't store personal data
- Runs entirely locally

### How do I report a security issue?

See our [Security Policy](../SECURITY.md) for responsible disclosure process.

## Advanced Usage

### Can I run Nixite in a container?

Yes! See [docs/deployment/DOCKER.md](./deployment/DOCKER.md)

### Can I integrate Nixite with other tools?

The AI bridge provides an API. Documentation coming in v2.2.

### Can I run multiple instances?

Yes! Use different ports for each instance:
```bash
python3 -m http.server 8000  # Instance 1
python3 -m http.server 8001  # Instance 2
```

### How do I backup my configuration?

Your configuration is in:
- `config.js` - Application config
- `nixite-packages.json` - Package database

Just copy these files.

## Future Plans

### What's coming next?

See [ROADMAP.md](../ROADMAP.md) for detailed plans:
- v2.1: Enhanced testing, deployment guides
- v2.2: Performance improvements, advanced features
- v2.3: Mobile app, community features
- v3.0: Internationalization, plugin system

### Can I request a feature?

Yes! Use the feature request template. Be specific about:
- What problem it solves
- How you'd use it
- Why it's important

### Will there be a mobile app?

Yes! Mobile app is planned for v2.3 (Q2 2025).

## Getting Help

### Where can I get help?

1. **This FAQ**: Common questions answered here
2. **Troubleshooting Guide**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. **GitHub Issues**: For bugs and questions
4. **Discussions**: For general chat
5. **Documentation**: Comprehensive guides in `docs/`

### How do I stay updated?

- ⭐ Star the repository
- 👀 Watch for releases
- 📰 Check CHANGELOG.md

### The documentation is unclear

Please open an issue! Good docs are important to us.

---

**Still have questions?** Open an issue or start a discussion!

*Last updated: 2024-11-14*
