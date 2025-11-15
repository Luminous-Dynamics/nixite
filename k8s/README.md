# Kubernetes Deployment

Production-ready Kubernetes manifests for deploying Nixite at scale.

## Quick Start

```bash
# Apply all manifests
kubectl apply -f k8s/manifests/nixite.yaml

# Check deployment status
kubectl get all -n nixite

# View logs
kubectl logs -n nixite -l app=nixite -f
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Ingress (SSL/TLS)                       │
│                  nixite.example.com                         │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    ┌────▼────┐ ┌───▼────┐ ┌───▼────┐
    │ Web 1   │ │ Web 2  │ │ Web 3  │  (HPA: 3-10 pods)
    └────┬────┘ └───┬────┘ └───┬────┘
         │          │          │
         └──────────┼──────────┘
                    │
            ┌───────▼────────┐
            │  AI Bridge 1-2 │  (HPA: 2-5 pods)
            └───────┬────────┘
                    │
            ┌───────▼────────┐
            │    Ollama      │  (1 pod with PVC)
            └────────────────┘
```

## Components

### Deployments

1. **nixite-web** - Web interface (3-10 replicas)
   - CPU: 100m-500m
   - Memory: 256Mi-512Mi
   - Auto-scaling enabled

2. **nixite-bridge** - AI Bridge (2-5 replicas)
   - CPU: 200m-1000m
   - Memory: 512Mi-2Gi
   - Auto-scaling enabled

3. **ollama** - AI model server (1 replica)
   - CPU: 500m-2000m
   - Memory: 2Gi-4Gi
   - Persistent storage: 10Gi

### Services

- `nixite-web` - ClusterIP on port 8000
- `nixite-bridge` - ClusterIP on port 8890
- `ollama` - ClusterIP on port 11434

### Ingress

- TLS termination with Let's Encrypt
- Rate limiting (10 req/s)
- Automatic HTTPS redirect

### Auto-Scaling

- **Web**: 3-10 pods based on CPU (70%) and Memory (80%)
- **Bridge**: 2-5 pods based on CPU (75%) and Memory (85%)

### High Availability

- Pod Disruption Budgets ensure minimum availability
- Multiple replicas across nodes
- Health checks and automatic restarts

## Prerequisites

```bash
# Required
- Kubernetes 1.20+
- Ingress controller (nginx)
- cert-manager for TLS

# Optional but recommended
- Prometheus Operator (for monitoring)
- Metrics Server (for HPA)
- CSI storage driver
```

## Installation

### 1. Install cert-manager

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### 2. Create ClusterIssuer for Let's Encrypt

```yaml
# letsencrypt-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

```bash
kubectl apply -f letsencrypt-issuer.yaml
```

### 3. Update domain in Ingress

```bash
# Edit k8s/manifests/nixite.yaml
# Replace nixite.example.com with your domain
```

### 4. Deploy Nixite

```bash
kubectl apply -f k8s/manifests/nixite.yaml
```

### 5. Verify deployment

```bash
# Check all resources
kubectl get all -n nixite

# Check ingress
kubectl get ingress -n nixite

# Check certificates
kubectl get certificate -n nixite

# View logs
kubectl logs -n nixite -l component=web
kubectl logs -n nixite -l component=bridge
```

## Monitoring

### Prometheus Integration

If using Prometheus Operator:

```bash
# ServiceMonitors are automatically created
kubectl get servicemonitor -n nixite
```

Access metrics:
```bash
# Port-forward to access metrics locally
kubectl port-forward -n nixite svc/nixite-web 8000:8000
curl http://localhost:8000/metrics
```

### Grafana Dashboards

Import pre-configured dashboards from `k8s/dashboards/`:
- `nixite-overview.json` - System overview
- `nixite-performance.json` - Performance metrics

## Scaling

### Manual Scaling

```bash
# Scale web pods
kubectl scale deployment nixite-web -n nixite --replicas=5

# Scale bridge pods
kubectl scale deployment nixite-bridge -n nixite --replicas=3
```

### Auto-Scaling

HPA automatically adjusts replicas based on:
- CPU utilization
- Memory utilization

View HPA status:
```bash
kubectl get hpa -n nixite
```

## Maintenance

### Rolling Updates

```bash
# Update image
kubectl set image deployment/nixite-web -n nixite \
  web=ghcr.io/luminous-dynamics/nixite:2.2.0

# Watch rollout
kubectl rollout status deployment/nixite-web -n nixite

# Rollback if needed
kubectl rollout undo deployment/nixite-web -n nixite
```

### Backup

```bash
# Backup all resources
kubectl get all -n nixite -o yaml > nixite-backup.yaml

# Backup PVC data
kubectl exec -n nixite -it ollama-0 -- tar czf - /root/.ollama > ollama-backup.tar.gz
```

### Logs

```bash
# View logs
kubectl logs -n nixite -l app=nixite --tail=100

# Follow logs
kubectl logs -n nixite -l app=nixite -f

# Logs from specific component
kubectl logs -n nixite -l component=web -f
kubectl logs -n nixite -l component=bridge -f

# Previous container logs (after crash)
kubectl logs -n nixite <pod-name> --previous
```

## Troubleshooting

### Pods not starting

```bash
# Check pod status
kubectl get pods -n nixite

# Describe pod
kubectl describe pod -n nixite <pod-name>

# Check events
kubectl get events -n nixite --sort-by='.lastTimestamp'
```

### Ingress not working

```bash
# Check ingress
kubectl describe ingress -n nixite nixite-ingress

# Check certificate
kubectl describe certificate -n nixite nixite-tls

# Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager
```

### High memory usage

```bash
# Check resource usage
kubectl top pods -n nixite

# Adjust limits in deployment
kubectl edit deployment nixite-bridge -n nixite
```

## Security

### Network Policies

NetworkPolicy restricts traffic to:
- Only ingress controller can access web/bridge
- Pods can communicate with each other
- DNS traffic allowed

### RBAC

Minimal RBAC configuration:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: nixite-role
  namespace: nixite
rules:
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  verbs: ["get", "list"]
```

### Pod Security

- Non-root containers (UID 1000)
- Read-only root filesystem (where possible)
- No privilege escalation
- Resource limits enforced

## Advanced Configuration

### Custom ConfigMap

```bash
# Create custom config
kubectl create configmap nixite-custom-config \
  --from-file=config.js \
  -n nixite

# Update deployment to use it
kubectl patch deployment nixite-web -n nixite \
  -p '{"spec":{"template":{"spec":{"volumes":[{"name":"config","configMap":{"name":"nixite-custom-config"}}]}}}}'
```

### Persistent Storage

For production, use appropriate StorageClass:

```yaml
# Example with AWS EBS
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ollama-pvc
  namespace: nixite
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: gp3  # AWS gp3 SSD
  resources:
    requests:
      storage: 20Gi
```

### Multi-Region Deployment

Deploy to multiple clusters and use:
- Global load balancer (AWS Route53, GCP Cloud Load Balancing)
- Cross-region database replication
- Shared object storage (S3, GCS)

## Cost Optimization

### Resource Requests/Limits

Current settings are conservative. Adjust based on actual usage:

```bash
# Monitor actual usage
kubectl top pods -n nixite

# Adjust if needed
kubectl set resources deployment nixite-web -n nixite \
  --requests=cpu=50m,memory=128Mi \
  --limits=cpu=250m,memory=256Mi
```

### Spot/Preemptible Instances

Use node affinity for non-critical components:

```yaml
affinity:
  nodeAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      preference:
        matchExpressions:
        - key: cloud.google.com/gke-preemptible
          operator: In
          values:
          - "true"
```

## Performance Tuning

### Ollama GPU Support

For GPU acceleration:

```yaml
containers:
- name: ollama
  resources:
    limits:
      nvidia.com/gpu: 1
```

### Connection Pooling

Enable keep-alive in Ingress:

```yaml
annotations:
  nginx.ingress.kubernetes.io/upstream-keepalive-connections: "100"
  nginx.ingress.kubernetes.io/upstream-keepalive-timeout: "60"
```

## Monitoring Dashboards

See `k8s/dashboards/` for Grafana dashboard configurations.

## Related Documentation

- [High Availability Guide](../docs/HIGH_AVAILABILITY.md)
- [Monitoring Guide](../docs/MONITORING.md)
- [Production Runbook](../docs/RUNBOOK.md)

---

**Last Updated:** 2024-01-15
**Version:** 2.1.0+
