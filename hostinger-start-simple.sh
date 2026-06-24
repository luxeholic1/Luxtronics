#!/usr/bin/env bash
# Simple startup script for Hostinger without PM2
# Works with basic Node.js

echo "🚀 Starting Luxtronics Backend..."

# Kill any existing node processes
echo "Stopping old processes..."
pkill -9 node 2>/dev/null || true
sleep 2

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if server.js exists
if [ ! -f "server.js" ]; then
    echo "❌ server.js not found in current directory!"
    echo "Current directory: $(pwd)"
    echo "Please cd to the correct directory first."
    exit 1
fi

# Start server in background
echo "Starting server on port 3001..."
nohup node server.js > server.log 2>&1 &

# Get the PID
SERVER_PID=$!
echo "✅ Server started with PID: $SERVER_PID"

# Wait a moment
sleep 3

# Check if process is still running
if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "✅ Server is running!"
    echo "📝 Logs: tail -f server.log"
    echo "🛑 Stop: kill $SERVER_PID"
    echo ""
    echo "Testing server..."
    curl -s http://localhost:3001/health || echo "⚠️ Health check failed (may need more time)"
else
    echo "❌ Server failed to start! Check server.log for errors:"
    tail -20 server.log
    exit 1
fi

# Save PID to file
echo $SERVER_PID > .server.pid
echo "PID saved to .server.pid"
