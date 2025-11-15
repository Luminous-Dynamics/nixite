# Nixite Performance Optimization Guide

Tips and best practices for maximizing Nixite's performance.

## 📋 Table of Contents

- [Frontend Performance](#frontend-performance)
- [Backend Performance](#backend-performance)
- [AI Bridge Performance](#ai-bridge-performance)
- [Deployment Optimization](#deployment-optimization)
- [Monitoring Performance](#monitoring-performance)
- [Troubleshooting Performance Issues](#troubleshooting-performance-issues)

## 🎨 Frontend Performance

### Browser Optimization

**Enable Hardware Acceleration:**
```
Chrome/Edge: chrome://flags → Hardware Acceleration
Firefox: about:config → layers.acceleration.force-enabled
```

**Use Chromium-based Browsers:**
- Chrome, Edge, Brave - Best performance
- Firefox - Good performance
- Safari - Good on macOS

**Clear Cache Regularly:**
```bash
# Chrome: Ctrl+Shift+Delete
# Firefox: Ctrl+Shift+Delete
# Or use incognito/private mode for testing
```

### Network Performance

**Enable HTTP/2:**
If using Nginx:
```nginx
server {
    listen 443 ssl http2;
    # ... rest of config
}
```

**Enable Compression:**
```nginx
# In nginx.conf
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript;
```

**Use CDN for Static Assets** (if hosting publicly):
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 7d;
    add_header Cache-Control "public, immutable";
}
```

### JavaScript Optimization

**Current Optimizations (Already Implemented):**
✅ Debounced search (300ms delay)
✅ Event delegation for package cards
✅ Lazy loading of AI features
✅ Efficient DOM manipulation

**Additional Optimizations:**

1. **Use Browser DevTools:**
```
F12 → Performance Tab → Record → Stop
Analyze: Scripting, Rendering, Painting
```

2. **Reduce Repaints:**
```javascript
// Good - batch DOM updates
const fragment = document.createDocumentFragment();
packages.forEach(pkg => {
    const card = createPackageCard(pkg);
    fragment.appendChild(card);
});
container.appendChild(fragment);

// Bad - multiple repaints
packages.forEach(pkg => {
    container.appendChild(createPackageCard(pkg));
});
```

### CSS Optimization

**Use CSS Containment:**
```css
.package-card {
    contain: layout style paint;
}
```

**Optimize Animations:**
```css
/* Use transform instead of top/left */
.card {
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);  /* ✓ Good */
    /* top: -5px;  ✗ Bad - causes layout */
}
```

**Reduce Specificity:**
```css
/* Good */
.card-title { }

/* Bad - slower */
div.container .row .card .card-body .card-title { }
```

## ⚙️ Backend Performance

### Python HTTP Server

**Use Production Server:**

Instead of `python3 -m http.server`, use:

```bash
# gunicorn (recommended)
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app

# or uvicorn
pip install uvicorn
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

**Optimize Static File Serving:**

Use Nginx as reverse proxy:
```nginx
server {
    listen 80;

    # Serve static files directly
    location / {
        root /path/to/nixite;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests
    location /api/ {
        proxy_pass http://localhost:8890;
    }
}
```

### Node.js AI Bridge

**Use Production Mode:**
```bash
NODE_ENV=production node nixite-luminous-bridge.js
```

**Enable Clustering:**
```javascript
// At the top of nixite-luminous-bridge.js
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    // Your server code here
}
```

**Increase Node Memory:**
```bash
node --max-old-space-size=4096 nixite-luminous-bridge.js
```

## 🤖 AI Bridge Performance

### Model Selection

**Performance vs. Accuracy Trade-off:**

| Model | Size | RAM | Speed | Accuracy |
|-------|------|-----|-------|----------|
| tinyllama | ~1GB | 1GB | Fast | Good |
| gemma:2b | ~2GB | 2GB | Medium | Better |
| gemma:7b | ~4GB | 4GB | Slow | Best |
| llama2 | ~4GB | 4GB | Slow | Best |

**Switch Model:**
```javascript
// In config.js
ollama: {
    model: 'tinyllama'  // Faster, less accurate
    // model: 'gemma:2b'   // Balanced (default)
    // model: 'gemma:7b'   // Slower, more accurate
}
```

### Ollama Optimization

**Pre-load Model:**
```bash
# Load model into memory at startup
ollama pull gemma:2b
ollama run gemma:2b "warmup"
```

**Increase Context Window:**
```bash
# Edit Ollama Modelfile
ollama create mymodel -f Modelfile

# Modelfile content:
FROM gemma:2b
PARAMETER num_ctx 4096  # Larger context
PARAMETER num_thread 8  # Use more CPU threads
```

**Use GPU Acceleration:**
```bash
# Ollama automatically uses GPU if available
# Verify: nvidia-smi or rocm-smi

# Force CPU-only (if needed)
CUDA_VISIBLE_DEVICES=-1 ollama serve
```

### Caching

**Implement Response Cache:**
```javascript
// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedOrFetch(key, fetchFn) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const data = fetchFn();
    cache.set(key, { data, timestamp: Date.now() });
    return data;
}
```

**Use Redis for Distributed Caching:**
```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache AI responses
async function searchWithCache(query) {
    const cached = await client.get(`search:${query}`);
    if (cached) return JSON.parse(cached);

    const result = await performAISearch(query);
    await client.setex(`search:${query}`, 300, JSON.stringify(result));
    return result;
}
```

## 🐳 Deployment Optimization

### Docker

**Multi-stage Builds:**
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Runtime stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["node", "nixite-luminous-bridge.js"]
```

**Resource Limits:**
```yaml
# docker-compose.yml
services:
  nixite-web:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Kubernetes

**Horizontal Pod Autoscaling:**
```yaml
# Already configured in k8s/manifests/nixite.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nixite-web
spec:
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

**Resource Requests/Limits:**
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

**Use PodDisruptionBudgets:**
```yaml
# Ensures minimum availability during updates
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: nixite-web-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: nixite-web
```

## 📊 Monitoring Performance

### Browser Performance

**Measure with Lighthouse:**
```bash
# Chrome DevTools: F12 → Lighthouse tab
# Or use CLI:
npm install -g lighthouse
lighthouse http://localhost:8000 --view
```

**Performance Targets:**
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Cumulative Layout Shift (CLS): < 0.1

**Use Performance API:**
```javascript
// Measure page load
window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log(`Page Load Time: ${pageLoadTime}ms`);
});
```

### Backend Performance

**Run Performance Tests:**
```bash
npm run test:performance
```

**Use ApacheBench:**
```bash
# Test web server
ab -n 1000 -c 10 http://localhost:8000/

# Expected:
# Requests per second: > 100
# Time per request: < 100ms
```

**Use wrk:**
```bash
# More advanced benchmarking
wrk -t4 -c100 -d30s http://localhost:8000/

# Monitor:
# Latency p50, p99
# Requests/sec
```

### AI Bridge Performance

**Measure Response Times:**
```javascript
const start = Date.now();
const result = await searchPackages(query);
const duration = Date.now() - start;
console.log(`AI Search took ${duration}ms`);
```

**Monitor Ollama:**
```bash
# Check Ollama logs
journalctl -u ollama -f

# Monitor GPU usage
watch -n 1 nvidia-smi  # NVIDIA
watch -n 1 rocm-smi    # AMD
```

### System Monitoring

**Use Prometheus + Grafana:**
See [k8s/dashboards/nixite-overview.json](../k8s/dashboards/nixite-overview.json)

**Key Metrics:**
- Request rate
- Error rate
- Response time (p50, p95, p99)
- Memory usage
- CPU usage
- Active connections

## 🔧 Troubleshooting Performance Issues

### Slow Page Load

**Diagnose:**
```
1. Open DevTools (F12)
2. Network tab
3. Reload page
4. Check:
   - Total load time
   - Large files
   - Slow requests
```

**Solutions:**
- Enable compression (gzip)
- Minify JavaScript/CSS
- Optimize images
- Use browser caching
- Use CDN

### Slow Search

**Diagnose:**
```javascript
// Add timing
console.time('search');
const results = searchPackages(query);
console.timeEnd('search');
```

**Solutions:**
- Reduce package database size
- Optimize search algorithm
- Use Web Workers for background processing
- Implement debouncing (already done)

### Slow AI Search

**Diagnose:**
```bash
# Check Ollama response time
time curl -X POST http://localhost:11434/api/generate \
  -d '{"model":"gemma:2b","prompt":"test"}'
```

**Solutions:**
- Use smaller/faster model (tinyllama)
- Pre-load model at startup
- Enable GPU acceleration
- Increase Ollama threads
- Cache AI responses

### High Memory Usage

**Diagnose:**
```bash
# Check process memory
ps aux | grep -E 'python|node|ollama'

# Or use htop
htop
```

**Solutions:**
- Restart services periodically
- Set memory limits (Docker/K8s)
- Use smaller AI model
- Clear caches
- Fix memory leaks

### High CPU Usage

**Diagnose:**
```bash
# Find CPU hogs
top
# Press 'P' to sort by CPU

# Or detailed analysis
perf top
```

**Solutions:**
- Reduce concurrent requests
- Optimize hot code paths
- Use connection pooling
- Enable caching
- Scale horizontally

## 💡 Performance Best Practices

### General

1. **Measure First** - Don't optimize prematurely
2. **Set Targets** - Define acceptable performance
3. **Monitor Always** - Use metrics and dashboards
4. **Cache Aggressively** - Cache what doesn't change
5. **Scale Horizontally** - Add more instances vs. bigger instances

### Frontend

1. **Minimize Reflows** - Batch DOM updates
2. **Use CSS Transforms** - GPU-accelerated animations
3. **Lazy Load** - Load content as needed
4. **Debounce/Throttle** - Reduce event handler calls
5. **Optimize Images** - Compress and use appropriate formats

### Backend

1. **Use Reverse Proxy** - Nginx for static files
2. **Enable Caching** - Browser and server-side
3. **Compress Responses** - gzip/brotli
4. **Connection Pooling** - Reuse connections
5. **Async Processing** - Don't block requests

### AI

1. **Choose Right Model** - Balance speed vs. accuracy
2. **Pre-load Models** - Warm up at startup
3. **Cache Responses** - Store common queries
4. **Use GPU** - If available
5. **Batch Requests** - Process multiple at once

## 📚 Additional Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Nginx Performance Tuning](https://nginx.org/en/docs/http/ngx_http_core_module.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Ollama Documentation](https://ollama.ai/docs)
- [Lighthouse Scoring](https://web.dev/performance-scoring/)

## 🆘 Getting Help

Performance issues not covered here?

1. Run performance tests: `npm run test:performance`
2. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
3. Open an issue with:
   - System specs (CPU, RAM, OS)
   - Deployment method
   - Performance metrics
   - Steps to reproduce

---

**Remember**: Premature optimization is the root of all evil. Measure, identify bottlenecks, then optimize!

**Last Updated**: 2025-01-15
