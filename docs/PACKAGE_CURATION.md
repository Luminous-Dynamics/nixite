# Package Curation Guidelines

Guidelines for maintaining high-quality package listings in Nixite.

## 📋 Table of Contents

- [Overview](#overview)
- [Package Selection Criteria](#package-selection-criteria)
- [Package Information](#package-information)
- [Categories](#categories)
- [Tags](#tags)
- [Descriptions](#descriptions)
- [Adding a Package](#adding-a-package)
- [Reviewing Packages](#reviewing-packages)
- [Maintenance](#maintenance)

## 🎯 Overview

### Goals

Nixite aims to provide:
1. **Quality over Quantity** - Curated, well-maintained packages
2. **Accessibility** - Clear, beginner-friendly descriptions
3. **Discoverability** - Proper categorization and tagging
4. **Usefulness** - Packages people actually need

### Philosophy

- **Beginner-Friendly**: Descriptions should be clear to "Grandma Rose"
- **Purpose-Driven**: Categorize by what users want to DO, not what packages ARE
- **Well-Maintained**: Prefer actively developed packages
- **Popular**: Include widely-used, well-documented packages

## ✅ Package Selection Criteria

### Must Have

- [ ] Available in `nixpkgs` (official Nix package repository)
- [ ] Actively maintained (updated within last year)
- [ ] Clear, stable functionality
- [ ] Works on NixOS without major issues
- [ ] Appropriate for end users (not just libraries)

### Should Have

- [ ] Popular in the broader community
- [ ] Good documentation
- [ ] Stable releases (not alpha/beta)
- [ ] Cross-platform (when applicable)
- [ ] No controversial licensing

### Nice to Have

- [ ] Featured in NixOS manual
- [ ] Large user base
- [ ] Regular updates
- [ ] Active community

### Avoid

- ❌ Deprecated packages
- ❌ Unmaintained (> 2 years without updates)
- ❌ Alpha/Beta software (unless specifically notable)
- ❌ Duplicate functionality (prefer better-known alternative)
- ❌ Highly technical/niche (unless exceptional)
- ❌ Controversial/malicious software

## 📝 Package Information

### Required Fields

```json
{
  "id": "exact-nixpkgs-name",
  "name": "Display Name",
  "description": "Clear description",
  "category": "primary-category"
}
```

### Optional Fields

```json
{
  "tags": ["tag1", "tag2"],
  "homepage": "https://project.org",
  "license": "MIT",
  "platforms": ["linux", "darwin"]
}
```

### Field Guidelines

#### `id` (Required)
- **Must** match exact package name in nixpkgs
- Verify: `nix-env -qaP packagename`
- Use canonical name (not aliases)

**Examples:**
```json
"id": "firefox"           // ✓ Correct
"id": "firefox-esr"       // ✓ Correct (different package)
"id": "Firefox"           // ✗ Wrong - case matters
"id": "mozilla-firefox"   // ✗ Wrong - not the canonical name
```

#### `name` (Required)
- Human-readable display name
- Proper capitalization
- Official product name

**Examples:**
```json
"name": "Firefox"              // ✓ Correct
"name": "Visual Studio Code"   // ✓ Correct
"name": "firefox"              // ✗ Wrong - use proper case
"name": "VSCode"               // ⚠ Acceptable but prefer full name
```

#### `description` (Required)
- **What it does**, not what it is
- 5-15 words
- Clear to non-technical users
- Actionable (user can understand the benefit)

**Good Examples:**
```json
"Edit photos and create graphics"
"Browse the web privately and securely"
"Write code with intelligent completion"
"Watch and organize your videos"
```

**Bad Examples:**
```json
"A web browser"  // ✗ Too vague
"Mozilla Firefox is a free and open-source web browser developed by..."  // ✗ Too long
"Firefox browser for web browsing"  // ✗ Redundant
"Advanced image manipulation program"  // ✗ Too technical
```

#### `category` (Required)
- Exactly one primary category
- Choose the MOST relevant category
- See [Categories](#categories) section

## 🗂️ Categories

### Create (Content Creation & Media)

**For:** Creating, editing, and producing content

**Examples:**
- Photo editors (GIMP, Krita)
- Video editors (Kdenlive, DaVinci Resolve)
- Audio editors (Audacity)
- 3D modeling (Blender)
- Office suites (LibreOffice)
- Note-taking (Obsidian, Joplin)

**Keywords:** create, edit, design, draw, paint, model, record, produce

### Connect (Communication & Collaboration)

**For:** Communication, messaging, and collaboration

**Examples:**
- Browsers (Firefox, Chrome)
- Email (Thunderbird)
- Messaging (Discord, Signal, Slack)
- Video conferencing (Zoom, Jitsi)
- File sharing (Nextcloud)

**Keywords:** communicate, chat, message, email, call, video, share, collaborate

### Grow (Learning & Development)

**For:** Learning, education, and personal development

**Examples:**
- E-readers (Calibre)
- Learning platforms (Anki)
- Documentation (Obsidian)
- Language learning
- Educational games

**Keywords:** learn, study, read, practice, train, develop, educate

### Work (Productivity & Business)

**For:** Professional work and productivity

**Examples:**
- IDEs (VSCode, IntelliJ)
- Development tools (Git, Docker)
- Terminal emulators (Alacritty)
- Project management
- Business apps

**Keywords:** develop, program, code, build, manage, organize, plan

### Play (Gaming & Entertainment)

**For:** Games and entertainment

**Examples:**
- Game platforms (Steam)
- Media players (VLC, Spotify)
- Emulators
- Game development tools

**Keywords:** play, game, watch, listen, entertainment, fun

### Secure (Security & Privacy)

**For:** Security, privacy, and encryption

**Examples:**
- Password managers (KeePassXC, Bitwarden)
- VPNs (Mullvad, WireGuard)
- Encryption (VeraCrypt, GnuPG)
- Security tools (Tor)

**Keywords:** secure, encrypt, protect, private, safe, password, vpn

### Manage (System Administration)

**For:** System management and monitoring

**Examples:**
- System monitors (htop, btop)
- File managers (Ranger, Nemo)
- Disk utilities
- Backup tools (Restic)

**Keywords:** monitor, manage, admin, system, disk, backup, utility

### Serve (Server & Infrastructure)

**For:** Server applications and infrastructure

**Examples:**
- Web servers (Nginx, Apache)
- Databases (PostgreSQL, MySQL)
- Containers (Docker, Kubernetes)
- Self-hosted services (Nextcloud, Jellyfin)

**Keywords:** serve, host, server, database, infrastructure, cloud

## 🏷️ Tags

### Tag Guidelines

- Use lowercase
- 2-5 tags per package
- Specific and descriptive
- Common/searchable terms
- No redundant tags

### Common Tags

**Technology:**
```
web, cli, gui, terminal, browser, editor, ide
```

**File Types:**
```
pdf, image, video, audio, document, code, text
```

**Functionality:**
```
editor, viewer, player, converter, manager, tool
```

**Domains:**
```
graphics, photo, video, audio, music, 3d, office
development, programming, design, gaming
security, privacy, encryption, network
```

### Tag Examples

**Good:**
```json
{
  "id": "gimp",
  "tags": ["graphics", "photo-editing", "design", "creative"]
}
```

**Bad:**
```json
{
  "id": "gimp",
  "tags": ["image", "editor", "gnu", "photoshop-alternative", "raster-graphics", "layer-based", "open-source"]
  // ✗ Too many tags
  // ✗ Too specific ("gnu", "raster-graphics")
  // ✗ Comparative ("photoshop-alternative")
}
```

## ➕ Adding a Package

### Step-by-Step Process

1. **Verify Package Exists**
   ```bash
   nix-env -qaP packagename
   # Should show: nixpkgs.packagename
   ```

2. **Research Package**
   - Visit homepage
   - Read description
   - Check popularity
   - Verify maintenance status

3. **Determine Category**
   - What does the user WANT TO DO?
   - Which category fits best?
   - Only one primary category

4. **Write Description**
   - Focus on benefit/action
   - Keep it short (5-15 words)
   - Make it clear to beginners
   - Avoid jargon

5. **Choose Tags**
   - 2-5 relevant tags
   - Lowercase
   - Searchable terms

6. **Add to nixite-packages.json**
   ```json
   {
     "id": "packagename",
     "name": "Display Name",
     "description": "Clear description of what it does",
     "category": "appropriate-category",
     "tags": ["tag1", "tag2", "tag3"]
   }
   ```

7. **Validate**
   ```bash
   # Check JSON syntax
   python3 -m json.tool nixite-packages.json

   # Run package tests
   npm run test:packages
   ```

8. **Test in Nixite**
   ```bash
   # Start Nixite
   python3 -m http.server 8000

   # Open http://localhost:8000
   # Search for your package
   # Verify it appears in the right category
   ```

9. **Submit Pull Request**
   - Create feature branch
   - Commit changes
   - Submit PR with description
   - Wait for review

### Example Addition

```json
{
  "id": "thunderbird",
  "name": "Thunderbird",
  "description": "Manage your email, calendar, and contacts",
  "category": "connect",
  "tags": ["email", "calendar", "contacts", "productivity"]
}
```

**Rationale:**
- ✓ Available in nixpkgs
- ✓ Actively maintained by Mozilla
- ✓ Popular email client
- ✓ Clear functionality
- ✓ Good description (what user can DO)
- ✓ Appropriate category (Connect)
- ✓ Relevant tags

## 🔍 Reviewing Packages

### Review Checklist

When reviewing package additions:

**Package Quality:**
- [ ] Package exists in nixpkgs
- [ ] Package name is correct
- [ ] Package is maintained
- [ ] Package works on NixOS

**Information Quality:**
- [ ] Description is clear and helpful
- [ ] Description is 5-15 words
- [ ] Description focuses on what user can DO
- [ ] Category is appropriate
- [ ] Tags are relevant and lowercase
- [ ] Name uses proper capitalization

**Technical:**
- [ ] JSON is valid
- [ ] No duplicate entries
- [ ] Tests pass (`npm run test:packages`)

### Common Review Comments

**Description Issues:**
```
❌ "A text editor"
✓ "Edit text files with syntax highlighting"

❌ "Firefox is a free and open-source web browser..."
✓ "Browse the web privately and securely"

❌ "Advanced image manipulation program"
✓ "Edit photos and create graphics"
```

**Category Issues:**
```
❌ VSCode in "Manage" (it's for development)
✓ VSCode in "Work"

❌ Spotify in "Connect" (it's entertainment)
✓ Spotify in "Play"
```

**Tag Issues:**
```
❌ ["Web", "Browser", "Internet", "Firefox", "Mozilla"]
✓ ["web", "browser", "privacy"]
```

## 🔧 Maintenance

### Regular Tasks

**Monthly:**
- Review new packages in nixpkgs
- Check for deprecated packages
- Update descriptions if needed
- Remove unmaintained packages

**Quarterly:**
- Audit package categories
- Review tag consistency
- Update based on user feedback
- Check package popularity metrics

**Annually:**
- Major category review
- Comprehensive audit
- Update guidelines based on learnings

### Removing Packages

Consider removing if:
- Package no longer in nixpkgs
- Unmaintained for > 2 years
- Broken on NixOS
- Better alternative exists
- Duplicate functionality

**Process:**
1. Create issue documenting reason
2. Wait 2 weeks for feedback
3. Remove if no objections
4. Document in CHANGELOG

## 📊 Quality Metrics

### Target Metrics

- **Coverage**: 100-200 packages per category
- **Maintenance**: Update packages monthly
- **Quality**: 100% have clear descriptions
- **Testing**: 100% pass validation tests
- **User Satisfaction**: Positive feedback on 90%+ of packages

### Success Indicators

✅ Users find packages easily
✅ Descriptions make sense to beginners
✅ Categories feel intuitive
✅ Low number of "where is X?" questions
✅ Positive community feedback

## 💡 Tips for Curators

1. **Think Like a User** - Not a package maintainer
2. **Be Specific** - "Edit photos" beats "Image manipulation"
3. **Avoid Jargon** - Technical terms confuse beginners
4. **One Category** - Force yourself to choose the BEST fit
5. **Test Search** - Verify users can find it
6. **Read Aloud** - Descriptions should sound natural
7. **Check Competitors** - How do similar tools describe it?
8. **User Feedback** - Listen to how real users describe needs

## 🆘 Getting Help

Questions about package curation?

1. Check existing packages for examples
2. Read this guide thoroughly
3. Ask in GitHub Discussions
4. Tag @maintainers in PRs
5. Open an issue with questions

## 📚 Resources

- [Nix Packages Search](https://search.nixos.org/)
- [NixOS Wiki](https://nixos.wiki/)
- [Nixite Contributing Guide](../CONTRIBUTING.md)
- [Package Database](../nixite-packages.json)

---

**Remember**: We're building a tool for EVERYONE, including people new to NixOS. Every package should be welcoming and understandable!

**Last Updated**: 2025-01-15
