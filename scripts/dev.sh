#!/bin/bash
# Development helper script
# Quick commands for common development tasks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
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

# Command functions
cmd_setup() {
    print_header "Setting up development environment"

    # Copy developer config if config.js doesn't exist
    if [ ! -f "config.js" ]; then
        cp examples/developer-config.js config.js
        print_success "Copied developer config to config.js"
    else
        print_warning "config.js already exists, skipping"
    fi

    # Install npm dependencies if needed
    if [ -f "package.json" ]; then
        if [ ! -d "node_modules" ]; then
            echo "Installing npm dependencies..."
            npm install
            print_success "Dependencies installed"
        else
            print_success "Dependencies already installed"
        fi
    fi

    # Make scripts executable
    chmod +x start.sh verify.sh 2>/dev/null || true
    print_success "Made scripts executable"

    print_success "Development environment ready!"
}

cmd_start() {
    print_header "Starting development server"

    # Check if port 8000 is in use
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_error "Port 8000 is already in use"
        echo "Run './scripts/dev.sh stop' to kill existing server"
        exit 1
    fi

    echo "Starting web server on http://localhost:8000"
    python3 -m http.server 8000 &
    WEB_PID=$!
    echo $WEB_PID > .web.pid
    print_success "Web server started (PID: $WEB_PID)"

    # Ask if user wants to start AI Bridge
    echo ""
    read -p "Start AI Bridge? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -f "nixite-luminous-bridge.js" ]; then
            node nixite-luminous-bridge.js &
            BRIDGE_PID=$!
            echo $BRIDGE_PID > .bridge.pid
            print_success "AI Bridge started (PID: $BRIDGE_PID)"
        else
            print_error "nixite-luminous-bridge.js not found"
        fi
    fi

    echo ""
    print_success "Development server running at http://localhost:8000"
    echo "Press Ctrl+C to stop, or run './scripts/dev.sh stop'"
}

cmd_stop() {
    print_header "Stopping development servers"

    # Stop web server
    if [ -f ".web.pid" ]; then
        WEB_PID=$(cat .web.pid)
        if kill $WEB_PID 2>/dev/null; then
            print_success "Stopped web server (PID: $WEB_PID)"
        else
            print_warning "Web server not running"
        fi
        rm .web.pid
    else
        # Try to kill by port
        WEB_PID=$(lsof -ti:8000)
        if [ ! -z "$WEB_PID" ]; then
            kill $WEB_PID 2>/dev/null || true
            print_success "Stopped process on port 8000"
        else
            print_warning "No web server found"
        fi
    fi

    # Stop AI Bridge
    if [ -f ".bridge.pid" ]; then
        BRIDGE_PID=$(cat .bridge.pid)
        if kill $BRIDGE_PID 2>/dev/null; then
            print_success "Stopped AI Bridge (PID: $BRIDGE_PID)"
        else
            print_warning "AI Bridge not running"
        fi
        rm .bridge.pid
    fi
}

cmd_test() {
    print_header "Running tests"

    if [ ! -z "$1" ]; then
        # Run specific test
        case "$1" in
            config)
                npm run test:config
                ;;
            packages)
                npm run test:packages
                ;;
            *)
                print_error "Unknown test: $1"
                echo "Available: config, packages"
                exit 1
                ;;
        esac
    else
        # Run all tests
        npm test
    fi
}

cmd_verify() {
    print_header "Verifying installation"
    ./verify.sh
}

cmd_lint() {
    print_header "Linting code"

    # Check JSON files
    echo "Checking JSON files..."
    for file in *.json; do
        if [ -f "$file" ]; then
            if cat "$file" | jq . > /dev/null 2>&1; then
                print_success "$file"
            else
                print_error "$file has invalid JSON"
            fi
        fi
    done

    # Check JavaScript files
    echo ""
    echo "Checking JavaScript files..."
    for file in *.js; do
        if [ -f "$file" ]; then
            if node -c "$file" > /dev/null 2>&1; then
                print_success "$file"
            else
                print_error "$file has syntax errors"
            fi
        fi
    done

    print_success "Linting complete"
}

cmd_clean() {
    print_header "Cleaning temporary files"

    # Stop servers first
    cmd_stop > /dev/null 2>&1

    # Remove PID files
    rm -f .web.pid .bridge.pid
    print_success "Removed PID files"

    # Remove node_modules if requested
    if [ "$1" == "--all" ]; then
        if [ -d "node_modules" ]; then
            rm -rf node_modules
            print_success "Removed node_modules"
        fi
    fi

    print_success "Clean complete"
}

cmd_build() {
    print_header "Building project"

    # Run verification
    ./verify.sh || exit 1

    # Run tests
    npm test || exit 1

    print_success "Build successful"
}

cmd_docker() {
    print_header "Docker operations"

    case "$1" in
        build)
            docker build -t nixite:dev .
            print_success "Docker image built: nixite:dev"
            ;;
        run)
            docker run -d -p 8000:8000 --name nixite-dev nixite:dev
            print_success "Container started: nixite-dev"
            ;;
        stop)
            docker stop nixite-dev && docker rm nixite-dev
            print_success "Container stopped and removed"
            ;;
        compose)
            docker-compose up -d
            print_success "Docker Compose services started"
            ;;
        down)
            docker-compose down
            print_success "Docker Compose services stopped"
            ;;
        *)
            echo "Usage: ./scripts/dev.sh docker {build|run|stop|compose|down}"
            exit 1
            ;;
    esac
}

cmd_logs() {
    print_header "Viewing logs"

    case "$1" in
        web)
            journalctl -u nixite.service -f
            ;;
        bridge)
            journalctl -u nixite-bridge.service -f
            ;;
        docker)
            docker-compose logs -f
            ;;
        *)
            echo "Usage: ./scripts/dev.sh logs {web|bridge|docker}"
            exit 1
            ;;
    esac
}

cmd_status() {
    print_header "Service status"

    # Check web server
    echo "Web Server:"
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_success "Running on port 8000"
    else
        print_warning "Not running"
    fi

    # Check AI Bridge
    echo ""
    echo "AI Bridge:"
    if curl -s http://localhost:8890/health > /dev/null 2>&1; then
        print_success "Running on port 8890"
    else
        print_warning "Not running"
    fi

    # Check systemd services if on Linux
    if command -v systemctl &> /dev/null; then
        echo ""
        echo "Systemd Services:"
        if systemctl is-active --quiet nixite.service 2>/dev/null; then
            print_success "nixite.service active"
        else
            print_warning "nixite.service inactive"
        fi

        if systemctl is-active --quiet nixite-bridge.service 2>/dev/null; then
            print_success "nixite-bridge.service active"
        else
            print_warning "nixite-bridge.service inactive"
        fi
    fi
}

cmd_help() {
    cat << EOF
Nixite Development Helper

Usage: ./scripts/dev.sh <command> [options]

Commands:
  setup         Setup development environment
  start         Start development servers
  stop          Stop development servers
  test [name]   Run tests (all or specific: config, packages)
  verify        Verify installation
  lint          Lint code (JSON, JS)
  clean [--all] Clean temporary files (--all removes node_modules)
  build         Build and verify project
  docker        Docker operations: build, run, stop, compose, down
  logs          View logs: web, bridge, docker
  status        Check service status
  help          Show this help

Examples:
  ./scripts/dev.sh setup              # First-time setup
  ./scripts/dev.sh start              # Start dev servers
  ./scripts/dev.sh test config        # Run config tests
  ./scripts/dev.sh docker compose     # Start with Docker Compose
  ./scripts/dev.sh logs docker        # View Docker logs
  ./scripts/dev.sh status             # Check what's running

EOF
}

# Main
main() {
    if [ $# -eq 0 ]; then
        cmd_help
        exit 0
    fi

    case "$1" in
        setup)
            cmd_setup
            ;;
        start)
            cmd_start
            ;;
        stop)
            cmd_stop
            ;;
        test)
            cmd_test "$2"
            ;;
        verify)
            cmd_verify
            ;;
        lint)
            cmd_lint
            ;;
        clean)
            cmd_clean "$2"
            ;;
        build)
            cmd_build
            ;;
        docker)
            cmd_docker "$2"
            ;;
        logs)
            cmd_logs "$2"
            ;;
        status)
            cmd_status
            ;;
        help|--help|-h)
            cmd_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Run './scripts/dev.sh help' for usage"
            exit 1
            ;;
    esac
}

main "$@"
