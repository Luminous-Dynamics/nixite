# GitHub Configuration

This directory contains GitHub-specific configuration for the Nixite project.

## Contents

### `labels.json`

Standardized label configuration for issues and pull requests.

**Label Categories:**

#### Type Labels
- `type: bug` - Something isn't working correctly
- `type: feature` - New feature or request
- `type: enhancement` - Improvement to existing feature
- `type: documentation` - Documentation improvements
- `type: refactor` - Code refactoring
- `type: performance` - Performance improvements
- `type: security` - Security-related issues
- `type: test` - Testing improvements
- `type: chore` - Maintenance tasks

#### Priority Labels
- `priority: critical` - Needs immediate attention
- `priority: high` - Should be addressed soon
- `priority: medium` - Normal queue
- `priority: low` - Nice to have

#### Status Labels
- `status: needs-triage` - Needs review and categorization
- `status: in-progress` - Currently being worked on
- `status: blocked` - Blocked by dependency
- `status: ready` - Ready for development
- `status: on-hold` - Pending decision
- `status: wontfix` - Won't be worked on

#### Area Labels
- `area: frontend` - Frontend/UI related
- `area: backend` - Backend/server related
- `area: ai-bridge` - AI Bridge related
- `area: nixos` - NixOS module or packaging
- `area: docker` - Docker/containerization
- `area: deployment` - Deployment and infrastructure
- `area: packages` - Package data or management
- `area: config` - Configuration related

#### Special Labels
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested
- `duplicate` - Already exists
- `invalid` - Doesn't seem right
- `dependencies` - Dependency updates
- `breaking change` - Introduces breaking change
- `needs review` - Needs code review
- `needs testing` - Needs testing before merge
- `hacktoberfest` - Hacktoberfest participation
- `community` - Community-driven contribution
- `design` - Design or UX related
- `accessibility` - Accessibility improvements
- `i18n` - Internationalization/localization

## Applying Labels

### Prerequisites

Install GitHub CLI:
```bash
# Debian/Ubuntu
sudo apt install gh

# Fedora/RHEL
sudo dnf install gh

# macOS
brew install gh

# NixOS
nix-env -iA nixpkgs.gh
```

### Authenticate

```bash
gh auth login
```

### Apply Labels to Repository

```bash
./scripts/setup-labels.sh
```

This script will:
1. Read labels from `.github/labels.json`
2. Create new labels that don't exist
3. Update existing labels with new colors/descriptions
4. Show a summary of changes

### Manual Label Management

```bash
# List current labels
gh label list

# Create a label
gh label create "new-label" --color "ff6b6b" --description "Description"

# Edit a label
gh label edit "label-name" --color "00ff00" --description "New description"

# Delete a label
gh label delete "label-name"
```

## Label Usage Guidelines

### For Issues

**Always apply:**
1. One `type:*` label
2. One `priority:*` label
3. One or more `area:*` labels as applicable
4. One `status:*` label

**Example:**
```
type: bug
priority: high
area: ai-bridge
status: ready
```

### For Pull Requests

**Always apply:**
1. One `type:*` label matching the change
2. One or more `area:*` labels
3. `needs review` when ready for review
4. `breaking change` if applicable

**Example:**
```
type: feature
area: frontend
area: packages
needs review
```

### Label Colors

Labels use a color-coding system:
- **Red tones** (#d73a4a, #b60205) - Critical, bugs, security
- **Orange tones** (#d93f0b, #fbca04) - High priority, warnings
- **Blue tones** (#0075ca, #1d76db) - Documentation, backend, technical areas
- **Purple tones** (#5319e7, #7057ff) - Frontend, NixOS, special issues
- **Green tones** (#0e8a16, #008672) - Low priority, help wanted, ready
- **Yellow tones** (#fbca04, #fef2c0) - Medium priority, chores
- **Gray tones** (#cfd3d7, #ffffff) - Invalid, won't fix

## Automation

### Label Sync

To keep labels in sync across forks or multiple repositories, use the setup script:

```bash
# In each repository
./scripts/setup-labels.sh
```

### CI/CD Integration

Labels can trigger different CI/CD workflows:
- `type: security` - Runs security scans
- `needs testing` - Runs full test suite
- `dependencies` - Runs dependency checks

## Best Practices

### Issue Triage Process

1. New issue created → Auto-label: `status: needs-triage`
2. Review issue → Add `type:*`, `priority:*`, `area:*`
3. Remove `status: needs-triage`
4. Add `status: ready` when ready to work on
5. Assign to developer → `status: in-progress`
6. Close issue → Remove status labels

### Pull Request Process

1. PR created → Add `type:*` and `area:*` labels
2. Ready for review → Add `needs review`
3. Changes requested → Keep `needs review`
4. Approved → Remove `needs review`, add `needs testing`
5. Tests pass → Merge PR

### Label Maintenance

- Review labels quarterly
- Remove unused labels
- Update descriptions as needed
- Keep color scheme consistent
- Document any custom labels

## Related Documentation

- [Contributing Guidelines](../CONTRIBUTING.md)
- [Support Documentation](../SUPPORT.md)
- [Development Cheatsheet](../docs/CHEATSHEET.md)

---

**Last Updated:** 2024-01-15
