# High Availability & Scaling Guide

Comprehensive guide for deploying Nixite in high-availability configurations with horizontal scaling.

## Table of Contents

- [Overview](#overview)
- [Architecture Patterns](#architecture-patterns)
- [Load Balancing](#load-balancing)
- [Database Replication](#database-replication)
- [Caching Strategies](#caching-strategies)
- [Health Checks](#health-checks)
- [Auto-Scaling](#auto-scaling)
- [Disaster Recovery](#disaster-recovery)

## Overview

### Availability Goals

```
Availability Level  | Downtime/Year | Use Case
--------------------|---------------|----------------------------
99% (Two Nines)     | 3.65 days     | Non-critical applications
99.9% (Three Nines) | 8.76 hours    | Standard production
99.95%              | 4.38 hours    | Business-critical
99.99% (Four Nines) | 52.6 minutes  | Mission-critical
99.999% (Five Nines)| 5.26 minutes  | Ultra-critical systems
```

**Recommended for Nixite:** 99.9% (Three Nines) - Standard Production

### High Availability Principles

1. **Redundancy** - No single point of failure
2. **Load Distribution** - Spread traffic across instances
3. **Health Monitoring** - Detect and route around failures
4. **Automated Recovery** - Self-healing systems
5. **Geographic Distribution** - Multi-region deployment
6. **Data Replication** - Distributed data storage

## Architecture Patterns

### Pattern 1: Active-Passive (Simplest)

```
┌──────────────┐
│    Client    │
└──────┬───────┘
       │
┌──────▼───────────────────────────┐
│      Load Balancer               │
└──────┬───────────┬───────────────┘
       │           │
┌──────▼──────┐ ┌──▼──────────────┐
│   Active    │ │    Passive      │
│  Instance   │ │   Instance      │
│  (Primary)  │ │  (Standby)      │
└─────────────┘ └─────────────────┘
```

**Pros:**
- Simple to implement
- Easy to reason about
- No data sync issues

**Cons:**
- Wasted resources (passive node idle)
- Slower failover
- Lower capacity

**Configuration:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  nixite-primary:
    image: nixite:latest
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - INSTANCE_ROLE=primary
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  nixite-standby:
    image: nixite:latest
    environment:
      - NODE_ENV=production
      - INSTANCE_ROLE=standby
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  keepalived:
    image: osixia/keepalived:latest
    volumes:
      - ./keepalived.conf:/container/service/keepalived/assets/keepalived.conf
    network_mode: host
    privileged: true
```

### Pattern 2: Active-Active (Recommended)

```
┌──────────────┐
│    Client    │
└──────┬───────┘
       │
┌──────▼───────────────────────────┐
│      Load Balancer               │
│   (Round Robin / Least Conn)     │
└──┬────┬────┬────┬────┬──────────┘
   │    │    │    │    │
   ▼    ▼    ▼    ▼    ▼
┌────┐┌────┐┌────┐┌────┐┌────┐
│ N1 ││ N2 ││ N3 ││ N4 ││ N5 │  ← Nixite Instances
└────┘└────┘└────┘└────┘└────┘
   │    │    │    │    │
   └────┴────┴────┴────┴──────────┐
                                  │
                           ┌──────▼──────┐
                           │   Shared    │
                           │   Storage   │
                           └─────────────┘
```

**Pros:**
- Full resource utilization
- Linear scaling
- Better performance
- No wasted capacity

**Cons:**
- More complex
- Need shared state management
- Synchronization overhead

**Configuration:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-ha.conf:/etc/nginx/nginx.conf
    depends_on:
      - nixite-1
      - nixite-2
      - nixite-3

  nixite-1:
    image: nixite:latest
    environment:
      - NODE_ENV=production
      - INSTANCE_ID=1
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  nixite-2:
    image: nixite:latest
    environment:
      - NODE_ENV=production
      - INSTANCE_ID=2
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  nixite-3:
    image: nixite:latest
    environment:
      - NODE_ENV=production
      - INSTANCE_ID=3
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  redis:
    image: redis:latest
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

### Pattern 3: Multi-Region (Enterprise)

```
       Global DNS (GeoDNS / Route 53)
                    │
         ┌──────────┼──────────┐
         │          │          │
    ┌────▼───┐ ┌───▼────┐ ┌───▼────┐
    │Region 1│ │Region 2│ │Region 3│
    │ US-East│ │ EU-West│ │  APAC  │
    └────┬───┘ └───┬────┘ └───┬────┘
         │         │          │
    ┌────▼───┐ ┌───▼────┐ ┌───▼────┐
    │  LB +  │ │  LB +  │ │  LB +  │
    │ 3 Nodes│ │ 3 Nodes│ │ 3 Nodes│
    └────┬───┘ └───┬────┘ └───┬────┘
         └─────────┼──────────┘
                   │
            ┌──────▼──────┐
            │  Global DB  │
            │ Replication │
            └─────────────┘
```

## Load Balancing

### Nginx Load Balancer Configuration

```nginx
# nginx-ha.conf
upstream nixite_backend {
    # Load balancing method
    least_conn;  # or: round_robin, ip_hash, hash

    # Backend servers
    server nixite-1:8000 max_fails=3 fail_timeout=30s;
    server nixite-2:8000 max_fails=3 fail_timeout=30s;
    server nixite-3:8000 max_fails=3 fail_timeout=30s;

    # Health check (nginx Plus feature)
    # health_check interval=10s fails=3 passes=2;

    # Keepalive connections
    keepalive 32;
}

upstream nixite_bridge {
    least_conn;

    server bridge-1:8890 max_fails=3 fail_timeout=30s;
    server bridge-2:8890 max_fails=3 fail_timeout=30s;

    keepalive 16;
}

server {
    listen 80;
    server_name nixite.example.com;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }

    # Main application
    location / {
        proxy_pass http://nixite_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Retry on failure
        proxy_next_upstream error timeout http_500 http_502 http_503;
        proxy_next_upstream_tries 2;
    }

    # AI Bridge
    location /api/bridge {
        proxy_pass http://nixite_bridge;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_read_timeout 120s;  # Longer timeout for AI
    }
}
```

### HAProxy Configuration

```haproxy
# haproxy.cfg
global
    maxconn 4096
    log /dev/log local0
    log /dev/log local1 notice

defaults
    log     global
    mode    http
    option  httplog
    option  dontlognull
    timeout connect 5000ms
    timeout client  50000ms
    timeout server  50000ms

frontend nixite_frontend
    bind *:80
    bind *:443 ssl crt /etc/haproxy/certs/nixite.pem
    default_backend nixite_backend

    # Health check
    acl is_health path /health
    use_backend health_backend if is_health

backend nixite_backend
    balance leastconn
    option httpchk GET /health
    http-check expect status 200

    server nixite1 172.17.0.2:8000 check inter 2000 rise 2 fall 3
    server nixite2 172.17.0.3:8000 check inter 2000 rise 2 fall 3
    server nixite3 172.17.0.4:8000 check inter 2000 rise 2 fall 3

backend health_backend
    server health 127.0.0.1:8000 check
```

## Caching Strategies

### Redis Cache Layer

```javascript
// cache-middleware.js
const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

// Cache middleware
async function cacheMiddleware(req, res, next) {
  const key = `cache:${req.method}:${req.path}`;

  try {
    const cached = await client.get(key);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
  } catch (err) {
    console.error('Cache error:', err);
  }

  // Capture response
  const originalSend = res.json;
  res.json = function(data) {
    // Cache for 5 minutes
    client.setEx(key, 300, JSON.stringify(data))
      .catch(err => console.error('Cache set error:', err));

    originalSend.call(this, data);
  };

  next();
}

module.exports = cacheMiddleware;
```

### CDN Configuration

```nginx
# CloudFlare / Fastly / AWS CloudFront
server {
    location /static/ {
        proxy_pass http://nixite_backend;

        # Cache control
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /nixite-packages.json {
        proxy_pass http://nixite_backend;

        # Cache for 1 hour
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }
}
```

## Health Checks

### Application Health Endpoint

```javascript
// health-check.js
const express = require('express');
const app = express();

app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {}
  };

  // Check Ollama connection
  try {
    const ollamaResponse = await fetch('http://localhost:11434');
    health.checks.ollama = ollamaResponse.ok ? 'healthy' : 'unhealthy';
  } catch (err) {
    health.checks.ollama = 'unhealthy';
    health.status = 'degraded';
  }

  // Check disk space
  const diskUsage = await checkDiskSpace();
  health.checks.disk = diskUsage < 90 ? 'healthy' : 'warning';

  // Check memory
  const memUsage = (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100;
  health.checks.memory = memUsage < 90 ? 'healthy' : 'warning';

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

app.get('/ready', (req, res) => {
  // Readiness check - is the app ready to serve traffic?
  const ready = true; // Check dependencies
  res.status(ready ? 200 : 503).json({ ready });
});

app.get('/live', (req, res) => {
  // Liveness check - is the app still running?
  res.status(200).json({ live: true });
});
```

## Auto-Scaling

### Kubernetes HPA (Horizontal Pod Autoscaler)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nixite-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nixite
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 15
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 2
        periodSeconds: 15
```

### AWS Auto Scaling

```yaml
# aws-autoscaling.yml
Resources:
  NixiteASG:
    Type: AWS::AutoScaling::AutoScalingGroup
    Properties:
      VPCZoneIdentifier:
        - !Ref PrivateSubnet1
        - !Ref PrivateSubnet2
      LaunchConfigurationName: !Ref NixiteLC
      MinSize: '3'
      MaxSize: '10'
      DesiredCapacity: '3'
      HealthCheckType: ELB
      HealthCheckGracePeriod: 300
      TargetGroupARNs:
        - !Ref NixiteTargetGroup

  NixiteScalingPolicy:
    Type: AWS::AutoScaling::ScalingPolicy
    Properties:
      AutoScalingGroupName: !Ref NixiteASG
      PolicyType: TargetTrackingScaling
      TargetTrackingConfiguration:
        PredefinedMetricSpecification:
          PredefinedMetricType: ASGAverageCPUUtilization
        TargetValue: 70.0
```

## Disaster Recovery

### Backup Strategy

```bash
#!/bin/bash
# backup-ha.sh

# Backup configuration
BACKUP_DIR="/var/backups/nixite"
DATE=$(date +%Y%m%d-%H%M%S)
S3_BUCKET="s3://nixite-backups"

# Create backup
tar -czf $BACKUP_DIR/nixite-$DATE.tar.gz \
  /opt/nixite/config.js \
  /opt/nixite/nixite-packages.json

# Upload to S3
aws s3 cp $BACKUP_DIR/nixite-$DATE.tar.gz $S3_BUCKET/

# Replicate to secondary region
aws s3 sync $S3_BUCKET/ $S3_BUCKET-dr/ --region us-west-2

# Keep only last 30 backups
ls -t $BACKUP_DIR/nixite-*.tar.gz | tail -n +31 | xargs -r rm
```

### Failover Procedure

```bash
# 1. Detect primary failure
if ! curl -f http://primary:8000/health; then
  echo "Primary failed, initiating failover"

  # 2. Promote secondary
  ssh secondary "sudo systemctl start nixite"

  # 3. Update DNS
  aws route53 change-resource-record-sets \
    --hosted-zone-id Z1234567 \
    --change-batch file://failover-dns.json

  # 4. Notify team
  curl -X POST https://slack.com/webhook \
    -d '{"text":"Nixite failover completed"}'
fi
```

## Monitoring High Availability

### Key Metrics

```
- Instance count (should match desired)
- Health check success rate (>99.9%)
- Request distribution (balanced across instances)
- Failover time (< 30 seconds)
- Recovery time objective (RTO) - target: 5 minutes
- Recovery point objective (RPO) - target: 1 hour
```

### Alerting

```yaml
# prometheus-ha-alerts.yml
groups:
  - name: ha_alerts
    rules:
      - alert: InstanceDown
        expr: up{job="nixite"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Nixite instance down"
          description: "Instance {{ $labels.instance }} is down"

      - alert: LowInstanceCount
        expr: count(up{job="nixite"} == 1) < 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Low instance count"
          description: "Only {{ $value }} instances available"
```

## See Also

- [Monitoring Guide](./MONITORING.md)
- [Production Runbook](./RUNBOOK.md)
- [Disaster Recovery](./DISASTER_RECOVERY.md)

---

**Last Updated:** 2024-01-15
**Version:** 2.1.0+
