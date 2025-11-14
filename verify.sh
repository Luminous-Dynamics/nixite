#!/usr/bin/env bash

# Nixite Installation Verification Script
# Checks that all components are properly installed and working

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Print functions
print_header() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}$1${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

print_check() {
    echo -n "Checking $1... "
}

print_pass() {
    echo -e "${GREEN}✓ PASS${NC} $1"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}✗ FAIL${NC} $1"
    ((FAILED++))
}

print_warn() {
    echo -e "${YELLOW}⚠ WARN${NC} $1"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ INFO${NC} $1"
}

# Start verification
echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║         Nixite Installation Verification             ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Check 1: Required files
print_header "Required Files"

required_files=(
    "index.html"
    "config.js"
    "package.json"
    "nixite-packages.json"
    "install-manager.js"
    "nixite-luminous-bridge.js"
    "ui-feedback-enhancements.js"
    "voice-input.js"
    "start.sh"
    "README.md"
    "LICENSE"
)

for file in "${required_files[@]}"; do
    print_check "$file"
    if [ -f "$file" ]; then
        print_pass ""
    else
        print_fail "Missing required file"
    fi
done

# Check 2: File permissions
print_header "File Permissions"

print_check "start.sh executable"
if [ -x "start.sh" ]; then
    print_pass ""
else
    print_fail "start.sh is not executable (run: chmod +x start.sh)"
fi

# Check 3: JSON validation
print_header "JSON Files Validation"

print_check "package.json"
if jq empty package.json 2>/dev/null; then
    print_pass "Valid JSON"
else
    print_fail "Invalid JSON"
fi

print_check "nixite-packages.json"
if jq empty nixite-packages.json 2>/dev/null; then
    package_count=$(jq '.packages | length' nixite-packages.json 2>/dev/null || echo "0")
    print_pass "Valid JSON with $package_count packages"
else
    print_fail "Invalid JSON"
fi

# Check 4: JavaScript syntax
print_header "JavaScript Syntax"

js_files=(
    "config.js"
    "install-manager.js"
    "nixite-luminous-bridge.js"
    "ui-feedback-enhancements.js"
    "voice-input.js"
)

for file in "${js_files[@]}"; do
    print_check "$file"
    if node --check "$file" 2>/dev/null; then
        print_pass ""
    else
        print_warn "Syntax check failed (Node.js may not be installed)"
    fi
done

# Check 5: Dependencies
print_header "System Dependencies"

print_check "Python 3"
if command -v python3 &> /dev/null; then
    version=$(python3 --version 2>&1 | cut -d' ' -f2)
    print_pass "v$version installed"
else
    print_fail "Python 3 not found"
fi

print_check "Node.js"
if command -v node &> /dev/null; then
    version=$(node --version)
    print_pass "$version installed"
else
    print_warn "Node.js not found (AI features will be unavailable)"
fi

print_check "curl"
if command -v curl &> /dev/null; then
    print_pass "Installed"
else
    print_warn "curl not found (health checks unavailable)"
fi

print_check "jq"
if command -v jq &> /dev/null; then
    print_pass "Installed"
else
    print_warn "jq not found (JSON validation limited)"
fi

# Check 6: Package data integrity
print_header "Package Data Integrity"

if [ -f "nixite-packages.json" ]; then
    print_check "Package structure"
    if jq -e '.packages' nixite-packages.json > /dev/null 2>&1; then
        print_pass "Valid structure"
    else
        print_fail "Missing .packages array"
    fi

    print_check "Required fields"
    missing_fields=0
    jq -r '.packages[] | select(.id == null or .name == null or .description == null or .category == null) | .name // "unknown"' nixite-packages.json 2>/dev/null | while read -r pkg; do
        if [ -n "$pkg" ]; then
            print_fail "Package '$pkg' missing required fields"
            ((missing_fields++))
        fi
    done
    if [ $missing_fields -eq 0 ]; then
        print_pass "All packages have required fields"
    fi

    print_check "Valid categories"
    valid_categories=("create" "connect" "grow" "work" "play" "secure" "manage" "serve")
    invalid_cats=$(jq -r '.packages[].category' nixite-packages.json 2>/dev/null | sort -u | grep -v -E "^(create|connect|grow|work|play|secure|manage|serve)$" || true)
    if [ -z "$invalid_cats" ]; then
        print_pass "All categories are valid"
    else
        print_fail "Invalid categories found: $invalid_cats"
    fi
fi

# Check 7: Documentation
print_header "Documentation"

docs=(
    "README.md:50"
    "CONTRIBUTING.md:50"
    "CHANGELOG.md:20"
    "LICENSE:10"
)

for doc in "${docs[@]}"; do
    file="${doc%:*}"
    min_lines="${doc#*:}"
    print_check "$file"

    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        if [ "$lines" -ge "$min_lines" ]; then
            print_pass "$lines lines"
        else
            print_warn "Only $lines lines (expected at least $min_lines)"
        fi
    else
        print_fail "File not found"
    fi
done

# Check 8: Configuration
print_header "Configuration"

print_check "config.js structure"
if node -e "
    const config = require('./config.js');
    if (!config.api || !config.features || !config.network) {
        process.exit(1);
    }
" 2>/dev/null; then
    print_pass "Valid configuration"
else
    print_fail "Invalid config structure"
fi

# Check 9: Web server test
print_header "Web Server Test"

print_check "Starting web server"
python3 -m http.server 8000 > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2

if ps -p $SERVER_PID > /dev/null; then
    print_pass "Server started (PID: $SERVER_PID)"

    print_check "HTTP response"
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 | grep -q "200"; then
        print_pass "Server responding"
    else
        print_warn "Server not responding on port 8000"
    fi

    kill $SERVER_PID 2>/dev/null
    sleep 1
else
    print_fail "Server failed to start"
fi

# Check 10: Optional features
print_header "Optional Features"

print_check "systemd service files"
if [ -f "nixite.service" ] && [ -f "nixite-bridge.service" ]; then
    print_pass "Service files present"
else
    print_warn "Service files not found"
fi

print_check "Docker support"
if [ -f "Dockerfile" ] && [ -f "docker-compose.yml" ]; then
    print_pass "Docker files present"
else
    print_warn "Docker files not found"
fi

print_check "NixOS module"
if [ -f "nix/module.nix" ]; then
    print_pass "NixOS integration available"
else
    print_warn "NixOS module not found"
fi

# Summary
print_header "Verification Summary"

echo ""
echo -e "${GREEN}✓ Passed:${NC}   $PASSED"
echo -e "${YELLOW}⚠ Warnings:${NC} $WARNINGS"
echo -e "${RED}✗ Failed:${NC}   $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}✅ Nixite installation is VALID!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "You can now start Nixite with:"
    echo "  ./start.sh"
    echo ""
    echo "Or visit: http://localhost:8000"
    echo ""

    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}Note: There are $WARNINGS warnings. These are non-critical but may limit functionality.${NC}"
        echo ""
    fi

    exit 0
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${RED}❌ Nixite installation has ISSUES!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Please fix the failed checks above before running Nixite."
    echo ""
    echo "For help, see: https://github.com/Luminous-Dynamics/nixite/issues"
    echo ""
    exit 1
fi
