# AI Bridge (Luminous Bridge) Documentation

Complete guide to the Nixite AI Bridge, powered by Ollama and Gemma.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [Health Monitoring](#health-monitoring)
- [API Reference](#api-reference)
- [Performance Tuning](#performance-tuning)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Advanced Topics](#advanced-topics)

## Overview

The **Nixite AI Bridge** (Luminous Bridge) is a Node.js service that provides AI-powered features for Nixite using Ollama and the Gemma language model.

### Features

- **AI-Powered Package Recommendations** - Intelligent package suggestions
- **Natural Language Search** - Search packages using conversational queries
- **Package Feedback Analysis** - AI-driven feedback interpretation
- **Voice Input Support** - Voice-to-text package search
- **Context-Aware Responses** - Personalized recommendations
- **Multi-Model Support** - Swap between different AI models

### Technology Stack

- **Runtime:** Node.js v16+
- **AI Backend:** Ollama
- **Default Model:** Gemma 2B
- **Protocol:** REST API (JSON)
- **Port:** 8890 (configurable)

## Architecture

### System Overview

```
┌─────────────────┐
│   Web Browser   │
│   (Frontend)    │
└────────┬────────┘
         │ HTTP/HTTPS
         ▼
┌─────────────────┐
│   Web Server    │
│   (Port 8000)   │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   AI Bridge     │◄────────┐
│  (Port 8890)    │         │
└────────┬────────┘         │
         │ HTTP              │
         ▼                   │
┌─────────────────┐         │
│  Ollama Service │─────────┘
│  (Port 11434)   │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Gemma 2B Model │
│   (Local LLM)   │
└─────────────────┘
```

### Component Breakdown

#### 1. AI Bridge Service (`nixite-luminous-bridge.js`)

**Responsibilities:**
- Receive requests from web frontend
- Format prompts for Ollama
- Stream responses back to client
- Handle errors and timeouts
- Provide health check endpoint

**Key Functions:**
- `/health` - Health check endpoint
- `/feedback` - Process package feedback
- `/search` - Natural language package search
- `/recommend` - Get package recommendations

#### 2. Ollama Service

**Responsibilities:**
- Run the Gemma language model
- Process inference requests
- Manage model loading/unloading
- Handle GPU/CPU acceleration

**Configuration:**
- Default port: 11434
- Models directory: `~/.ollama/models`
- Supports: CUDA, ROCm, CPU

#### 3. Gemma 2B Model

**Specifications:**
- Size: ~1.7GB
- Parameters: 2 billion
- Context window: 8192 tokens
- Quantization: Q4_0 (default)
- Memory usage: ~2-4GB RAM

### Data Flow

1. **User Request:**
   ```
   User → Frontend → AI Bridge
   ```

2. **AI Processing:**
   ```
   AI Bridge → Format Prompt → Ollama → Gemma Model
   ```

3. **Response:**
   ```
   Gemma Model → Ollama → AI Bridge → Frontend → User
   ```

## Installation & Setup

### Prerequisites

```bash
# Install Node.js (v16+)
node --version  # Check version

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Verify Ollama
ollama --version
```

### Install Gemma Model

```bash
# Pull Gemma 2B (recommended)
ollama pull gemma:2b

# Or pull larger model for better quality
ollama pull gemma:7b

# Verify installation
ollama list
```

### Start AI Bridge

#### Method 1: Using Helper Script (Recommended)

```bash
./scripts/dev.sh start
```

#### Method 2: Manual Start

```bash
# Start Ollama service
ollama serve &

# Start AI Bridge
node nixite-luminous-bridge.js
```

#### Method 3: systemd Service

```bash
# Copy service file
sudo cp examples/systemd/nixite-bridge.service /etc/systemd/system/

# Enable and start
sudo systemctl enable nixite-bridge
sudo systemctl start nixite-bridge

# Check status
sudo systemctl status nixite-bridge
```

### Configuration

Edit `config.js`:

```javascript
const config = {
  luminousBridge: {
    enabled: true,
    port: 8890,
    host: 'localhost',
    model: 'gemma:2b',          // AI model to use
    timeout: 30000,             // Request timeout (ms)
    maxTokens: 500,             // Max response tokens
    temperature: 0.7,           // Creativity (0-1)
    systemPrompt: 'custom...'   // Custom system prompt
  }
};
```

## Health Monitoring

### Health Check Endpoint

```bash
# Check if AI Bridge is healthy
curl http://localhost:8890/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "model": "gemma:2b",
  "ollama": {
    "connected": true,
    "version": "0.1.17"
  }
}
```

### Automated Health Checks

#### Using curl + cron

```bash
# Add to crontab
*/5 * * * * curl -f http://localhost:8890/health || systemctl restart nixite-bridge
```

#### Using systemd

```ini
[Unit]
Description=AI Bridge Health Check

[Service]
Type=oneshot
ExecStart=/usr/bin/curl -f http://localhost:8890/health

[Install]
WantedBy=multi-user.target
```

```ini
[Unit]
Description=AI Bridge Health Check Timer

[Timer]
OnBootSec=5min
OnUnitActiveSec=5min

[Install]
WantedBy=timers.target
```

### Monitoring Metrics

#### Response Time

```bash
# Measure response time
time curl http://localhost:8890/health

# Expected: < 100ms for health check
# Expected: < 5s for AI inference
```

#### Resource Usage

```bash
# CPU and Memory
top -p $(pgrep -f "nixite-luminous-bridge")

# Detailed stats
ps aux | grep nixite-luminous-bridge
```

#### Ollama Status

```bash
# Check Ollama
curl http://localhost:11434

# List loaded models
ollama ps

# View Ollama logs
journalctl -u ollama -f
```

### Logs

```bash
# View AI Bridge logs
tail -f .bridge.log

# Filter for errors
grep -i error .bridge.log

# Count requests by type
awk '{print $1}' .bridge.log | sort | uniq -c
```

## API Reference

### POST /feedback

Submit user feedback for a package.

**Request:**
```bash
curl -X POST http://localhost:8890/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "packageName": "vim",
    "feedback": "Great text editor!",
    "context": {
      "category": "work",
      "userLevel": "advanced"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "sentiment": "positive",
    "topics": ["text-editing", "productivity"],
    "recommendation": "Users who like vim might also enjoy neovim or emacs"
  }
}
```

### POST /search

Natural language package search.

**Request:**
```bash
curl -X POST http://localhost:8890/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I need a tool for editing photos",
    "limit": 5
  }'
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "package": "gimp",
      "relevance": 0.95,
      "reason": "Professional photo editing tool"
    },
    {
      "package": "krita",
      "relevance": 0.85,
      "reason": "Digital painting and photo manipulation"
    }
  ]
}
```

### POST /recommend

Get personalized package recommendations.

**Request:**
```bash
curl -X POST http://localhost:8890/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "installedPackages": ["vim", "git", "tmux"],
    "categories": ["work", "create"],
    "limit": 3
  }'
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "package": "neovim",
      "score": 0.92,
      "reason": "Modern vim alternative with Lua scripting"
    },
    {
      "package": "lazygit",
      "score": 0.88,
      "reason": "Terminal UI for git commands"
    }
  ]
}
```

### GET /health

Health check endpoint.

**Request:**
```bash
curl http://localhost:8890/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "model": "gemma:2b",
  "ollama": {
    "connected": true,
    "version": "0.1.17"
  },
  "stats": {
    "totalRequests": 1234,
    "avgResponseTime": 2.5,
    "errorRate": 0.02
  }
}
```

## Performance Tuning

### Model Selection

```bash
# Fast, lightweight (recommended for most users)
ollama pull gemma:2b

# Better quality, slower
ollama pull gemma:7b

# Smallest, fastest
ollama pull gemma:2b-instruct-q4_0
```

### Resource Allocation

#### CPU Only

```javascript
// config.js
const config = {
  luminousBridge: {
    workers: 1,              // Single worker for CPU
    maxConcurrent: 2,        // Max concurrent requests
    timeout: 60000           // Longer timeout for CPU
  }
};
```

#### GPU Acceleration

```bash
# Check GPU availability
nvidia-smi

# Ollama will auto-detect and use GPU
# No configuration needed
```

#### Memory Optimization

```bash
# Set Ollama environment
export OLLAMA_NUM_PARALLEL=2
export OLLAMA_MAX_LOADED_MODELS=1

# Restart Ollama
systemctl restart ollama
```

### Caching

```javascript
// Implement response caching
const cache = new Map();

function getCachedResponse(query) {
  const cacheKey = hash(query);
  if (cache.has(cacheKey)) {
    const { response, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < 3600000) { // 1 hour TTL
      return response;
    }
  }
  return null;
}
```

### Load Balancing

For high-traffic deployments:

```
┌──────────────┐
│ Load Balancer│
└──────┬───────┘
       │
       ├─────────────┬─────────────┐
       │             │             │
   ┌───▼───┐     ┌───▼───┐     ┌───▼───┐
   │Bridge1│     │Bridge2│     │Bridge3│
   └───┬───┘     └───┬───┘     └───┬───┘
       │             │             │
       └─────────────┼─────────────┘
                     │
               ┌─────▼──────┐
               │  Ollama    │
               │  (Shared)  │
               └────────────┘
```

## Troubleshooting

### Common Issues

#### Issue: Bridge Won't Start

**Symptoms:**
```
Error: listen EADDRINUSE :::8890
```

**Solutions:**
```bash
# Find process using port
lsof -i :8890

# Kill process
kill -9 $(lsof -ti:8890)

# Or change port in config.js
```

#### Issue: Ollama Not Responding

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:11434
```

**Solutions:**
```bash
# Check Ollama status
systemctl status ollama

# Start Ollama
ollama serve

# Or
systemctl start ollama

# Test Ollama
curl http://localhost:11434
```

#### Issue: Model Not Found

**Symptoms:**
```
Error: model 'gemma:2b' not found
```

**Solutions:**
```bash
# List available models
ollama list

# Pull missing model
ollama pull gemma:2b

# Verify
ollama list | grep gemma
```

#### Issue: Slow Responses

**Symptoms:**
- AI responses take >30 seconds
- Timeout errors

**Solutions:**

1. **Use smaller model:**
   ```bash
   ollama pull gemma:2b  # Instead of 7b
   ```

2. **Enable GPU acceleration:**
   ```bash
   nvidia-smi  # Verify GPU
   # Ollama auto-uses GPU
   ```

3. **Increase timeout:**
   ```javascript
   config.luminousBridge.timeout = 60000;  // 60s
   ```

4. **Check system resources:**
   ```bash
   free -h  # Check available memory
   top      # Check CPU usage
   ```

#### Issue: Out of Memory

**Symptoms:**
```
JavaScript heap out of memory
FATAL ERROR: Reached heap limit
```

**Solutions:**

1. **Increase Node.js heap:**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   node nixite-luminous-bridge.js
   ```

2. **Use smaller model:**
   ```bash
   ollama pull gemma:2b  # ~2GB RAM
   # Instead of gemma:7b  # ~6GB RAM
   ```

3. **Limit concurrent requests:**
   ```javascript
   config.luminousBridge.maxConcurrent = 1;
   ```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* node nixite-luminous-bridge.js

# Or specific modules
DEBUG=express:*,ollama:* node nixite-luminous-bridge.js

# Save to log file
DEBUG=* node nixite-luminous-bridge.js 2>&1 | tee debug.log
```

### Health Check Script

```bash
#!/bin/bash
# health-check.sh

# Check if bridge is running
if ! curl -f http://localhost:8890/health &>/dev/null; then
  echo "ERROR: AI Bridge is not responding"
  exit 1
fi

# Check if Ollama is running
if ! curl -f http://localhost:11434 &>/dev/null; then
  echo "ERROR: Ollama is not responding"
  exit 1
fi

# Check model is loaded
if ! ollama list | grep -q "gemma:2b"; then
  echo "ERROR: Gemma model not found"
  exit 1
fi

echo "All checks passed!"
exit 0
```

## Security

### Network Security

```javascript
// Bind to localhost only (not 0.0.0.0)
const config = {
  luminousBridge: {
    host: '127.0.0.1',  // Not accessible from outside
    port: 8890
  }
};
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // Max 100 requests per window
  message: 'Too many requests'
});

app.use('/api/bridge', limiter);
```

### Input Validation

```javascript
function validateFeedback(req, res, next) {
  const { packageName, feedback } = req.body;

  if (!packageName || typeof packageName !== 'string') {
    return res.status(400).json({ error: 'Invalid packageName' });
  }

  if (!feedback || feedback.length > 1000) {
    return res.status(400).json({ error: 'Invalid feedback length' });
  }

  next();
}

app.post('/feedback', validateFeedback, handleFeedback);
```

### Sanitization

```javascript
const DOMPurify = require('isomorphic-dompurify');

function sanitizeInput(input) {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}
```

## Advanced Topics

### Custom Models

```bash
# Use different model
ollama pull llama2:7b

# Update config
config.luminousBridge.model = 'llama2:7b';
```

### Fine-Tuning

```bash
# Create Modelfile
cat > Modelfile <<EOF
FROM gemma:2b
PARAMETER temperature 0.8
PARAMETER top_p 0.9
SYSTEM "You are a NixOS package expert assistant."
EOF

# Build custom model
ollama create nixite-expert -f Modelfile

# Use in config
config.luminousBridge.model = 'nixite-expert';
```

### Multi-Model Support

```javascript
const models = {
  fast: 'gemma:2b',
  quality: 'gemma:7b',
  custom: 'nixite-expert'
};

function selectModel(requestType) {
  switch(requestType) {
    case 'search': return models.fast;
    case 'recommend': return models.quality;
    default: return models.fast;
  }
}
```

### Streaming Responses

```javascript
app.post('/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await ollama.generate({
    model: 'gemma:2b',
    prompt: req.body.prompt,
    stream: true
  });

  for await (const chunk of stream) {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  }

  res.end();
});
```

## See Also

- [Ollama Documentation](https://ollama.ai/docs)
- [Gemma Model Card](https://ai.google.dev/gemma)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Configuration Reference](../config.js)

---

**Last Updated:** 2024-01-15
**Version:** 2.1.0+
