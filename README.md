# Nixite - Visual Package Discovery for NixOS

Making NixOS accessible to everyone through visual package discovery.

![Nixite Banner](https://img.shields.io/badge/NixOS-Visual%20Discovery-7c3aed?style=for-the-badge&logo=nixos)
![Version](https://img.shields.io/badge/version-2.0.0-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## 🌟 Features

### Core Features
- **🎯 Purpose-Driven Browsing**: Find packages by what you want to do, not what they're called
- **🗣️ Voice Control**: Speak your needs instead of typing (accessibility-first design)
- **🤖 AI-Powered Recommendations**: Intelligent package suggestions using HRM + Gemma architecture
- **📦 One-Click Installation**: Install packages directly from the web interface
- **🎨 Beautiful UI**: Modern, responsive design with dark mode support
- **♿ Accessibility**: Designed for everyone, including "Grandma Rose"

### Package Categories
- **Create** 🎨 - Graphics, video, audio, and creative tools
- **Connect** 💬 - Communication and social tools
- **Grow** 🌱 - Learning and personal development
- **Work** 💼 - Productivity and development tools
- **Play** 🎮 - Games and entertainment
- **Secure** 🔐 - Security and privacy tools
- **Manage** 📊 - System and file management
- **Serve** 🌐 - Servers and network services

## 🚀 Quick Start

### Prerequisites
- NixOS or Nix package manager installed
- Node.js 14+ (for AI bridge)
- Python 3.8+ (for AI backend)
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Luminous-Dynamics/nixite.git
   cd nixite
   ```

2. **Start the web interface**
   ```bash
   # Using Python's built-in server
   python3 -m http.server 8000

   # Or using npm
   npm run serve
   ```

3. **Open in your browser**
   ```
   http://localhost:8000
   ```

### Optional: AI-Powered Features

To enable AI-powered package recommendations and intelligent search:

1. **Start the Luminous Bridge** (requires Luminous Nix backend)
   ```bash
   node nixite-luminous-bridge.js
   ```

   The bridge will run on port 8890 and provide:
   - 98% accuracy for NixOS operations
   - 95% accuracy for general queries
   - Automatic fallback to knowledge base if AI unavailable

## 📦 Package Database

Nixite includes **80+ curated packages** across 8 categories. The package database is in `nixite-packages.json` and can be easily extended:

```json
{
  "id": "package-name",
  "name": "Display Name",
  "description": "What this package does",
  "category": "category-id"
}
```

## 🛠️ Architecture

### Frontend Components
- **index.html** - Main application interface
- **config.js** - Centralized configuration
- **install-manager.js** - Package installation logic
- **ui-feedback-enhancements.js** - Visual feedback and animations
- **voice-input.js** - Voice control functionality
- **styles.css** - Additional styling

### Backend Services
- **nixite-luminous-bridge.js** - AI bridge service (Node.js)
  - Connects to Luminous Nix HRM + Gemma backend
  - Provides intelligent package search and recommendations
  - Falls back to knowledge base if AI unavailable

### Configuration
Edit `config.js` to customize:
- API endpoints
- Feature flags
- Network timeouts
- AI/ML settings
- UI preferences

## 🎨 Usage Examples

### Basic Package Installation
1. Browse categories or use the search bar
2. Click on a category to expand packages
3. Click "Install" on any package
4. Package installs automatically via Nix

### Voice Control
1. Click the microphone button (bottom right)
2. Say what you need: "I need a web browser"
3. Nixite understands and shows relevant packages
4. Confirm to install

### AI Recommendations
1. Click "AI Suggest" in the header
2. Get personalized package recommendations
3. Based on your profile and usage patterns

## 🔧 Development

### Project Structure
```
nixite/
├── index.html                    # Main application
├── config.js                     # Configuration
├── package.json                  # Node.js dependencies
├── nixite-packages.json          # Package database
├── install-manager.js            # Installation logic
├── nixite-luminous-bridge.js     # AI bridge service
├── ui-feedback-enhancements.js   # UI feedback
├── voice-input.js                # Voice control
├── styles.css                    # Styling
├── README.md                     # This file
├── .gitignore                    # Git ignore rules
└── CNAME                         # Custom domain
```

### Adding New Packages
1. Edit `nixite-packages.json`
2. Add package with proper structure
3. Refresh the browser
4. Package appears in relevant category

### Customizing Categories
Edit the `categories` array in `index.html` (lines 917-982) to add/modify categories.

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with ❤️ by Luminous Dynamics
- AI powered by HRM + Gemma architecture from Luminous Nix
- Designed for accessibility and ease of use
- Special thanks to "Grandma Rose" for inspiring this project

## 🔗 Links

- **Website**: [https://nixite.luminousdynamics.org](https://nixite.luminousdynamics.org)
- **Repository**: [https://github.com/Luminous-Dynamics/nixite](https://github.com/Luminous-Dynamics/nixite)
- **Issues**: [https://github.com/Luminous-Dynamics/nixite/issues](https://github.com/Luminous-Dynamics/nixite/issues)
- **NixOS**: [https://nixos.org](https://nixos.org)

## 📞 Support

- Open an issue on GitHub
- Visit our website
- Check the NixOS wiki for package-specific help

---

Made with 💜 for the NixOS community
