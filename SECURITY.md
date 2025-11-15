# Security Policy

## Supported Versions

We actively support the following versions of Nixite with security updates:

| Version | Supported          | End of Life |
| ------- | ------------------ | ----------- |
| 2.1.x   | ✅ Yes             | TBD         |
| 2.0.x   | ✅ Yes             | 2026-01-01  |
| 1.x.x   | ⚠️ Security only   | 2025-06-01  |
| < 1.0   | ❌ No              | 2024-12-01  |

**Current stable version:** 2.1.0

**Update recommendation:** We strongly recommend always running the latest stable version.

## Reporting a Vulnerability

We take the security of Nixite seriously. If you believe you have found a security vulnerability, please report it to us responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by:

1. **Email**: Send details to security@luminousdynamics.org
   - Use "Nixite Security Vulnerability" in the subject line
   - Include detailed information (see below)

2. **Private Security Advisory**: Use GitHub's private vulnerability reporting
   - Go to the Security tab → Report a vulnerability
   - Fill out the advisory form

### What to Include

Please include as much of the following information as possible:

- **Type of vulnerability** (e.g., XSS, CSRF, code injection, etc.)
- **Full path** of affected source file(s)
- **Location** of the affected code (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact** of the vulnerability and how an attacker might exploit it
- **Possible fixes** (if you have ideas)

### What to Expect

After you submit a vulnerability report:

1. **Acknowledgment**: We'll acknowledge receipt within 48 hours
2. **Assessment**: We'll investigate and assess the severity (1-7 days)
3. **Updates**: We'll keep you informed of our progress
4. **Resolution**: We'll work on a fix and coordinate disclosure
5. **Credit**: We'll credit you in the security advisory (unless you prefer to remain anonymous)

### Response Timeline

- **Critical vulnerabilities**: Patch within 7 days
- **High severity**: Patch within 14 days
- **Medium severity**: Patch within 30 days
- **Low severity**: Include in next regular release

## Security Best Practices

### For Users

1. **Keep Updated**: Always use the latest version of Nixite
2. **Review Permissions**: Understand what permissions Nixite needs
3. **Secure Your System**: Keep your NixOS system updated
4. **Report Issues**: If something seems suspicious, report it
5. **Use HTTPS**: Always access Nixite over HTTPS in production

### For Developers

1. **Input Validation**: Always validate and sanitize user input
2. **No Secrets in Code**: Never commit API keys, tokens, or credentials
3. **Dependency Updates**: Keep dependencies updated
4. **Security Review**: Request security review for sensitive changes
5. **Principle of Least Privilege**: Request only necessary permissions

## Known Security Considerations

### Client-Side Application

Nixite is primarily a client-side web application that:
- Runs in the user's browser
- Makes API calls to localhost services
- Executes package installation commands with user permissions

### Package Installation

When installing packages:
- Nixite uses the NixOS package manager
- Installation runs with the user's permissions
- No privilege escalation without explicit `sudo`
- All installations are logged

### AI Bridge (Optional)

If using the AI bridge:
- Python backend runs locally
- No external data transmission by default
- Intent recognition happens locally
- Optional: Can connect to Luminous Nix backend

## Vulnerability Disclosure Policy

### Our Commitment

- We will work with security researchers in good faith
- We won't pursue legal action for responsible disclosure
- We'll keep you updated on fix progress
- We'll credit researchers (unless they prefer anonymity)

### Responsible Disclosure

We ask that you:
- Give us reasonable time to fix issues before public disclosure
- Make a good faith effort to avoid privacy violations
- Don't exploit vulnerabilities beyond what's needed for demonstration
- Don't access or modify data without permission

### Public Disclosure

After a vulnerability is fixed:
- We'll publish a security advisory
- We'll update CHANGELOG.md with security notes
- We'll credit the researcher (if they agree)
- We'll notify users through our channels

## Security Features

### Current Security Measures

- ✅ No external dependencies for core functionality
- ✅ Client-side operation (no cloud data storage)
- ✅ Input validation and sanitization
- ✅ CORS protection for API endpoints
- ✅ No eval() or unsafe code execution
- ✅ CSP headers recommended for production

### Planned Security Enhancements

- 🔄 Regular security audits
- 🔄 Automated dependency vulnerability scanning
- 🔄 Security-focused CI/CD checks
- 🔄 Penetration testing
- 🔄 Security documentation

## Security Updates

Security updates are announced through:

1. **GitHub Security Advisories**: https://github.com/Luminous-Dynamics/nixite/security/advisories
2. **Release Notes**: Check CHANGELOG.md for security fixes
3. **Mailing List**: Subscribe for security notifications (coming soon)

## Bug Bounty Program

We currently do not have a bug bounty program, but we deeply appreciate security research and will:

- Publicly acknowledge your contribution
- Credit you in our security advisories
- Feature you in our contributors list
- Provide a letter of recommendation (upon request)

## Security Contact

- **Email**: security@luminousdynamics.org
- **PGP Key**: (Coming soon)
- **GitHub**: Use private vulnerability reporting

## Questions?

If you have questions about this security policy:
- Open a discussion on GitHub
- Email us at security@luminousdynamics.org
- Check our documentation

---

**Thank you for helping keep Nixite and our users safe!** 🔒

*Last updated: 2024-11-14*
