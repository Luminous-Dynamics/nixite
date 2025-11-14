#!/usr/bin/env bash

# Nixite Startup Script
# Launches all necessary services for Nixite

set -e

echo "🚀 Starting Nixite..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Python 3 not found. Please install Python 3 to run Nixite.${NC}"
    exit 1
fi

# Check if Node.js is available (optional for AI features)
NODE_AVAILABLE=false
if command -v node &> /dev/null; then
    NODE_AVAILABLE=true
    echo -e "${GREEN}✓${NC} Node.js found - AI features will be available"
else
    echo -e "${YELLOW}⚠️  Node.js not found - AI features will be disabled${NC}"
    echo "  Install Node.js to enable AI-powered recommendations"
fi

echo ""
echo "Starting services..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down services..."
    jobs -p | xargs -r kill 2>/dev/null
    echo "✓ All services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Start web server
echo -e "${BLUE}📡 Starting web server on port 8000...${NC}"
python3 -m http.server 8000 &
WEB_PID=$!

# Wait a moment for server to start
sleep 1

# Check if web server started successfully
if ! ps -p $WEB_PID > /dev/null; then
    echo -e "${YELLOW}⚠️  Failed to start web server${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Web server running at http://localhost:8000"

# Start AI bridge if Node.js is available
if [ "$NODE_AVAILABLE" = true ]; then
    echo ""
    echo -e "${BLUE}🤖 Starting AI bridge on port 8890...${NC}"
    node nixite-luminous-bridge.js &
    BRIDGE_PID=$!

    # Wait a moment for bridge to start
    sleep 2

    # Check if bridge started successfully
    if ps -p $BRIDGE_PID > /dev/null; then
        echo -e "${GREEN}✓${NC} AI bridge running at http://localhost:8890"
    else
        echo -e "${YELLOW}⚠️  AI bridge failed to start (HRM backend may not be available)${NC}"
        echo "  Nixite will use fallback knowledge base mode"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ Nixite is ready!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Open your browser to:"
echo "   http://localhost:8000"
echo ""
echo "Features available:"
echo "  ✓ Visual package browsing"
echo "  ✓ Search functionality"
echo "  ✓ Voice input (browser-dependent)"
if [ "$NODE_AVAILABLE" = true ]; then
    echo "  ✓ AI-powered recommendations"
fi
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running and wait for services
wait
