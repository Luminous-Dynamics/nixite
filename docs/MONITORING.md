# Monitoring & Observability Guide

Comprehensive guide to monitoring, observability, and operational excellence for Nixite in production environments.

## Table of Contents

- [Overview](#overview)
- [Monitoring Stack](#monitoring-stack)
- [Metrics](#metrics)
- [Logging](#logging)
- [Tracing](#tracing)
- [Alerting](#alerting)
- [Dashboards](#dashboards)
- [SLIs & SLOs](#slis--slos)
- [Incident Response](#incident-response)
- [Best Practices](#best-practices)

## Overview

### The Three Pillars of Observability

```
┌──────────────────────────────────────────────────────────┐
│                   OBSERVABILITY                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   METRICS   │  │   LOGGING   │  │   TRACING   │     │
│  │             │  │             │  │             │     │
│  │  • Counters │  │  • Events   │  │  • Spans    │     │
│  │  • Gauges   │  │  • Errors   │  │  • Context  │     │
│  │  • Histograms│ │  • Audit    │  │  • Latency  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Monitoring Goals

1. **Detect Issues Before Users Do** - Proactive monitoring
2. **Understand System Behavior** - Deep insights
3. **Debug Production Problems** - Fast troubleshooting
4. **Optimize Performance** - Data-driven improvements
5. **Ensure Reliability** - Meet SLOs

## Monitoring Stack

### Recommended Stack

```
Application Layer
    ↓
┌──────────────────┐
│  Prometheus      │  ← Metrics collection
│  (Time-series DB)│
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Grafana         │  ← Visualization
│  (Dashboards)    │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Loki            │  ← Log aggregation
│  (Log storage)   │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Alertmanager    │  ← Alerting
│  (Notifications) │
└──────────────────┘
```

### Alternative Stacks

**Cloud-Native:**
- **AWS:** CloudWatch + X-Ray + CloudWatch Logs
- **GCP:** Cloud Monitoring + Cloud Trace + Cloud Logging
- **Azure:** Azure Monitor + Application Insights

**Commercial:**
- **Datadog** - All-in-one observability
- **New Relic** - APM and monitoring
- **Honeycomb** - Observability platform

**Open Source:**
- **Elastic Stack** - ELK (Elasticsearch, Logstash, Kibana)
- **Jaeger** - Distributed tracing
- **Tempo** - Distributed tracing backend

## Metrics

### Key Metrics to Monitor

#### Application Metrics

```javascript
// Example metrics to collect

// HTTP Request metrics
http_requests_total{method, path, status}        // Counter
http_request_duration_seconds{method, path}      // Histogram
http_requests_in_flight                          // Gauge

// AI Bridge metrics
ai_bridge_requests_total{model, operation}       // Counter
ai_bridge_response_time_seconds{model}           // Histogram
ai_bridge_tokens_used_total{model}               // Counter
ai_bridge_errors_total{type}                     // Counter

// Package metrics
package_searches_total{category}                 // Counter
package_installations_total{package}             // Counter
package_views_total{package}                     // Counter

// System metrics
nodejs_memory_usage_bytes{type}                  // Gauge
nodejs_cpu_usage_percent                         // Gauge
nodejs_active_handles                            // Gauge
nodejs_event_loop_lag_seconds                    // Histogram
```

#### Infrastructure Metrics

```
# System resources
- CPU usage (%)
- Memory usage (bytes, %)
- Disk I/O (ops/sec, MB/sec)
- Network I/O (packets/sec, MB/sec)
- Disk space (bytes, %)

# Service health
- Service uptime
- Process count
- File descriptor usage
- Connection count

# Database (if applicable)
- Query latency
- Connection pool size
- Slow queries
- Lock contention
```

### Implementing Metrics with Prometheus

#### 1. Install prom-client

```bash
npm install prom-client
```

#### 2. Add metrics to AI Bridge

```javascript
// nixite-luminous-bridge.js
const client = require('prom-client');

// Create a Registry
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestsTotal = new client.Counter({
  name: 'nixite_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'nixite_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
});

const aiBridgeRequests = new client.Counter({
  name: 'nixite_ai_bridge_requests_total',
  help: 'Total AI Bridge requests',
  labelNames: ['model', 'operation'],
  registers: [register]
});

// Middleware to track requests
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;

    httpRequestsTotal.inc({
      method: req.method,
      path: req.route?.path || req.path,
      status: res.statusCode
    });

    httpRequestDuration.observe({
      method: req.method,
      path: req.route?.path || req.path
    }, duration);
  });

  next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

#### 3. Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'nixite-web'
    static_configs:
      - targets: ['localhost:8000']

  - job_name: 'nixite-bridge'
    static_configs:
      - targets: ['localhost:8890']
    metrics_path: '/metrics'

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
```

#### 4. Run Prometheus

```bash
# Using Docker
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

# Using NixOS
services.prometheus = {
  enable = true;
  scrapeConfigs = [
    {
      job_name = "nixite";
      static_configs = [{
        targets = [ "localhost:8890" ];
      }];
    }
  ];
};
```

## Logging

### Log Levels

```
TRACE → DEBUG → INFO → WARN → ERROR → FATAL
  ↓       ↓      ↓      ↓       ↓       ↓
 Dev   Dev/QA  Prod   Prod    Prod   Critical
```

### Structured Logging

**Bad (Unstructured):**
```javascript
console.log('User john logged in from 192.168.1.1');
```

**Good (Structured):**
```javascript
logger.info('user_login', {
  user: 'john',
  ip: '192.168.1.1',
  timestamp: new Date().toISOString(),
  userAgent: req.headers['user-agent']
});
```

### Implementing Structured Logging

#### 1. Install winston

```bash
npm install winston
```

#### 2. Configure logger

```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'nixite-bridge',
    version: '2.1.0'
  },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    // File output
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

module.exports = logger;
```

#### 3. Use in application

```javascript
const logger = require('./logger');

// Log events
logger.info('Server started', { port: 8890 });
logger.warn('Ollama connection slow', { responseTime: 5000 });
logger.error('AI request failed', {
  error: err.message,
  stack: err.stack,
  model: 'gemma:2b'
});
```

### Log Aggregation with Loki

#### 1. Docker Compose Setup

```yaml
# docker-compose.yml
version: '3'

services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - loki-data:/loki

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - ./logs:/app/logs
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml

volumes:
  loki-data:
```

#### 2. Promtail Configuration

```yaml
# promtail-config.yml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: nixite-logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: nixite
          __path__: /app/logs/*.log
```

## Tracing

### Distributed Tracing Concepts

```
Request Flow with Tracing:

User Request
    ↓
┌───────────────┐  Span 1: HTTP Request
│  Web Server   │  Duration: 120ms
└───────┬───────┘
        ↓
    ┌───────────────┐  Span 2: Package Search
    │  Search Logic │  Duration: 30ms
    └───────┬───────┘
            ↓
        ┌───────────────┐  Span 3: AI Bridge
        │  AI Request   │  Duration: 80ms
        └───────┬───────┘
                ↓
            ┌───────────────┐  Span 4: Ollama
            │  Ollama API   │  Duration: 75ms
            └───────────────┘
```

### Implementing Tracing with OpenTelemetry

#### 1. Install OpenTelemetry

```bash
npm install @opentelemetry/api \
  @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-jaeger
```

#### 2. Configure tracing

```javascript
// tracing.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: 'http://localhost:14268/api/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: 'nixite-bridge',
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
```

#### 3. Start application with tracing

```bash
node -r ./tracing.js nixite-luminous-bridge.js
```

## Alerting

### Alert Rules

#### Prometheus Alert Rules

```yaml
# alerts.yml
groups:
  - name: nixite_alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          rate(nixite_http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/sec"

      # Service down
      - alert: ServiceDown
        expr: up{job="nixite-bridge"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Nixite AI Bridge is down"
          description: "AI Bridge has been down for more than 1 minute"

      # High response time
      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.95,
            rate(nixite_http_request_duration_seconds_bucket[5m])
          ) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High response time"
          description: "95th percentile response time is {{ $value }}s"

      # High memory usage
      - alert: HighMemoryUsage
        expr: |
          (nodejs_memory_usage_bytes{type="heapUsed"} /
           nodejs_memory_usage_bytes{type="heapTotal"}) > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      # Ollama connection issues
      - alert: OllamaConnectionFailures
        expr: |
          rate(nixite_ai_bridge_errors_total{type="ollama_connection"}[5m]) > 0
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Ollama connection issues"
          description: "{{ $value }} connection failures/sec to Ollama"
```

### Alertmanager Configuration

```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'

  routes:
    - match:
        severity: critical
      receiver: 'pagerduty'
      continue: true

    - match:
        severity: warning
      receiver: 'slack'

receivers:
  - name: 'default'
    webhook_configs:
      - url: 'http://localhost:5001/webhook'

  - name: 'slack'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#nixite-alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'
```

## Dashboards

### Grafana Dashboard Configuration

#### System Overview Dashboard

```json
{
  "dashboard": {
    "title": "Nixite System Overview",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(nixite_http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(nixite_http_requests_total{status=~\"5..\"}[5m])"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(nixite_http_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "AI Bridge Requests",
        "targets": [
          {
            "expr": "rate(nixite_ai_bridge_requests_total[5m])"
          }
        ]
      }
    ]
  }
}
```

### Key Dashboards to Create

1. **System Overview** - High-level health
2. **Application Performance** - Request rates, latency, errors
3. **AI Bridge Metrics** - Model performance, token usage
4. **Infrastructure** - CPU, memory, disk, network
5. **Business Metrics** - Package searches, installations
6. **Logs** - Real-time log exploration

## SLIs & SLOs

### Service Level Indicators (SLIs)

```
Availability SLI = (Successful requests / Total requests) × 100%
Latency SLI = (Requests < latency threshold / Total requests) × 100%
Error Rate SLI = (Failed requests / Total requests) × 100%
```

### Service Level Objectives (SLOs)

**Recommended SLOs for Nixite:**

```
| Service        | SLI          | SLO    | Measurement Window |
|----------------|--------------|--------|-------------------|
| Web Interface  | Availability | 99.9%  | 30 days           |
| Web Interface  | Latency p95  | < 500ms| 30 days           |
| AI Bridge      | Availability | 99.5%  | 30 days           |
| AI Bridge      | Latency p95  | < 5s   | 30 days           |
| Package Search | Availability | 99.9%  | 30 days           |
| All Services   | Error Rate   | < 0.1% | 30 days           |
```

### Error Budget

```
Error Budget = (1 - SLO) × Total Requests

Example for 99.9% availability over 30 days:
- Total seconds: 2,592,000
- Allowed downtime: 2,592 seconds (~43 minutes)
- Error budget: 0.1% of requests
```

## Incident Response

### Incident Severity Levels

```
SEV-1 (Critical)
  - Service completely down
  - Data loss occurring
  - Security breach
  → Response: Immediate (24/7)
  → Resolution: < 1 hour

SEV-2 (High)
  - Major feature unavailable
  - Performance severely degraded
  → Response: Within 15 minutes (business hours)
  → Resolution: < 4 hours

SEV-3 (Medium)
  - Minor feature issue
  - Performance degradation
  → Response: Next business day
  → Resolution: < 2 days

SEV-4 (Low)
  - Cosmetic issues
  - Nice-to-have features
  → Response: As time permits
  → Resolution: Next release
```

### Incident Response Runbook

See [docs/RUNBOOK.md](./RUNBOOK.md) for detailed incident response procedures.

## Best Practices

### 1. Monitor What Matters

**DO:**
- Monitor user-facing metrics (latency, errors, availability)
- Monitor business metrics (searches, installations)
- Monitor resource utilization trends

**DON'T:**
- Monitor everything possible
- Create alerts for every metric
- Ignore false positives

### 2. Alert Fatigue Prevention

- Set meaningful thresholds
- Use alert aggregation
- Implement alert routing
- Regular alert review

### 3. Observability Culture

- Make metrics visible to all
- Include monitoring in design
- Share dashboards openly
- Learn from incidents

### 4. Security & Privacy

- Sanitize sensitive data from logs
- Restrict metrics access
- Encrypt data in transit
- Audit access logs

## Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [OpenTelemetry](https://opentelemetry.io/)
- [SRE Book](https://sre.google/books/)
- [Production Runbook](./RUNBOOK.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

---

**Last Updated:** 2024-01-15
**Version:** 2.1.0+
