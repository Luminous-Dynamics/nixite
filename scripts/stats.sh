#!/usr/bin/env bash

# Nixite Project Statistics Dashboard
# Displays comprehensive project metrics and statistics

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
RESET='\033[0m'

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Helper function to print colored headers
print_header() {
  echo -e "\n${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "${BOLD}${WHITE}$1${RESET}"
  echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
}

print_section() {
  echo -e "${BOLD}${BLUE}▶ $1${RESET}"
}

print_metric() {
  local label="$1"
  local value="$2"
  local color="${3:-$WHITE}"
  printf "  %-30s ${color}%s${RESET}\n" "$label:" "$value"
}

# ASCII Banner
echo -e "${BOLD}${MAGENTA}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ███╗   ██╗██╗██╗  ██╗██╗████████╗███████╗                  ║
║   ████╗  ██║██║╚██╗██╔╝██║╚══██╔══╝██╔════╝                  ║
║   ██╔██╗ ██║██║ ╚███╔╝ ██║   ██║   █████╗                    ║
║   ██║╚██╗██║██║ ██╔██╗ ██║   ██║   ██╔══╝                    ║
║   ██║ ╚████║██║██╔╝ ██╗██║   ██║   ███████╗                  ║
║   ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝                  ║
║                                                               ║
║              Project Statistics Dashboard                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${RESET}"

# ============================================
# PROJECT INFO
# ============================================
print_header "📊 Project Information"

if [ -f "package.json" ]; then
  VERSION=$(grep -oP '(?<="version": ")[^"]*' package.json || echo "Unknown")
  DESCRIPTION=$(grep -oP '(?<="description": ")[^"]*' package.json || echo "N/A")
else
  VERSION="v2.1.0"
  DESCRIPTION="Visual Package Discovery for NixOS"
fi

print_metric "Project" "Nixite" "$BOLD$MAGENTA"
print_metric "Version" "$VERSION" "$GREEN"
print_metric "Description" "$DESCRIPTION" "$WHITE"
print_metric "Location" "$PROJECT_ROOT" "$CYAN"

# ============================================
# FILE STATISTICS
# ============================================
print_header "📁 File Statistics"

print_section "Total Files by Type"

# JavaScript files
JS_COUNT=$(find . -type f -name "*.js" ! -path "./node_modules/*" | wc -l)
print_metric "JavaScript (.js)" "$JS_COUNT files" "$YELLOW"

# JSON files
JSON_COUNT=$(find . -type f -name "*.json" ! -path "./node_modules/*" ! -name "package-lock.json" | wc -l)
print_metric "JSON (.json)" "$JSON_COUNT files" "$YELLOW"

# HTML files
HTML_COUNT=$(find . -type f -name "*.html" | wc -l)
print_metric "HTML (.html)" "$HTML_COUNT files" "$YELLOW"

# CSS files
CSS_COUNT=$(find . -type f -name "*.css" | wc -l)
print_metric "CSS (.css)" "$CSS_COUNT files" "$YELLOW"

# Markdown files
MD_COUNT=$(find . -type f -name "*.md" | wc -l)
print_metric "Markdown (.md)" "$MD_COUNT files" "$YELLOW"

# Shell scripts
SH_COUNT=$(find . -type f -name "*.sh" | wc -l)
print_metric "Shell Scripts (.sh)" "$SH_COUNT files" "$YELLOW"

# Nix files
NIX_COUNT=$(find . -type f -name "*.nix" | wc -l)
print_metric "Nix (.nix)" "$NIX_COUNT files" "$YELLOW"

# Docker files
DOCKER_COUNT=$(find . -type f \( -name "Dockerfile" -o -name "docker-compose.yml" \) | wc -l)
print_metric "Docker files" "$DOCKER_COUNT files" "$YELLOW"

# Configuration files
CONFIG_COUNT=$(find . -type f \( -name "*.conf" -o -name ".editorconfig" -o -name "Caddyfile" \) ! -path "./node_modules/*" | wc -l)
print_metric "Config files" "$CONFIG_COUNT files" "$YELLOW"

# Total files (excluding node_modules)
TOTAL_FILES=$(find . -type f ! -path "./node_modules/*" ! -path "./.git/*" | wc -l)
print_metric "Total Files" "$TOTAL_FILES files" "$BOLD$GREEN"

# ============================================
# CODE STATISTICS
# ============================================
print_header "💻 Code Statistics"

print_section "Lines of Code"

# JavaScript LOC
if [ "$JS_COUNT" -gt 0 ]; then
  JS_LOC=$(find . -type f -name "*.js" ! -path "./node_modules/*" -exec cat {} + | wc -l)
  print_metric "JavaScript" "$JS_LOC lines" "$YELLOW"
fi

# HTML LOC
if [ "$HTML_COUNT" -gt 0 ]; then
  HTML_LOC=$(find . -type f -name "*.html" -exec cat {} + | wc -l)
  print_metric "HTML" "$HTML_LOC lines" "$YELLOW"
fi

# CSS LOC
if [ "$CSS_COUNT" -gt 0 ]; then
  CSS_LOC=$(find . -type f -name "*.css" -exec cat {} + | wc -l)
  print_metric "CSS" "$CSS_LOC lines" "$YELLOW"
fi

# Shell scripts LOC
if [ "$SH_COUNT" -gt 0 ]; then
  SH_LOC=$(find . -type f -name "*.sh" -exec cat {} + | wc -l)
  print_metric "Shell Scripts" "$SH_LOC lines" "$YELLOW"
fi

# Nix LOC
if [ "$NIX_COUNT" -gt 0 ]; then
  NIX_LOC=$(find . -type f -name "*.nix" -exec cat {} + | wc -l)
  print_metric "Nix" "$NIX_LOC lines" "$YELLOW"
fi

# Total LOC (excluding node_modules, .git, and binary files)
TOTAL_LOC=$(find . -type f ! -path "./node_modules/*" ! -path "./.git/*" \
  \( -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.json" \
  -o -name "*.md" -o -name "*.sh" -o -name "*.nix" -o -name "*.yml" \
  -o -name "*.yaml" -o -name "*.conf" \) -exec cat {} + | wc -l)
print_metric "Total LOC" "$TOTAL_LOC lines" "$BOLD$GREEN"

# ============================================
# DOCUMENTATION STATISTICS
# ============================================
print_header "📚 Documentation Statistics"

print_section "Documentation Files"

# Count documentation by directory
if [ -d "docs" ]; then
  DOCS_COUNT=$(find docs -type f -name "*.md" | wc -l)
  print_metric "docs/ directory" "$DOCS_COUNT files" "$YELLOW"
fi

ROOT_DOCS=$(find . -maxdepth 1 -type f -name "*.md" | wc -l)
print_metric "Root directory" "$ROOT_DOCS files" "$YELLOW"

EXAMPLES_DOCS=$(find examples -type f -name "*.md" 2>/dev/null | wc -l || echo 0)
print_metric "examples/ directory" "$EXAMPLES_DOCS files" "$YELLOW"

VSCODE_DOCS=$(find .vscode -type f -name "*.md" 2>/dev/null | wc -l || echo 0)
print_metric ".vscode/ directory" "$VSCODE_DOCS files" "$YELLOW"

print_section "Documentation Size"

# Total markdown word count
MD_WORDS=$(find . -type f -name "*.md" ! -path "./node_modules/*" -exec cat {} + | wc -w)
print_metric "Total Words" "$MD_WORDS words" "$GREEN"

# Total markdown lines
MD_LINES=$(find . -type f -name "*.md" ! -path "./node_modules/*" -exec cat {} + | wc -l)
print_metric "Total Lines" "$MD_LINES lines" "$GREEN"

# Average words per document
if [ "$MD_COUNT" -gt 0 ]; then
  AVG_WORDS=$((MD_WORDS / MD_COUNT))
  print_metric "Average per Document" "$AVG_WORDS words" "$CYAN"
fi

# ============================================
# PACKAGE DATA STATISTICS
# ============================================
print_header "📦 Package Data Statistics"

if [ -f "nixite-packages.json" ]; then
  # Total packages
  TOTAL_PACKAGES=$(grep -o '"id":' nixite-packages.json | wc -l)
  print_metric "Total Packages" "$TOTAL_PACKAGES packages" "$BOLD$GREEN"

  print_section "Packages by Category"

  # Count packages by category
  for category in "create" "connect" "grow" "work" "play" "secure" "manage" "serve"; do
    COUNT=$(grep -c "\"category\": \"$category\"" nixite-packages.json || echo 0)
    EMOJI=$(case $category in
      create) echo "🎨";;
      connect) echo "💬";;
      grow) echo "🌱";;
      work) echo "💼";;
      play) echo "🎮";;
      secure) echo "🔒";;
      manage) echo "⚙️";;
      serve) echo "🌐";;
    esac)
    print_metric "$EMOJI $category" "$COUNT packages" "$YELLOW"
  done

  # Average description length
  AVG_DESC_LEN=$(grep -oP '(?<="description": ")[^"]*' nixite-packages.json | awk '{print length}' | awk '{sum+=$1; count++} END {print int(sum/count)}')
  print_metric "Avg Description Length" "$AVG_DESC_LEN chars" "$CYAN"
else
  print_metric "Package File" "Not found" "$RED"
fi

# ============================================
# TEST STATISTICS
# ============================================
print_header "🧪 Test Statistics"

if [ -d "tests" ]; then
  TEST_COUNT=$(find tests -type f -name "*.test.js" -o -name "*.spec.js" | wc -l)
  print_metric "Test Files" "$TEST_COUNT files" "$YELLOW"

  # Count test cases (rough estimate based on 'it(' or 'test(' occurrences)
  TEST_CASES=$(find tests -type f \( -name "*.test.js" -o -name "*.spec.js" \) -exec grep -oh '\(it\|test\)(' {} \; | wc -l || echo 0)
  print_metric "Test Cases" "$TEST_CASES tests" "$GREEN"

  # Test LOC
  TEST_LOC=$(find tests -type f \( -name "*.test.js" -o -name "*.spec.js" \) -exec cat {} + | wc -l || echo 0)
  print_metric "Test Code" "$TEST_LOC lines" "$CYAN"
else
  print_metric "Tests Directory" "Not found" "$YELLOW"
fi

# Check for test coverage
if [ -f "package.json" ] && grep -q "coverage" package.json; then
  print_metric "Coverage" "Configured (run: npm test)" "$GREEN"
fi

# ============================================
# SCRIPT STATISTICS
# ============================================
print_header "🔧 Script Statistics"

if [ -d "scripts" ]; then
  SCRIPT_COUNT=$(find scripts -type f -name "*.sh" -o -name "*.js" | wc -l)
  print_metric "Script Files" "$SCRIPT_COUNT files" "$YELLOW"

  # Shell scripts
  SHELL_SCRIPTS=$(find scripts -type f -name "*.sh" | wc -l)
  print_metric "Shell Scripts" "$SHELL_SCRIPTS files" "$CYAN"

  # Node scripts
  NODE_SCRIPTS=$(find scripts -type f -name "*.js" | wc -l)
  print_metric "Node.js Scripts" "$NODE_SCRIPTS files" "$CYAN"

  # Total script LOC
  SCRIPT_LOC=$(find scripts -type f \( -name "*.sh" -o -name "*.js" \) -exec cat {} + | wc -l)
  print_metric "Script LOC" "$SCRIPT_LOC lines" "$GREEN"
fi

# ============================================
# GIT STATISTICS
# ============================================
print_header "🌿 Git Statistics"

if [ -d ".git" ]; then
  # Current branch
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "Unknown")
  print_metric "Current Branch" "$CURRENT_BRANCH" "$CYAN"

  # Total commits
  TOTAL_COMMITS=$(git rev-list --count HEAD 2>/dev/null || echo "0")
  print_metric "Total Commits" "$TOTAL_COMMITS commits" "$GREEN"

  # Contributors
  CONTRIBUTORS=$(git log --format='%aN' | sort -u | wc -l 2>/dev/null || echo "0")
  print_metric "Contributors" "$CONTRIBUTORS people" "$YELLOW"

  # Recent commits (last 5)
  print_section "Recent Commits (Last 5)"
  git log --oneline --decorate --color -5 2>/dev/null | while IFS= read -r line; do
    echo "  $line"
  done

  # Files changed in last commit
  LAST_COMMIT_FILES=$(git diff-tree --no-commit-id --name-only -r HEAD 2>/dev/null | wc -l || echo "0")
  print_metric "Files in Last Commit" "$LAST_COMMIT_FILES files" "$CYAN"

  # Repository size
  REPO_SIZE=$(du -sh .git 2>/dev/null | cut -f1 || echo "Unknown")
  print_metric "Repository Size" "$REPO_SIZE" "$YELLOW"
else
  print_metric "Git Repository" "Not initialized" "$YELLOW"
fi

# ============================================
# DEPLOYMENT STATISTICS
# ============================================
print_header "🚀 Deployment Statistics"

print_section "Available Deployment Methods"

# Check for different deployment methods
if [ -f "Dockerfile" ]; then
  print_metric "Docker" "✅ Available" "$GREEN"
else
  print_metric "Docker" "❌ Not configured" "$RED"
fi

if [ -f "docker-compose.yml" ]; then
  print_metric "Docker Compose" "✅ Available" "$GREEN"
else
  print_metric "Docker Compose" "❌ Not configured" "$RED"
fi

if [ -f "nixos-module.nix" ]; then
  print_metric "NixOS Module" "✅ Available" "$GREEN"
else
  print_metric "NixOS Module" "❌ Not configured" "$RED"
fi

if [ -d "examples/systemd" ]; then
  print_metric "systemd" "✅ Available" "$GREEN"
else
  print_metric "systemd" "❌ Not configured" "$RED"
fi

if [ -d "examples/reverse-proxy" ]; then
  PROXY_COUNT=$(find examples/reverse-proxy -type f \( -name "*.conf" -o -name "Caddyfile" \) | wc -l)
  print_metric "Reverse Proxy Configs" "✅ $PROXY_COUNT configs" "$GREEN"
else
  print_metric "Reverse Proxy" "❌ Not configured" "$RED"
fi

# ============================================
# DEPENDENCIES
# ============================================
print_header "📦 Dependencies"

if [ -f "package.json" ]; then
  # Count dependencies
  DEV_DEPS=$(grep -c '"' package.json | grep -A100 '"devDependencies"' | grep -c '"' || echo "0")
  DEPS=$(grep -c '"' package.json | grep -A100 '"dependencies"' | grep -c '"' || echo "0")

  print_metric "Dependencies" "$DEPS packages" "$YELLOW"
  print_metric "Dev Dependencies" "$DEV_DEPS packages" "$YELLOW"

  # Check if node_modules exists
  if [ -d "node_modules" ]; then
    NODE_MODULES_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1 || echo "Unknown")
    print_metric "node_modules Size" "$NODE_MODULES_SIZE" "$CYAN"
  fi
fi

# ============================================
# CONFIGURATION FILES
# ============================================
print_header "⚙️  Configuration Files"

print_section "Project Configuration"

# Check for various config files
[ -f "config.js" ] && print_metric "Main Config" "✅ config.js" "$GREEN" || print_metric "Main Config" "❌ Missing" "$RED"
[ -f "nixite-packages.json" ] && print_metric "Package Data" "✅ nixite-packages.json" "$GREEN" || print_metric "Package Data" "❌ Missing" "$RED"
[ -f ".editorconfig" ] && print_metric "EditorConfig" "✅ .editorconfig" "$GREEN" || print_metric "EditorConfig" "❌ Missing" "$YELLOW"
[ -f ".gitignore" ] && print_metric "Git Ignore" "✅ .gitignore" "$GREEN" || print_metric "Git Ignore" "❌ Missing" "$YELLOW"

# VS Code
if [ -d ".vscode" ]; then
  VSCODE_FILES=$(find .vscode -type f | wc -l)
  print_metric "VS Code Config" "✅ $VSCODE_FILES files" "$GREEN"
else
  print_metric "VS Code Config" "❌ Not configured" "$YELLOW"
fi

# Git hooks
if [ -d ".githooks" ]; then
  HOOKS_COUNT=$(find .githooks -type f ! -name "*.md" | wc -l)
  print_metric "Git Hooks" "✅ $HOOKS_COUNT hooks" "$GREEN"
else
  print_metric "Git Hooks" "❌ Not configured" "$YELLOW"
fi

# ============================================
# QUALITY METRICS
# ============================================
print_header "✨ Quality Metrics"

print_section "Code Quality"

# Check for validation scripts
if [ -f "scripts/validate-config.js" ]; then
  print_metric "Config Validator" "✅ Available" "$GREEN"
else
  print_metric "Config Validator" "❌ Missing" "$YELLOW"
fi

if [ -f "scripts/validate-packages.js" ]; then
  print_metric "Package Validator" "✅ Available" "$GREEN"
else
  print_metric "Package Validator" "❌ Missing" "$YELLOW"
fi

# Check for documentation quality
if [ "$MD_COUNT" -ge 10 ]; then
  print_metric "Documentation" "✅ Comprehensive ($MD_COUNT files)" "$GREEN"
elif [ "$MD_COUNT" -ge 5 ]; then
  print_metric "Documentation" "⚠️  Good ($MD_COUNT files)" "$YELLOW"
else
  print_metric "Documentation" "❌ Limited ($MD_COUNT files)" "$RED"
fi

# Code-to-docs ratio
if [ "$TOTAL_LOC" -gt 0 ] && [ "$MD_LINES" -gt 0 ]; then
  DOCS_RATIO=$((MD_LINES * 100 / TOTAL_LOC))
  if [ "$DOCS_RATIO" -ge 50 ]; then
    print_metric "Code-to-Docs Ratio" "✅ Excellent (${DOCS_RATIO}%)" "$GREEN"
  elif [ "$DOCS_RATIO" -ge 25 ]; then
    print_metric "Code-to-Docs Ratio" "⚠️  Good (${DOCS_RATIO}%)" "$YELLOW"
  else
    print_metric "Code-to-Docs Ratio" "❌ Low (${DOCS_RATIO}%)" "$RED"
  fi
fi

# ============================================
# DISK USAGE
# ============================================
print_header "💾 Disk Usage"

# Project size (excluding node_modules and .git)
PROJECT_SIZE=$(du -sh --exclude=node_modules --exclude=.git . 2>/dev/null | cut -f1 || echo "Unknown")
print_metric "Project Size" "$PROJECT_SIZE (excl. node_modules, .git)" "$CYAN"

# Individual directories
if [ -d "docs" ]; then
  DOCS_SIZE=$(du -sh docs 2>/dev/null | cut -f1 || echo "Unknown")
  print_metric "docs/" "$DOCS_SIZE" "$YELLOW"
fi

if [ -d "examples" ]; then
  EXAMPLES_SIZE=$(du -sh examples 2>/dev/null | cut -f1 || echo "Unknown")
  print_metric "examples/" "$EXAMPLES_SIZE" "$YELLOW"
fi

if [ -d "scripts" ]; then
  SCRIPTS_SIZE=$(du -sh scripts 2>/dev/null | cut -f1 || echo "Unknown")
  print_metric "scripts/" "$SCRIPTS_SIZE" "$YELLOW"
fi

if [ -d "tests" ]; then
  TESTS_SIZE=$(du -sh tests 2>/dev/null | cut -f1 || echo "Unknown")
  print_metric "tests/" "$TESTS_SIZE" "$YELLOW"
fi

# ============================================
# SUMMARY
# ============================================
print_header "📈 Summary"

echo -e "  ${BOLD}Project Nixite v$VERSION${RESET}"
echo -e "  ├─ ${WHITE}$TOTAL_FILES${RESET} files with ${WHITE}$TOTAL_LOC${RESET} lines of code"
echo -e "  ├─ ${WHITE}$MD_COUNT${RESET} documentation files (${WHITE}$MD_WORDS${RESET} words)"
echo -e "  ├─ ${WHITE}$TOTAL_PACKAGES${RESET} packages across ${WHITE}8${RESET} categories"
echo -e "  ├─ ${WHITE}$TEST_COUNT${RESET} test files with ${WHITE}$TEST_CASES${RESET} test cases"
echo -e "  ├─ ${WHITE}$SCRIPT_COUNT${RESET} utility scripts"
echo -e "  ├─ ${WHITE}$TOTAL_COMMITS${RESET} commits from ${WHITE}$CONTRIBUTORS${RESET} contributors"
echo -e "  └─ ${GREEN}✨ Production Ready (v2.1.0+)${RESET}"

# Footer
echo -e "\n${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${WHITE}Generated on $(date '+%Y-%m-%d %H:%M:%S')${RESET}"
echo -e "${CYAN}For more information, see: ${YELLOW}docs/README.md${RESET}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
