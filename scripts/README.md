# Utility Scripts

Helper scripts for development, testing, and deployment.

## Available Scripts

### Development Script (`dev.sh`)

**Purpose**: Simplify common development tasks

**Usage**:
```bash
./scripts/dev.sh <command> [options]
```

**Commands**:

- `setup` - First-time development environment setup
  ```bash
  ./scripts/dev.sh setup
  ```

- `start` - Start development servers (web + optional AI bridge)
  ```bash
  ./scripts/dev.sh start
  ```

- `stop` - Stop all running development servers
  ```bash
  ./scripts/dev.sh stop
  ```

- `test [name]` - Run tests (all or specific)
  ```bash
  ./scripts/dev.sh test          # All tests
  ./scripts/dev.sh test config   # Config tests only
  ./scripts/dev.sh test packages # Package tests only
  ```

- `verify` - Run installation verification
  ```bash
  ./scripts/dev.sh verify
  ```

- `lint` - Lint JSON and JavaScript files
  ```bash
  ./scripts/dev.sh lint
  ```

- `clean [--all]` - Clean temporary files
  ```bash
  ./scripts/dev.sh clean        # Clean PID files
  ./scripts/dev.sh clean --all  # Also remove node_modules
  ```

- `build` - Build and verify project
  ```bash
  ./scripts/dev.sh build
  ```

- `docker` - Docker operations
  ```bash
  ./scripts/dev.sh docker build    # Build image
  ./scripts/dev.sh docker run      # Run container
  ./scripts/dev.sh docker stop     # Stop container
  ./scripts/dev.sh docker compose  # Start with compose
  ./scripts/dev.sh docker down     # Stop compose
  ```

- `logs` - View service logs
  ```bash
  ./scripts/dev.sh logs web     # Web server logs
  ./scripts/dev.sh logs bridge  # AI bridge logs
  ./scripts/dev.sh logs docker  # Docker logs
  ```

- `status` - Check service status
  ```bash
  ./scripts/dev.sh status
  ```

**Typical Development Workflow**:
```bash
# First time setup
./scripts/dev.sh setup

# Start development
./scripts/dev.sh start

# Make changes...

# Test changes
./scripts/dev.sh test

# Verify everything works
./scripts/dev.sh verify

# Stop servers
./scripts/dev.sh stop
```

### Deployment Script (`deploy.sh`)

**Purpose**: Simplify deployment to various platforms

**Usage**:
```bash
./scripts/deploy.sh <command>
```

**Commands**:

- `docker` - Deploy using Docker and docker-compose
  ```bash
  ./scripts/deploy.sh docker
  ```

- `nixos` - Deploy on NixOS using module
  ```bash
  ./scripts/deploy.sh nixos
  ```

- `systemd` - Deploy using systemd services
  ```bash
  ./scripts/deploy.sh systemd
  ```

- `manual` - Show manual deployment instructions
  ```bash
  ./scripts/deploy.sh manual
  ```

- `check` - Check production readiness
  ```bash
  ./scripts/deploy.sh check
  ```

- `rollback` - Rollback to previous deployment
  ```bash
  ./scripts/deploy.sh rollback
  ```

**Typical Deployment Workflow**:

**Docker Deployment**:
```bash
# Check if ready
./scripts/deploy.sh check

# Deploy with Docker
./scripts/deploy.sh docker

# Verify
curl http://localhost:8000
```

**NixOS Deployment**:
```bash
# Check if ready
./scripts/deploy.sh check

# Deploy on NixOS
./scripts/deploy.sh nixos

# Follow interactive prompts
```

**Systemd Deployment**:
```bash
# Check if ready
./scripts/deploy.sh check

# Deploy with systemd
./scripts/deploy.sh systemd

# Check status
sudo systemctl status nixite.service
```

## Script Features

### Common Features

All scripts include:
- ✅ Colored output for better readability
- ✅ Error handling and validation
- ✅ Clear success/error messages
- ✅ Interactive prompts when needed
- ✅ Help documentation

### Development Script Features

- Automatic port conflict detection
- PID file management
- Configuration file setup
- Parallel service management
- Docker integration
- Log viewing

### Deployment Script Features

- Production readiness checks
- Multiple deployment targets
- Environment configuration
- Service management
- Rollback support

## Making Scripts Executable

If scripts aren't executable:
```bash
chmod +x scripts/*.sh
```

## Troubleshooting

### Script won't run

**Error**: `Permission denied`

**Solution**:
```bash
chmod +x scripts/dev.sh
./scripts/dev.sh help
```

### Port already in use

**Error**: `Port 8000 is already in use`

**Solution**:
```bash
./scripts/dev.sh stop  # Stop existing servers
# Or manually:
lsof -ti:8000 | xargs kill
```

### Command not found

**Error**: `command not found: docker`

**Solution**: Install missing dependencies:
- Docker: https://docs.docker.com/get-docker/
- Node.js: https://nodejs.org/
- Python 3: Usually pre-installed

### Tests failing

**Solution**:
```bash
# Install dependencies first
npm install

# Then run tests
./scripts/dev.sh test
```

## Examples

### Quick Development Session

```bash
# Setup (first time only)
./scripts/dev.sh setup

# Start development
./scripts/dev.sh start

# In another terminal, run tests
./scripts/dev.sh test

# Check what's running
./scripts/dev.sh status

# When done
./scripts/dev.sh stop
```

### Pre-deployment Check

```bash
# Verify everything works
./scripts/dev.sh verify

# Run all tests
./scripts/dev.sh test

# Check production readiness
./scripts/deploy.sh check

# If all good, deploy
./scripts/deploy.sh docker
```

### Docker Development

```bash
# Build Docker image
./scripts/dev.sh docker build

# Start with compose
./scripts/dev.sh docker compose

# View logs
./scripts/dev.sh docker logs

# Stop when done
./scripts/dev.sh docker down
```

### Debugging

```bash
# Check service status
./scripts/dev.sh status

# View logs
./scripts/dev.sh logs web

# Verify installation
./scripts/dev.sh verify

# Lint code
./scripts/dev.sh lint
```

## Advanced Usage

### Custom Port

The scripts use default ports, but you can customize:

**For web server**:
```bash
# Edit start command in dev.sh
python3 -m http.server 8080  # Change 8000 to 8080
```

**For Docker**:
```bash
# Edit docker-compose.yml
ports:
  - "8080:8000"  # Change external port
```

### Environment Variables

**Development**:
```bash
export DEBUG=true
./scripts/dev.sh start
```

**Production**:
```bash
export NIXITE_API_BASE=https://api.example.com
export NIXITE_BRIDGE=https://bridge.example.com
./scripts/deploy.sh check
```

### Automated Testing

**Run tests before every commit**:
```bash
# .git/hooks/pre-commit
#!/bin/bash
./scripts/dev.sh test || exit 1
```

**Run tests in CI/CD**:
```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: ./scripts/dev.sh test
```

## Contributing

When adding new scripts:

1. Follow the existing pattern
2. Add colored output
3. Include error handling
4. Add to this README
5. Make executable
6. Test thoroughly

## See Also

- Main startup script: `start.sh`
- Verification script: `verify.sh`
- Development guide: `docs/development/GETTING_STARTED.md`
- Deployment guides: `docs/deployment/`

---

**Questions?** Check `docs/FAQ.md` or open an issue.
