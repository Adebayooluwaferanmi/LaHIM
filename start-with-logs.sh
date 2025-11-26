#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== LaHIM Development Server with Logs ===${NC}"
echo ""
echo -e "${YELLOW}Starting Backend Server (port 3000)...${NC}"
echo -e "${BLUE}Backend logs will appear below:${NC}"
echo ""

# Start backend in background but show output
cd packages/server
npm run dev:start &
BACKEND_PID=$!

echo ""
echo -e "${YELLOW}Starting Frontend Server (port 3001)...${NC}"
echo -e "${BLUE}Frontend logs will appear below:${NC}"
echo ""

# Start frontend in background but show output  
cd ../frontend
yarn start &
FRONTEND_PID=$!

# Wait for both processes
echo ""
echo -e "${GREEN}✅ Both servers started!${NC}"
echo -e "${GREEN}Backend PID: $BACKEND_PID${NC}"
echo -e "${GREEN}Frontend PID: $FRONTEND_PID${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait
