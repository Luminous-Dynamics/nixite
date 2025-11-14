# Support

Need help with Nixite? You're in the right place! This guide will help you get the support you need.

## 📖 Before You Ask

Please check these resources first - your question might already be answered:

### Self-Service Resources

1. **📚 Documentation** - Comprehensive guides covering all aspects
   - [README.md](./README.md) - Project overview and quick start
   - [FAQ.md](./docs/FAQ.md) - 100+ frequently asked questions
   - [Quick Reference](./docs/QUICK_REFERENCE.md) - Common tasks cheat sheet
   - [Getting Started](./docs/development/GETTING_STARTED.md) - Developer guide

2. **🔍 Search Existing Issues**
   - [Open Issues](https://github.com/Luminous-Dynamics/nixite/issues) - Current known issues
   - [Closed Issues](https://github.com/Luminous-Dynamics/nixite/issues?q=is%3Aissue+is%3Aclosed) - Previously solved problems

3. **💬 Browse Discussions**
   - [GitHub Discussions](https://github.com/Luminous-Dynamics/nixite/discussions) - Community Q&A

---

## 🆘 Getting Help

### For Users

#### Installation Problems

**Issue**: Can't get Nixite running

**Where to go**:
1. Check [Quick Start](./README.md#-quick-start) guide
2. Review [Deployment Guides](./docs/deployment/)
3. Open a [Bug Report](https://github.com/Luminous-Dynamics/nixite/issues/new?template=bug_report.yml)

**What to include**:
- Your operating system and version
- Installation method (Docker, NixOS, manual, etc.)
- Error messages (full output)
- Steps you've tried
- Output of `./verify.sh` if available

#### Package Not Working

**Issue**: Installed package doesn't work or not found

**Where to go**:
1. Check [FAQ - Package Issues](./docs/FAQ.md)
2. Verify package exists in nixpkgs: `nix search nixpkgs <package>`
3. Open a [Bug Report](https://github.com/Luminous-Dynamics/nixite/issues/new?template=bug_report.yml)

**What to include**:
- Package name from Nixite
- Error message from installation
- NixOS version: `nixos-version`
- Nix version: `nix --version`

#### Feature Not Working

**Issue**: Voice input, AI, or another feature isn't working

**Where to go**:
1. Check [Architecture Docs](./docs/ARCHITECTURE.md)
2. Verify feature requirements (Node.js for AI, modern browser for voice)
3. Check browser console for errors (F12 → Console tab)
4. Open a [Bug Report](https://github.com/Luminous-Dynamics/nixite/issues/new?template=bug_report.yml)

**What to include**:
- Feature name
- Browser and version
- Console errors (screenshot or copy/paste)
- Configuration file (if customized)

### For Developers

#### Development Setup Issues

**Issue**: Can't set up development environment

**Where to go**:
1. Follow [Getting Started Guide](./docs/development/GETTING_STARTED.md)
2. Run `./scripts/dev.sh setup`
3. Run `./verify.sh` to check installation
4. Ask in [GitHub Discussions](https://github.com/Luminous-Dynamics/nixite/discussions)

**What to include**:
- Operating system
- Node.js version: `node --version`
- Python version: `python3 --version`
- Error output

#### Code Questions

**Issue**: How does X work? How do I implement Y?

**Where to go**:
1. Read [Architecture Documentation](./docs/ARCHITECTURE.md)
2. Check [API Reference](./docs/api/BRIDGE_API.md)
3. Browse the code with inline comments
4. Ask in [GitHub Discussions](https://github.com/Luminous-Dynamics/nixite/discussions)

#### Contribution Questions

**Issue**: Want to contribute but not sure how

**Where to go**:
1. Read [Contributing Guide](./CONTRIBUTING.md)
2. Check [Contribution Pathways](./docs/CONTRIBUTION_PATHWAYS.md) for your role
3. Look for [Good First Issues](https://github.com/Luminous-Dynamics/nixite/labels/good-first-issue)
4. Ask in [GitHub Discussions](https://github.com/Luminous-Dynamics/nixite/discussions)

---

## 🐛 Reporting Bugs

Found a bug? Help us fix it!

### Before Reporting

1. **Search existing issues** - Someone may have already reported it
2. **Try the latest version** - It might already be fixed
3. **Verify it's reproducible** - Can you make it happen consistently?

### How to Report

Use our [Bug Report Template](https://github.com/Luminous-Dynamics/nixite/issues/new?template=bug_report.yml)

**Good bug reports include**:
- ✅ Clear, descriptive title
- ✅ Steps to reproduce
- ✅ Expected behavior
- ✅ Actual behavior
- ✅ Screenshots/error messages
- ✅ Environment details (OS, versions, etc.)
- ✅ Relevant configuration

**Example**:
```
Title: Voice input button not appearing in Firefox

Steps to reproduce:
1. Open Nixite in Firefox 120.0
2. Navigate to main page
3. Look for microphone button

Expected: Microphone button visible in bottom right
Actual: No microphone button appears

Environment:
- Firefox 120.0 on macOS 13.6
- Nixite v2.1.0
- config.js: voiceInput: true (confirmed)

Console errors:
SpeechRecognition is not defined (voice-input.js:15)
```

---

## 💡 Requesting Features

Have an idea to make Nixite better?

### Feature Requests

Use our [Feature Request Template](https://github.com/Luminous-Dynamics/nixite/issues/new?template=feature_request.yml)

**Good feature requests include**:
- ✅ Clear description of the feature
- ✅ Why you need it (use case)
- ✅ How it would work
- ✅ Alternatives you've considered
- ✅ Willingness to contribute (optional)

### Package Requests

Want to add a package to Nixite's database?

Use our [Package Request Template](https://github.com/Luminous-Dynamics/nixite/issues/new?template=package_request.yml)

**Include**:
- Package name (NixOS package name)
- Category it belongs to
- Brief description
- Why it's useful

---

## 🔒 Security Issues

**⚠️ DO NOT report security vulnerabilities publicly**

See [SECURITY.md](./SECURITY.md) for responsible disclosure:
- Email security contact (specified in SECURITY.md)
- Include detailed description
- We'll respond within 7 days
- Coordinated disclosure after fix

---

## 💬 Community Support

### GitHub Discussions

[Start a Discussion](https://github.com/Luminous-Dynamics/nixite/discussions/new)

**When to use**:
- General questions
- Ideas and brainstorming
- Show and tell
- Community help

**Categories**:
- 💬 **General** - Anything Nixite-related
- 💡 **Ideas** - Feature brainstorming
- 🙏 **Q&A** - Ask the community
- 📣 **Announcements** - Project updates
- 🎉 **Show and Tell** - Share your setups

### Response Times

We aim for:
- 🐛 **Bugs**: Response within 48 hours
- 💡 **Features**: Response within 1 week
- ❓ **Questions**: Response within 72 hours
- 🔒 **Security**: Response within 24 hours (see SECURITY.md)

*Note: We're a community-driven project. Response times may vary.*

---

## 📚 Additional Resources

### Official Documentation
- [README.md](./README.md) - Project overview
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Community guidelines
- [SECURITY.md](./SECURITY.md) - Security policy
- [docs/](./docs) - Comprehensive documentation

### External Resources
- [NixOS Manual](https://nixos.org/manual/nixos/stable/)
- [Nix Package Search](https://search.nixos.org/packages)
- [NixOS Wiki](https://nixos.wiki/)
- [NixOS Discourse](https://discourse.nixos.org/)

### Deployment-Specific
- [Docker Documentation](https://docs.docker.com/)
- [systemd Manual](https://www.freedesktop.org/software/systemd/man/)
- [NixOS Options Search](https://search.nixos.org/options)

---

## ✅ Support Checklist

Before asking for help, have you:

- [ ] Checked the [FAQ](./docs/FAQ.md)?
- [ ] Searched [existing issues](https://github.com/Luminous-Dynamics/nixite/issues)?
- [ ] Read the relevant documentation?
- [ ] Tried the latest version?
- [ ] Included all required information?
- [ ] Followed the [Code of Conduct](./CODE_OF_CONDUCT.md)?

---

## 🎯 Quick Links

| I want to... | Go here |
|--------------|---------|
| Report a bug | [Bug Report Template](https://github.com/Luminous-Dynamics/nixite/issues/new?template=bug_report.yml) |
| Request a feature | [Feature Request Template](https://github.com/Luminous-Dynamics/nixite/issues/new?template=feature_request.yml) |
| Request a package | [Package Request Template](https://github.com/Luminous-Dynamics/nixite/issues/new?template=package_request.yml) |
| Ask a question | [GitHub Discussions](https://github.com/Luminous-Dynamics/nixite/discussions) |
| Report security issue | [SECURITY.md](./SECURITY.md) |
| Contribute code | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| Read docs | [docs/](./docs) |
| Get started developing | [Getting Started Guide](./docs/development/GETTING_STARTED.md) |

---

## 🤝 We're Here to Help!

Remember, there are no stupid questions! Everyone was a beginner once.

- Be respectful and patient
- Follow our [Code of Conduct](./CODE_OF_CONDUCT.md)
- Help others when you can
- Share your knowledge

**Thank you for being part of the Nixite community!** 💜

---

*Last Updated: November 14, 2024*
*Version: 1.0*
