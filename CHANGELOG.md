# Changelog

All notable changes to Nixite will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-11-14

### Added
- **Package Database**: Comprehensive `nixite-packages.json` with 80+ curated packages across all 8 categories
- **Centralized Configuration**: `config.js` for managing API endpoints and feature flags
- **Project Metadata**: `package.json` for Node.js dependency management and npm scripts
- **Git Ignore**: `.gitignore` file with standard exclusions for Node.js and Python projects
- **Startup Script**: `start.sh` for easy one-command launching of all services
- **Contribution Guidelines**: `CONTRIBUTING.md` with comprehensive guidelines for contributors
- **License**: MIT License file
- **Changelog**: This file to track all notable changes

### Changed
- **README.md**: Complete rewrite with comprehensive documentation, Quick Start guide, and professional formatting
- **index.html**: Updated to reference external JavaScript modules and use centralized configuration
- **Package Count**: Expanded from 16 to 80+ packages (5x increase)

### Fixed
- **File Name Mismatch**: Corrected reference to `nixite-packages.json` (was looking for wrong filename)
- **Data Structure**: Fixed package database structure to match code expectations
- **Script Loading**: Added proper references to external JavaScript modules that were missing

### Removed
- **Redundant Files**: Removed old `packages.json` that was replaced by `nixite-packages.json`

### Improved
- **Code Quality**: Better separation of concerns and centralized configuration
- **Developer Experience**: Easy startup, clear structure, comprehensive documentation
- **User Experience**: More packages, better organization, professional presentation
- **Maintainability**: Proper project structure with clear documentation

## [1.0.0] - 2024-11-13

### Added
- Initial release of Nixite
- Visual package discovery interface
- AI-powered package recommendations via Luminous Bridge
- Voice input for accessibility
- 8 package categories (Create, Connect, Grow, Work, Play, Secure, Manage, Serve)
- Installation manager for NixOS packages
- UI feedback enhancements
- Beautiful gradient design with animations

### Features
- Purpose-driven package browsing
- Search functionality
- Category-based organization
- One-click package installation
- Dark mode support
- Responsive design
- Accessibility features

---

## Version History

- **2.0.0** (2024-11-14) - Major improvements to architecture and documentation
- **1.0.0** (2024-11-13) - Initial release

## Upgrade Guide

### From 1.0.0 to 2.0.0

No breaking changes for users! All changes are backward compatible.

For developers:
1. Pull the latest changes
2. Note new file structure with `nixite-packages.json` (replaces `packages.json`)
3. Configuration now available in `config.js`
4. Use `./start.sh` for easy startup
5. See `CONTRIBUTING.md` for development guidelines

---

For more details, see the [commit history](https://github.com/Luminous-Dynamics/nixite/commits/main).
