#!/bin/bash

# Mushroom Hunter PWA - Frontend Startup Script

echo "🍄 Mushroom Hunter PWA - Starting Frontend"
echo "=========================================="

cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Starting frontend development server..."
echo "App will run on http://localhost:5173"
echo ""
echo "Login credentials:"
echo "  User: user@mushroomhunter.ch / user123"
echo "  Admin: admin@mushroomhunter.ch / admin123"
echo ""
npm run dev
