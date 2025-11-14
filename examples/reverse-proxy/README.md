# Reverse Proxy Configuration Examples

Production-ready reverse proxy configurations for Nixite.

## Why Use a Reverse Proxy?

A reverse proxy provides:
- ✅ **HTTPS/SSL** - Encrypted connections
- ✅ **Security Headers** - XSS, clickjacking protection
- ✅ **Rate Limiting** - DDoS protection
- ✅ **Compression** - Faster page loads
- ✅ **Caching** - Reduced server load
- ✅ **Load Balancing** - Multiple backend servers
- ✅ **Logging** - Access logs and monitoring

## Available Configurations

### 1. Nginx (`nginx.conf`)

**Best for**: Maximum performance, complex setups, high traffic

**Pros**:
- Industry standard
- Excellent performance
- Very flexible
- Rich module ecosystem
- Well-documented

**Cons**:
- More complex configuration
- Manual SSL setup required

**Quick Start**:
```bash
# Install nginx
sudo apt install nginx  # Debian/Ubuntu
# OR
sudo yum install nginx  # RHEL/CentOS
# OR
nix-env -iA nixos.nginx  # NixOS

# Copy configuration
sudo cp nginx.conf /etc/nginx/sites-available/nixite
sudo ln -s /etc/nginx/sites-available/nixite /etc/nginx/sites-enabled/nixite

# Update configuration
sudo vim /etc/nginx/sites-available/nixite
# Change: nixite.example.com to your domain
# Change: SSL certificate paths

# Obtain SSL certificate (Let's Encrypt)
sudo certbot --nginx -d nixite.example.com

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 2. Caddy (`Caddyfile`)

**Best for**: Simplicity, automatic HTTPS, quick setup

**Pros**:
- Automatic HTTPS with Let's Encrypt
- Very simple configuration
- Modern HTTP/2 and HTTP/3 support
- Easy to maintain
- Great documentation

**Cons**:
- Newer (less established than nginx)
- Fewer modules

**Quick Start**:
```bash
# Install Caddy
# See: https://caddyserver.com/docs/install

# Debian/Ubuntu/Raspbian
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# OR NixOS
nix-env -iA nixos.caddy

# Copy configuration
sudo cp Caddyfile /etc/caddy/Caddyfile

# Update configuration
sudo vim /etc/caddy/Caddyfile
# Change: nixite.example.com to your domain
# Change: admin@example.com to your email

# Start Caddy (it will automatically get SSL certificate!)
sudo systemctl start caddy
sudo systemctl enable caddy

# Check status
sudo systemctl status caddy
```

**That's it!** Caddy automatically obtains and renews SSL certificates.

## Common Configuration Patterns

### Security Headers

Both configurations include:
- `Strict-Transport-Security` - Force HTTPS
- `X-Frame-Options` - Prevent clickjacking
- `X-Content-Type-Options` - Prevent MIME sniffing
- `X-XSS-Protection` - XSS protection
- `Content-Security-Policy` - Control resource loading
- `Permissions-Policy` - Control browser features

### Rate Limiting

**Nginx**: 10 requests per second per IP
```nginx
limit_req_zone $binary_remote_addr zone=nixite_limit:10m rate=10r/s;
limit_req zone=nixite_limit burst=20 nodelay;
```

**Caddy**: 10 requests per second per host
```caddy
rate_limit {
    zone static_rl {
        key {remote_host}
        events 10
        window 1s
    }
}
```

### Caching Strategy

| Asset Type | Cache Duration | Why |
|------------|----------------|-----|
| Static files (js, css, images) | 1 year | Rarely change, use versioning |
| JSON data files | 1 hour | May update with package changes |
| API responses | No cache | Dynamic, user-specific |
| HTML | No cache | Entry point, should be fresh |

### SSL/TLS Best Practices

Both configurations use:
- TLS 1.2 and 1.3 only (no TLS 1.0/1.1)
- Modern cipher suites
- OCSP stapling (nginx)
- Automatic renewal (Caddy)

## Deployment Scenarios

### Single Server

```
Internet → Reverse Proxy → Nixite (localhost:8000)
                         → AI Bridge (localhost:8890)
```

**Use**: nginx.conf or Caddyfile as-is

### Load Balanced

```
Internet → Reverse Proxy → Nixite Instance 1 (localhost:8000)
                         → Nixite Instance 2 (localhost:8001)
                         → Nixite Instance 3 (localhost:8002)
                         → AI Bridge (localhost:8890)
```

**Nginx Configuration**:
```nginx
upstream nixite_web {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}
```

**Caddy Configuration**:
```caddy
reverse_proxy localhost:8000 localhost:8001 localhost:8002 {
    lb_policy round_robin
}
```

### Docker Behind Proxy

```
Internet → Reverse Proxy → Docker Host
                            ↓
                         Nixite Container (8000)
                         AI Bridge Container (8890)
```

**Change upstream to**:
- nginx: `server docker_host_ip:8000;`
- Caddy: `reverse_proxy docker_host_ip:8000`

## Testing Your Configuration

### Test SSL Configuration

```bash
# SSL Labs (online)
https://www.ssllabs.com/ssltest/analyze.html?d=nixite.example.com

# Local test
openssl s_client -connect nixite.example.com:443 -servername nixite.example.com
```

### Test Security Headers

```bash
# Using curl
curl -I https://nixite.example.com

# Online checker
https://securityheaders.com/?q=nixite.example.com
```

### Test Performance

```bash
# Load testing with ab (Apache Bench)
ab -n 1000 -c 10 https://nixite.example.com/

# Or with wrk
wrk -t12 -c400 -d30s https://nixite.example.com/
```

### Test Rate Limiting

```bash
# Should fail after 10 requests in 1 second
for i in {1..20}; do curl https://nixite.example.com/ & done
```

## Monitoring

### Nginx Logs

```bash
# Access log
tail -f /var/log/nginx/nixite-access.log

# Error log
tail -f /var/log/nginx/nixite-error.log

# Real-time stats
watch -n 1 "tail -20 /var/log/nginx/nixite-access.log"
```

### Caddy Logs

```bash
# Caddy logs (JSON format)
tail -f /var/log/caddy/nixite.log | jq .

# Access logs
tail -f /var/log/caddy/nixite-access.log | jq .

# Live stats
caddy list
```

## Troubleshooting

### Nginx Issues

**502 Bad Gateway**:
```bash
# Check if Nixite is running
curl http://localhost:8000

# Check nginx error log
tail -50 /var/log/nginx/nixite-error.log

# Check nginx status
systemctl status nginx

# Test configuration
nginx -t
```

**Permission Denied**:
```bash
# Check SELinux (if enabled)
sudo setsebool -P httpd_can_network_connect 1

# Check firewall
sudo firewall-cmd --add-service=http --permanent
sudo firewall-cmd --add-service=https --permanent
sudo firewall-cmd --reload
```

### Caddy Issues

**Certificate Not Obtained**:
```bash
# Check Caddy logs
journalctl -u caddy -f

# Ensure port 80/443 are open
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ensure DNS points to server
dig nixite.example.com

# Try manual certificate
caddy trust
```

**Configuration Syntax Error**:
```bash
# Format and validate
caddy fmt --overwrite Caddyfile
caddy validate Caddyfile

# Run in foreground to see errors
caddy run
```

## NixOS Integration

### Nginx on NixOS

```nix
# configuration.nix
services.nginx = {
  enable = true;
  recommendedProxySettings = true;
  recommendedTlsSettings = true;
  recommendedOptimisation = true;
  recommendedGzipSettings = true;

  virtualHosts."nixite.example.com" = {
    enableACME = true;
    forceSSL = true;
    locations."/" = {
      proxyPass = "http://127.0.0.1:8000";
      proxyWebsockets = true;
    };
    locations."/api/bridge/" = {
      proxyPass = "http://127.0.0.1:8890/";
    };
  };
};

# Open firewall
networking.firewall.allowedTCPPorts = [ 80 443 ];
```

### Caddy on NixOS

```nix
# configuration.nix
services.caddy = {
  enable = true;
  email = "admin@example.com";
  config = builtins.readFile ./Caddyfile;
};

# Open firewall
networking.firewall.allowedTCPPorts = [ 80 443 ];
```

## Performance Tuning

### Nginx Optimizations

```nginx
# /etc/nginx/nginx.conf
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
}

http {
    # Connection keep-alive
    keepalive_timeout 65;
    keepalive_requests 100;

    # File descriptor caching
    open_file_cache max=200000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

### Caddy Optimizations

Caddy is already highly optimized out of the box!

## See Also

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Caddy Documentation](https://caddyserver.com/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [Security Headers Reference](https://securityheaders.com/)

---

**Need help?** See [SUPPORT.md](../../SUPPORT.md) or open an issue on GitHub.
