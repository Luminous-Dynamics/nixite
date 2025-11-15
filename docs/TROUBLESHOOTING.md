# Troubleshooting Guide

This guide helps you diagnose and fix common issues with Nixite. If you don't find your issue here, see [SUPPORT.md](../SUPPORT.md) for additional help options.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Installation Issues](#installation-issues)
- [Runtime Errors](#runtime-errors)
- [Configuration Problems](#configuration-problems)
- [Network & Connectivity](#network--connectivity)
- [Platform-Specific Issues](#platform-specific-issues)
- [AI Bridge Issues](#ai-bridge-issues)
- [Performance Problems](#performance-problems)
- [Debug Techniques](#debug-techniques)
- [Log Files & Locations](#log-files--locations)

## Quick Diagnostics

### Health Check Script

Run the automated health check to diagnose common issues:

```bash
./scripts/health-check.sh
```

This script checks:
- Installation status
- Configuration validity
- Service availability
- Network connectivity
- Log file permissions
- Disk space

### Manual Quick Check

```bash
# Check if services are running
./scripts/dev.sh status

# Test web server
curl http://localhost:8000

# Test AI Bridge
curl http://localhost:8890/health

# Validate configuration
node scripts/validate-config.js config.js

# Validate packages
node scripts/validate-packages.js nixite-packages.json

# Check logs
tail -f .web.log
tail -f .bridge.log
```

## Installation Issues

### Issue: Command Not Found

**Symptoms:**
```
bash: nixite: command not found
```

**Causes & Solutions:**

1. **Not in PATH** (NixOS installation)
   ```bash
   # Check if installed
   nix-env -q | grep nixite

   # If missing, install:
   nix-env -iA nixpkgs.nixite

   # Or rebuild system config
   sudo nixos-rebuild switch
   ```

2. **Not in project directory** (Manual installation)
   ```bash
   # Navigate to Nixite directory
   cd /path/to/nixite

   # Use helper scripts
   ./scripts/dev.sh start
   ```

### Issue: Permission Denied

**Symptoms:**
```
-bash: ./scripts/dev.sh: Permission denied
```

**Solution:**
```bash
# Make scripts executable
chmod +x scripts/*.sh
chmod +x verify.sh
chmod +x nixite-luminous-bridge.js

# Or use bash directly
bash scripts/dev.sh start
```

### Issue: Dependencies Missing

**Symptoms:**
```
Error: Cannot find module 'express'
ModuleNotFoundError: No module named 'ollama'
```

**Solutions:**

1. **Node.js dependencies:**
   ```bash
   # Install npm packages
   npm install

   # Or use Nix shell
   nix-shell
   ```

2. **Python dependencies:**
   ```bash
   # Using pip
   pip install ollama

   # Using Nix
   nix-shell -p python3Packages.ollama
   ```

3. **System dependencies:**
   ```bash
   # NixOS
   nix-env -iA nixpkgs.nodejs nixpkgs.python3

   # Debian/Ubuntu
   sudo apt install nodejs npm python3 python3-pip

   # Fedora/RHEL
   sudo dnf install nodejs npm python3 python3-pip
   ```

### Issue: Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::8000
Error: listen EADDRINUSE: address already in use :::8890
```

**Solutions:**

1. **Stop existing processes:**
   ```bash
   # Stop Nixite services
   ./scripts/dev.sh stop

   # Find and kill processes on port
   lsof -ti:8000 | xargs kill -9
   lsof -ti:8890 | xargs kill -9
   ```

2. **Change ports in config.js:**
   ```javascript
   const config = {
     server: {
       port: 8080,  // Changed from 8000
       // ...
     },
     luminousBridge: {
       port: 8891,  // Changed from 8890
       // ...
     }
   };
   ```

## Runtime Errors

### Issue: Server Won't Start

**Symptoms:**
```
Failed to start web server
Server exited with code 1
```

**Diagnostic Steps:**

1. **Check configuration:**
   ```bash
   node scripts/validate-config.js config.js
   ```

2. **Check for syntax errors:**
   ```bash
   node -c index.html
   node -c config.js
   ```

3. **Review logs:**
   ```bash
   cat .web.log
   cat .bridge.log
   ```

4. **Test manually:**
   ```bash
   # Start in foreground to see errors
   python3 -m http.server 8000
   ```

**Common Fixes:**

- **Invalid config.js:** Fix syntax errors shown by validator
- **Missing files:** Restore from git or reinstall
- **Firewall blocking:** Open ports 8000 and 8890
- **SELinux/AppArmor:** Configure security policies

### Issue: 404 Not Found

**Symptoms:**
- Web page loads but shows 404 errors
- Package data not loading
- API calls failing

**Solutions:**

1. **Check file paths:**
   ```bash
   # Verify files exist
   ls -la index.html
   ls -la nixite-packages.json
   ls -la config.js
   ```

2. **Check server root:**
   ```bash
   # Ensure running from project root
   pwd
   # Should show: /path/to/nixite

   # Start from correct directory
   cd /path/to/nixite
   ./scripts/dev.sh start
   ```

3. **Check reverse proxy config:**
   ```nginx
   # nginx: Verify location blocks
   location / {
       root /path/to/nixite;
       try_files $uri $uri/ /index.html;
   }
   ```

### Issue: Packages Not Loading

**Symptoms:**
- Empty package grid
- Console error: "Failed to load packages"
- Search returns no results

**Solutions:**

1. **Validate package data:**
   ```bash
   node scripts/validate-packages.js nixite-packages.json
   ```

2. **Check JSON syntax:**
   ```bash
   cat nixite-packages.json | jq .
   # Should parse without errors
   ```

3. **Verify file encoding:**
   ```bash
   file nixite-packages.json
   # Should show: ASCII text or UTF-8 Unicode text
   ```

4. **Check browser console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

## Configuration Problems

### Issue: Invalid Configuration

**Symptoms:**
```
Configuration validation failed
TypeError: Cannot read property 'base' of undefined
```

**Solutions:**

1. **Run validator:**
   ```bash
   node scripts/validate-config.js config.js
   ```

2. **Compare with example:**
   ```bash
   # View default config
   cat config.js

   # Restore from git if corrupted
   git checkout config.js
   ```

3. **Common config mistakes:**

   ```javascript
   // ❌ WRONG: Missing required fields
   const config = {
     api: {
       base: "http://localhost:8000"
       // Missing: installer, luminousBridge
     }
   };

   // ✅ CORRECT: All required fields
   const config = {
     api: {
       base: "http://localhost:8000",
       installer: "http://localhost:8000/api/install",
       luminousBridge: "http://localhost:8890"
     },
     features: {
       voiceInput: true,
       aiFeedback: true,
       installManager: true,
       luminousBridge: true
     },
     // ... other required sections
   };
   ```

### Issue: Feature Not Working

**Symptoms:**
- Voice input button missing
- AI feedback not responding
- Install manager not working

**Solution:**

Check feature flags in config.js:

```javascript
const config = {
  features: {
    voiceInput: true,       // Enable voice input
    aiFeedback: true,       // Enable AI feedback
    installManager: true,   // Enable install manager
    luminousBridge: true    // Enable AI Bridge
  }
};
```

Restart server after config changes:
```bash
./scripts/dev.sh restart
```

## Network & Connectivity

### Issue: Cannot Connect to Server

**Symptoms:**
```
curl: (7) Failed to connect to localhost port 8000: Connection refused
ERR_CONNECTION_REFUSED in browser
```

**Solutions:**

1. **Check if server is running:**
   ```bash
   ./scripts/dev.sh status

   # Or check processes
   ps aux | grep python
   ps aux | grep node
   ```

2. **Verify ports are listening:**
   ```bash
   netstat -tuln | grep 8000
   netstat -tuln | grep 8890

   # Or with ss
   ss -tuln | grep 8000
   ```

3. **Check firewall:**
   ```bash
   # NixOS
   sudo nixos-rebuild switch
   # Ensure firewall allows ports

   # UFW (Ubuntu)
   sudo ufw allow 8000
   sudo ufw allow 8890

   # firewalld (Fedora/RHEL)
   sudo firewall-cmd --add-port=8000/tcp --permanent
   sudo firewall-cmd --add-port=8890/tcp --permanent
   sudo firewall-cmd --reload
   ```

### Issue: AI Bridge Timeout

**Symptoms:**
```
Error: AI Bridge request timeout
Failed to get AI feedback
```

**Solutions:**

1. **Check AI Bridge status:**
   ```bash
   curl http://localhost:8890/health
   # Should return: {"status":"healthy"}
   ```

2. **Verify Ollama is running:**
   ```bash
   # Check Ollama status
   ollama list

   # Start Ollama if needed
   ollama serve

   # Test Gemma model
   ollama run gemma:2b "Hello"
   ```

3. **Increase timeout in config.js:**
   ```javascript
   const config = {
     network: {
       timeout: 30000,  // Increase from 10000 to 30000ms
       healthCheckTimeout: 3000
     }
   };
   ```

4. **Check AI Bridge logs:**
   ```bash
   tail -f .bridge.log
   ```

### Issue: Slow Response Times

**Symptoms:**
- Pages load slowly
- API calls take >5 seconds
- Package search is sluggish

**Solutions:**

1. **Check system resources:**
   ```bash
   # CPU and memory
   top
   htop

   # Disk I/O
   iostat -x 1
   ```

2. **Enable caching:**
   ```javascript
   // In config.js
   const config = {
     cache: {
       enabled: true,
       ttl: 3600  // 1 hour
     }
   };
   ```

3. **Optimize network settings:**
   ```javascript
   const config = {
     network: {
       timeout: 10000,
       retryAttempts: 2,      // Reduce retries
       retryDelay: 500,       // Faster retry
       keepAlive: true,       // Enable keep-alive
       compression: true      // Enable compression
     }
   };
   ```

## Platform-Specific Issues

### NixOS Issues

#### Issue: Service Won't Start

**Symptoms:**
```
systemctl status nixite
● nixite.service - failed
```

**Solutions:**

1. **Check service status:**
   ```bash
   sudo systemctl status nixite.service
   sudo journalctl -u nixite.service -n 50
   ```

2. **Verify NixOS configuration:**
   ```nix
   # In /etc/nixos/configuration.nix
   services.nixite = {
     enable = true;
     port = 8000;
     # ... other options
   };
   ```

3. **Rebuild and restart:**
   ```bash
   sudo nixos-rebuild switch
   sudo systemctl restart nixite.service
   ```

#### Issue: Package Not Found

**Symptoms:**
```
error: attribute 'nixite' missing
```

**Solution:**

```bash
# Update channels
sudo nix-channel --update

# Search for package
nix search nixpkgs nixite

# Install from unstable if needed
nix-env -iA nixpkgs.nixite
```

### Docker Issues

#### Issue: Container Won't Start

**Symptoms:**
```
Error response from daemon: container failed to start
```

**Solutions:**

1. **Check container logs:**
   ```bash
   docker logs nixite-web
   docker logs nixite-bridge
   ```

2. **Verify image built correctly:**
   ```bash
   docker images | grep nixite
   docker build -t nixite:latest .
   ```

3. **Check port conflicts:**
   ```bash
   docker ps -a
   # Look for containers using ports 8000/8890
   ```

4. **Restart with docker-compose:**
   ```bash
   docker-compose down
   docker-compose up -d
   docker-compose logs -f
   ```

#### Issue: Permission Denied in Container

**Symptoms:**
```
Permission denied: '/app/index.html'
```

**Solution:**

```dockerfile
# Ensure correct ownership in Dockerfile
RUN chown -R nixite:nixite /app
USER nixite
```

Rebuild:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### systemd Issues

#### Issue: Service Fails to Start

**Symptoms:**
```
systemctl status nixite-web.service
● nixite-web.service - failed
```

**Solutions:**

1. **Check service file:**
   ```bash
   cat /etc/systemd/system/nixite-web.service
   systemctl cat nixite-web.service
   ```

2. **View detailed logs:**
   ```bash
   journalctl -u nixite-web.service -n 100 --no-pager
   journalctl -u nixite-bridge.service -n 100 --no-pager
   ```

3. **Verify file paths:**
   ```bash
   # Check WorkingDirectory exists
   ls -la /opt/nixite

   # Check ExecStart file exists
   ls -la /opt/nixite/scripts/dev.sh
   ```

4. **Fix permissions:**
   ```bash
   sudo chown -R nixite:nixite /opt/nixite
   sudo chmod 755 /opt/nixite/scripts/*.sh
   ```

5. **Reload and restart:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart nixite-web.service
   sudo systemctl restart nixite-bridge.service
   ```

## AI Bridge Issues

### Issue: Ollama Not Responding

**Symptoms:**
```
Error: Failed to connect to Ollama
ECONNREFUSED 127.0.0.1:11434
```

**Solutions:**

1. **Start Ollama:**
   ```bash
   ollama serve
   ```

2. **Check Ollama status:**
   ```bash
   ps aux | grep ollama
   curl http://localhost:11434
   ```

3. **Install as service (systemd):**
   ```bash
   # Create service file
   sudo tee /etc/systemd/system/ollama.service <<EOF
   [Unit]
   Description=Ollama Service
   After=network.target

   [Service]
   Type=simple
   User=ollama
   ExecStart=/usr/local/bin/ollama serve
   Restart=always

   [Install]
   WantedBy=multi-user.target
   EOF

   sudo systemctl daemon-reload
   sudo systemctl enable ollama
   sudo systemctl start ollama
   ```

### Issue: Model Not Found

**Symptoms:**
```
Error: model 'gemma:2b' not found
```

**Solution:**

```bash
# List available models
ollama list

# Pull Gemma model
ollama pull gemma:2b

# Verify model works
ollama run gemma:2b "Test message"
```

### Issue: AI Responses Are Slow

**Symptoms:**
- AI feedback takes >30 seconds
- Bridge timeouts

**Solutions:**

1. **Use smaller model:**
   ```javascript
   // In nixite-luminous-bridge.js
   const model = 'gemma:2b';  // Instead of larger models
   ```

2. **Allocate more resources:**
   ```bash
   # Set OLLAMA environment
   export OLLAMA_NUM_PARALLEL=2
   export OLLAMA_MAX_LOADED_MODELS=1
   ```

3. **Enable GPU acceleration:**
   ```bash
   # Check GPU available
   nvidia-smi

   # Ollama will use GPU automatically
   ollama run gemma:2b
   ```

## Performance Problems

### Issue: High CPU Usage

**Symptoms:**
- CPU at 100%
- System becomes unresponsive

**Solutions:**

1. **Check what's consuming CPU:**
   ```bash
   top -o %CPU
   ps aux --sort=-%cpu | head -10
   ```

2. **Limit AI Bridge workers:**
   ```javascript
   // In config.js
   const config = {
     luminousBridge: {
       workers: 1,  // Reduce from default
       maxRequests: 5
     }
   };
   ```

3. **Use systemd resource limits:**
   ```ini
   [Service]
   CPUQuota=50%
   MemoryLimit=1G
   ```

### Issue: High Memory Usage

**Symptoms:**
```
Out of memory
JavaScript heap out of memory
```

**Solutions:**

1. **Increase Node.js heap:**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   node nixite-luminous-bridge.js
   ```

2. **Limit model memory:**
   ```bash
   # Use smaller Ollama model
   ollama pull gemma:2b  # Instead of gemma:7b
   ```

3. **Add swap space:**
   ```bash
   # Create 4GB swap
   sudo fallocate -l 4G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

## Debug Techniques

### Enable Debug Logging

1. **Web Server:**
   ```bash
   # Run in foreground
   python3 -m http.server 8000 --bind 0.0.0.0
   ```

2. **AI Bridge:**
   ```bash
   # Enable debug mode
   DEBUG=* node nixite-luminous-bridge.js

   # Or specific debug
   DEBUG=express:*,nixite:* node nixite-luminous-bridge.js
   ```

3. **Set verbose config:**
   ```javascript
   const config = {
     logging: {
       level: 'debug',  // trace, debug, info, warn, error
       verbose: true
     }
   };
   ```

### Browser Developer Tools

1. **Open DevTools:** Press F12

2. **Check Console:**
   - Look for JavaScript errors (red)
   - Review warnings (yellow)
   - Check API responses

3. **Network Tab:**
   - Filter by XHR to see API calls
   - Check response codes (200 = success, 404 = not found, 500 = server error)
   - View request/response headers

4. **Application Tab:**
   - Check Local Storage
   - Verify Service Workers
   - Review cached data

### Network Debugging

```bash
# Test connectivity
ping localhost
telnet localhost 8000
curl -v http://localhost:8000

# Monitor network traffic
sudo tcpdump -i lo port 8000
sudo tcpdump -i lo port 8890

# Check DNS resolution
nslookup nixite.example.com
dig nixite.example.com

# Trace route
traceroute nixite.example.com
```

### Process Debugging

```bash
# List all Nixite processes
ps aux | grep -E "python.*8000|node.*8890"

# Check process resources
top -p $(pgrep -f "python.*8000")

# Trace system calls
strace -p $(pgrep -f "python.*8000")

# Debug with gdb (advanced)
gdb -p $(pgrep -f "node.*8890")
```

## Log Files & Locations

### Default Log Locations

```
nixite/
├── .web.log          # Web server log
├── .bridge.log       # AI Bridge log
└── .dev.log          # Development script log
```

### systemd Logs

```bash
# View service logs
journalctl -u nixite-web.service
journalctl -u nixite-bridge.service

# Follow logs in real-time
journalctl -u nixite-web.service -f

# Show last 100 lines
journalctl -u nixite-web.service -n 100

# Show logs since boot
journalctl -u nixite-web.service -b

# Show logs for date range
journalctl -u nixite-web.service --since "2024-01-01" --until "2024-01-31"
```

### Docker Logs

```bash
# View container logs
docker logs nixite-web
docker logs nixite-bridge

# Follow logs
docker logs -f nixite-web

# Show last 100 lines
docker logs --tail 100 nixite-web

# Show timestamps
docker logs -t nixite-web
```

### nginx/Caddy Logs

```bash
# nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Caddy
tail -f /var/log/caddy/access.log
tail -f /var/log/caddy/error.log

# Or check systemd
journalctl -u nginx -f
journalctl -u caddy -f
```

### Log Analysis

```bash
# Search for errors
grep -i error .web.log .bridge.log

# Count HTTP status codes
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c

# Find slow requests (>5s)
awk '$NF > 5000' .web.log

# Get top IP addresses
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10
```

## Still Having Issues?

If this guide doesn't solve your problem:

1. **Check GitHub Issues:** [github.com/Luminous-Dynamics/nixite/issues](https://github.com/Luminous-Dynamics/nixite/issues)
2. **Review Documentation:** See [docs/README.md](README.md)
3. **Get Support:** See [SUPPORT.md](../SUPPORT.md)
4. **Report Bug:** Include:
   - Operating system and version
   - Installation method (NixOS, Docker, manual)
   - Error messages from logs
   - Steps to reproduce
   - Expected vs actual behavior

## Useful Commands Reference

```bash
# Quick status check
./scripts/dev.sh status

# View all logs
tail -f .web.log .bridge.log

# Restart everything
./scripts/dev.sh restart

# Validate configuration
node scripts/validate-config.js config.js
node scripts/validate-packages.js nixite-packages.json

# Clean and rebuild
./scripts/dev.sh clean
./scripts/dev.sh start

# Health check
./scripts/health-check.sh

# Run tests
npm test

# Check system resources
htop
df -h
free -h
```

---

**Last Updated:** 2024-01-15
**Nixite Version:** v2.1.0+
