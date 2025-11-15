# Nixite Development Cheatsheet

Quick reference for common commands, workflows, and shortcuts for Nixite development.

## Table of Contents

- [Essential Commands](#essential-commands)
- [Development Workflow](#development-workflow)
- [Testing Commands](#testing-commands)
- [Git Commands](#git-commands)
- [Docker Commands](#docker-commands)
- [NixOS Commands](#nixos-commands)
- [Debugging](#debugging)
- [Validation & Quality](#validation--quality)
- [VS Code Shortcuts](#vs-code-shortcuts)
- [Useful One-Liners](#useful-one-liners)

## Essential Commands

### Quick Start

```bash
# Clone and start (first time)
git clone https://github.com/Luminous-Dynamics/nixite.git
cd nixite
./scripts/dev.sh setup
./scripts/dev.sh start

# Daily start
./scripts/dev.sh start

# Check status
./scripts/dev.sh status

# Stop everything
./scripts/dev.sh stop
```

### Helper Script

```bash
# All-in-one development script
./scripts/dev.sh <command>

# Available commands:
./scripts/dev.sh setup     # Initial setup
./scripts/dev.sh start     # Start servers
./scripts/dev.sh stop      # Stop servers
./scripts/dev.sh restart   # Restart servers
./scripts/dev.sh status    # Check status
./scripts/dev.sh logs      # View logs
./scripts/dev.sh clean     # Clean temp files
./scripts/dev.sh help      # Show help
```

### Project Stats

```bash
# View comprehensive project statistics
./scripts/stats.sh

# Quick stats
find . -type f -name "*.js" ! -path "./node_modules/*" | wc -l  # JS files
find . -type f -name "*.md" | wc -l                              # Docs
git log --oneline | wc -l                                        # Commits
```

## Development Workflow

### Starting Development

```bash
# 1. Start development environment
./scripts/dev.sh start

# 2. Open in browser
open http://localhost:8000
# Or
xdg-open http://localhost:8000

# 3. Monitor logs
tail -f .web.log .bridge.log
```

### Making Changes

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes to code

# 3. Validate configuration
node scripts/validate-config.js config.js

# 4. Validate package data
node scripts/validate-packages.js nixite-packages.json

# 5. Test changes
npm test

# 6. Preview in browser
# Changes auto-reload (no restart needed for HTML/CSS/JS)
```

### Before Committing

```bash
# Validate everything
node scripts/validate-config.js config.js
node scripts/validate-packages.js nixite-packages.json
npm test

# Or use pre-commit hook
git config core.hooksPath .githooks
# Now 'git commit' auto-validates
```

## Testing Commands

### Run All Tests

```bash
npm test                    # All tests
npm run test:config         # Config tests only
npm run test:packages       # Package tests only
```

### Manual Testing

```bash
# Test web server
curl http://localhost:8000
curl -I http://localhost:8000  # Headers only

# Test AI Bridge
curl http://localhost:8890/health
curl -X POST http://localhost:8890/feedback \
  -H "Content-Type: application/json" \
  -d '{"packageName":"vim","feedback":"Great editor"}'

# Test package loading
curl http://localhost:8000/nixite-packages.json | jq .

# Test configuration
node -e "const config = require('./config.js'); console.log(JSON.stringify(config, null, 2))"
```

### Validation

```bash
# Validate configuration
node scripts/validate-config.js config.js

# Validate packages
node scripts/validate-packages.js nixite-packages.json

# Validate JSON syntax
cat nixite-packages.json | jq .
cat config.js | node -c

# Check for JavaScript syntax errors
find . -name "*.js" ! -path "./node_modules/*" -exec node -c {} \;
```

## Git Commands

### Daily Workflow

```bash
# Update from remote
git pull origin main

# Create feature branch
git checkout -b feature/my-feature

# Stage changes
git add .
git add -p  # Interactive staging

# Commit
git commit -m "feat: add new feature"

# Push
git push origin feature/my-feature

# Create PR (using gh CLI)
gh pr create --title "Add new feature" --body "Description"
```

### Useful Git Commands

```bash
# View status
git status
git status -sb  # Short format

# View changes
git diff
git diff --staged
git diff HEAD~1  # Compare with last commit

# View history
git log --oneline
git log --graph --oneline --all --decorate
git log -p config.js  # Changes to specific file

# Undo changes
git checkout -- file.js     # Discard changes
git reset HEAD file.js      # Unstage
git reset --soft HEAD~1     # Undo last commit (keep changes)
git reset --hard HEAD~1     # Undo last commit (discard changes)

# Stash changes
git stash
git stash list
git stash pop
git stash apply stash@{0}

# Branch management
git branch                  # List branches
git branch -d feature/old   # Delete branch
git checkout main           # Switch branch
git merge feature/new       # Merge branch
```

### Git Hooks

```bash
# Install git hooks
git config core.hooksPath .githooks

# Manually run pre-commit
./.githooks/pre-commit

# Bypass hooks (not recommended)
git commit --no-verify
```

## Docker Commands

### Basic Operations

```bash
# Build image
docker build -t nixite:latest .

# Run container
docker run -d -p 8000:8000 --name nixite-web nixite:latest

# View logs
docker logs nixite-web
docker logs -f nixite-web  # Follow

# Stop/start
docker stop nixite-web
docker start nixite-web
docker restart nixite-web

# Remove
docker rm nixite-web
docker rmi nixite:latest
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs
docker-compose logs -f
docker-compose logs -f web  # Specific service

# Stop services
docker-compose stop
docker-compose down

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Execute command in container
docker-compose exec web sh
docker-compose exec bridge node --version
```

### Docker Debugging

```bash
# Interactive shell
docker exec -it nixite-web sh
docker exec -it nixite-bridge sh

# Inspect container
docker inspect nixite-web
docker inspect nixite-web | jq '.[0].NetworkSettings.Ports'

# View processes
docker top nixite-web

# Resource usage
docker stats nixite-web
docker stats --no-stream
```

## NixOS Commands

### Package Management

```bash
# Search for packages
nix search nixpkgs nixite
nix-env -qaP | grep nixite

# Install package
nix-env -iA nixpkgs.nixite

# List installed
nix-env -q
nix-env -q --installed

# Remove package
nix-env -e nixite

# Update channels
sudo nix-channel --update
```

### System Configuration

```bash
# Edit configuration
sudo nano /etc/nixos/configuration.nix

# Test configuration
sudo nixos-rebuild test

# Apply configuration
sudo nixos-rebuild switch

# Rollback
sudo nixos-rebuild switch --rollback

# View generations
sudo nix-env --list-generations --profile /nix/var/nix/profiles/system
```

### Nixite Service (NixOS Module)

```bash
# Check service status
sudo systemctl status nixite.service

# Start/stop/restart
sudo systemctl start nixite
sudo systemctl stop nixite
sudo systemctl restart nixite

# Enable/disable autostart
sudo systemctl enable nixite
sudo systemctl disable nixite

# View logs
sudo journalctl -u nixite.service
sudo journalctl -u nixite.service -f
sudo journalctl -u nixite.service -n 100
```

## Debugging

### Server Debugging

```bash
# Run web server in foreground
python3 -m http.server 8000

# Run AI Bridge with debug
DEBUG=* node nixite-luminous-bridge.js
DEBUG=express:* node nixite-luminous-bridge.js

# Check what's using a port
lsof -i :8000
lsof -i :8890
netstat -tuln | grep 8000
ss -tuln | grep 8000

# Kill process on port
lsof -ti:8000 | xargs kill -9
```

### Log Analysis

```bash
# View logs
cat .web.log
cat .bridge.log
tail -f .web.log .bridge.log

# Search logs for errors
grep -i error .web.log .bridge.log
grep -i warn .web.log

# Last 100 lines
tail -n 100 .web.log

# Follow new entries
tail -f .web.log

# Filter by pattern
grep "ERROR" .web.log | less
```

### Network Debugging

```bash
# Test connectivity
ping localhost
telnet localhost 8000
nc -zv localhost 8000

# HTTP testing
curl -v http://localhost:8000
curl -I http://localhost:8000
wget http://localhost:8000 -O /dev/null

# DNS testing
nslookup nixite.example.com
dig nixite.example.com

# Trace network calls
tcpdump -i lo port 8000
tcpdump -i lo port 8890 -A
```

### Process Debugging

```bash
# Find processes
ps aux | grep python
ps aux | grep node
pgrep -f "python.*8000"

# Monitor processes
top
htop
top -p $(pgrep -f "python.*8000")

# System resources
free -h
df -h
iostat -x 1
vmstat 1
```

## Validation & Quality

### Configuration Validation

```bash
# Validate config.js
node scripts/validate-config.js config.js

# Validate with verbose output
DEBUG=1 node scripts/validate-config.js config.js

# Quick syntax check
node -c config.js
```

### Package Validation

```bash
# Validate package data
node scripts/validate-packages.js nixite-packages.json

# Count packages
grep -c '"id":' nixite-packages.json

# List all package IDs
grep -oP '(?<="id": ")[^"]*' nixite-packages.json

# Check for duplicates
grep -oP '(?<="id": ")[^"]*' nixite-packages.json | sort | uniq -d
```

### Code Quality

```bash
# Check for syntax errors
find . -name "*.js" ! -path "./node_modules/*" -exec node -c {} \;

# Find console.log statements
grep -r "console.log" . --include="*.js" --exclude-dir=node_modules

# Find TODO comments
grep -r "TODO\|FIXME\|XXX" . --include="*.js" --exclude-dir=node_modules

# Count lines by file type
find . -name "*.js" ! -path "./node_modules/*" | xargs wc -l | sort -n
find . -name "*.md" | xargs wc -w | sort -n  # Word count for docs
```

## VS Code Shortcuts

### General

- `Ctrl+Shift+P` - Command palette
- `Ctrl+P` - Quick open file
- `Ctrl+Shift+B` - Run build task (starts dev server)
- `F5` - Start debugging
- `Ctrl+` ` ` - Toggle terminal
- `Ctrl+Shift+E` - Explorer
- `Ctrl+Shift+F` - Search in files

### Editing

- `Alt+Click` - Add cursor
- `Ctrl+D` - Select next occurrence
- `Ctrl+Shift+L` - Select all occurrences
- `Ctrl+/` - Toggle comment
- `Shift+Alt+F` - Format document
- `Ctrl+Space` - Trigger suggestions

### Navigation

- `Ctrl+Shift+O` - Go to symbol in file
- `Ctrl+T` - Go to symbol in workspace
- `F12` - Go to definition
- `Alt+Left/Right` - Go back/forward
- `Ctrl+G` - Go to line

### Tasks (Configured in .vscode/tasks.json)

- `Ctrl+Shift+B` → "Start Development Server"
- `Ctrl+Shift+P` → "Tasks: Run Task" → "Run All Tests"
- `Ctrl+Shift+P` → "Tasks: Run Task" → "Validate Configuration"
- `Ctrl+Shift+P` → "Tasks: Run Task" → "Docker: Build"

## Useful One-Liners

### File Operations

```bash
# Find largest files
find . -type f ! -path "./node_modules/*" ! -path "./.git/*" -exec du -h {} + | sort -rh | head -20

# Count files by type
find . -type f ! -path "./node_modules/*" | sed 's/.*\.//' | sort | uniq -c | sort -rn

# Find empty files
find . -type f -empty

# Find files modified in last 24 hours
find . -type f -mtime -1

# Remove all .log files
find . -name "*.log" -delete
```

### Text Processing

```bash
# Count unique IPs in nginx access log
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn

# Extract emails from files
grep -r -oE "\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b" .

# Replace text in multiple files
find . -name "*.js" -exec sed -i 's/oldtext/newtext/g' {} +

# Count word frequency
cat README.md | tr ' ' '\n' | sort | uniq -c | sort -rn | head -20
```

### System Monitoring

```bash
# Watch command output (updates every 2s)
watch -n 2 './scripts/dev.sh status'

# Monitor disk usage
watch -n 5 'df -h | grep -E "Filesystem|/$"'

# Monitor network connections
watch -n 1 'netstat -tuln | grep -E "8000|8890"'

# Monitor process
watch -n 1 'ps aux | grep -E "python.*8000|node.*8890"'
```

### Package Management

```bash
# Count packages by category
for cat in create connect grow work play secure manage serve; do
  echo "$cat: $(grep -c "\"category\": \"$cat\"" nixite-packages.json)"
done

# List packages in category
jq -r '.[] | select(.category=="create") | .name' nixite-packages.json

# Find packages by keyword
jq -r '.[] | select(.description | contains("editor")) | "\(.name): \(.description)"' nixite-packages.json
```

### Git Statistics

```bash
# Commit count by author
git shortlog -sn

# Files changed most often
git log --pretty=format: --name-only | sort | uniq -c | sort -rn | head -20

# Commits per day
git log --pretty=format:"%ad" --date=short | sort | uniq -c

# Lines added/removed per author
git log --author="Author Name" --pretty=tformat: --numstat | \
  awk '{added+=$1; removed+=$2} END {print "Added:", added, "Removed:", removed}'
```

## Quick Reference Card

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                  NIXITE QUICK REFERENCE                    ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ Development                                                ┃
┃   ./scripts/dev.sh start     Start development             ┃
┃   ./scripts/dev.sh stop      Stop servers                  ┃
┃   ./scripts/dev.sh status    Check status                  ┃
┃   ./scripts/dev.sh logs      View logs                     ┃
┃   ./scripts/stats.sh         Project statistics            ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ Testing                                                    ┃
┃   npm test                   All tests                     ┃
┃   npm run test:config        Config tests                  ┃
┃   npm run test:packages      Package tests                 ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ Validation                                                 ┃
┃   node scripts/validate-config.js config.js                ┃
┃   node scripts/validate-packages.js nixite-packages.json   ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ URLs                                                       ┃
┃   http://localhost:8000      Web interface                 ┃
┃   http://localhost:8890      AI Bridge                     ┃
┃   http://localhost:8890/health  Health check               ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ Logs                                                       ┃
┃   tail -f .web.log           Web server log                ┃
┃   tail -f .bridge.log        AI Bridge log                 ┃
┃   journalctl -u nixite -f    systemd logs (NixOS)          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

## Additional Resources

- **Documentation:** [docs/README.md](README.md)
- **Troubleshooting:** [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Support:** [SUPPORT.md](../SUPPORT.md)
- **Contributing:** [CONTRIBUTING.md](../CONTRIBUTING.md)
- **VS Code Setup:** [.vscode/README.md](../.vscode/README.md)

---

**Pro Tip:** Bookmark this file in your browser or pin it in your editor for quick access!

**Last Updated:** 2024-01-15
