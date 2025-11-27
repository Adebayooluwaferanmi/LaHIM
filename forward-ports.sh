#!/bin/bash
# Port forwarding script for HospitalRun/LaHIM
# This script uses ngrok to create public tunnels to your local services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}Error: ngrok is not installed.${NC}"
    echo "Install it from: https://ngrok.com/download"
    echo "Or install via package manager:"
    echo "  Ubuntu/Debian: sudo snap install ngrok"
    echo "  macOS: brew install ngrok/ngrok/ngrok"
    exit 1
fi

# Check if ngrok is authenticated
if [ ! -f ~/.ngrok2/ngrok.yml ] && [ -z "$NGROK_AUTHTOKEN" ]; then
    echo -e "${YELLOW}Warning: ngrok may not be authenticated.${NC}"
    echo "Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "Then run: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Port configuration
FRONTEND_PORT=${FRONTEND_PORT:-3001}
SERVER_PORT=${SERVER_PORT:-3000}
COUCHDB_PORT=${COUCHDB_PORT:-5984}

echo -e "${GREEN}Starting port forwarding...${NC}"
echo "Frontend: http://localhost:${FRONTEND_PORT}"
echo "Server: http://localhost:${SERVER_PORT}"
echo "CouchDB: http://localhost:${COUCHDB_PORT}"
echo ""

# Create ngrok config file
NGROK_CONFIG=$(mktemp)
cat > "$NGROK_CONFIG" <<EOF
version: "2"
authtoken: ${NGROK_AUTHTOKEN:-}
tunnels:
  frontend:
    addr: ${FRONTEND_PORT}
    proto: http
  server:
    addr: ${SERVER_PORT}
    proto: http
  couchdb:
    addr: ${COUCHDB_PORT}
    proto: http
EOF

# Start ngrok with config
echo -e "${GREEN}Starting ngrok tunnels...${NC}"
echo "Press Ctrl+C to stop"
echo ""

# Start ngrok in background
ngrok start --config "$NGROK_CONFIG" --all &
NGROK_PID=$!

# Wait a moment for ngrok to start
sleep 3

# Get public URLs from ngrok API
echo -e "${GREEN}Public URLs:${NC}"
echo "=================="

# Function to get tunnel URL
get_tunnel_url() {
    local tunnel_name=$1
    sleep 1
    curl -s http://localhost:4040/api/tunnels | \
        python3 -c "import sys, json; \
        tunnels = json.load(sys.stdin)['tunnels']; \
        tunnel = next((t for t in tunnels if '${tunnel_name}' in t['name']), None); \
        print(tunnel['public_url'] if tunnel else 'Not available')" 2>/dev/null || \
        echo "Check ngrok dashboard: http://localhost:4040"
}

FRONTEND_URL=$(get_tunnel_url frontend)
SERVER_URL=$(get_tunnel_url server)
COUCHDB_URL=$(get_tunnel_url couchdb)

echo -e "${GREEN}Frontend:${NC} ${FRONTEND_URL}"
echo -e "${GREEN}Server API:${NC} ${SERVER_URL}"
echo -e "${GREEN}CouchDB:${NC} ${COUCHDB_URL}"
echo ""
echo -e "${YELLOW}Note: Update your frontend .env file with the server URL:${NC}"
echo "REACT_APP_HOSPITALRUN_API=${SERVER_URL}"
echo ""
echo -e "${YELLOW}Access ngrok dashboard at:${NC} http://localhost:4040"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop forwarding...${NC}"

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping ngrok...${NC}"
    kill $NGROK_PID 2>/dev/null || true
    rm -f "$NGROK_CONFIG"
    echo -e "${GREEN}Port forwarding stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for ngrok process
wait $NGROK_PID


