# Nixite Quick Reference

One-page cheat sheets for common tasks.

## 🚀 Quick Start

```bash
# Clone and start
git clone https://github.com/Luminous-Dynamics/nixite.git
cd nixite
./start.sh

# Open browser
http://localhost:8000
```

## 📦 Package Management

### Search for Packages
- Type in search box: `web browser`
- Click category to browse: `Connect > Firefox`
- Use voice: Click 🎤 and say "I need a web browser"

### Install Package
```bash
# Via UI
Click "Install Firefox" button

# Via CLI
nix-env -iA nixos.firefox

# With AI Bridge
curl -X POST http://localhost:8890/install \
  -H "Content-Type: application/json" \
  -d '{"package": "firefox"}'
```

## 🛠️ Development

### Start Development Server
```bash
# All services
./start.sh

# Web server only
python3 -m http.server 8000

# AI Bridge only
node nixite-luminous-bridge.js
```

### Run Tests
```bash
# All tests
npm test

# Specific tests
npm run test:config
npm run test:packages

# Verify installation
./verify.sh
```

### Configuration
```bash
# Use developer config
cp examples/developer-config.js config.js

# Use production config
cp examples/production-config.js config.js

# Custom config
vim config.js
```

## 🐳 Docker Deployment

### Quick Deploy
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Production Deploy
```bash
# Build production image
docker build -t nixite:2.1.0 .

# Run with custom port
docker run -d -p 8080:8000 nixite:2.1.0

# With AI Bridge
docker-compose up -d
```

## 🔧 NixOS Module

### Enable Module
```nix
# /etc/nixos/configuration.nix
{
  imports = [ ./path/to/nixite/nix/module.nix ];

  services.nixite = {
    enable = true;
    webPort = 8000;
    enableBridge = true;
  };
}
```

### Rebuild System
```bash
sudo nixos-rebuild switch
systemctl status nixite.service
```

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Use different port
python3 -m http.server 8001
```

### AI Bridge Not Working
```bash
# Check if running
curl http://localhost:8890/health

# Start manually
node nixite-luminous-bridge.js

# Check logs
journalctl -u nixite-bridge.service -f
```

### Package Not Loading
```bash
# Verify JSON syntax
cat nixite-packages.json | jq .

# Check config
cat config.js

# Hard refresh browser
Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

## 📊 API Endpoints

### Health Check
```bash
curl http://localhost:8890/health
```

### Intent Recognition
```bash
curl -X POST http://localhost:8890/intent \
  -H "Content-Type: application/json" \
  -d '{"query": "I need a web browser"}'
```

### Package Search
```bash
curl -X POST http://localhost:8890/search \
  -H "Content-Type: application/json" \
  -d '{"query": "photo editing"}'
```

### Package Installation
```bash
curl -X POST http://localhost:8890/install \
  -H "Content-Type: application/json" \
  -d '{"package": "firefox"}'
```

## 🔐 Security

### Production Checklist
- [ ] Change default ports
- [ ] Enable HTTPS with reverse proxy
- [ ] Restrict CORS origins
- [ ] Enable authentication
- [ ] Update systemd security settings
- [ ] Run security scan: `docker scan nixite:2.1.0`

### Hardening Systemd Service
```ini
[Service]
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
```

## 📝 Git Workflow

### Create Feature Branch
```bash
git checkout -b feature/my-feature
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

### Run CI Checks Locally
```bash
# Lint
npm run lint

# Test
npm test

# Verify
./verify.sh
```

## 🎨 Customization

### Add New Package
Edit `nixite-packages.json`:
```json
{
  "id": "myapp",
  "name": "My App",
  "description": "What it does",
  "category": "work"
}
```

### Modify UI Theme
Edit CSS variables in `index.html`:
```css
:root {
  --primary: #667eea;
  --secondary: #764ba2;
}
```

### Configure AI Settings
Edit `config.js`:
```javascript
ai: {
  confidenceThreshold: 0.7,
  enableHRM: true,
  enableGemma: true
}
```

## 📚 Documentation Links

- **Full Docs**: `docs/`
- **API Reference**: `docs/api/BRIDGE_API.md`
- **FAQ**: `docs/FAQ.md`
- **Getting Started**: `docs/development/GETTING_STARTED.md`
- **Docker Guide**: `docs/deployment/DOCKER.md`
- **NixOS Guide**: `docs/deployment/NIXOS.md`
- **Contributing**: `CONTRIBUTING.md`

## 🆘 Get Help

```bash
# Check version
cat package.json | grep version

# View logs
journalctl -u nixite.service -f

# Debug mode
export DEBUG=true
./start.sh
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Port in use | `lsof -i :8000` then `kill -9 <PID>` |
| Packages not loading | Check `nixite-packages.json` syntax |
| Config not applied | Hard refresh: Ctrl+Shift+R |
| Tests failing | Run `npm install` first |
| Docker build fails | Check Docker version: `docker --version` |
| AI Bridge timeout | Increase timeout in `config.js` |

## 🎯 Quick Commands

```bash
# Start everything
./start.sh

# Run tests
npm test

# Verify install
./verify.sh

# Docker deploy
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Git commit
git add . && git commit -m "feat: description"

# Push changes
git push origin <branch-name>
```

## 🔗 Useful URLs

- **Web UI**: http://localhost:8000
- **AI Bridge**: http://localhost:8890
- **Health Check**: http://localhost:8890/health
- **GitHub**: https://github.com/Luminous-Dynamics/nixite
- **NixOS Packages**: https://search.nixos.org/packages

---

**Need more details?** Check the full documentation in the `docs/` directory or open an issue on GitHub.
