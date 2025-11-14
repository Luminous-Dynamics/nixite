# VS Code Workspace Configuration

This directory contains VS Code-specific configuration for the Nixite project.

## Files

### `settings.json`
Workspace-specific settings optimized for Nixite development:
- **Editor**: 2-space indentation, format on save, trim whitespace
- **Language-specific**: JavaScript, JSON, Markdown, HTML, CSS, Shell, Nix
- **Git**: Auto-fetch, smart commit
- **Terminal**: Bash default, custom environment variables
- **Files**: Associations, exclusions, auto-save

### `extensions.json`
Recommended VS Code extensions for the best development experience:
- **Essential**: Prettier, ESLint, Markdown support
- **Language**: Nix, Shell, TOML
- **Deployment**: Docker, Caddy, nginx
- **Git**: GitLens, Git Graph
- **Productivity**: Better Comments, TODO highlighting, Spell checker

### `tasks.json`
Pre-configured tasks for common operations:
- **Development**: Start/stop servers, setup
- **Testing**: Run all tests, specific tests
- **Validation**: Config, packages, installation
- **Docker**: Build, run, stop, logs
- **Deployment**: Production readiness check

**Usage**: Press `Ctrl+Shift+B` (or `Cmd+Shift+B` on Mac) to see available tasks

### `launch.json`
Debug configurations:
- **AI Bridge**: Debug Node.js AI bridge
- **Tests**: Debug config and package tests
- **Validators**: Debug validation scripts
- **Browser**: Debug in Chrome
- **Full Stack**: Debug AI Bridge + Chrome together

**Usage**: Press `F5` to start debugging

## Quick Start

### 1. Install Recommended Extensions
When you open this project in VS Code, you'll see a notification to install recommended extensions. Click "Install All" for the best experience.

**Or manually**:
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Show Recommended Extensions"
3. Install each recommended extension

### 2. Common Tasks

**Start Development**:
- Press `Ctrl+Shift+B`
- Select "Start Development Server"
- Or run: `./scripts/dev.sh start`

**Run Tests**:
- Press `Ctrl+Shift+P`
- Type "Tasks: Run Task"
- Select "Run All Tests"
- Or press `Ctrl+Shift+T`

**Validate Changes**:
- Press `Ctrl+Shift+P`
- Type "Tasks: Run Task"
- Select "Validate Configuration" or "Validate Packages"

### 3. Debugging

**Debug AI Bridge**:
1. Press `F5`
2. Select "Debug AI Bridge"
3. Set breakpoints in `nixite-luminous-bridge.js`

**Debug in Browser**:
1. Make sure development server is running
2. Press `F5`
3. Select "Debug in Chrome"
4. Browser opens with debugger attached

**Debug Tests**:
1. Open a test file
2. Set breakpoints
3. Press `F5`
4. Select appropriate debug configuration

## Keyboard Shortcuts

### General
- `Ctrl+Shift+B` - Run build task (start server)
- `Ctrl+Shift+P` - Command palette
- `Ctrl+` - Open terminal
- `Ctrl+Shift+E` - Explorer
- `Ctrl+Shift+F` - Search

### Development
- `F5` - Start debugging
- `Ctrl+F5` - Run without debugging
- `Shift+F5` - Stop debugging
- `Ctrl+Shift+F5` - Restart debugging

### Testing
- `Ctrl+Shift+T` - Run tests (custom keybinding needed)
- `Ctrl+T` - Go to symbol

### Git
- `Ctrl+Shift+G` - Source control
- `Ctrl+Enter` - Commit (in source control view)

## Customization

### Personal Settings

Don't modify the workspace settings directly. Instead:

1. Open User Settings: `Ctrl+,`
2. Search for the setting you want to override
3. Modify in User Settings (takes precedence over workspace)

### Additional Extensions

Feel free to install additional extensions! The recommended list covers essentials, but you might want:
- **Themes**: Material Theme, One Dark Pro
- **Icons**: Material Icon Theme, vscode-icons
- **Remote**: Remote-SSH, Remote-Containers
- **Collaboration**: Live Share

## Environment Variables

The workspace sets `NIXITE_DEV=1` in the terminal. This can be used in scripts to detect VS Code development environment.

**Example**:
```bash
if [ "$NIXITE_DEV" = "1" ]; then
    echo "Running in VS Code"
fi
```

## Troubleshooting

### Extensions Not Installing

**Issue**: Recommended extensions notification doesn't appear

**Solution**:
1. Open extensions view: `Ctrl+Shift+X`
2. Filter by "Recommended"
3. Install each extension manually

### Tasks Not Running

**Issue**: "No task runner configured" error

**Solution**:
1. Ensure you're in the project root
2. Check that `tasks.json` exists in `.vscode/`
3. Reload window: `Ctrl+Shift+P` → "Reload Window"

### Debugger Not Attaching

**Issue**: Debugger fails to start

**Solution**:
1. Ensure Node.js is installed and in PATH
2. Check console for error messages
3. Try "Restart Debugging": `Ctrl+Shift+F5`

### Format on Save Not Working

**Issue**: Files don't format when saved

**Solution**:
1. Check if formatter is installed (Prettier for most files)
2. Ensure `"editor.formatOnSave": true` in settings
3. Check language-specific settings

## File Associations

The workspace configures these file associations:
- `*.json` → JSON with Comments (jsonc)
- `Caddyfile` → Caddyfile syntax
- `.githooks/*` → Shell script

## Excluded Files

These files/folders are hidden in VS Code:
- `.git` folder
- `.DS_Store` (macOS)
- `node_modules`
- `.web.pid` (dev server PID)
- `.bridge.pid` (AI bridge PID)

## Git Integration

### GitLens

If GitLens is installed, you get:
- Blame annotations
- Commit search
- Repository view
- File history
- Line history

### Git Graph

Visual representation of git history:
1. Open Source Control
2. Click "Git Graph" icon
3. Explore commits visually

## Tips & Tricks

### 1. Quick File Navigation
- `Ctrl+P` - Quick open file by name
- `Ctrl+Shift+O` - Go to symbol in file
- `Ctrl+T` - Go to symbol in workspace

### 2. Multi-Cursor Editing
- `Alt+Click` - Add cursor
- `Ctrl+Alt+Down/Up` - Add cursor above/below
- `Ctrl+D` - Select next occurrence

### 3. Integrated Terminal
- `Ctrl+` `` - Toggle terminal
- `Ctrl+Shift+` `` - New terminal
- `Ctrl+Shift+5` - Split terminal

### 4. Code Snippets
Type these shortcuts and press Tab:
- `log` - console.log()
- `fun` - function declaration
- `arrf` - arrow function
- `desc` - describe block (testing)

### 5. Zen Mode
- `Ctrl+K Z` - Enter Zen mode (distraction-free)
- `Escape Escape` - Exit Zen mode

## Contributing

When contributing to Nixite:
1. Use the workspace settings (automatic)
2. Install recommended extensions
3. Use the pre-configured tasks
4. Run validation before committing
5. Format code automatically (on save)

The workspace configuration ensures consistent code style across all contributors!

## See Also

- [VS Code Documentation](https://code.visualstudio.com/docs)
- [VS Code Tips & Tricks](https://code.visualstudio.com/docs/getstarted/tips-and-tricks)
- [Debugging in VS Code](https://code.visualstudio.com/docs/editor/debugging)
- [Tasks in VS Code](https://code.visualstudio.com/docs/editor/tasks)

---

**Questions?** See [SUPPORT.md](../SUPPORT.md) or open an issue on GitHub.
