# Git Hooks

This directory contains optional Git hooks that help maintain code quality.

## Available Hooks

### pre-commit

Validates code before allowing commits.

**Checks**:
- JSON syntax (nixite-packages.json, package.json)
- JavaScript syntax
- Package data integrity
- Configuration validity
- Common issues (console.log, large files, etc.)

## Installation

### Method 1: Copy to .git/hooks (Traditional)

```bash
cp .githooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Method 2: Configure Git to use .githooks directory (Recommended)

```bash
git config core.hooksPath .githooks
```

This method is recommended because:
- Hooks are tracked in version control
- Updates are automatically picked up
- Easier to share with team

### Method 3: Symlink (Alternative)

```bash
ln -s ../../.githooks/pre-commit .git/hooks/pre-commit
```

## Usage

Once installed, the hooks run automatically:

```bash
# Normal commit - hooks run automatically
git commit -m "feat: add new feature"

# Skip hooks if needed (use sparingly!)
git commit --no-verify -m "WIP: work in progress"
```

## Requirements

### Minimum (Basic Validation)
- Bash shell

### Recommended (Full Validation)
- Node.js (for JavaScript syntax checking and validators)
- jq (for JSON validation) - optional, Node.js can be used instead

## Customization

You can modify the hooks to fit your workflow:

```bash
# Edit the hook
vim .githooks/pre-commit

# Test the hook manually
./.githooks/pre-commit
```

## Bypassing Hooks

Sometimes you need to bypass hooks (use judiciously):

```bash
# Skip all hooks
git commit --no-verify

# Or set an environment variable
SKIP_HOOKS=1 git commit
```

## Troubleshooting

### Hook not running

```bash
# Check if hooks are installed
ls -la .git/hooks/pre-commit

# Check permissions
chmod +x .githooks/pre-commit
chmod +x .git/hooks/pre-commit

# Check git config
git config core.hooksPath
```

### Node.js not found

```bash
# Install Node.js
# - macOS: brew install node
# - Ubuntu: sudo apt install nodejs npm
# - NixOS: add nodejs to configuration.nix
```

### Permission denied

```bash
# Make hooks executable
chmod +x .githooks/*
```

## Adding New Hooks

To add more hooks:

1. Create the hook script in `.githooks/`
2. Make it executable: `chmod +x .githooks/hook-name`
3. Document it in this README
4. Test it manually
5. Commit to repository

Available hook types:
- `pre-commit` - Before commit is created
- `commit-msg` - After commit message is entered
- `pre-push` - Before push to remote
- `post-commit` - After commit is created
- And many more (see `man githooks`)

## Benefits

Using git hooks helps:
- ✅ Catch errors before they're committed
- ✅ Maintain consistent code quality
- ✅ Automate validation
- ✅ Reduce CI/CD failures
- ✅ Save review time
- ✅ Enforce standards

## Best Practices

1. **Keep hooks fast** - Slow hooks frustrate developers
2. **Make them optional** - Allow bypass with `--no-verify`
3. **Give clear feedback** - Show what's wrong and how to fix it
4. **Test thoroughly** - Ensure hooks work on different systems
5. **Document well** - Help developers understand what's happening

## See Also

- Git Hooks Documentation: https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks
- Pre-commit Framework: https://pre-commit.com/ (alternative approach)
- Husky: https://typicode.github.io/husky/ (Node.js alternative)

---

**Questions?** Check `CONTRIBUTING.md` or open an issue.
