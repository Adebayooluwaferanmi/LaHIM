#!/bin/bash

# Quick script to kill any process on port 3000

PORT=3000
PID=$(lsof -ti :$PORT 2>/dev/null)

if [ -z "$PID" ]; then
    echo "No process found on port $PORT"
    exit 0
fi

echo "Found process(es) on port $PORT: $PID"
echo "Killing process(es)..."

for pid in $PID; do
    kill $pid 2>/dev/null && echo "✅ Killed PID $pid" || echo "⚠️ Could not kill PID $pid (may need sudo: sudo kill -9 $pid)"
done

sleep 2

# Check if still running
REMAINING=$(lsof -ti :$PORT 2>/dev/null)
if [ -n "$REMAINING" ]; then
    echo "⚠️ Some processes still running. Force killing..."
    for pid in $REMAINING; do
        kill -9 $pid 2>/dev/null && echo "✅ Force killed PID $pid" || echo "❌ Could not kill PID $pid (may need sudo)"
    done
fi

# Final check
if lsof -ti :$PORT > /dev/null 2>&1; then
    echo "❌ Port $PORT is still in use. You may need to run: sudo kill -9 \$(lsof -ti :$PORT)"
    exit 1
else
    echo "✅ Port $PORT is now free!"
    exit 0
fi

