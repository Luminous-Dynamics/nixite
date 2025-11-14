# Docker Deployment Guide

Deploy Nixite using Docker for easy, isolated deployment.

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/Luminous-Dynamics/nixite.git
cd nixite

# Start with Docker Compose
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

Access at: http://localhost:8000

### Using Docker Only

```bash
# Build the image
docker build -t nixite:latest .

# Run the container
docker run -d \
  --name nixite \
  -p 8000:8000 \
  nixite:latest

# View logs
docker logs -f nixite
```

## Configuration

### Environment Variables

```bash
docker run -d \
  --name nixite \
  -p 8000:8000 \
  -e NIXITE_HOST=0.0.0.0 \
  -e NIXITE_PORT=8000 \
  nixite:latest
```

### Custom Configuration

Mount your own config.js:

```bash
docker run -d \
  --name nixite \
  -p 8000:8000 \
  -v $(pwd)/my-config.js:/app/config.js:ro \
  nixite:latest
```

### Custom Package List

Mount your own package database:

```bash
docker run -d \
  --name nixite \
  -p 8000:8000 \
  -v $(pwd)/my-packages.json:/app/nixite-packages.json:ro \
  nixite:latest
```

## Full Stack with AI Bridge

Use Docker Compose for both web and AI services:

```yaml
# docker-compose.yml
version: '3.8'

services:
  nixite-web:
    build: .
    ports:
      - "8000:8000"
    restart: unless-stopped

  nixite-bridge:
    build: .
    command: ["node", "/app/nixite-luminous-bridge.js"]
    ports:
      - "8890:8890"
    environment:
      - NODE_ENV=production
      - BRIDGE_PORT=8890
    restart: unless-stopped
    depends_on:
      - nixite-web
```

## Production Deployment

### With SSL/TLS (using nginx)

```yaml
version: '3.8'

services:
  nixite:
    build: .
    expose:
      - "8000"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - nixite
    restart: unless-stopped
```

### Health Checks

Docker Compose with health monitoring:

```yaml
services:
  nixite-web:
    build: .
    ports:
      - "8000:8000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
    restart: unless-stopped
```

## Persistence

### Data Volumes

For persistent data:

```yaml
services:
  nixite-web:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - nixite-data:/app/data
    restart: unless-stopped

volumes:
  nixite-data:
    driver: local
```

## Troubleshooting

### Container Won't Start

Check logs:
```bash
docker logs nixite
```

### Port Already in Use

Change the port mapping:
```bash
docker run -d -p 8001:8000 nixite:latest
```

### Permission Issues

Run with specific user:
```bash
docker run -d --user 1000:1000 -p 8000:8000 nixite:latest
```

### Rebuild After Changes

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Docker Hub

Pull pre-built image (when available):

```bash
docker pull luminousdynamics/nixite:latest
docker run -d -p 8000:8000 luminousdynamics/nixite:latest
```

## Kubernetes

Deploy to Kubernetes:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nixite
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nixite
  template:
    metadata:
      labels:
        app: nixite
    spec:
      containers:
      - name: nixite
        image: luminousdynamics/nixite:latest
        ports:
        - containerPort: 8000
---
apiVersion: v1
kind: Service
metadata:
  name: nixite
spec:
  selector:
    app: nixite
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
```

## Best Practices

1. **Use docker-compose** for multi-container setups
2. **Set resource limits** to prevent resource exhaustion
3. **Use health checks** for reliability
4. **Mount volumes** for persistence
5. **Use restart policies** for automatic recovery
6. **Keep images updated** for security patches

## Security

- Run as non-root user (already configured)
- Use read-only volumes where possible
- Limit container capabilities
- Keep base images updated
- Scan images for vulnerabilities

## Next Steps

- [Reverse Proxy Setup](./REVERSE_PROXY.md)
- [SSL/TLS Configuration](./SSL.md)
- [Monitoring Setup](../operations/MONITORING.md)

---

**Need help?** Check [Troubleshooting](./TROUBLESHOOTING.md) or open an issue.
