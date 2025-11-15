#!/usr/bin/env bash

# Nixite Health Check Script
# Performs comprehensive health checks on the project

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

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Helper functions
check_pass() {
  echo -e "  ${GREEN}✓${RESET} $1"
  ((PASSED_CHECKS++))
  ((TOTAL_CHECKS++))
}

check_fail() {
  echo -e "  ${RED}✗${RESET} $1"
  ((FAILED_CHECKS++))
  ((TOTAL_CHECKS++))
}

check_warn() {
  echo -e "  ${YELLOW}⚠${RESET} $1"
  ((WARNING_CHECKS++))
  ((TOTAL_CHECKS++))
}

print_header() {
  echo -e "\n${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "${BOLD}${WHITE}$1${RESET}"
  echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
}

print_section() {
  echo -e "${BOLD}${BLUE}▶ $1${RESET}"
}

# Banner
echo -e "${BOLD}${MAGENTA}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                  NIXITE HEALTH CHECK                          ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${RESET}"

# ============================================
# FILE STRUCTURE CHECKS
# ============================================
print_header "📁 File Structure"

print_section "Core Files"

[ -f "index.html" ] && check_pass "index.html exists" || check_fail "index.html missing"
[ -f "config.js" ] && check_pass "config.js exists" || check_fail "config.js missing"
[ -f "nixite-packages.json" ] && check_pass "nixite-packages.json exists" || check_fail "nixite-packages.json missing"
[ -f "nixite-luminous-bridge.js" ] && check_pass "nixite-luminous-bridge.js exists" || check_fail "nixite-luminous-bridge.js missing"

print_section "Documentation"

[ -f "README.md" ] && check_pass "README.md exists" || check_fail "README.md missing"
[ -f "CONTRIBUTING.md" ] && check_pass "CONTRIBUTING.md exists" || check_warn "CONTRIBUTING.md missing"
[ -f "LICENSE" ] && check_pass "LICENSE exists" || check_warn "LICENSE missing"
[ -f "SUPPORT.md" ] && check_pass "SUPPORT.md exists" || check_warn "SUPPORT.md missing"
[ -d "docs" ] && check_pass "docs/ directory exists" || check_warn "docs/ directory missing"

print_section "Configuration"

[ -f ".gitignore" ] && check_pass ".gitignore exists" || check_warn ".gitignore missing"
[ -f ".editorconfig" ] && check_pass ".editorconfig exists" || check_warn ".editorconfig missing"
[ -f "package.json" ] && check_pass "package.json exists" || check_warn "package.json missing"

print_section "Scripts"

[ -d "scripts" ] && check_pass "scripts/ directory exists" || check_fail "scripts/ directory missing"
[ -f "scripts/dev.sh" ] && check_pass "scripts/dev.sh exists" || check_fail "scripts/dev.sh missing"
[ -f "scripts/validate-config.js" ] && check_pass "scripts/validate-config.js exists" || check_warn "Validation scripts missing"

# ============================================
# CONFIGURATION VALIDATION
# ============================================
print_header "⚙️  Configuration Validation"

print_section "config.js"

if [ -f "config.js" ]; then
  # Check syntax
  if node -c config.js 2>/dev/null; then
    check_pass "config.js syntax valid"
  else
    check_fail "config.js has syntax errors"
  fi

  # Check with validator if available
  if [ -f "scripts/validate-config.js" ]; then
    if node scripts/validate-config.js config.js &>/dev/null; then
      check_pass "config.js validation passed"
    else
      check_fail "config.js validation failed"
    fi
  fi
else
  check_fail "config.js not found"
fi

print_section "nixite-packages.json"

if [ -f "nixite-packages.json" ]; then
  # Check JSON syntax
  if jq empty nixite-packages.json 2>/dev/null; then
    check_pass "nixite-packages.json is valid JSON"
  else
    check_fail "nixite-packages.json has invalid JSON"
  fi

  # Check with validator if available
  if [ -f "scripts/validate-packages.js" ]; then
    if node scripts/validate-packages.js nixite-packages.json &>/dev/null; then
      check_pass "nixite-packages.json validation passed"
    else
      check_fail "nixite-packages.json validation failed"
    fi
  fi

  # Count packages
  PACKAGE_COUNT=$(jq '. | length' nixite-packages.json 2>/dev/null || echo 0)
  if [ "$PACKAGE_COUNT" -gt 0 ]; then
    check_pass "Found $PACKAGE_COUNT packages"
  else
    check_fail "No packages found"
  fi
else
  check_fail "nixite-packages.json not found"
fi

# ============================================
# SERVICE STATUS CHECKS
# ============================================
print_header "🔄 Service Status"

print_section "Web Server (Port 8000)"

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 || ss -tuln | grep -q ":8000 "; then
  check_pass "Web server is running"

  # Test HTTP response
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 2>/dev/null | grep -q "200\|301\|302"; then
    check_pass "Web server responds to HTTP requests"
  else
    check_fail "Web server not responding correctly"
  fi
else
  check_warn "Web server not running (use: ./scripts/dev.sh start)"
fi

print_section "AI Bridge (Port 8890)"

if lsof -Pi :8890 -sTCP:LISTEN -t >/dev/null 2>&1 || ss -tuln | grep -q ":8890 "; then
  check_pass "AI Bridge is running"

  # Test health endpoint
  if curl -s http://localhost:8890/health 2>/dev/null | grep -q "healthy\|ok"; then
    check_pass "AI Bridge health check passed"
  else
    check_warn "AI Bridge health check returned unexpected response"
  fi
else
  check_warn "AI Bridge not running (use: ./scripts/dev.sh start)"
fi

# ============================================
# DEPENDENCY CHECKS
# ============================================
print_header "📦 Dependencies"

print_section "System Dependencies"

# Node.js
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  check_pass "Node.js installed ($NODE_VERSION)"
else
  check_fail "Node.js not installed"
fi

# Python
if command -v python3 &> /dev/null; then
  PYTHON_VERSION=$(python3 --version)
  check_pass "Python 3 installed ($PYTHON_VERSION)"
else
  check_fail "Python 3 not installed"
fi

# jq (nice to have)
if command -v jq &> /dev/null; then
  check_pass "jq installed (for JSON processing)"
else
  check_warn "jq not installed (optional, recommended)"
fi

# curl
if command -v curl &> /dev/null; then
  check_pass "curl installed"
else
  check_warn "curl not installed (optional, for testing)"
fi

print_section "Optional Dependencies"

# Ollama (for AI features)
if command -v ollama &> /dev/null; then
  check_pass "Ollama installed"

  # Check if Ollama is running
  if curl -s http://localhost:11434 &>/dev/null; then
    check_pass "Ollama service is running"
  else
    check_warn "Ollama installed but not running"
  fi
else
  check_warn "Ollama not installed (required for AI features)"
fi

# Docker (for containerization)
if command -v docker &> /dev/null; then
  check_pass "Docker installed"
else
  check_warn "Docker not installed (optional)"
fi

# Git
if command -v git &> /dev/null; then
  GIT_VERSION=$(git --version)
  check_pass "Git installed ($GIT_VERSION)"
else
  check_warn "Git not installed"
fi

# ============================================
# FILE PERMISSIONS
# ============================================
print_header "🔐 File Permissions"

print_section "Executables"

for script in scripts/*.sh verify.sh; do
  if [ -f "$script" ]; then
    if [ -x "$script" ]; then
      check_pass "$(basename "$script") is executable"
    else
      check_warn "$(basename "$script") is not executable (run: chmod +x $script)"
    fi
  fi
done

if [ -f "nixite-luminous-bridge.js" ]; then
  if [ -x "nixite-luminous-bridge.js" ]; then
    check_pass "nixite-luminous-bridge.js is executable"
  else
    check_warn "nixite-luminous-bridge.js not executable (optional)"
  fi
fi

print_section "File Ownership"

# Check if files are readable
if [ -r "config.js" ] && [ -r "nixite-packages.json" ] && [ -r "index.html" ]; then
  check_pass "Core files are readable"
else
  check_fail "Some core files are not readable"
fi

# ============================================
# DISK SPACE
# ============================================
print_header "💾 Disk Space"

print_section "Available Space"

DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
DISK_AVAIL=$(df -h . | awk 'NR==2 {print $4}')

if [ "$DISK_USAGE" -lt 90 ]; then
  check_pass "Disk usage OK (${DISK_USAGE}% used, ${DISK_AVAIL} available)"
elif [ "$DISK_USAGE" -lt 95 ]; then
  check_warn "Disk usage high (${DISK_USAGE}% used, ${DISK_AVAIL} available)"
else
  check_fail "Disk usage critical (${DISK_USAGE}% used, ${DISK_AVAIL} available)"
fi

print_section "Project Size"

PROJECT_SIZE=$(du -sh --exclude=node_modules --exclude=.git . 2>/dev/null | cut -f1 || echo "Unknown")
check_pass "Project size: $PROJECT_SIZE (excluding node_modules, .git)"

if [ -d "node_modules" ]; then
  NODE_MODULES_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1 || echo "Unknown")
  check_pass "node_modules size: $NODE_MODULES_SIZE"
fi

# ============================================
# LOG FILES
# ============================================
print_header "📋 Log Files"

print_section "Log File Status"

for log in .web.log .bridge.log .dev.log; do
  if [ -f "$log" ]; then
    LOG_SIZE=$(du -h "$log" | cut -f1)
    LOG_LINES=$(wc -l < "$log")

    if [ "$LOG_LINES" -gt 10000 ]; then
      check_warn "$log exists (${LOG_SIZE}, ${LOG_LINES} lines - consider rotating)"
    else
      check_pass "$log exists (${LOG_SIZE}, ${LOG_LINES} lines)"
    fi
  else
    check_pass "$log does not exist (will be created on startup)"
  fi
done

# Check for errors in logs
print_section "Recent Errors"

ERROR_COUNT=0
for log in .web.log .bridge.log; do
  if [ -f "$log" ]; then
    RECENT_ERRORS=$(tail -100 "$log" 2>/dev/null | grep -ci "error\|exception\|fatal" || echo 0)
    ERROR_COUNT=$((ERROR_COUNT + RECENT_ERRORS))
  fi
done

if [ "$ERROR_COUNT" -eq 0 ]; then
  check_pass "No recent errors in logs"
elif [ "$ERROR_COUNT" -lt 5 ]; then
  check_warn "Found $ERROR_COUNT recent error(s) in logs"
else
  check_fail "Found $ERROR_COUNT recent errors in logs (check: tail -f .*.log)"
fi

# ============================================
# GIT REPOSITORY
# ============================================
print_header "🌿 Git Repository"

print_section "Repository Status"

if [ -d ".git" ]; then
  check_pass "Git repository initialized"

  # Check for uncommitted changes
  if git diff --quiet && git diff --cached --quiet; then
    check_pass "No uncommitted changes"
  else
    check_warn "Uncommitted changes present (run: git status)"
  fi

  # Check current branch
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
  check_pass "Current branch: $CURRENT_BRANCH"

  # Check for untracked files
  UNTRACKED=$(git ls-files --others --exclude-standard | wc -l)
  if [ "$UNTRACKED" -eq 0 ]; then
    check_pass "No untracked files"
  else
    check_warn "$UNTRACKED untracked file(s)"
  fi
else
  check_warn "Not a git repository"
fi

print_section "Git Hooks"

if [ -d ".githooks" ]; then
  check_pass ".githooks directory exists"

  HOOKS_PATH=$(git config core.hooksPath 2>/dev/null || echo "")
  if [ "$HOOKS_PATH" = ".githooks" ]; then
    check_pass "Git hooks configured"
  else
    check_warn "Git hooks not configured (run: git config core.hooksPath .githooks)"
  fi
else
  check_warn ".githooks directory not found"
fi

# ============================================
# DEPLOYMENT READINESS
# ============================================
print_header "🚀 Deployment Readiness"

print_section "Deployment Options"

[ -f "Dockerfile" ] && check_pass "Docker deployment available" || check_warn "Docker deployment not configured"
[ -f "docker-compose.yml" ] && check_pass "Docker Compose available" || check_warn "Docker Compose not configured"
[ -f "nixos-module.nix" ] && check_pass "NixOS module available" || check_warn "NixOS module not configured"
[ -d "examples/systemd" ] && check_pass "systemd examples available" || check_warn "systemd examples not configured"
[ -d "examples/reverse-proxy" ] && check_pass "Reverse proxy configs available" || check_warn "Reverse proxy configs not configured"

print_section "Production Checks"

# Check for development-only code
if grep -r "console.log\|debugger\|TODO" *.html *.js 2>/dev/null | grep -v "node_modules" | grep -q .; then
  check_warn "Development code found (console.log, debugger, TODO)"
else
  check_pass "No development code found"
fi

# Check for security issues
if [ -f ".env" ]; then
  check_warn ".env file exists (ensure it's in .gitignore)"
else
  check_pass "No .env file found"
fi

# ============================================
# TESTING
# ============================================
print_header "🧪 Testing"

print_section "Test Infrastructure"

if [ -d "tests" ]; then
  check_pass "tests/ directory exists"

  TEST_COUNT=$(find tests -name "*.test.js" -o -name "*.spec.js" | wc -l)
  if [ "$TEST_COUNT" -gt 0 ]; then
    check_pass "Found $TEST_COUNT test file(s)"
  else
    check_warn "No test files found"
  fi
else
  check_warn "tests/ directory not found"
fi

if [ -f "package.json" ] && grep -q "\"test\":" package.json; then
  check_pass "Test script configured in package.json"
else
  check_warn "Test script not configured"
fi

# ============================================
# SUMMARY
# ============================================
print_header "📊 Summary"

TOTAL_PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo -e "  ${BOLD}Total Checks:${RESET}    $TOTAL_CHECKS"
echo -e "  ${GREEN}${BOLD}Passed:${RESET}          $PASSED_CHECKS"
echo -e "  ${YELLOW}${BOLD}Warnings:${RESET}        $WARNING_CHECKS"
echo -e "  ${RED}${BOLD}Failed:${RESET}          $FAILED_CHECKS"
echo -e "  ${BOLD}Health Score:${RESET}    ${TOTAL_PERCENTAGE}%"

echo ""

if [ "$FAILED_CHECKS" -eq 0 ] && [ "$WARNING_CHECKS" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✓ Perfect! All checks passed!${RESET}"
  HEALTH_STATUS="excellent"
elif [ "$FAILED_CHECKS" -eq 0 ] && [ "$WARNING_CHECKS" -le 5 ]; then
  echo -e "${GREEN}${BOLD}✓ Great! No critical issues, minor warnings only.${RESET}"
  HEALTH_STATUS="good"
elif [ "$FAILED_CHECKS" -eq 0 ]; then
  echo -e "${YELLOW}${BOLD}⚠ Good, but some warnings need attention.${RESET}"
  HEALTH_STATUS="fair"
elif [ "$FAILED_CHECKS" -le 3 ]; then
  echo -e "${YELLOW}${BOLD}⚠ Some issues need to be fixed.${RESET}"
  HEALTH_STATUS="needs-attention"
else
  echo -e "${RED}${BOLD}✗ Critical issues found! Please fix them.${RESET}"
  HEALTH_STATUS="critical"
fi

echo ""
echo -e "${BOLD}Health Status: ${RESET}${HEALTH_STATUS}"
echo ""

# Recommendations
if [ "$FAILED_CHECKS" -gt 0 ] || [ "$WARNING_CHECKS" -gt 0 ]; then
  echo -e "${BOLD}${BLUE}Recommendations:${RESET}\n"

  if [ "$FAILED_CHECKS" -gt 0 ]; then
    echo -e "  ${RED}⚠${RESET} Fix all failed checks immediately"
  fi

  if [ "$WARNING_CHECKS" -gt 0 ]; then
    echo -e "  ${YELLOW}⚠${RESET} Review warnings and address as needed"
  fi

  echo -e "  ${BLUE}ℹ${RESET} Run './scripts/dev.sh start' to start services"
  echo -e "  ${BLUE}ℹ${RESET} Check './scripts/dev.sh status' for service status"
  echo -e "  ${BLUE}ℹ${RESET} See docs/TROUBLESHOOTING.md for help"
  echo ""
fi

# Footer
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${WHITE}Health check completed on $(date '+%Y-%m-%d %H:%M:%S')${RESET}"
echo -e "${CYAN}For detailed troubleshooting, see: ${YELLOW}docs/TROUBLESHOOTING.md${RESET}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"

# Exit with appropriate code
if [ "$FAILED_CHECKS" -gt 0 ]; then
  exit 1
elif [ "$WARNING_CHECKS" -gt 5 ]; then
  exit 2
else
  exit 0
fi
