#!/bin/bash

# Mushroom Hunter PWA - Backend Startup Script

echo "🍄 Mushroom Hunter PWA - Starting Backend Server"
echo "================================================"

cd "$(dirname "$0")/backend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "Please edit .env with your database credentials!"
    exit 1
fi

echo "✅ Starting backend server..."
echo "Server will run on http://localhost:5000"
echo ""
npm run dev
