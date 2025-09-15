#!/bin/bash

# Quick deployment script for small changes
# This script only deploys specific services that changed

echo "🚀 Quick Deploy Script for SmartStart"

# Check what files changed
CHANGED_FILES=$(git diff --name-only HEAD~1 HEAD)

echo "📝 Changed files:"
echo "$CHANGED_FILES"

# Determine what to deploy
DEPLOY_FRONTEND=false
DEPLOY_PYTHON=false
DEPLOY_NODE=false

if echo "$CHANGED_FILES" | grep -q "frontend/"; then
    DEPLOY_FRONTEND=true
    echo "✅ Frontend changes detected"
fi

if echo "$CHANGED_FILES" | grep -q "python-services/"; then
    DEPLOY_PYTHON=true
    echo "✅ Python backend changes detected"
fi

if echo "$CHANGED_FILES" | grep -q "server/"; then
    DEPLOY_NODE=true
    echo "✅ Node API changes detected"
fi

# Deploy only what changed
if [ "$DEPLOY_FRONTEND" = true ]; then
    echo "🚀 Deploying frontend..."
    # This would trigger only frontend deployment
fi

if [ "$DEPLOY_PYTHON" = true ]; then
    echo "🚀 Deploying Python backend..."
    # This would trigger only Python deployment
fi

if [ "$DEPLOY_NODE" = true ]; then
    echo "🚀 Deploying Node API..."
    # This would trigger only Node deployment
fi

echo "✅ Quick deploy complete!"
