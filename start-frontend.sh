#!/bin/bash
# ========================================
# CTRG Grant System - Frontend Startup Script (Mac/Linux/Windows Git Bash)
# ========================================
# This script starts the React development server
#
# Usage: ./start-frontend.sh

echo "=========================================="
echo "CTRG Grant System - Starting Frontend"
echo "=========================================="
echo ""

# Change to frontend directory
cd "$(dirname "$0")/frontend" || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed!"
    echo ""
    echo "Installing npm dependencies..."
    npm install
fi

# Start the development server
echo ""
echo "=========================================="
echo "✓ Starting React development server..."
echo "=========================================="
echo ""
echo "Frontend: http://localhost:5173/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
