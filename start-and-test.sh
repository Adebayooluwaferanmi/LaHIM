#!/bin/bash

# Quick Start and Test Script
# This script starts the server and runs tests

echo "=========================================="
echo "LaHIM - Start Server and Run Tests"
echo "=========================================="
echo ""

# Check if server is already running
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✓ Server is already running on port 3000"
    SERVER_RUNNING=true
else
    echo "Starting server..."
    SERVER_RUNNING=false
    
    # Start server in background
    cd /home/adbafem/Documents/LaHIM
    yarn dev:server > /tmp/lahim-server.log 2>&1 &
    SERVER_PID=$!
    
    echo "Server starting (PID: $SERVER_PID)..."
    echo "Waiting for server to be ready..."
    
    # Wait for server to start (max 30 seconds)
    for i in {1..30}; do
        if curl -s http://localhost:3000/health > /dev/null 2>&1; then
            echo "✓ Server is ready!"
            break
        fi
        sleep 1
        echo -n "."
    done
    echo ""
    
    if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo "✗ Server failed to start. Check /tmp/lahim-server.log"
        kill $SERVER_PID 2>/dev/null
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo "Running Tests"
echo "=========================================="
echo ""

# Run tests
node test-features.js

TEST_EXIT_CODE=$?

echo ""
echo "=========================================="
echo "Test Complete"
echo "=========================================="
echo ""

# If we started the server, offer to stop it
if [ "$SERVER_RUNNING" = false ]; then
    echo "Server is still running (PID: $SERVER_PID)"
    echo "To stop the server, run: kill $SERVER_PID"
    echo "Or check logs at: /tmp/lahim-server.log"
fi

exit $TEST_EXIT_CODE

