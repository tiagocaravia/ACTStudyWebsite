#!/bin/bash

# Build script for deploying the ACT Study Website
# This script prepares the application for production deployment

set -e

echo "🔨 Building ACT Study Website for production..."

# Install backend dependencies if needed
if [ -f "backend/requirements.txt" ]; then
  echo "📦 Backend dependencies already in requirements.txt"
fi

# Install frontend dependencies and build
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "🏗️ Building frontend for production..."
npm run build

echo "✅ Build complete! Ready for deployment."
