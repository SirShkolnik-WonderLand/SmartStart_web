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

# Install all dependencies (including dev dependencies for build)
echo "📦 Installing dependencies..."
npm ci --no-audit --no-fund --prefer-offline

# Run type checking (fast)
echo "🔍 Running type check..."
npx tsc --noEmit --skipLibCheck

# Run linting (fast) - skip if eslint config is missing
echo "🔍 Running linting..."
if [ -f "eslint.config.mjs" ] || [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
  npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0 --cache || echo "⚠️ Linting failed, continuing with build..."
else
  echo "⚠️ No ESLint config found, skipping linting..."
fi

# Build the application
echo "🏗️ Building application..."
npm run build

# Verify build was successful
if [ ! -d ".next" ]; then
  echo "❌ Build failed - .next directory not found"
  exit 1
fi

echo "✅ Build complete!"
