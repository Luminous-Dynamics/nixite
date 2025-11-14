# Nixite Architecture

Comprehensive overview of Nixite's architecture, design decisions, and system components.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Core Components](#core-components)
4. [Data Flow](#data-flow)
5. [AI Pipeline](#ai-pipeline)
6. [Security Architecture](#security-architecture)
7. [Deployment Models](#deployment-models)
8. [Design Decisions](#design-decisions)
9. [Future Architecture](#future-architecture)

## System Overview

Nixite is a visual package discovery system for NixOS with AI-powered recommendations. The architecture follows a modular, service-oriented design with clear separation of concerns.

### Key Characteristics

- **Client-Side First**: Primary logic runs in the browser
- **Optional AI Backend**: AI features are optional enhancements
- **Zero Dependencies**: Core functionality works with just HTML/CSS/JS
- **Progressive Enhancement**: Features degrade gracefully
- **Service-Oriented**: Each component can run independently

### Technology Stack

```
Frontend:
├── HTML5 (Semantic, Accessible)
├── CSS3 (Variables, Grid, Flexbox)
└── JavaScript (ES6+, Modules)

Backend (Optional):
├── Node.js (AI Bridge)
├── Python (Web Server, ML)
└── NixOS (Package Management)

Infrastructure:
├── Docker (Containerization)
├── systemd (Service Management)
├── GitHub Actions (CI/CD)
└── Nix (NixOS Integration)
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  index.html (Main UI)                      │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │   Search    │  │  Categories  │  │  Voice Input    │  │  │
│  │  │   Filter    │  │  Grid View   │  │  (Optional)     │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│         │                    │                     │             │
│         ▼                    ▼                     ▼             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │  config.js   │    │  packages    │    │ ui-feedback  │     │
│  │  (Settings)  │    │  loader      │    │ enhancements │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
└─────────────────────────────────────────────────────────────────┘
         │                    │                     │
         ▼                    ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Static File Server                          │
│                   (Python, nginx, caddy)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  nixite-packages.json  │  config.js  │  *.js modules      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Nixite AI Bridge│  │  Install Manager │  │   Voice Input    │
│  (Optional)      │  │  (Optional)      │  │   (Optional)     │
│  Port: 8890      │  │  Port: 8889      │  │   Browser API    │
├──────────────────┤  ├──────────────────┤  └──────────────────┘
│ - Intent Recog.  │  │ - Package Install│
│ - Semantic Search│  │ - Dependency Mgmt│
│ - Recommendations│  │ - Progress Track │
│                  │  │                  │
│  ┌────────────┐  │  │  ┌────────────┐ │
│  │    HRM     │  │  │  │  nix-env   │ │
│  │  (98% acc) │  │  │  │  commands  │ │
│  └────────────┘  │  │  └────────────┘ │
│  ┌────────────┐  │  │                  │
│  │   Gemma    │  │  │                  │
│  │ Embeddings │  │  │                  │
│  └────────────┘  │  │                  │
└──────────────────┘  └──────────────────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────────┐
│         NixOS Package Manager           │
│  ┌───────────────────────────────────┐  │
│  │   nix-env -iA nixos.firefox       │  │
│  │   nix-shell                        │  │
│  │   nixos-rebuild switch             │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Core Components

### 1. Frontend Application (index.html)

**Purpose**: Main user interface and application logic

**Responsibilities**:
- Render package catalog with categories
- Handle user interactions (search, filter, clicks)
- Manage application state
- Display feedback and notifications
- Load configuration and packages

**Key Features**:
- Pure HTML/CSS/JS (no framework dependencies)
- Responsive design (mobile-first)
- Accessibility features (ARIA labels)
- Progressive enhancement
- Dark mode support

**Code Location**: `index.html` (lines 1-1500+)

### 2. Configuration System (config.js)

**Purpose**: Centralized configuration management

**Structure**:
```javascript
{
  api: {
    base: string,
    installer: string,
    luminousBridge: string
  },
  features: {
    voiceInput: boolean,
    aiFeedback: boolean,
    installManager: boolean,
    luminousBridge: boolean
  },
  network: {
    timeout: number,
    retryAttempts: number,
    retryDelay: number
  },
  ai: {
    confidenceThreshold: number,
    fallbackMode: string,
    enableHRM: boolean,
    enableGemma: boolean
  },
  ui: {
    toastDuration: number,
    animationSpeed: string,
    theme: string
  },
  development: {
    enabled: boolean,
    verboseLogging: boolean,
    mockBackend: boolean
  }
}
```

**Design Pattern**: Singleton configuration object

### 3. Package Database (nixite-packages.json)

**Purpose**: Package metadata and categorization

**Schema**:
```json
{
  "packages": [
    {
      "id": "string",        // Unique identifier (matches Nix package name)
      "name": "string",       // Display name
      "description": "string",// Short description
      "category": "string"    // One of 8 categories
    }
  ]
}
```

**Categories**:
- `create`: Creative tools (GIMP, Blender, Krita)
- `connect`: Communication (Firefox, Thunderbird)
- `grow`: Personal development (Anki, Calibre)
- `work`: Productivity (LibreOffice, VSCode)
- `play`: Entertainment (VLC, Steam)
- `secure`: Security (KeePassXC, Tor)
- `manage`: System management (Stacer, GParted)
- `serve`: Server applications (Docker, PostgreSQL)

**Size**: 80+ curated packages

### 4. AI Bridge (nixite-luminous-bridge.js)

**Purpose**: AI-powered intent recognition and package recommendations

**Architecture**:
```
Request → Intent Recognition → Package Mapping → Response
              ↓
          HRM Model (98% accuracy for NixOS)
              ↓
       Gemma Embeddings (95% for general queries)
              ↓
       Knowledge Base Fallback (70%)
```

**Endpoints**:
- `GET /health` - Health check
- `POST /intent` - Intent recognition
- `POST /search` - Semantic package search
- `POST /install` - AI-assisted installation
- `GET /recommendations` - Personalized recommendations

**AI Models**:

1. **HRM (Hierarchical Relationship Model)**
   - Purpose: Intent classification
   - Accuracy: 98% for NixOS operations
   - Latency: 50-200ms
   - Intents: install, search, remove, list, update

2. **Gemma Embeddings**
   - Purpose: Semantic understanding
   - Accuracy: 95% for general queries
   - Model: EmbeddingGemma
   - Use case: Natural language package search

3. **Knowledge Base Fallback**
   - Purpose: Backup when AI unavailable
   - Accuracy: 70%
   - Method: Pattern matching + keyword extraction

### 5. Install Manager (install-manager.js)

**Purpose**: Package installation with progress tracking

**Features**:
- Asynchronous installation
- Progress tracking
- Dependency resolution
- Error handling
- Cancellation support

**Flow**:
```
User clicks "Install"
  → Check if already installed
  → Verify dependencies
  → Execute nix-env command
  → Track progress
  → Update UI
  → Show completion
```

### 6. UI Feedback Enhancements (ui-feedback-enhancements.js)

**Purpose**: Enhanced user feedback and animations

**Features**:
- Toast notifications
- Loading spinners
- Progress bars
- Success/error states
- Smooth transitions

### 7. Voice Input (voice-input.js)

**Purpose**: Voice-controlled package search

**Technology**: Web Speech API (Browser-native)

**Flow**:
```
User clicks microphone
  → Request microphone permission
  → Start speech recognition
  → Transcribe speech to text
  → Send to AI Bridge (if enabled)
  → Extract intent and package
  → Execute action
```

**Browser Support**: Chrome, Edge, Safari (limited on Firefox)

## Data Flow

### Package Loading Flow

```
Page Load
  ↓
Load config.js
  ↓
Load nixite-packages.json
  ↓
Validate data structure
  ↓
Organize by category
  ↓
Render categories grid
  ↓
Apply search filters (if any)
  ↓
Display packages
```

### Search Flow

```
User types in search
  ↓
Debounce input (300ms)
  ↓
Filter packages by:
  - Name (case-insensitive)
  - Description (case-insensitive)
  - Category (exact match)
  ↓
Re-render filtered results
  ↓
Update UI state
```

### Installation Flow (with AI)

```
User: "I need a web browser"
  ↓
Voice Input (voice-input.js)
  ↓
AI Bridge: POST /intent
  ↓
Response: { intent: "install", package: "firefox", confidence: 0.92 }
  ↓
Install Manager: Install firefox
  ↓
Progress tracking UI
  ↓
Execute: nix-env -iA nixos.firefox
  ↓
Success notification
```

### Configuration Override Flow

```
Default config.js
  ↓
Check window.NIXITE_CONFIG
  ↓
Merge environment variables (production)
  ↓
Validate required fields
  ↓
Apply to application
```

## AI Pipeline

### Intent Recognition Pipeline

```
Natural Language Query
  ↓
┌──────────────────────────────────────┐
│  1. Preprocessing                     │
│  - Lowercase                          │
│  - Remove punctuation                 │
│  - Extract keywords                   │
└──────────────────────────────────────┘
  ↓
┌──────────────────────────────────────┐
│  2. Intent Classification (HRM)       │
│  - install (0.95)                     │
│  - search (0.03)                      │
│  - remove (0.01)                      │
│  - list (0.01)                        │
└──────────────────────────────────────┘
  ↓
┌──────────────────────────────────────┐
│  3. Entity Extraction                 │
│  - Package name                       │
│  - Category                           │
│  - Version (optional)                 │
└──────────────────────────────────────┘
  ↓
┌──────────────────────────────────────┐
│  4. Package Mapping (Gemma)           │
│  - Semantic similarity                │
│  - Package ranking                    │
│  - Confidence scoring                 │
└──────────────────────────────────────┘
  ↓
┌──────────────────────────────────────┐
│  5. Response Generation               │
│  {                                    │
│    intent: "install",                 │
│    package: "firefox",                │
│    confidence: 0.92,                  │
│    entities: {...}                    │
│  }                                    │
└──────────────────────────────────────┘
```

### Confidence Thresholds

- **High (>0.7)**: Execute automatically
- **Medium (0.5-0.7)**: Ask for confirmation
- **Low (<0.5)**: Use fallback or ask clarification

### Fallback Strategy

```
Primary: HRM + Gemma
  ↓ (if unavailable or low confidence)
Secondary: Knowledge Base
  ↓ (if unavailable)
Tertiary: Pattern Matching
  ↓ (if all fail)
Manual Search
```

## Security Architecture

### Frontend Security

1. **Content Security Policy** (planned for v2.2)
   ```html
   <meta http-equiv="Content-Security-Policy"
         content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">
   ```

2. **Input Sanitization**
   - All user input sanitized
   - No direct DOM manipulation with user data
   - XSS protection

3. **CORS Policy**
   - Currently: Allow all (development)
   - Production: Restrict to specific origins

### Backend Security

1. **Systemd Hardening**
   ```ini
   NoNewPrivileges=true
   ProtectSystem=strict
   ProtectHome=true
   PrivateTmp=true
   ReadOnlyPaths=/
   ReadWritePaths=/var/lib/nixite
   CapabilityBoundingSet=
   SystemCallFilter=@system-service
   RestrictAddressFamilies=AF_INET AF_INET6
   ```

2. **Resource Limits**
   - Memory: 512MB
   - CPU: 50%
   - File descriptors: 1024

3. **Network Isolation**
   - Firewall rules for specific ports
   - No internet access by default
   - Localhost binding

### Container Security

1. **Docker Hardening**
   ```dockerfile
   # Non-root user
   USER nixite

   # Read-only filesystem
   --read-only

   # No new privileges
   --security-opt=no-new-privileges

   # Drop capabilities
   --cap-drop=ALL
   ```

2. **Security Scanning**
   - Trivy for vulnerability scanning
   - Automated in CI/CD
   - Fail on HIGH/CRITICAL

## Deployment Models

### Model 1: Manual Deployment

```
User's Machine
├── Python HTTP Server (port 8000)
├── Node.js AI Bridge (port 8890) [optional]
└── NixOS Package Manager
```

**Use Case**: Development, personal use
**Pros**: Simple, flexible
**Cons**: Manual management

### Model 2: Docker Deployment

```
Docker Host
├── nixite-web container (port 8000)
├── nixite-bridge container (port 8890) [optional]
└── Docker network (internal)
```

**Use Case**: Production, cloud deployment
**Pros**: Isolated, reproducible
**Cons**: Requires Docker

### Model 3: NixOS Module

```
NixOS System
├── systemd service: nixite.service
├── systemd service: nixite-bridge.service [optional]
├── Firewall rules
└── Automatic updates
```

**Use Case**: NixOS users, system integration
**Pros**: Native, declarative
**Cons**: NixOS-only

### Model 4: Reverse Proxy

```
Internet
  ↓
Nginx/Caddy (HTTPS, port 443)
  ↓
┌─────────────────────────┐
│  nixite-web (8000)      │
│  nixite-bridge (8890)   │
└─────────────────────────┘
```

**Use Case**: Public deployment, SSL/TLS
**Pros**: Secure, scalable
**Cons**: More complex

## Design Decisions

### Why Client-Side First?

**Decision**: Core functionality in the browser without backend dependencies

**Rationale**:
- Lower deployment complexity
- Works offline (with cached packages)
- Faster initial load
- No server costs for basic usage
- Progressive enhancement

**Trade-offs**:
- Limited AI capabilities without backend
- No persistent user data
- Security constraints

### Why Optional AI Backend?

**Decision**: AI features are optional enhancements

**Rationale**:
- Core functionality doesn't require AI
- Reduces infrastructure requirements
- Graceful degradation
- Lower barrier to entry

**Trade-offs**:
- Inconsistent user experience
- More complex configuration

### Why Static Package Database?

**Decision**: Package list in static JSON file

**Rationale**:
- Fast loading
- No database required
- Easy to maintain
- Cacheable
- Version controlled

**Trade-offs**:
- Manual updates required
- Not real-time with nixpkgs
- Limited to curated packages

### Why Modular JavaScript?

**Decision**: Separate JS files for each feature

**Rationale**:
- Clear separation of concerns
- Optional features can be disabled
- Easier testing
- Better maintainability

**Trade-offs**:
- Multiple HTTP requests
- No bundling (yet)

### Why No Framework?

**Decision**: Vanilla HTML/CSS/JS without frameworks

**Rationale**:
- Zero dependencies
- Faster load times
- Easier to understand
- Longer lifespan (no framework churn)
- Educational value

**Trade-offs**:
- More verbose code
- Manual state management
- No framework ecosystem

## Future Architecture

### Planned for v2.2

1. **Real-time Package Updates**
   ```
   nixpkgs → Indexer → Database → API → Nixite
   ```

2. **User Accounts & Preferences**
   ```
   User → Auth → Profile → Recommendations
   ```

3. **Package Reviews & Ratings**
   ```
   Community → Reviews → Aggregation → Display
   ```

4. **WebAssembly AI Models**
   ```
   Browser → WASM Model → Local Inference
   ```

### Planned for v3.0

1. **Distributed Architecture**
   ```
   CDN → Edge Functions → Backend Services
   ```

2. **Mobile Apps**
   ```
   React Native → Shared Logic → Platform APIs
   ```

3. **Plugin System**
   ```
   Core → Plugin API → Third-party Plugins
   ```

## Performance Considerations

### Current Performance

- **Initial Load**: <2s (without AI Bridge)
- **Package Rendering**: <100ms for 80 packages
- **Search Filtering**: <50ms
- **AI Intent Recognition**: 50-200ms
- **Installation**: 1-30s (depends on package size)

### Optimization Strategies

1. **Lazy Loading**: Load AI Bridge only when needed
2. **Debouncing**: 300ms debounce on search input
3. **Virtual Scrolling**: (planned) For large package lists
4. **Code Splitting**: (planned) Bundle optimization
5. **Caching**: Browser cache for static assets

## Monitoring & Observability

### Health Checks

- Web server: HTTP 200 on `/`
- AI Bridge: `GET /health`
- Install Manager: Process status

### Logging

- Frontend: Console logs (dev mode)
- Backend: systemd journal
- Docker: Container logs

### Metrics (planned)

- Package search frequency
- Installation success rate
- AI Bridge accuracy
- Response times

---

**Architecture Version**: 2.1.0
**Last Updated**: 2024-11-14
**Maintainer**: Luminous Dynamics
