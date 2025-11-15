# Security Hardening Examples

Production-grade security configurations for Nixite deployments.

## 📋 Contents

- **nginx-hardened.conf** - Hardened Nginx reverse proxy configuration
- **docker-security.yml** - Security-hardened Docker Compose setup

## 🔒 Security Features

### Nginx Configuration

The hardened Nginx configuration includes:

- **SSL/TLS Hardening**
  - TLS 1.2+ only (modern cipher suites)
  - OCSP stapling
  - SSL session caching
  - Perfect forward secrecy

- **Security Headers**
  - Strict-Transport-Security (HSTS)
  - Content-Security-Policy (CSP)
  - X-Frame-Options (clickjacking protection)
  - X-Content-Type-Options (MIME sniffing protection)
  - X-XSS-Protection
  - Referrer-Policy
  - Permissions-Policy

- **Rate Limiting**
  - General endpoints: 10 req/s
  - API endpoints: 30 req/s
  - AI endpoints: 5 req/s
  - Configurable burst limits

- **Attack Prevention**
  - SQL injection blocking
  - XSS attempt blocking
  - Path traversal blocking
  - Suspicious user agent blocking
  - Request size limits
  - Connection limits

- **Access Control**
  - IP whitelisting for admin/metrics
  - HTTP Basic Auth for admin interface
  - Geo-blocking support

### Docker Security

The Docker Compose configuration includes:

- **Container Hardening**
  - Non-root user execution
  - Read-only root filesystem
  - Minimal capabilities (cap_drop: ALL)
  - No new privileges
  - AppArmor/Seccomp profiles

- **Resource Limits**
  - CPU limits and reservations
  - Memory limits and reservations
  - Tmpfs for writable directories

- **Network Isolation**
  - Internal networks for service communication
  - Public network only for reverse proxy
  - Network segmentation

- **Health Checks**
  - Automated health monitoring
  - Restart on failure
  - Startup period configuration

- **Logging**
  - Log rotation
  - Size limits
  - Structured logging

- **Image Scanning**
  - Trivy integration
  - Automated vulnerability scanning

## 🚀 Quick Start

### Nginx Setup

1. **Install Nginx** (with headers-more module for some features):
   ```bash
   # Ubuntu/Debian
   sudo apt install nginx nginx-extras

   # NixOS
   services.nginx.enable = true;
   ```

2. **Copy configuration**:
   ```bash
   sudo cp nginx-hardened.conf /etc/nginx/sites-available/nixite
   sudo ln -s /etc/nginx/sites-available/nixite /etc/nginx/sites-enabled/
   ```

3. **Update domain names**:
   ```bash
   sed -i 's/nixite.example.com/your-domain.com/g' /etc/nginx/sites-available/nixite
   ```

4. **Setup SSL certificates** (Let's Encrypt):
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

5. **Test and reload**:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Docker Security Setup

1. **Copy configuration**:
   ```bash
   cp docker-security.yml docker-compose.yml
   ```

2. **Build images** (ensure they follow security best practices):
   ```bash
   docker build -t nixite:latest .
   docker build -t nixite-bridge:latest -f Dockerfile.bridge .
   ```

3. **Run security scan** (optional):
   ```bash
   docker compose --profile security-scan up trivy-scanner
   ```

4. **Deploy**:
   ```bash
   docker compose up -d
   ```

5. **Verify security**:
   ```bash
   # Check containers are running as non-root
   docker compose exec nixite-web id

   # Verify read-only filesystem
   docker compose exec nixite-web touch /test.txt  # Should fail

   # Check capabilities
   docker compose exec nixite-web capsh --print
   ```

## 🔍 Security Checklist

### Pre-Deployment

- [ ] Update all domain names in configurations
- [ ] Generate strong passwords/API keys
- [ ] Configure SSL certificates
- [ ] Review and customize rate limits
- [ ] Configure IP whitelists
- [ ] Set up monitoring and alerting
- [ ] Review CSP and adjust for your needs
- [ ] Configure backup strategies

### Regular Maintenance

- [ ] Keep Nginx updated
- [ ] Renew SSL certificates (automated with certbot)
- [ ] Review access logs for suspicious activity
- [ ] Update Docker images regularly
- [ ] Run security scans
- [ ] Review and update firewall rules
- [ ] Rotate secrets and passwords
- [ ] Test backup restoration

## 🛡️ Additional Security Recommendations

### 1. Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 8000/tcp  # Block direct access to web server
sudo ufw deny 8890/tcp  # Block direct access to AI bridge
sudo ufw enable

# iptables
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 8000 -j DROP
iptables -A INPUT -p tcp --dport 8890 -j DROP
```

### 2. Fail2ban Configuration

Create `/etc/fail2ban/jail.d/nixite.conf`:

```ini
[nixite]
enabled = true
port = 80,443
filter = nixite
logpath = /var/log/nginx/nixite-access.log
maxretry = 5
bantime = 3600
findtime = 600
```

Create `/etc/fail2ban/filter.d/nixite.conf`:

```ini
[Definition]
failregex = ^<HOST> .* "(GET|POST|HEAD).*" (4\d\d|5\d\d) .*$
ignoreregex =
```

### 3. AppArmor Profile

Create `/etc/apparmor.d/docker-nixite`:

```
#include <tunables/global>

profile docker-nixite flags=(attach_disconnected,mediate_deleted) {
  #include <abstractions/base>

  network inet tcp,
  network inet udp,

  deny @{PROC}/* w,
  deny /sys/* w,
  deny /dev/mem r,
  deny /dev/kmem r,

  /usr/bin/node r,
  /app/** r,
  /tmp/** rw,
}
```

### 4. Secrets Management

Use a proper secrets manager instead of environment variables:

- **HashiCorp Vault**
- **AWS Secrets Manager**
- **Azure Key Vault**
- **Docker Secrets** (Swarm mode)

Example with Docker Secrets:

```bash
echo "my-api-key" | docker secret create nixite_api_key -
```

Update docker-compose.yml:

```yaml
services:
  nixite-bridge:
    secrets:
      - nixite_api_key
    environment:
      - API_KEY_FILE=/run/secrets/nixite_api_key
```

### 5. Security Monitoring

Integrate with security monitoring tools:

- **OSSEC/Wazuh** - Host-based intrusion detection
- **Suricata** - Network intrusion detection
- **Falco** - Container runtime security
- **Prometheus + Grafana** - Metrics and alerting

### 6. Compliance

For regulated environments, consider:

- **GDPR compliance** - Data privacy, right to deletion
- **HIPAA compliance** - Healthcare data protection
- **SOC 2** - Security controls audit
- **PCI DSS** - Payment card data security

## 📊 Security Testing

### Automated Tests

```bash
# SSL/TLS testing
testssl.sh https://your-domain.com

# Security headers
curl -I https://your-domain.com | grep -i security

# Nmap scan
nmap -sV -sC your-domain.com

# Docker bench security
docker run --net host --pid host --userns host --cap-add audit_control \
  -v /var/lib:/var/lib -v /var/run/docker.sock:/var/run/docker.sock \
  -v /etc:/etc --label docker_bench_security \
  docker/docker-bench-security

# Container vulnerability scanning
trivy image nixite:latest
```

### Manual Testing

1. **Rate Limiting**:
   ```bash
   # Should get rate limited after burst
   for i in {1..100}; do curl https://your-domain.com/; done
   ```

2. **Attack Prevention**:
   ```bash
   # SQL injection (should be blocked)
   curl "https://your-domain.com/?id=1' OR '1'='1"

   # XSS (should be blocked)
   curl "https://your-domain.com/?q=<script>alert(1)</script>"

   # Path traversal (should be blocked)
   curl "https://your-domain.com/../../etc/passwd"
   ```

3. **Access Control**:
   ```bash
   # Metrics endpoint (should be restricted)
   curl https://your-domain.com/metrics  # Should fail from public IP
   ```

## 🆘 Incident Response

If you detect a security incident:

1. **Immediate Actions**:
   - Enable maintenance mode
   - Block suspicious IPs at firewall level
   - Snapshot current state for forensics

2. **Investigation**:
   ```bash
   # Check recent access logs
   tail -1000 /var/log/nginx/nixite-access.log | grep -E "(4\d\d|5\d\d)"

   # Check for suspicious processes
   docker compose top

   # Review recent file changes
   find /app -mtime -1 -ls
   ```

3. **Containment**:
   - Isolate affected containers
   - Rotate all credentials
   - Update firewall rules

4. **Recovery**:
   - Restore from clean backup
   - Update all dependencies
   - Apply security patches
   - Re-deploy with enhanced monitoring

5. **Post-Incident**:
   - Document timeline
   - Root cause analysis
   - Update security procedures
   - Implement additional controls

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Nginx Security Controls](https://nginx.org/en/docs/http/ngx_http_security_module.html)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/)

## 🤝 Contributing

Found a security issue? Please report it responsibly:
- **Email**: security@luminousdynamics.org
- **Do not** create public issues for security vulnerabilities
- We'll acknowledge within 24 hours and provide a fix timeline

---

**⚠️ Security Notice**: These configurations are starting points. Always customize for your specific environment, conduct security audits, and stay updated with the latest security patches.
