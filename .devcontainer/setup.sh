#!/bin/bash

# Nixite Development Container Setup Script

set -e

echo "🚀 Setting up Nixite development environment..."

# Install Node dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x scripts/*.sh
chmod +x verify.sh
chmod +x tests/*.test.js

# Install Python packages (if needed)
echo "🐍 Setting up Python environment..."
pip3 install --user --upgrade pip

# Install Ollama (optional - for AI features)
if command -v ollama &> /dev/null; then
    echo "✅ Ollama already installed"
else
    echo "📥 Ollama not found. To enable AI features, install Ollama manually:"
    echo "   curl -fsSL https://ollama.com/install.sh | sh"
fi

# Install jq for JSON processing
echo "🔧 Installing additional tools..."
sudo apt-get update -qq
sudo apt-get install -y jq curl

# Configure git
echo "📝 Configuring git..."
git config --global core.hooksPath .githooks

# Run initial health check
echo "🏥 Running health check..."
if [ -f "./scripts/health-check.sh" ]; then
    ./scripts/health-check.sh || echo "⚠️  Some health checks failed (this is normal for first setup)"
fi

# Display welcome message
cat << 'EOF'

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ✨ Nixite Development Environment Ready!                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

🎯 Quick Start:
   ./scripts/dev.sh start     # Start development servers
   npm test                    # Run tests
   ./scripts/health-check.sh   # Check system health
   ./scripts/stats.sh          # View project statistics

📚 Documentation:
   docs/CHEATSHEET.md          # Developer cheatsheet
   docs/GETTING_STARTED.md     # Getting started guide
   .vscode/README.md           # VS Code setup guide

🔗 Services (after starting):
   http://localhost:8000       # Web interface
   http://localhost:8890       # AI Bridge
   http://localhost:11434      # Ollama (if installed)

Happy coding! 💜

EOF
