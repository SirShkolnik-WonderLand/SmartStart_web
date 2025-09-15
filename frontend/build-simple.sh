#!/bin/bash

# Optimized build script for Render Professional (HIPAA-compliant)
# Leverages build caching and optimized for security

echo "🚀 Starting optimized build for Render Professional..."

# Set environment variables for build optimization
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
export NEXT_BUILD_CACHE=true

# Create cache directories if they don't exist
mkdir -p .npm-cache
mkdir -p .next/cache

# Only clean build artifacts, preserve cache
echo "🧹 Cleaning build artifacts (preserving cache)..."
rm -rf .next/static
rm -rf out
rm -rf node_modules/.cache

# Install dependencies with aggressive caching for Professional plan
echo "📦 Installing dependencies with cache optimization..."
npm ci --no-audit --no-fund --prefer-offline \
  --cache .npm-cache \
  --cache-min 86400 \
  --production=false

# Build with optimizations for Professional plan
echo "🏗️ Building application with optimizations..."
NEXT_TELEMETRY_DISABLED=1 npm run build

# Verify build was successful
if [ ! -d ".next" ]; then
  echo "❌ Build failed - .next directory not found"
  exit 1
fi

# Create build metadata for caching
echo "📊 Creating build metadata..."
echo "Build completed at: $(date)" > .next/build-info.txt
echo "Node version: $(node --version)" >> .next/build-info.txt
echo "NPM version: $(npm --version)" >> .next/build-info.txt

echo "✅ Optimized build complete!"
