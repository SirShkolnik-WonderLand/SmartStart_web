#!/bin/bash

# Render-optimized build script
# This script is designed to minimize build time on Render

echo "🚀 Starting optimized build for Render..."

# Set environment variables for build optimization
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
export NEXT_PRIVATE_STANDALONE=true

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache

# Install dependencies with optimizations
echo "📦 Installing dependencies..."
npm ci --only=production --no-audit --no-fund --prefer-offline

# Run type checking (fast)
echo "🔍 Running type check..."
npx tsc --noEmit --skipLibCheck

# Run linting (fast)
echo "🔍 Running linting..."
npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0 --cache

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build complete!"
