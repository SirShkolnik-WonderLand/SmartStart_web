#!/bin/bash

# Simple build script for Render
# This script focuses on getting the build working without type checking

echo "🚀 Starting simple build for Render..."

# Set environment variables for build optimization
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache

# Install all dependencies with caching
echo "📦 Installing dependencies..."
npm ci --no-audit --no-fund --prefer-offline --cache .npm-cache

# Build the application (skip type checking and optimize)
echo "🏗️ Building application..."
NEXT_TELEMETRY_DISABLED=1 npm run build -- --no-lint

# Verify build was successful
if [ ! -d ".next" ]; then
  echo "❌ Build failed - .next directory not found"
  exit 1
fi

echo "✅ Build complete!"
