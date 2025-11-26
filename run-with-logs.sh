#!/bin/bash

# LaHIM Development Server Runner with Visible Logs
# This script starts both backend and frontend servers with visible terminal output

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    pkill -f "node.*dist/index.js" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   LaHIM Development Server - Running with Live Logs     ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if backend is built
if [ ! -d "packages/server/dist" ]; then
    echo -e "${YELLOW}Building backend...${NC}"
    cd packages/server
    npm run build
    cd ../..
fi

# Start Backend
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Starting Backend Server (port 3000)...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cd packages/server
npm run dev:start 2>&1 | sed 's/^/[BACKEND] /' &
BACKEND_PID=$!
cd ../..

sleep 2

# Start Frontend
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Starting Frontend Server (port 3001)...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cd packages/frontend
yarn start 2>&1 | sed 's/^/[FRONTEND] /' &
FRONTEND_PID=$!
cd ../..

echo ""
echo -e "${GREEN}✅ Both servers started!${NC}"
echo ""
echo -e "${GREEN}Backend PID:${NC} $BACKEND_PID"
echo -e "${GREEN}Frontend PID:${NC} $FRONTEND_PID"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🌐 Access the application:${NC}"
echo -e "   Frontend: ${YELLOW}http://localhost:3001${NC}"
echo -e "   Backend API: ${YELLOW}http://localhost:3000${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}All logs will appear below. Press Ctrl+C to stop both servers.${NC}"
echo ""

# Wait for both processes
wait

