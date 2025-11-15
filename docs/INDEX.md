# Nixite Documentation Index

Complete documentation for Nixite - Visual Package Discovery for NixOS

## 📚 Documentation Navigation

### 🚀 Getting Started

**New to Nixite? Start here:**

1. [**README.md**](../README.md) - Project overview, quick start, features
2. [**QUICKSTART.md**](QUICKSTART.md) - 5-minute getting started guide
3. [**INSTALL.md**](INSTALL.md) - Installation instructions for all platforms

### 🎯 Core Documentation

**Essential reading for all users:**

- [**CONTRIBUTING.md**](../CONTRIBUTING.md) - How to contribute to Nixite
- [**LICENSE**](../LICENSE) - MIT License
- [**CODE_OF_CONDUCT.md**](../CODE_OF_CONDUCT.md) - Community guidelines
- [**CHEATSHEET.md**](CHEATSHEET.md) - Quick reference for common commands
- [**TROUBLESHOOTING.md**](TROUBLESHOOTING.md) - Solutions to common issues

### 🏗️ Architecture & Design

**Understanding how Nixite works:**

- [**ARCHITECTURE.md**](ARCHITECTURE.md) - System architecture and design decisions
- [**AI_BRIDGE.md**](AI_BRIDGE.md) - AI Bridge component documentation
- [**api/openapi.yaml**](api/openapi.yaml) - OpenAPI specification for AI Bridge API

### 🔧 Development

**For developers working on Nixite:**

- [**DEVELOPMENT.md**](DEVELOPMENT.md) - Development setup and guidelines
- [**TESTING.md**](TESTING.md) - Testing strategy and how to run tests
- [**CHEATSHEET.md**](CHEATSHEET.md) - Development commands and workflows

**Code Quality:**
- ESLint configuration: [../.eslintrc.json](../.eslintrc.json)
- Prettier configuration: [../.prettierrc](../.prettierrc)
- EditorConfig: [../.editorconfig](../.editorconfig)

### 🚢 Deployment

**Production deployment guides:**

#### Quick Deployment
- [**examples/nixos/README.md**](../examples/nixos/README.md) - NixOS deployment guide
- [**examples/nixos/flake-integration.nix**](../examples/nixos/flake-integration.nix) - Flakes integration
- [**examples/nixos/advanced-config.nix**](../examples/nixos/advanced-config.nix) - Production configuration

#### Container Deployment
- [**Dockerfile**](../Dockerfile) - Container image build
- [**docker-compose.yml**](../docker-compose.yml) - Docker Compose deployment
- [**examples/security/docker-security.yml**](../examples/security/docker-security.yml) - Hardened Docker Compose

#### Kubernetes Deployment
- [**k8s/README.md**](../k8s/README.md) - Kubernetes deployment guide
- [**k8s/manifests/nixite.yaml**](../k8s/manifests/nixite.yaml) - Complete Kubernetes manifests
- [**k8s/dashboards/nixite-overview.json**](../k8s/dashboards/nixite-overview.json) - Grafana dashboard
- [**k8s/prometheus/alerts.yaml**](../k8s/prometheus/alerts.yaml) - Prometheus alert rules

#### Infrastructure as Code
- [**terraform/README.md**](../terraform/README.md) - Terraform guide
- [**terraform/aws/main.tf**](../terraform/aws/main.tf) - AWS EKS deployment
- [**terraform/aws/variables.tf**](../terraform/aws/variables.tf) - Configuration variables

### 🔒 Security

**Security hardening and best practices:**

- [**SECURITY.md**](../SECURITY.md) - Security policy and reporting
- [**examples/security/README.md**](../examples/security/README.md) - Security hardening guide
- [**examples/security/nginx-hardened.conf**](../examples/security/nginx-hardened.conf) - Hardened Nginx config
- [**examples/security/docker-security.yml**](../examples/security/docker-security.yml) - Secure Docker Compose

**Automated Security:**
- [**.github/workflows/security.yml**](../.github/workflows/security.yml) - 7-layer security scanning
- Dependency scanning, container scanning, secret detection, SAST

### 📊 Operations

**Running and monitoring Nixite in production:**

#### Monitoring & Observability
- [**MONITORING.md**](MONITORING.md) - Complete monitoring guide
- [**HIGH_AVAILABILITY.md**](HIGH_AVAILABILITY.md) - HA deployment patterns
- [**k8s/dashboards/nixite-overview.json**](../k8s/dashboards/nixite-overview.json) - Grafana dashboard
- [**k8s/prometheus/alerts.yaml**](../k8s/prometheus/alerts.yaml) - Alert rules

#### Operations Runbooks
- [**RUNBOOK.md**](RUNBOOK.md) - Production operations runbook
- [**TROUBLESHOOTING.md**](TROUBLESHOOTING.md) - Troubleshooting playbooks
- [**UPGRADE.md**](UPGRADE.md) - Upgrade and migration guide

#### Automation Scripts
- [**scripts/health-check.sh**](../scripts/health-check.sh) - Automated health checks
- [**scripts/stats.sh**](../scripts/stats.sh) - Project statistics
- [**scripts/setup-labels.sh**](../scripts/setup-labels.sh) - GitHub labels setup

### 🧪 Testing

**Quality assurance and testing:**

- [**TESTING.md**](TESTING.md) - Testing overview
- [**tests/config.test.js**](../tests/config.test.js) - Configuration tests
- [**tests/packages.test.js**](../tests/packages.test.js) - Package data validation
- [**tests/integration.test.js**](../tests/integration.test.js) - Integration tests
- [**tests/performance.test.js**](../tests/performance.test.js) - Performance benchmarks
- [**tests/accessibility.test.js**](../tests/accessibility.test.js) - WCAG 2.1 compliance tests

**Running Tests:**
```bash
npm run test              # All tests
npm run test:config       # Configuration only
npm run test:packages     # Package validation
npm run test:integration  # Integration tests
npm run test:performance  # Performance benchmarks
```

### 🌐 API Documentation

**AI Bridge API reference:**

- [**api/openapi.yaml**](api/openapi.yaml) - Complete OpenAPI 3.0 specification
- [**AI_BRIDGE.md**](AI_BRIDGE.md) - AI Bridge user guide

**Endpoints:**
- `GET /health` - Health check
- `POST /feedback` - Package feedback analysis
- `POST /search` - Natural language package search
- `POST /recommend` - Package recommendations
- `GET /metrics` - Prometheus metrics

### 🔄 CI/CD

**Continuous integration and deployment:**

- [**.github/workflows/ci.yml**](../.github/workflows/ci.yml) - CI pipeline
- [**.github/workflows/release.yml**](../.github/workflows/release.yml) - Release automation
- [**.github/workflows/security.yml**](../.github/workflows/security.yml) - Security scanning

**GitHub Configuration:**
- [**.github/README.md**](../.github/README.md) - GitHub settings documentation
- [**.github/labels.json**](../.github/labels.json) - Issue labels
- [**.github/PULL_REQUEST_TEMPLATE.md**](../.github/PULL_REQUEST_TEMPLATE.md) - PR template
- [**.github/ISSUE_TEMPLATE/**](../.github/ISSUE_TEMPLATE/) - Issue templates

### 📦 Package Data

**Understanding package organization:**

- [**nixite-packages.json**](../nixite-packages.json) - Package database
- [**PACKAGE_SCHEMA.md**](PACKAGE_SCHEMA.md) - Package data schema (if exists)

**Categories:**
- Create (Content Creation & Media)
- Connect (Communication & Collaboration)
- Grow (Learning & Development)
- Work (Productivity & Business)
- Play (Gaming & Entertainment)
- Secure (Security & Privacy)
- Manage (System Administration)
- Serve (Server & Infrastructure)

### 🛠️ Configuration

**Customizing Nixite:**

- [**config.js**](../config.js) - Main configuration file
- [**nixite-luminous-bridge.js**](../nixite-luminous-bridge.js) - AI Bridge configuration

**Environment Variables:**
```bash
OLLAMA_HOST      # Ollama server URL
AI_BRIDGE_PORT   # AI Bridge port (default: 8890)
LOG_LEVEL        # Logging level
```

### 🎨 Frontend

**User interface and experience:**

- [**index.html**](../index.html) - Main web interface
- [**nixite-luminous.js**](../nixite-luminous.js) - Frontend JavaScript
- [**nixite-luminous.css**](../nixite-luminous.css) - Styles

**Design System:**
- Color palette: Luminous Dynamics brand colors
- Typography: System fonts with fallbacks
- Responsive: Mobile-first design
- Accessibility: WCAG 2.1 Level AA compliant

### 🌟 Advanced Topics

**Deep dives and advanced usage:**

#### High Availability
- [**HIGH_AVAILABILITY.md**](HIGH_AVAILABILITY.md) - HA patterns
  - Active-Passive setup
  - Active-Active deployment
  - Multi-region architecture
  - Auto-scaling configurations
  - Disaster recovery procedures

#### Performance
- [**tests/performance.test.js**](../tests/performance.test.js) - Benchmarking
- Performance targets: <100ms p95 response time
- Caching strategies
- CDN integration

#### Customization
- Custom package categories
- Custom AI models
- Theming and branding
- Plugin system (future)

### 📱 Platform Support

**Deployment platforms:**

- **NixOS** - Native flakes integration
- **Docker** - Container deployment
- **Kubernetes** - Orchestrated deployment
- **AWS EKS** - Managed Kubernetes
- **Any Linux** - Systemd service
- **macOS** - Development environment
- **Dev Containers** - VS Code/Codespaces

### 🤝 Community

**Getting help and contributing:**

- [**CONTRIBUTING.md**](../CONTRIBUTING.md) - Contribution guidelines
- [**CODE_OF_CONDUCT.md**](../CODE_OF_CONDUCT.md) - Community standards
- [**SECURITY.md**](../SECURITY.md) - Security vulnerability reporting
- GitHub Issues - Bug reports and feature requests
- GitHub Discussions - Questions and community support

### 📖 Reference

**Quick reference materials:**

- [**CHEATSHEET.md**](CHEATSHEET.md) - Command cheatsheet
- [**TROUBLESHOOTING.md**](TROUBLESHOOTING.md) - Common issues
- [**RUNBOOK.md**](RUNBOOK.md) - Operations procedures
- [**UPGRADE.md**](UPGRADE.md) - Version migrations

### 📋 Appendices

#### Version History
- **v2.1.0** - Current release (AI-powered features)
- **v2.0.0** - Luminous redesign
- **v1.0.0** - Initial release

#### File Structure
```
nixite/
├── docs/                    # Documentation
│   ├── INDEX.md            # This file
│   ├── ARCHITECTURE.md     # System design
│   ├── AI_BRIDGE.md        # AI component
│   ├── MONITORING.md       # Observability
│   ├── RUNBOOK.md          # Operations
│   ├── TROUBLESHOOTING.md  # Problem solving
│   ├── UPGRADE.md          # Migrations
│   ├── HIGH_AVAILABILITY.md # HA patterns
│   ├── CHEATSHEET.md       # Quick reference
│   └── api/
│       └── openapi.yaml    # API specification
├── k8s/                    # Kubernetes
│   ├── README.md           # K8s guide
│   ├── manifests/          # Deployment manifests
│   ├── dashboards/         # Grafana dashboards
│   └── prometheus/         # Prometheus config
├── terraform/              # Infrastructure as Code
│   ├── README.md           # Terraform guide
│   └── aws/                # AWS deployment
├── examples/               # Example configurations
│   ├── nixos/              # NixOS examples
│   └── security/           # Security hardening
├── tests/                  # Test suites
│   ├── config.test.js      # Config tests
│   ├── packages.test.js    # Package tests
│   ├── integration.test.js # Integration tests
│   ├── performance.test.js # Benchmarks
│   └── accessibility.test.js # A11y tests
├── scripts/                # Automation scripts
│   ├── health-check.sh     # Health checks
│   ├── stats.sh            # Statistics
│   └── setup-labels.sh     # GitHub labels
├── .github/                # GitHub configuration
│   ├── workflows/          # CI/CD pipelines
│   ├── ISSUE_TEMPLATE/     # Issue templates
│   └── labels.json         # Issue labels
├── .devcontainer/          # Dev container config
├── index.html              # Main UI
├── nixite-luminous.js      # Frontend logic
├── nixite-luminous.css     # Styles
├── nixite-luminous-bridge.js # AI Bridge
├── nixite-packages.json    # Package database
├── config.js               # Configuration
├── package.json            # Node.js metadata
├── Dockerfile              # Container image
├── docker-compose.yml      # Docker Compose
└── README.md               # Project overview
```

#### External Resources
- [NixOS Official Documentation](https://nixos.org/manual/nixos/stable/)
- [Nix Package Search](https://search.nixos.org/)
- [Ollama Documentation](https://ollama.ai/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🎯 Common Documentation Tasks

### I want to...

**Install Nixite**
→ Start with [README.md](../README.md) → [QUICKSTART.md](QUICKSTART.md)

**Deploy to production**
→ [k8s/README.md](../k8s/README.md) or [terraform/README.md](../terraform/README.md)

**Contribute code**
→ [CONTRIBUTING.md](../CONTRIBUTING.md) → [DEVELOPMENT.md](DEVELOPMENT.md)

**Report a bug**
→ [TROUBLESHOOTING.md](TROUBLESHOOTING.md) → GitHub Issues

**Set up monitoring**
→ [MONITORING.md](MONITORING.md) → [k8s/dashboards/](../k8s/dashboards/)

**Secure my deployment**
→ [examples/security/README.md](../examples/security/README.md)

**Understand the architecture**
→ [ARCHITECTURE.md](ARCHITECTURE.md) → [AI_BRIDGE.md](AI_BRIDGE.md)

**Run tests**
→ [TESTING.md](TESTING.md) → `npm run test:all`

**Upgrade to new version**
→ [UPGRADE.md](UPGRADE.md)

**Solve a problem**
→ [TROUBLESHOOTING.md](TROUBLESHOOTING.md) → [RUNBOOK.md](RUNBOOK.md)

**Learn commands**
→ [CHEATSHEET.md](CHEATSHEET.md)

**Set up high availability**
→ [HIGH_AVAILABILITY.md](HIGH_AVAILABILITY.md)

**Use the AI features**
→ [AI_BRIDGE.md](AI_BRIDGE.md) → [api/openapi.yaml](api/openapi.yaml)

**Configure CI/CD**
→ [.github/workflows/](../.github/workflows/) → [.github/README.md](../.github/README.md)

## 📊 Documentation Statistics

```
Total Documentation Files: 35+
Total Lines of Documentation: 15,000+
Documentation Coverage: 100%
Last Updated: 2025-11-15
```

## 🔍 Search Tips

Use your editor's search functionality to find specific information:

```bash
# Search all documentation
grep -r "your search term" docs/

# Search specific file types
find docs/ -name "*.md" -exec grep "search term" {} +

# Case-insensitive search
grep -ri "search term" docs/
```

## 🌟 Documentation Quality

All documentation follows:
- ✅ Clear, concise writing
- ✅ Code examples with syntax highlighting
- ✅ Visual diagrams where helpful
- ✅ Cross-references to related docs
- ✅ Up-to-date with latest version
- ✅ Tested examples and commands
- ✅ Accessibility considerations

## 📝 Contributing to Docs

Found an issue with documentation? Want to improve it?

1. Check [CONTRIBUTING.md](../CONTRIBUTING.md)
2. Create an issue or PR
3. Follow documentation style guide
4. Test all code examples
5. Update this index if adding new docs

## 📮 Feedback

Have suggestions for documentation improvements?
- Open an issue on GitHub
- Tag with `documentation` label
- We review all documentation feedback

---

**🎉 Thank you for using Nixite!**

For the latest updates, visit: https://github.com/Luminous-Dynamics/nixite

Last updated: 2025-11-15
