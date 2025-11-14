#!/bin/bash
# Deployment helper script
# Simplifies deployment to various platforms

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Deployment commands

deploy_docker() {
    print_header "Deploying with Docker"

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        echo "Install from: https://docs.docker.com/get-docker/"
        exit 1
    fi

    # Check if docker-compose is available
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed"
        exit 1
    fi

    # Build image
    echo "Building Docker image..."
    docker build -t nixite:latest . || exit 1
    print_success "Image built: nixite:latest"

    # Tag with version
    VERSION=$(cat package.json | grep -m1 version | cut -d'"' -f4)
    docker tag nixite:latest nixite:$VERSION
    print_success "Tagged as nixite:$VERSION"

    # Start with docker-compose
    echo ""
    read -p "Start with docker-compose? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        docker-compose up -d
        print_success "Services started"
        echo ""
        echo "Access at: http://localhost:8000"
        echo "View logs: docker-compose logs -f"
        echo "Stop: docker-compose down"
    fi
}

deploy_nixos() {
    print_header "Deploying on NixOS"

    # Check if running on NixOS
    if [ ! -f "/etc/nixos/configuration.nix" ]; then
        print_error "Not running on NixOS"
        exit 1
    fi

    # Copy module to nix store path or use absolute path
    MODULE_PATH=$(pwd)/nix/module.nix

    echo "To enable Nixite, add to /etc/nixos/configuration.nix:"
    echo ""
    echo "  imports = [ $MODULE_PATH ];"
    echo ""
    echo "  services.nixite = {"
    echo "    enable = true;"
    echo "    webPort = 8000;"
    echo "    enableBridge = false;  # Set to true for AI features"
    echo "  };"
    echo ""

    read -p "Open configuration.nix in editor? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ${EDITOR:-nano} /etc/nixos/configuration.nix
    fi

    echo ""
    read -p "Rebuild NixOS now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo nixos-rebuild switch
        print_success "NixOS rebuilt"

        # Check service status
        if systemctl is-active --quiet nixite.service; then
            print_success "nixite.service is active"
        else
            print_warning "nixite.service is not active"
            echo "Start with: sudo systemctl start nixite.service"
        fi
    fi
}

deploy_systemd() {
    print_header "Deploying with systemd"

    # Copy service files
    echo "Copying service files..."
    sudo cp nixite.service /etc/systemd/system/ 2>/dev/null || {
        print_error "Failed to copy nixite.service"
        exit 1
    }
    print_success "Copied nixite.service"

    # Ask about AI Bridge
    read -p "Install AI Bridge service? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo cp nixite-bridge.service /etc/systemd/system/ 2>/dev/null || {
            print_error "Failed to copy nixite-bridge.service"
        }
        print_success "Copied nixite-bridge.service"
    fi

    # Update paths in service files
    INSTALL_DIR=$(pwd)
    echo "Updating service files with install directory: $INSTALL_DIR"
    sudo sed -i "s|/opt/nixite|$INSTALL_DIR|g" /etc/systemd/system/nixite.service
    if [ -f "/etc/systemd/system/nixite-bridge.service" ]; then
        sudo sed -i "s|/opt/nixite|$INSTALL_DIR|g" /etc/systemd/system/nixite-bridge.service
    fi

    # Reload systemd
    sudo systemctl daemon-reload
    print_success "Reloaded systemd"

    # Enable and start services
    echo ""
    read -p "Enable and start services now? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        sudo systemctl enable nixite.service
        sudo systemctl start nixite.service
        print_success "nixite.service enabled and started"

        if [ -f "/etc/systemd/system/nixite-bridge.service" ]; then
            sudo systemctl enable nixite-bridge.service
            sudo systemctl start nixite-bridge.service
            print_success "nixite-bridge.service enabled and started"
        fi

        echo ""
        echo "Check status: sudo systemctl status nixite.service"
        echo "View logs: sudo journalctl -u nixite.service -f"
    fi
}

deploy_manual() {
    print_header "Manual deployment instructions"

    cat << EOF

Manual Deployment Steps:

1. Copy files to production server:
   scp -r . user@server:/opt/nixite

2. SSH to server:
   ssh user@server

3. Install dependencies:
   cd /opt/nixite
   # For Node.js (if using AI Bridge):
   npm install --production

4. Configure for production:
   cp examples/production-config.js config.js
   # Edit config.js with production settings

5. Set environment variables:
   export NIXITE_API_BASE=https://api.yourserver.com
   export NIXITE_BRIDGE=https://bridge.yourserver.com

6. Start services:
   # Option A: systemd (recommended)
   ./scripts/deploy.sh systemd

   # Option B: Docker
   ./scripts/deploy.sh docker

   # Option C: Manual with screen/tmux
   screen -S nixite
   ./start.sh

7. Configure reverse proxy (nginx/caddy) for HTTPS:
   # See docs/deployment/DOCKER.md for nginx example

8. Test deployment:
   curl https://yourserver.com/health

EOF
}

check_production_ready() {
    print_header "Production readiness check"

    # Run verification
    echo "Running verification script..."
    if ./verify.sh > /dev/null 2>&1; then
        print_success "Verification passed"
    else
        print_error "Verification failed"
        echo "Run './verify.sh' to see details"
        return 1
    fi

    # Run tests
    echo "Running tests..."
    if npm test > /dev/null 2>&1; then
        print_success "Tests passed"
    else
        print_error "Tests failed"
        echo "Run 'npm test' to see details"
        return 1
    fi

    # Check for production config
    if [ -f "config.js" ]; then
        if grep -q "process.env" config.js; then
            print_success "Production config uses environment variables"
        else
            print_warning "Config doesn't use environment variables"
            echo "Consider using examples/production-config.js"
        fi
    else
        print_error "config.js not found"
        return 1
    fi

    # Check security
    echo "Checking security settings..."
    if grep -q "NoNewPrivileges=true" nixite.service 2>/dev/null; then
        print_success "Systemd hardening enabled"
    else
        print_warning "Systemd service not hardened"
    fi

    print_success "Production readiness check complete"
}

rollback() {
    print_header "Rollback deployment"

    echo "Select rollback method:"
    echo "1. Docker: docker-compose down && docker-compose up -d"
    echo "2. Systemd: sudo systemctl restart nixite.service"
    echo "3. NixOS: sudo nixos-rebuild switch --rollback"
    echo ""
    read -p "Choice (1-3): " -n 1 -r
    echo

    case $REPLY in
        1)
            docker-compose down
            docker-compose up -d
            print_success "Rolled back Docker deployment"
            ;;
        2)
            sudo systemctl restart nixite.service
            print_success "Restarted systemd service"
            ;;
        3)
            sudo nixos-rebuild switch --rollback
            print_success "Rolled back NixOS configuration"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

cmd_help() {
    cat << EOF
Nixite Deployment Helper

Usage: ./scripts/deploy.sh <command>

Commands:
  docker      Deploy using Docker and docker-compose
  nixos       Deploy on NixOS using module
  systemd     Deploy using systemd services
  manual      Show manual deployment instructions
  check       Check if ready for production deployment
  rollback    Rollback to previous deployment
  help        Show this help

Examples:
  ./scripts/deploy.sh docker      # Deploy with Docker
  ./scripts/deploy.sh nixos       # Deploy on NixOS
  ./scripts/deploy.sh check       # Check readiness

For detailed deployment guides, see:
  - docs/deployment/DOCKER.md
  - docs/deployment/NIXOS.md

EOF
}

# Main
main() {
    if [ $# -eq 0 ]; then
        cmd_help
        exit 0
    fi

    case "$1" in
        docker)
            deploy_docker
            ;;
        nixos)
            deploy_nixos
            ;;
        systemd)
            deploy_systemd
            ;;
        manual)
            deploy_manual
            ;;
        check)
            check_production_ready
            ;;
        rollback)
            rollback
            ;;
        help|--help|-h)
            cmd_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Run './scripts/deploy.sh help' for usage"
            exit 1
            ;;
    esac
}

main "$@"
