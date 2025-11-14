# Nixite Configuration Examples

Example configurations for different use cases.

## Available Examples

### Developer Configuration
**File**: `developer-config.js`

Optimized for development:
- All features enabled
- Verbose logging
- Longer timeouts for debugging
- Fast animations

**Usage**:
```bash
cp examples/developer-config.js config.js
```

### Production Configuration
**File**: `production-config.js`

Optimized for production:
- Stable features only
- Minimal logging
- Standard timeouts
- Environment variable support

**Usage**:
```bash
cp examples/production-config.js config.js
# Set environment variables:
export NIXITE_API_BASE=https://api.yourserver.com
export NIXITE_BRIDGE=https://bridge.yourserver.com
```

### NixOS Configuration Examples
**File**: `nixos-configurations/`

Various NixOS module configurations:
- Home server setup
- Production server
- Development machine
- Multi-instance setup

## Creating Custom Configurations

### Basic Template

```javascript
const NIXITE_CONFIG = {
    api: {
        base: 'http://localhost:8888/api',
        installer: 'http://localhost:8889',
        luminousBridge: 'http://localhost:8890'
    },

    features: {
        voiceInput: true,
        aiFeedback: true,
        installManager: true,
        luminousBridge: true
    },

    network: {
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        healthCheckTimeout: 500
    },

    ai: {
        confidenceThreshold: 0.6,
        fallbackMode: 'knowledge-base',
        enableHRM: true,
        enableGemma: true
    },

    ui: {
        toastDuration: 3000,
        animationSpeed: 'normal',
        theme: 'auto'
    },

    development: {
        enabled: false,
        verboseLogging: false,
        mockBackend: false
    }
};
```

### Configuration Options

#### API Endpoints
- `api.base`: Main API endpoint
- `api.installer`: Package installer service
- `api.luminousBridge`: AI bridge service

#### Features
- `voiceInput`: Enable voice control
- `aiFeedback`: Show AI processing feedback
- `installManager`: Enable installation features
- `luminousBridge`: Use AI-powered recommendations

#### Network
- `timeout`: Request timeout (ms)
- `retryAttempts`: Number of retry attempts
- `retryDelay`: Delay between retries (ms)
- `healthCheckTimeout`: Health check timeout (ms)

#### AI
- `confidenceThreshold`: Minimum confidence (0-1)
- `fallbackMode`: Fallback when AI unavailable
- `enableHRM`: Use HRM model
- `enableGemma`: Use Gemma embeddings

#### UI
- `toastDuration`: Notification duration (ms)
- `animationSpeed`: 'fast', 'normal', or 'slow'
- `theme`: 'light', 'dark', or 'auto'

#### Development
- `enabled`: Enable development mode
- `verboseLogging`: Detailed console logs
- `mockBackend`: Use mock data (testing)

## Environment Variables

Use environment variables in production:

```javascript
api: {
    base: process.env.NIXITE_API_BASE || 'http://localhost:8888/api',
    // ...
}
```

Set in your deployment:
```bash
export NIXITE_API_BASE=https://api.example.com
export NIXITE_BRIDGE=https://bridge.example.com
```

## Best Practices

### Development
- Enable all features
- Use verbose logging
- Longer timeouts
- Fast animations

### Production
- Disable unstable features
- Minimal logging
- Standard timeouts
- Use environment variables

### Security
- Never commit sensitive data
- Use environment variables for secrets
- Validate all configuration values
- Use HTTPS in production

## Troubleshooting

### Configuration Not Loading
- Check file location (must be `config.js`)
- Verify JavaScript syntax
- Check browser console for errors

### Features Not Working
- Verify feature flags are enabled
- Check browser compatibility
- Ensure services are running

### Performance Issues
- Reduce timeout values
- Disable unnecessary features
- Adjust animation speed

## More Examples

See also:
- [docs/deployment/](../docs/deployment/) for deployment configs
- [nix/](../nix/) for NixOS configurations
- [CONTRIBUTING.md](../CONTRIBUTING.md) for development setup

---

**Need help?** Check [FAQ](../docs/FAQ.md) or open an issue.
