# Nixite AI Bridge API Documentation

API reference for the Luminous-Nixite AI Bridge.

## Overview

The AI Bridge provides intelligent package search and recommendations using HRM + Gemma architecture.

**Base URL**: `http://localhost:8890`

## Endpoints

### Health Check

Check if the bridge is running.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "service": "nixite-luminous-bridge",
  "ai_backend": "HRM + EmbeddingGemma",
  "accuracy": "98% NixOS, 95% general"
}
```

**Example**:
```bash
curl http://localhost:8890/health
```

---

### Intent Recognition

Recognize user intent from natural language.

**Endpoint**: `POST /intent`

**Request Body**:
```json
{
  "query": "I need a web browser"
}
```

**Response**:
```json
{
  "intent": "install",
  "confidence": 0.92,
  "package": "firefox",
  "entities": {
    "package": "firefox",
    "category": "browsers"
  },
  "method": "HRM + EmbeddingGemma"
}
```

**Example**:
```bash
curl -X POST http://localhost:8890/intent \
  -H "Content-Type: application/json" \
  -d '{"query": "I need a web browser"}'
```

**Fields**:
- `intent`: Detected intent (`install`, `search`, `remove`, `list`, `update`)
- `confidence`: Confidence score (0.0 - 1.0)
- `package`: Recommended package name
- `entities`: Extracted entities
- `method`: Recognition method used

---

### Package Search

Search for packages semantically.

**Endpoint**: `POST /search`

**Request Body**:
```json
{
  "query": "photo editing"
}
```

**Response**:
```json
{
  "packages": [
    {
      "name": "gimp",
      "category": "graphics",
      "score": 95,
      "recommendation": "Photoshop alternative"
    },
    {
      "name": "krita",
      "category": "graphics",
      "score": 88,
      "recommendation": "Digital painting"
    }
  ]
}
```

**Example**:
```bash
curl -X POST http://localhost:8890/search \
  -H "Content-Type: application/json" \
  -d '{"query": "photo editing"}'
```

---

### Package Installation

Install a package with AI assistance.

**Endpoint**: `POST /install`

**Request Body**:
```json
{
  "package": "firefox",
  "options": {
    "user_profile": "general",
    "prefer_gui": true,
    "smart_dependencies": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "package": "firefox",
  "duration": 2340,
  "installedAs": "firefox-120.0",
  "method": "direct",
  "intent": {
    "intent": "install",
    "confidence": 0.95
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:8890/install \
  -H "Content-Type: application/json" \
  -d '{
    "package": "firefox",
    "options": {
      "user_profile": "general",
      "prefer_gui": true
    }
  }'
```

---

### Recommendations

Get personalized package recommendations.

**Endpoint**: `GET /recommendations?profile=developer`

**Query Parameters**:
- `profile`: User profile (`developer`, `creative`, `office`, `gamer`, `student`)

**Response**:
```json
{
  "recommendations": [
    "vscode",
    "git",
    "nodejs",
    "docker",
    "neovim"
  ]
}
```

**Example**:
```bash
curl http://localhost:8890/recommendations?profile=developer
```

## Authentication

Currently, the API does not require authentication. For production use, implement authentication via reverse proxy or API gateway.

## Rate Limiting

No rate limiting currently implemented. For production:
- Implement rate limiting
- Use API keys
- Monitor usage

## Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Errors

**500 Internal Server Error**:
```json
{
  "error": "Failed to process intent"
}
```

**404 Not Found**:
```json
{
  "error": "Not found"
}
```

## Integration Examples

### JavaScript/Node.js

```javascript
async function searchPackages(query) {
  const response = await fetch('http://localhost:8890/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  const result = await response.json();
  return result.packages;
}

const packages = await searchPackages('text editor');
console.log(packages);
```

### Python

```python
import requests

def get_intent(query):
    response = requests.post(
        'http://localhost:8890/intent',
        json={'query': query}
    )
    return response.json()

result = get_intent('install web browser')
print(f"Intent: {result['intent']}")
print(f"Package: {result['package']}")
```

### Bash/curl

```bash
#!/bin/bash

QUERY="I need a video player"

curl -s -X POST http://localhost:8890/intent \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$QUERY\"}" \
  | jq '.package'
```

## Configuration

The bridge can be configured via environment variables:

```bash
export BRIDGE_PORT=8890
export NODE_ENV=production
node nixite-luminous-bridge.js
```

## AI Models

### HRM (Hierarchical Relationship Model)
- **Accuracy**: 98% for NixOS operations
- **Purpose**: Intent recognition
- **Fallback**: Knowledge base (70% accuracy)

### Gemma Embeddings
- **Accuracy**: 95% for general queries
- **Purpose**: Semantic understanding
- **Fallback**: Pattern matching

## Performance

Typical response times:
- `/health`: <10ms
- `/intent`: 50-200ms
- `/search`: 100-300ms
- `/install`: 1-30s (depending on package)

## Security

### Best Practices

1. **Run locally**: Don't expose to internet
2. **Use reverse proxy**: For external access
3. **Implement auth**: Before production use
4. **Validate input**: Always sanitize queries
5. **Rate limit**: Prevent abuse

### CORS

CORS is enabled for all origins. For production:
```javascript
res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
```

## Troubleshooting

### Bridge Won't Start

Check:
1. Node.js installed: `node --version`
2. Port available: `lsof -i :8890`
3. Dependencies: `npm install`

### Low Accuracy

If accuracy is poor:
1. Ensure HRM backend is running
2. Check Python dependencies
3. Verify package knowledge base
4. Use fallback mode

### Connection Refused

```bash
# Check if bridge is running
curl http://localhost:8890/health

# Start bridge manually
node nixite-luminous-bridge.js
```

## Future Endpoints

Planned for v2.2:
- `POST /batch-install`: Install multiple packages
- `GET /package-info`: Get detailed package info
- `POST /feedback`: Submit feedback for ML training
- `GET /stats`: Usage statistics

## Support

- **Documentation**: This file
- **Issues**: GitHub issues
- **Examples**: See `examples/` directory

---

**API Version**: 1.0.0
**Last Updated**: 2024-11-14
**Status**: Beta
