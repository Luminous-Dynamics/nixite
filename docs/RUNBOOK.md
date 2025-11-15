# Production Runbook

Operational procedures and incident response guide for Nixite in production environments.

## Table of Contents

- [Quick Reference](#quick-reference)
- [Service Architecture](#service-architecture)
- [Common Operations](#common-operations)
- [Incident Response](#incident-response)
- [Troubleshooting Playbooks](#troubleshooting-playbooks)
- [Maintenance Procedures](#maintenance-procedures)
- [Emergency Contacts](#emergency-contacts)

## Quick Reference

### Service Health Checks

```bash
# Quick health check
./scripts/health-check.sh

# Service status
systemctl status nixite-web nixite-bridge

# Check logs
journalctl -u nixite-web -f
journalctl -u nixite-bridge -f

# Resource usage
htop
df -h
free -h
```

### Emergency Commands

```bash
# Restart services
sudo systemctl restart nixite-web nixite-bridge

# Emergency stop
sudo systemctl stop nixite-web nixite-bridge

# View recent errors
journalctl -u nixite-web -p err -n 50

# Check resource exhaustion
ps aux --sort=-%mem | head -10
ps aux --sort=-%cpu | head -10
```

## Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     NIXITE STACK                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────┐          ┌──────────────────┐      │
│  │ Web Interface │          │    AI Bridge     │      │
│  │  Port: 8000   │◄────────►│   Port: 8890     │      │
│  └───────┬───────┘          └────────┬─────────┘      │
│          │                           │                 │
│          │                    ┌──────▼──────┐          │
│          │                    │   Ollama    │          │
│          │                    │ Port: 11434 │          │
│          │                    └─────────────┘          │
│          │                                             │
│  ┌───────▼──────────────────────────────────┐          │
│  │         System Resources                  │          │
│  │  CPU | Memory | Disk | Network           │          │
│  └──────────────────────────────────────────┘          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Critical Files and Locations

```
/opt/nixite/                    # Application root
├── config.js                   # Main configuration
├── nixite-packages.json        # Package database
├── index.html                  # Web interface
├── nixite-luminous-bridge.js   # AI Bridge service
└── scripts/                    # Utility scripts

/var/lib/nixite/                # Data directory
├── logs/                       # Application logs
├── cache/                      # Cache files
└── backups/                    # Backup files

/etc/systemd/system/            # Service files
├── nixite-web.service
└── nixite-bridge.service

/var/log/                       # System logs
├── nginx/                      # Reverse proxy logs
└── nixite/                     # Application logs
```

## Common Operations

### Starting/Stopping Services

```bash
# Start all services
sudo systemctl start nixite-web nixite-bridge

# Stop all services
sudo systemctl stop nixite-web nixite-bridge

# Restart single service
sudo systemctl restart nixite-web

# Reload configuration (no downtime)
sudo systemctl reload nixite-web

# Check status
sudo systemctl status nixite-web nixite-bridge
```

### Viewing Logs

```bash
# Real-time logs
journalctl -u nixite-web -f
journalctl -u nixite-bridge -f

# Last 100 lines
journalctl -u nixite-web -n 100

# Errors only
journalctl -u nixite-web -p err

# Specific time range
journalctl -u nixite-web --since "1 hour ago"
journalctl -u nixite-web --since "2024-01-15 10:00:00"

# Follow multiple services
journalctl -u nixite-web -u nixite-bridge -f
```

### Configuration Updates

```bash
# 1. Backup current config
sudo cp /opt/nixite/config.js /opt/nixite/config.js.backup

# 2. Edit configuration
sudo nano /opt/nixite/config.js

# 3. Validate configuration
node /opt/nixite/scripts/validate-config.js /opt/nixite/config.js

# 4. Reload service
sudo systemctl reload nixite-web

# 5. Verify
curl http://localhost:8000
```

### Package Database Updates

```bash
# 1. Backup current packages
sudo cp /opt/nixite/nixite-packages.json /opt/nixite/nixite-packages.json.backup

# 2. Edit packages
sudo nano /opt/nixite/nixite-packages.json

# 3. Validate packages
node /opt/nixite/scripts/validate-packages.js /opt/nixite/nixite-packages.json

# 4. No service restart needed (static file)

# 5. Verify
curl http://localhost:8000/nixite-packages.json | jq .
```

## Incident Response

### Incident Severity Matrix

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| **SEV-1** | Complete service outage | Immediate | Service won't start |
| **SEV-2** | Major degradation | < 15 min | AI Bridge down |
| **SEV-3** | Minor issues | < 4 hours | Slow responses |
| **SEV-4** | Cosmetic | Next release | UI glitch |

### SEV-1: Complete Outage

#### Symptoms
- Service won't start
- All health checks failing
- Users cannot access application

#### Response Procedure

```bash
# 1. Check service status
sudo systemctl status nixite-web nixite-bridge

# 2. Check recent logs
journalctl -u nixite-web -n 100 --no-pager
journalctl -u nixite-bridge -n 100 --no-pager

# 3. Check system resources
df -h    # Disk space
free -h  # Memory
uptime   # Load average

# 4. Attempt restart
sudo systemctl restart nixite-web nixite-bridge

# 5. If restart fails, check configuration
node scripts/validate-config.js config.js

# 6. Check file permissions
ls -la /opt/nixite/

# 7. Check port conflicts
sudo lsof -i :8000
sudo lsof -i :8890

# 8. If still failing, restore from backup
sudo systemctl stop nixite-web nixite-bridge
sudo cp /var/lib/nixite/backups/latest/* /opt/nixite/
sudo systemctl start nixite-web nixite-bridge
```

### SEV-2: AI Bridge Failure

#### Symptoms
- AI features not working
- Ollama connection errors
- Timeout errors in logs

#### Response Procedure

```bash
# 1. Check AI Bridge status
sudo systemctl status nixite-bridge
curl http://localhost:8890/health

# 2. Check Ollama
curl http://localhost:11434
ollama list

# 3. Check Ollama logs
journalctl -u ollama -n 50

# 4. Restart Ollama
sudo systemctl restart ollama

# 5. Restart AI Bridge
sudo systemctl restart nixite-bridge

# 6. Verify
curl http://localhost:8890/health
```

### SEV-3: Performance Degradation

#### Symptoms
- Slow response times
- High resource usage
- Timeouts

#### Response Procedure

```bash
# 1. Check resource usage
htop
iostat -x 1 5
vmstat 1 5

# 2. Identify resource hog
ps aux --sort=-%mem | head -10
ps aux --sort=-%cpu | head -10

# 3. Check for memory leaks
systemctl show --property=MemoryCurrent nixite-bridge

# 4. Review recent logs for errors
journalctl -u nixite-web -p warn --since "1 hour ago"

# 5. Consider restart if memory leak
sudo systemctl restart nixite-bridge

# 6. Monitor improvement
watch -n 1 'systemctl show --property=MemoryCurrent nixite-bridge'
```

## Troubleshooting Playbooks

### Playbook 1: Service Won't Start

```bash
# Check 1: Verify service file
sudo systemctl cat nixite-web
sudo systemctl cat nixite-bridge

# Check 2: Validate configuration
node scripts/validate-config.js config.js

# Check 3: Check file permissions
ls -la /opt/nixite/
sudo chown -R nixite:nixite /opt/nixite/

# Check 4: Check for port conflicts
sudo lsof -i :8000
sudo lsof -i :8890

# Check 5: Start in foreground for debugging
cd /opt/nixite
python3 -m http.server 8000  # Web server
node nixite-luminous-bridge.js  # AI Bridge

# Check 6: Review systemd logs
journalctl -xe
```

### Playbook 2: High Memory Usage

```bash
# Check 1: Current memory usage
free -h
ps aux --sort=-%mem | head -10

# Check 2: Check for memory leaks
systemctl show --property=MemoryCurrent nixite-bridge
systemctl show --property=MemoryMax nixite-bridge

# Check 3: Review heap usage (Node.js)
# Add to nixite-luminous-bridge.js:
# setInterval(() => {
#   const used = process.memoryUsage();
#   console.log(JSON.stringify(used));
# }, 60000);

# Check 4: Set memory limits
sudo systemctl edit nixite-bridge
# Add:
# [Service]
# MemoryMax=1G

# Check 5: Restart with limits
sudo systemctl daemon-reload
sudo systemctl restart nixite-bridge
```

### Playbook 3: Database (Package File) Corruption

```bash
# Check 1: Validate package file
node scripts/validate-packages.js nixite-packages.json

# Check 2: Check JSON syntax
jq . nixite-packages.json

# Check 3: Restore from backup
sudo cp /var/lib/nixite/backups/latest/nixite-packages.json /opt/nixite/

# Check 4: Verify restoration
node scripts/validate-packages.js /opt/nixite/nixite-packages.json

# Check 5: No restart needed (static file)
```

### Playbook 4: SSL Certificate Issues

```bash
# Check 1: Certificate expiration
sudo certbot certificates

# Check 2: Renew certificate
sudo certbot renew --dry-run
sudo certbot renew

# Check 3: Reload nginx
sudo systemctl reload nginx

# Check 4: Verify SSL
curl -vI https://nixite.example.com

# Check 5: Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

## Maintenance Procedures

### Weekly Maintenance

```bash
# 1. Check disk space
df -h

# 2. Rotate logs if needed
sudo journalctl --vacuum-time=30d

# 3. Check for updates
sudo apt update
nix-channel --update

# 4. Review error logs
journalctl -u nixite-web -p err --since "1 week ago" | less

# 5. Backup configuration
sudo cp /opt/nixite/config.js /var/lib/nixite/backups/weekly/config-$(date +%Y%m%d).js
```

### Monthly Maintenance

```bash
# 1. Full backup
sudo tar -czf /var/lib/nixite/backups/monthly/nixite-$(date +%Y%m).tar.gz /opt/nixite/

# 2. Review metrics
# - Average response times
# - Error rates
# - Resource usage trends

# 3. Update dependencies
cd /opt/nixite
npm audit
npm update

# 4. Security scan
npm audit fix
trivy image nixite:latest  # If using Docker

# 5. Review and update documentation
```

### Deployment Procedure

```bash
# 1. Pre-deployment
# - Announce maintenance window
# - Backup current version
# - Validate new version in staging

# 2. Create backup
sudo systemctl stop nixite-web nixite-bridge
sudo tar -czf /var/lib/nixite/backups/pre-deploy-$(date +%Y%m%d%H%M).tar.gz /opt/nixite/

# 3. Deploy new version
sudo cp -r /tmp/nixite-new/* /opt/nixite/
sudo chown -R nixite:nixite /opt/nixite/

# 4. Validate
node scripts/validate-config.js /opt/nixite/config.js
./scripts/health-check.sh

# 5. Start services
sudo systemctl start nixite-web nixite-bridge

# 6. Verify
curl http://localhost:8000
curl http://localhost:8890/health

# 7. Monitor
journalctl -u nixite-web -f

# 8. Rollback if issues
sudo systemctl stop nixite-web nixite-bridge
sudo tar -xzf /var/lib/nixite/backups/pre-deploy-*.tar.gz -C /
sudo systemctl start nixite-web nixite-bridge
```

### Backup Procedures

#### Automated Backups

```bash
# Create backup script
cat > /usr/local/bin/nixite-backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR=/var/lib/nixite/backups
DATE=$(date +%Y%m%d-%H%M%S)

# Create backup
tar -czf $BACKUP_DIR/nixite-$DATE.tar.gz \
  /opt/nixite/config.js \
  /opt/nixite/nixite-packages.json \
  /var/lib/nixite/logs

# Keep only last 30 backups
ls -t $BACKUP_DIR/nixite-*.tar.gz | tail -n +31 | xargs -r rm
EOF

chmod +x /usr/local/bin/nixite-backup.sh

# Add to cron
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/nixite-backup.sh
```

#### Restore from Backup

```bash
# 1. Stop services
sudo systemctl stop nixite-web nixite-bridge

# 2. List available backups
ls -lah /var/lib/nixite/backups/

# 3. Extract backup
sudo tar -xzf /var/lib/nixite/backups/nixite-YYYYMMDD-HHMMSS.tar.gz -C /

# 4. Verify
node scripts/validate-config.js /opt/nixite/config.js

# 5. Start services
sudo systemctl start nixite-web nixite-bridge

# 6. Verify
./scripts/health-check.sh
```

## Emergency Contacts

```
Primary On-Call: [Name] - [Phone] - [Email]
Secondary On-Call: [Name] - [Phone] - [Email]
Team Lead: [Name] - [Phone] - [Email]

Escalation Path:
1. On-call engineer (SEV-1, SEV-2)
2. Team lead (after 30 min, SEV-1)
3. Management (after 1 hour, SEV-1)

External Contacts:
- Hosting Provider: [Contact info]
- CDN Provider: [Contact info]
- DNS Provider: [Contact info]
```

## Monitoring & Alerts

### Key Metrics Dashboards

- **System Overview**: https://grafana.example.com/d/nixite-overview
- **AI Bridge**: https://grafana.example.com/d/nixite-bridge
- **Infrastructure**: https://grafana.example.com/d/nixite-infra

### Alert Channels

- Slack: #nixite-alerts
- PagerDuty: nixite-oncall
- Email: nixite-ops@example.com

## Additional Resources

- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Monitoring Guide](./MONITORING.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [Deployment Guide](./deployment/NIXOS.md)

---

**Last Updated:** 2024-01-15
**Version:** 2.1.0+
**Maintained By:** Nixite Operations Team
