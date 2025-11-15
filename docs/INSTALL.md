# Nixite Installation Guide

Comprehensive installation instructions for all platforms and deployment methods.

## 📋 Table of Contents

- [Quick Install](#quick-install)
- [Platform-Specific Installation](#platform-specific-installation)
  - [NixOS](#nixos)
  - [Linux](#linux)
  - [macOS](#macos)
  - [Windows](#windows)
- [Deployment Methods](#deployment-methods)
  - [Docker](#docker)
  - [Docker Compose](#docker-compose)
  - [Kubernetes](#kubernetes)
  - [Cloud Platforms](#cloud-platforms)
- [AI Bridge Setup](#ai-bridge-setup)
- [Verification](#verification)
- [Uninstallation](#uninstallation)

## ⚡ Quick Install

**Fastest way to get started:**

```bash
# Clone repository
git clone https://github.com/Luminous-Dynamics/nixite.git
cd nixite

# Start web interface
python3 -m http.server 8000

# Open browser
open http://localhost:8000
```

For more options, continue reading below.

## 🖥️ Platform-Specific Installation

### NixOS

Nixite integrates natively with NixOS using flakes.

#### Method 1: NixOS Flakes (Recommended)

1. **Add to flake.nix:**

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixite.url = "github:Luminous-Dynamics/nixite";
  };

  outputs = { self, nixpkgs, nixite }: {
    nixosConfigurations.your-hostname = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        nixite.nixosModules.default
        {
          services.nixite = {
            enable = true;
            port = 8000;
            aiBridge = {
              enable = true;
              port = 8890;
            };
          };
        }
      ];
    };
  };
}
```

2. **Rebuild:**

```bash
sudo nixos-rebuild switch --flake .#your-hostname
```

3. **Access Nixite:**

```
http://localhost:8000
```

#### Method 2: NixOS Module (without flakes)

1. **Copy module:**

```bash
sudo cp examples/nixos/flake-integration.nix /etc/nixos/nixite.nix
```

2. **Import in configuration.nix:**

```nix
{
  imports = [
    ./nixite.nix
  ];

  services.nixite.enable = true;
}
```

3. **Rebuild:**

```bash
sudo nixos-rebuild switch
```

#### Method 3: Manual NixOS Setup

```bash
# Clone to /srv
sudo git clone https://github.com/Luminous-Dynamics/nixite.git /srv/nixite
cd /srv/nixite

# Create systemd service
sudo cp examples/nixos/nixite.service /etc/systemd/system/

# Enable and start
sudo systemctl enable nixite
sudo systemctl start nixite
```

**Check status:**
```bash
systemctl status nixite
```

### Linux

Works on all major Linux distributions.

#### Ubuntu/Debian

```bash
# Install dependencies
sudo apt update
sudo apt install -y python3 nodejs npm git

# Clone repository
git clone https://github.com/Luminous-Dynamics/nixite.git
cd nixite

# Start web server
python3 -m http.server 8000

# (Optional) Start AI Bridge
node nixite-luminous-bridge.js
```

#### Fedora/RHEL/CentOS

```bash
# Install dependencies
sudo dnf install -y python3 nodejs npm git

# Clone repository
git clone https://github.com/Luminous-Dynamics/nixite.git
cd nixite

# Start services
python3 -m http.server 8000
```

#### Arch Linux

```bash
# Install dependencies
sudo pacman -S python nodejs npm git

# Clone repository
git clone https://github.com/Luminous-Dynamics/nixite.git
cd nixite

# Start services
python3 -m http.server 8000
```

#### Alpine Linux

```bash
# Install dependencies
sudo apk add python3 nodejs npm git

# Clone repository
git clone https://github.com/Luminous-Dynamics/nixite.git
cd nixite

# Start services
python3 -m http.server 8000
```

#### Systemd Service (All Linux)

To run Nixite as a system service:

1. **Create service file:**

```bash
sudo tee /etc/systemd/system/nixite.service > /dev/null <<EOF
[Unit]
Description=Nixite Web Interface
After=network.target

[Service]
Type=simple
User=nixite
WorkingDirectory=/opt/nixite
ExecStart=/usr/bin/python3 -m http.server 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF
```

2. **Install Nixite:**

```bash
sudo mkdir -p /opt
sudo git clone https://github.com/Luminous-Dynamics/nixite.git /opt/nixite
sudo useradd -r -s /bin/false nixite
sudo chown -R nixite:nixite /opt/nixite
```

3. **Enable and start:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable nixite
sudo systemctl start nixite
```

### macOS

#### Using Homebrew (Recommended)

```bash
# Install dependencies (if not already installed)
brew install python node git

# Clone repository
git clone https://github.com/Luminous-Dynamics/nixite.git
cd nixite

# Start web server
python3 -m http.server 8000
```

#### Manual Installation

1. **Install Python 3** (if needed):
   - Download from [python.org](https://www.python.org/downloads/)
   - Or use system Python 3

2. **Install Node.js** (optional, for AI features):
   - Download from [nodejs.org](https://nodejs.org/)
   - Or: `brew install node`

3. **Clone and run:**

```bash
git clone https://github.com/Luminous-Dynamics/nixite.git
cd nixite
python3 -m http.server 8000
```

#### Launch Agent (Auto-start on macOS)

1. **Create launch agent:**

```bash
mkdir -p ~/Library/LaunchAgents
tee ~/Library/LaunchAgents/org.luminousdynamics.nixite.plist > /dev/null <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>org.luminousdynamics.nixite</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>-m</string>
        <string>http.server</string>
        <string>8000</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$HOME/nixite</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF
```

2. **Load agent:**

```bash
launchctl load ~/Library/LaunchAgents/org.luminousdynamics.nixite.plist
```

### Windows

#### Using WSL (Recommended)

1. **Install WSL:**

```powershell
wsl --install
```

2. **Inside WSL (Ubuntu):**

```bash
# Update packages
sudo apt update
sudo apt install -y python3 git

# Clone repository
git clone https://github.com/Luminous-Dynamics/nixite.git
cd nixite

# Start server
python3 -m http.server 8000
```

3. **Access from Windows:**
```
http://localhost:8000
```

#### Native Windows

1. **Install Python:**
   - Download from [python.org](https://www.python.org/downloads/)
   - Check "Add Python to PATH" during installation

2. **Install Git:**
   - Download from [git-scm.com](https://git-scm.com/)

3. **Clone and run:**

```powershell
# In PowerShell or CMD
git clone https://github.com/Luminous-Dynamics/nixite.git
cd nixite
python -m http.server 8000
```

4. **Open browser:**
```
http://localhost:8000
```

#### Windows Service (Advanced)

Use [NSSM](https://nssm.cc/) to run Nixite as a Windows service:

```powershell
# Download NSSM and install the service
nssm install Nixite "C:\Python39\python.exe" "-m http.server 8000"
nssm set Nixite AppDirectory "C:\path\to\nixite"
nssm start Nixite
```

## 🐳 Deployment Methods

### Docker

#### Quick Start

```bash
# Build image
docker build -t nixite:latest .

# Run container
docker run -d -p 8000:8000 --name nixite nixite:latest

# Access Nixite
open http://localhost:8000
```

#### With AI Bridge

```bash
# Build images
docker build -t nixite:latest .
docker build -t nixite-bridge:latest -f Dockerfile.bridge .

# Run web interface
docker run -d -p 8000:8000 --name nixite-web nixite:latest

# Run AI Bridge (requires Ollama)
docker run -d -p 8890:8890 --name nixite-bridge \
  -e OLLAMA_HOST=host.docker.internal:11434 \
  nixite-bridge:latest
```

#### Using Pre-built Images

```bash
# Pull from GitHub Container Registry
docker pull ghcr.io/luminous-dynamics/nixite:latest

# Run
docker run -d -p 8000:8000 ghcr.io/luminous-dynamics/nixite:latest
```

### Docker Compose

#### Basic Setup

```bash
# Clone repository
git clone https://github.com/Luminous-Dynamics/nixite.git
cd nixite

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

#### Production Setup with Security

```bash
# Use hardened configuration
docker compose -f examples/security/docker-security.yml up -d
```

#### Customize

Edit `docker-compose.yml` or create `docker-compose.override.yml`:

```yaml
version: '3.8'

services:
  nixite-web:
    ports:
      - "80:8000"  # Custom port
    environment:
      - CUSTOM_VAR=value
```

### Kubernetes

#### Quick Deploy

```bash
# Apply manifests
kubectl apply -f k8s/manifests/nixite.yaml

# Wait for pods
kubectl wait --for=condition=ready pod -l app=nixite-web -n nixite --timeout=300s

# Get ingress URL
kubectl get ingress -n nixite
```

#### Production Deploy

See [k8s/README.md](../k8s/README.md) for complete guide.

```bash
# Install prerequisites
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Deploy Nixite
kubectl apply -f k8s/manifests/nixite.yaml

# Configure ingress
kubectl edit ingress nixite-ingress -n nixite
# Update spec.rules[0].host to your domain

# Monitor deployment
kubectl get pods -n nixite -w
```

### Cloud Platforms

#### AWS EKS (with Terraform)

```bash
# Clone repository
git clone https://github.com/Luminous-Dynamics/nixite.git
cd nixite/terraform/aws

# Configure
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Edit configuration

# Deploy infrastructure
terraform init
terraform plan
terraform apply

# Configure kubectl
aws eks update-kubeconfig --region us-east-1 --name nixite-prod

# Deploy Nixite
kubectl apply -f ../../k8s/manifests/nixite.yaml
```

See [terraform/README.md](../terraform/README.md) for complete guide.

#### Google Cloud Run

```bash
# Build and push image
gcloud builds submit --tag gcr.io/PROJECT_ID/nixite

# Deploy
gcloud run deploy nixite \
  --image gcr.io/PROJECT_ID/nixite \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Azure Container Instances

```bash
# Create resource group
az group create --name nixite-rg --location eastus

# Deploy container
az container create \
  --resource-group nixite-rg \
  --name nixite \
  --image ghcr.io/luminous-dynamics/nixite:latest \
  --dns-name-label nixite-app \
  --ports 8000
```

#### DigitalOcean App Platform

```bash
# Install doctl
snap install doctl

# Create app
doctl apps create --spec .do/app.yaml
```

#### Heroku

```bash
# Login
heroku login

# Create app
heroku create your-nixite-app

# Deploy
git push heroku main

# Open
heroku open
```

## 🤖 AI Bridge Setup

The AI Bridge provides intelligent package recommendations and natural language search.

### Prerequisites

- Node.js 14 or later
- Ollama installed and running

### Install Ollama

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve
```

**macOS:**
```bash
brew install ollama
ollama serve
```

**Windows (WSL):**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve
```

### Download AI Model

```bash
# Recommended: Gemma 2B (good balance)
ollama pull gemma:2b

# Alternative: Smaller model (faster, less accurate)
ollama pull tinyllama

# Alternative: Larger model (slower, more accurate)
ollama pull gemma:7b
```

### Start AI Bridge

```bash
# Default configuration
node nixite-luminous-bridge.js

# Custom Ollama host
OLLAMA_HOST=http://remote-host:11434 node nixite-luminous-bridge.js

# Custom port
AI_BRIDGE_PORT=9000 node nixite-luminous-bridge.js
```

### Verify AI Bridge

```bash
# Check health
curl http://localhost:8890/health

# Test search
curl -X POST http://localhost:8890/search \
  -H "Content-Type: application/json" \
  -d '{"query": "video editor"}'
```

### Configuration

Edit `config.js` or set environment variables:

```javascript
module.exports = {
  aiBridge: {
    enabled: true,
    host: 'http://localhost:8890',
    timeout: 30000
  },
  ollama: {
    host: 'http://localhost:11434',
    model: 'gemma:2b'
  }
};
```

## ✅ Verification

### Verify Web Interface

```bash
# Check web server is running
curl -I http://localhost:8000

# Expected: HTTP/1.0 200 OK
```

### Verify AI Bridge

```bash
# Check AI Bridge health
curl http://localhost:8890/health

# Expected: {"status":"healthy","ollama":"connected"}
```

### Run Tests

```bash
# Configuration tests
npm run test:config

# Package validation
npm run test:packages

# Integration tests
npm run test:integration

# All tests
npm run test:all
```

### Health Check

```bash
# Run comprehensive health check
./scripts/health-check.sh

# Should show all green checkmarks
```

## 🗑️ Uninstallation

### Remove Nixite Files

```bash
# If installed in home directory
rm -rf ~/nixite

# If installed system-wide
sudo rm -rf /opt/nixite
sudo rm -rf /srv/nixite
```

### Remove System Service

**Systemd (Linux):**
```bash
sudo systemctl stop nixite nixite-bridge
sudo systemctl disable nixite nixite-bridge
sudo rm /etc/systemd/system/nixite*.service
sudo systemctl daemon-reload
```

**Launchd (macOS):**
```bash
launchctl unload ~/Library/LaunchAgents/org.luminousdynamics.nixite.plist
rm ~/Library/LaunchAgents/org.luminousdynamics.nixite.plist
```

**Windows Service:**
```powershell
nssm stop Nixite
nssm remove Nixite confirm
```

### Remove Docker

```bash
# Stop and remove containers
docker compose down
docker rm -f nixite nixite-bridge

# Remove images
docker rmi nixite:latest nixite-bridge:latest

# Remove volumes (optional)
docker volume prune
```

### Remove Kubernetes

```bash
# Delete namespace (removes everything)
kubectl delete namespace nixite

# Or delete individual resources
kubectl delete -f k8s/manifests/nixite.yaml
```

### Uninstall Ollama

**Linux:**
```bash
sudo systemctl stop ollama
sudo rm /usr/local/bin/ollama
sudo rm -rf /usr/share/ollama
sudo rm /etc/systemd/system/ollama.service
```

**macOS:**
```bash
brew uninstall ollama
```

## 🆘 Installation Troubleshooting

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :8000

# Kill process
kill -9 PID

# Or use different port
python3 -m http.server 8001
```

### Permission Denied

```bash
# Fix file permissions
chmod +x nixite-luminous-bridge.js
chmod +x scripts/*.sh

# Or run with sudo (not recommended)
sudo python3 -m http.server 8000
```

### Python Not Found

**Linux:**
```bash
# Install Python
sudo apt install python3  # Ubuntu/Debian
sudo dnf install python3  # Fedora
sudo pacman -S python     # Arch
```

**macOS:**
```bash
brew install python3
```

**Windows:**
- Download from [python.org](https://www.python.org/downloads/)
- Add to PATH during installation

### Node.js Not Found

**Linux:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

**macOS:**
```bash
brew install node
```

**Windows:**
- Download from [nodejs.org](https://nodejs.org/)

### Ollama Connection Failed

```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve

# Check model is downloaded
ollama list
```

### Docker Build Fails

```bash
# Clear Docker cache
docker builder prune -a

# Rebuild without cache
docker build --no-cache -t nixite:latest .

# Check Docker daemon
sudo systemctl status docker
```

## 📚 Next Steps

After installation:

1. **[QUICKSTART.md](QUICKSTART.md)** - Quick usage guide
2. **[AI_BRIDGE.md](AI_BRIDGE.md)** - AI features documentation
3. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues
4. **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Help improve Nixite

## 🤝 Getting Help

**Installation issues?**
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Search [GitHub Issues](https://github.com/Luminous-Dynamics/nixite/issues)
- Create a new issue with:
  - Your OS and version
  - Installation method used
  - Complete error message
  - Steps to reproduce

---

**📌 Installation Summary:**
- **Easiest:** Clone + Python server (2 minutes)
- **Production:** Docker Compose or Kubernetes (15-30 minutes)
- **Enterprise:** Terraform + EKS (45-60 minutes)
- **Full Stack:** Web + AI Bridge + Ollama (10-15 minutes)

Choose the method that best fits your needs!
