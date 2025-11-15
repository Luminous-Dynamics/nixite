# Nixite Quick Start Guide

Get Nixite up and running in 5 minutes! 🚀

## ⚡ TL;DR

```bash
# Clone the repository
git clone https://github.com/Luminous-Dynamics/nixite.git
cd nixite

# Start the web interface
python3 -m http.server 8000

# Open your browser
open http://localhost:8000

# (Optional) Start AI Bridge
node nixite-luminous-bridge.js
```

That's it! Nixite is now running. 🎉

## 📋 Prerequisites

**Required:**
- Python 3.x (for web server)
- Modern web browser (Chrome, Firefox, Safari, Edge)

**Optional (for AI features):**
- Node.js 14+ (for AI Bridge)
- [Ollama](https://ollama.ai) with gemma model (for AI recommendations)

## 🚀 Step-by-Step Guide

### Step 1: Get Nixite

**Option A: Download Release**
```bash
# Download latest release
wget https://github.com/Luminous-Dynamics/nixite/archive/refs/tags/v2.1.0.zip
unzip v2.1.0.zip
cd nixite-2.1.0
```

**Option B: Clone Repository**
```bash
git clone https://github.com/Luminous-Dynamics/nixite.git
cd nixite
```

### Step 2: Start the Web Interface

```bash
# Using Python (works everywhere)
python3 -m http.server 8000

# OR using npm
npm run serve
```

You should see:
```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

### Step 3: Open Nixite

Open your browser and navigate to:
```
http://localhost:8000
```

You should see the Nixite interface with beautiful package categories!

### Step 4: Explore Packages (No Setup Required!)

- Click on any category (Create, Connect, Grow, Work, Play, Secure, Manage, Serve)
- Browse packages with beautiful cards
- Search for packages using the search bar
- Click on package cards to see details
- Use tag filters to narrow down results

**That's all you need for basic usage!** 🎉

## 🤖 Step 5: Enable AI Features (Optional)

For AI-powered recommendations and natural language search:

### Install Ollama

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**macOS:**
```bash
brew install ollama
```

**Start Ollama:**
```bash
ollama serve
```

### Download AI Model

```bash
# Download Gemma model (recommended, ~5GB)
ollama pull gemma:2b

# OR use a smaller model
ollama pull tinyllama
```

### Start AI Bridge

In a new terminal:
```bash
cd nixite
node nixite-luminous-bridge.js
```

You should see:
```
🌟 Nixite AI Bridge v2.1.0
🚀 Server running on http://localhost:8890
🧠 Ollama connection: http://localhost:11434
✨ AI features ready!
```

### Test AI Features

Refresh your browser and try:
- Natural language search: "I want to edit videos"
- Package recommendations: Click "Get AI Recommendations" on any package
- Smart filtering: Ask for "secure communication tools"

## 🎯 Quick Usage Examples

### Find Packages

**Browse by Category:**
1. Click on a category card (e.g., "Create")
2. See all packages in that category
3. Use filters to narrow down

**Search:**
1. Type in the search box: "firefox"
2. Press Enter or click Search
3. See matching packages instantly

**AI Search (if enabled):**
1. Type natural language: "I need a video editor"
2. Get AI-powered results
3. See relevance scores

### Install Packages (NixOS)

When you find a package you want:

**Method 1: configuration.nix**
```nix
environment.systemPackages = with pkgs; [
  firefox
  vlc
  libreoffice
];
```

**Method 2: nix-env**
```bash
nix-env -iA nixpkgs.firefox
```

**Method 3: nix-shell (temporary)**
```bash
nix-shell -p firefox
```

Then rebuild:
```bash
sudo nixos-rebuild switch
```

## 🔧 Common Tasks

### Check Server Status

```bash
# Check if web server is running
curl http://localhost:8000/health

# Check if AI Bridge is running (if you enabled it)
curl http://localhost:8890/health
```

### Stop Servers

```bash
# Stop web server: Ctrl+C in the terminal

# Stop AI Bridge: Ctrl+C in its terminal

# Stop Ollama
pkill ollama
```

### Restart Services

```bash
# Restart web server
python3 -m http.server 8000

# Restart AI Bridge
node nixite-luminous-bridge.js

# Restart Ollama
ollama serve
```

### Update Nixite

```bash
cd nixite
git pull
# No build step needed! Just refresh your browser
```

## 🐛 Troubleshooting

### Port Already in Use

**Error:** `OSError: [Errno 98] Address already in use`

**Solution:** Use a different port
```bash
python3 -m http.server 8001
# Then visit http://localhost:8001
```

### Cannot Connect to Ollama

**Error:** AI Bridge shows "Ollama connection failed"

**Solutions:**
1. Make sure Ollama is running: `ollama serve`
2. Check Ollama is accessible: `curl http://localhost:11434`
3. Restart Ollama if needed

### Packages Not Loading

**Error:** Empty package list or JSON error

**Solutions:**
1. Check `nixite-packages.json` exists
2. Validate JSON: `python3 -m json.tool nixite-packages.json`
3. Clear browser cache and refresh

### AI Features Not Working

**Checklist:**
- [ ] Ollama is running (`ollama serve`)
- [ ] Model is downloaded (`ollama list`)
- [ ] AI Bridge is running on port 8890
- [ ] Check AI Bridge logs for errors
- [ ] Try restarting all services

## 📚 Next Steps

Now that you have Nixite running, check out:

1. **[README.md](../README.md)** - Full feature overview
2. **[INSTALL.md](INSTALL.md)** - Advanced installation options
3. **[AI_BRIDGE.md](AI_BRIDGE.md)** - Deep dive into AI features
4. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Detailed problem solving
5. **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Help improve Nixite!

## 🎓 Learning Resources

**New to NixOS?**
- [NixOS Manual](https://nixos.org/manual/nixos/stable/)
- [Nix Pills](https://nixos.org/guides/nix-pills/)
- [NixOS Wiki](https://nixos.wiki/)

**Want to Contribute?**
- [Development Guide](DEVELOPMENT.md)
- [Testing Guide](TESTING.md)
- [Architecture Overview](ARCHITECTURE.md)

## 💡 Tips

**Performance Tips:**
- AI Bridge uses ~2GB RAM with gemma:2b model
- Use `tinyllama` for lower memory usage (~1GB)
- Web interface is static - no server resources needed
- Package search is instant (client-side filtering)

**Productivity Tips:**
- Bookmark frequently used categories
- Use browser search (Ctrl+F) for quick package finding
- Try AI search for discovering new packages
- Use tag filters for precise results

**Customization Tips:**
- Edit `nixite-packages.json` to add your own packages
- Modify `config.js` for custom settings
- Theme can be customized in `nixite-luminous.css`

## 🤝 Getting Help

**Found a bug?**
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) first
- Search [GitHub Issues](https://github.com/Luminous-Dynamics/nixite/issues)
- Create a new issue with details

**Have a question?**
- Check [Documentation Index](INDEX.md)
- Ask in GitHub Discussions
- Read the [FAQ](TROUBLESHOOTING.md#faq)

**Want to chat?**
- Join our community (links in README)
- Follow development progress
- Share your Nixite setup!

## ✅ Quick Reference

**Essential Commands:**
```bash
# Start web interface
python3 -m http.server 8000

# Start AI Bridge
node nixite-luminous-bridge.js

# Start Ollama
ollama serve

# Download AI model
ollama pull gemma:2b

# Check health
curl http://localhost:8000/health
curl http://localhost:8890/health

# Update Nixite
git pull

# Run tests
npm test
```

**Essential URLs:**
- Web Interface: http://localhost:8000
- AI Bridge: http://localhost:8890
- Ollama: http://localhost:11434

**Essential Files:**
- Package Data: `nixite-packages.json`
- Configuration: `config.js`
- Web UI: `index.html`
- AI Bridge: `nixite-luminous-bridge.js`

---

**🎉 Congratulations!** You're now running Nixite. Start exploring beautiful NixOS packages!

**Estimated setup time:** 2-5 minutes (basic) | 10-15 minutes (with AI)

**Next:** Try searching for packages or explore the AI features!
