# Upgrade & Migration Guide

Complete guide for upgrading Nixite and migrating between deployment methods.

## Table of Contents

- [Version Upgrades](#version-upgrades)
- [Migration Paths](#migration-paths)
- [Breaking Changes](#breaking-changes)
- [Rollback Procedures](#rollback-procedures)
- [Best Practices](#best-practices)

## Version Upgrades

### Upgrading from v2.0.x to v2.1.x

#### Changes in v2.1.0

**New Features:**
- Enhanced developer tooling (health checks, stats dashboard)
- VS Code workspace integration
- GitHub labels system
- Advanced NixOS examples
- Comprehensive documentation (+5,000 words)

**Breaking Changes:**
- None (backward compatible)

#### Upgrade Procedure

**Method 1: Git Pull (Development)**

```bash
# 1. Backup current version
sudo cp -r /opt/nixite /opt/nixite.backup

# 2. Pull latest changes
cd /opt/nixite
git fetch origin
git checkout v2.1.0

# 3. Install new dependencies (if any)
npm install

# 4. Restart services
./scripts/dev.sh restart

# 5. Verify
./scripts/health-check.sh
```

**Method 2: NixOS Module**

```nix
# Update flake.nix or configuration.nix
{
  inputs.nixite.url = "github:Luminous-Dynamics/nixite/v2.1.0";
}
```

```bash
sudo nixos-rebuild switch
```

**Method 3: Docker**

```bash
# 1. Pull new image
docker pull luminousdynamics/nixite:2.1.0

# 2. Stop current containers
docker-compose down

# 3. Update docker-compose.yml
# image: luminousdynamics/nixite:2.1.0

# 4. Start new version
docker-compose up -d

# 5. Verify
docker logs nixite-web
curl http://localhost:8000
```

### Upgrading from v1.x to v2.x

#### Major Changes

**Architecture:**
- New AI Bridge service (Luminous Bridge)
- Separated web and AI services
- Enhanced configuration system

**Breaking Changes:**
- Configuration file format changed
- Package database schema updated
- New service architecture

#### Upgrade Procedure

**1. Pre-upgrade Checklist**

```bash
# Backup everything
sudo tar -czf nixite-v1-backup-$(date +%Y%m%d).tar.gz /opt/nixite

# Note current packages
cp /opt/nixite/nixite-packages.json ~/nixite-packages-v1.json

# Export any custom configurations
cp /opt/nixite/config.js ~/config-v1.js
```

**2. Migration Steps**

```bash
# 1. Stop v1 services
sudo systemctl stop nixite

# 2. Install v2
git clone https://github.com/Luminous-Dynamics/nixite.git /opt/nixite-v2
cd /opt/nixite-v2
git checkout v2.1.0

# 3. Migrate configuration
# Review old config and update new config.js with your values
node scripts/migrate-config.js ~/config-v1.js config.js

# 4. Migrate package data (if customized)
node scripts/migrate-packages.js ~/nixite-packages-v1.json nixite-packages.json

# 5. Install dependencies
npm install

# 6. Setup new services
sudo cp nixite-web.service /etc/systemd/system/
sudo cp nixite-bridge.service /etc/systemd/system/
sudo systemctl daemon-reload

# 7. Start new version
sudo systemctl enable nixite-web nixite-bridge
sudo systemctl start nixite-web nixite-bridge

# 8. Verify
./scripts/health-check.sh
curl http://localhost:8000
curl http://localhost:8890/health
```

**3. Post-upgrade Verification**

```bash
# Check all services running
systemctl status nixite-web nixite-bridge

# Verify package count
jq '. | length' nixite-packages.json

# Test AI Bridge
curl -X POST http://localhost:8890/feedback \
  -H "Content-Type: application/json" \
  -d '{"packageName":"vim","feedback":"test"}'

# Check logs
journalctl -u nixite-web -n 50
journalctl -u nixite-bridge -n 50
```

## Migration Paths

### From Docker to NixOS

#### Advantages of NixOS Deployment
- Native systemd integration
- Declarative configuration
- Atomic upgrades and rollbacks
- Better resource management

#### Migration Procedure

**1. Export Data from Docker**

```bash
# Create backup from Docker container
docker exec nixite-web tar -czf /tmp/nixite-data.tar.gz \
  /app/config.js \
  /app/nixite-packages.json

# Copy to host
docker cp nixite-web:/tmp/nixite-data.tar.gz ./
```

**2. Setup NixOS Configuration**

```nix
# /etc/nixos/configuration.nix
{ config, pkgs, ... }:

{
  imports = [
    /path/to/nixite/nixos-module.nix
  ];

  services.nixite = {
    enable = true;
    port = 8000;
    bridgePort = 8890;
    dataDir = "/var/lib/nixite";
  };
}
```

**3. Import Data**

```bash
# Extract data
sudo tar -xzf nixite-data.tar.gz -C /tmp/

# Copy to NixOS location
sudo cp /tmp/app/config.js /var/lib/nixite/
sudo cp /tmp/app/nixite-packages.json /var/lib/nixite/
sudo chown -R nixite:nixite /var/lib/nixite/
```

**4. Apply Configuration**

```bash
sudo nixos-rebuild switch
```

**5. Verify Migration**

```bash
systemctl status nixite-web nixite-bridge
curl http://localhost:8000
```

### From Manual Install to Docker

#### Advantages of Docker Deployment
- Isolated environment
- Easy scaling
- Simplified deployment
- Reproducible builds

#### Migration Procedure

**1. Backup Current Install**

```bash
tar -czf nixite-manual-backup-$(date +%Y%m%d).tar.gz /opt/nixite
```

**2. Prepare Docker Configuration**

```yaml
# docker-compose.yml
version: '3.8'

services:
  nixite-web:
    image: luminousdynamics/nixite:2.1.0
    ports:
      - "8000:8000"
    volumes:
      - ./config.js:/app/config.js
      - ./nixite-packages.json:/app/nixite-packages.json
    restart: unless-stopped

  nixite-bridge:
    image: luminousdynamics/nixite-bridge:2.1.0
    ports:
      - "8890:8890"
    environment:
      - PORT=8890
    restart: unless-stopped
```

**3. Copy Configuration**

```bash
cp /opt/nixite/config.js ./
cp /opt/nixite/nixite-packages.json ./
```

**4. Start Docker Containers**

```bash
docker-compose up -d
```

**5. Stop Manual Services**

```bash
sudo systemctl stop nixite
sudo systemctl disable nixite
```

### From systemd to NixOS Module

#### Advantages
- Declarative configuration
- Automatic dependency management
- Easy rollbacks
- System-wide integration

#### Migration Procedure

**1. Document Current systemd Configuration**

```bash
systemctl cat nixite-web > nixite-web.service.backup
systemctl cat nixite-bridge > nixite-bridge.service.backup
```

**2. Create NixOS Configuration**

```nix
{ config, pkgs, ... }:

{
  services.nixite = {
    enable = true;
    port = 8000;  # From old configuration
    bridgePort = 8890;

    # Copy settings from systemd service files
    user = "nixite";
    group = "nixite";
    dataDir = "/var/lib/nixite";

    # Additional options
    enableAI = true;
    openFirewall = false;
  };
}
```

**3. Stop systemd Services**

```bash
sudo systemctl stop nixite-web nixite-bridge
sudo systemctl disable nixite-web nixite-bridge
```

**4. Apply NixOS Configuration**

```bash
sudo nixos-rebuild switch
```

**5. Verify**

```bash
systemctl status nixite-web
systemctl status nixite-bridge
```

## Breaking Changes

### v2.1.0 (Current)
- ✅ No breaking changes
- ✅ Fully backward compatible with v2.0.x

### v2.0.0 (Previous Major Release)

**Configuration Changes:**
```javascript
// OLD (v1.x)
const config = {
  port: 8000,
  bridgeEnabled: true
};

// NEW (v2.x)
NIXITE_CONFIG = {
  server: {
    port: 8000
  },
  luminousBridge: {
    enabled: true,
    port: 8890
  }
};
```

**Package Schema Changes:**
```json
// OLD (v1.x)
{
  "id": "vim",
  "name": "Vim",
  "desc": "Text editor"
}

// NEW (v2.x)
{
  "id": "vim",
  "name": "Vim",
  "description": "Text editor",
  "category": "work"
}
```

**Service Architecture:**
- v1.x: Single service
- v2.x: Separate web and bridge services

## Rollback Procedures

### Quick Rollback (Emergency)

```bash
# 1. Stop current version
sudo systemctl stop nixite-web nixite-bridge

# 2. Restore backup
sudo rm -rf /opt/nixite
sudo cp -r /opt/nixite.backup /opt/nixite

# 3. Start previous version
sudo systemctl start nixite-web nixite-bridge

# 4. Verify
curl http://localhost:8000
```

### NixOS Rollback

```bash
# List generations
sudo nix-env --list-generations --profile /nix/var/nix/profiles/system

# Rollback to previous
sudo nixos-rebuild switch --rollback

# Or specific generation
sudo nixos-rebuild switch --switch-generation 123
```

### Docker Rollback

```bash
# 1. Stop current containers
docker-compose down

# 2. Update to previous version
# docker-compose.yml
# image: luminousdynamics/nixite:2.0.0

# 3. Start previous version
docker-compose up -d

# 4. Verify
docker logs nixite-web
```

## Best Practices

### Before Upgrading

**1. Read Release Notes**
```bash
# Check GitHub releases
https://github.com/Luminous-Dynamics/nixite/releases

# Read CHANGELOG
cat CHANGELOG.md
```

**2. Test in Staging**
```bash
# Clone production to staging
# Test upgrade procedure
# Verify functionality
# Monitor for issues
```

**3. Backup Everything**
```bash
# Full backup
sudo tar -czf nixite-pre-upgrade-$(date +%Y%m%d).tar.gz \
  /opt/nixite \
  /var/lib/nixite \
  /etc/systemd/system/nixite*
```

**4. Plan Maintenance Window**
- Announce to users
- Schedule during low-traffic period
- Have rollback plan ready
- Ensure team availability

### During Upgrade

**1. Monitor Logs**
```bash
# Follow logs in real-time
journalctl -u nixite-web -f
journalctl -u nixite-bridge -f
```

**2. Verify Each Step**
```bash
# After each step, verify
systemctl status nixite-web
curl http://localhost:8000
./scripts/health-check.sh
```

**3. Document Issues**
- Note any errors
- Save log excerpts
- Screenshot dashboards

### After Upgrade

**1. Verification Checklist**
- [ ] All services running
- [ ] No errors in logs
- [ ] Health checks passing
- [ ] Package search working
- [ ] AI Bridge responding
- [ ] Metrics being collected
- [ ] Dashboards updating

**2. Monitor Metrics**
```bash
# Watch for 24 hours
# - Error rates
# - Response times
# - Resource usage
# - User feedback
```

**3. Update Documentation**
```bash
# Update runbook
# Document any issues
# Update procedures
```

## Troubleshooting Upgrades

### Issue: Service Won't Start After Upgrade

```bash
# Check configuration
node scripts/validate-config.js config.js

# Check dependencies
npm install

# Check file permissions
sudo chown -R nixite:nixite /opt/nixite

# Check logs
journalctl -xe
```

### Issue: Configuration Incompatible

```bash
# Compare schemas
diff ~/config-old.js /opt/nixite/config.js

# Use migration script
node scripts/migrate-config.js ~/config-old.js /opt/nixite/config.js

# Or manually update
nano /opt/nixite/config.js
```

### Issue: Data Loss After Upgrade

```bash
# Restore from backup
sudo systemctl stop nixite-web
sudo cp /var/lib/nixite/backups/latest/* /opt/nixite/
sudo systemctl start nixite-web

# Verify data
jq '. | length' /opt/nixite/nixite-packages.json
```

## Version Compatibility Matrix

| Component | v1.x | v2.0.x | v2.1.x |
|-----------|------|--------|--------|
| Config Format | Legacy | Modern | Modern |
| Package Schema | v1 | v2 | v2 |
| AI Bridge | Optional | Separate Service | Separate Service |
| NixOS Module | Basic | Advanced | Advanced+ |
| Docker Support | Yes | Yes | Yes |
| systemd | Single | Dual | Dual |

## Support

- **Upgrade Issues**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Migration Help**: See [SUPPORT.md](../SUPPORT.md)
- **Bug Reports**: [GitHub Issues](https://github.com/Luminous-Dynamics/nixite/issues)

---

**Last Updated:** 2024-01-15
**Version:** 2.1.0+
