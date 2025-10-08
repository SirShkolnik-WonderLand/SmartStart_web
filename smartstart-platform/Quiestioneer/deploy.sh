#!/bin/bash

# SMB Cyber Health Check - Deployment Script
# This script handles building and deploying the application

set -e  # Exit on any error

echo "🚀 Starting SMB Cyber Health Check deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "server/app.py" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Parse command line arguments
DEPLOY_ENV="production"
BUILD_FRONTEND=true
BUILD_DOCKER=false
DEPLOY_TARGET=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            DEPLOY_ENV="$2"
            shift 2
            ;;
        --no-frontend)
            BUILD_FRONTEND=false
            shift
            ;;
        --docker)
            BUILD_DOCKER=true
            shift
            ;;
        --target)
            DEPLOY_TARGET="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --env ENV        Deployment environment (production|staging) [default: production]"
            echo "  --no-frontend    Skip frontend build"
            echo "  --docker         Build Docker image"
            echo "  --target HOST    Deploy to specific host"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

print_status "Deployment environment: $DEPLOY_ENV"

# Step 1: Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.vite/
print_success "Cleanup completed"

# Step 2: Install dependencies
print_status "Installing frontend dependencies..."
npm ci
print_success "Frontend dependencies installed"

# Step 3: Build frontend
if [ "$BUILD_FRONTEND" = true ]; then
    print_status "Building frontend..."
    npm run build
    
    if [ ! -d "dist" ]; then
        print_error "Frontend build failed - dist directory not found"
        exit 1
    fi
    
    print_success "Frontend build completed"
else
    print_warning "Skipping frontend build"
fi

# Step 4: Install Python dependencies
print_status "Installing Python dependencies..."
cd server
pip install -r requirements.txt
cd ..
print_success "Python dependencies installed"

# Step 5: Security checks
print_status "Running security checks..."

# Check for common security issues
if grep -r "password.*=" . --include="*.py" --include="*.js" --include="*.ts" | grep -v "your-" | grep -v "example"; then
    print_warning "Potential hardcoded passwords found. Please review."
fi

# Check for debug statements in production
if [ "$DEPLOY_ENV" = "production" ]; then
    if grep -r "console.log\|print(" dist/ server/ 2>/dev/null; then
        print_warning "Debug statements found in production build"
    fi
fi

print_success "Security checks completed"

# Step 6: Build Docker image (if requested)
if [ "$BUILD_DOCKER" = true ]; then
    print_status "Building Docker image..."
    docker build -t smb-cyber-health-check:$DEPLOY_ENV .
    
    if [ $? -eq 0 ]; then
        print_success "Docker image built successfully"
    else
        print_error "Docker build failed"
        exit 1
    fi
fi

# Step 7: Deploy to target (if specified)
if [ -n "$DEPLOY_TARGET" ]; then
    print_status "Deploying to $DEPLOY_TARGET..."
    
    # Create deployment package
    tar -czf deployment.tar.gz dist/ server/ Dockerfile render.yaml env.example
    
    # Copy to server
    scp deployment.tar.gz $DEPLOY_TARGET:/tmp/
    ssh $DEPLOY_TARGET "cd /tmp && tar -xzf deployment.tar.gz && rm deployment.tar.gz"
    
    print_success "Deployment package sent to $DEPLOY_TARGET"
fi

# Step 8: Health check (if running locally)
if [ -z "$DEPLOY_TARGET" ] && [ "$BUILD_DOCKER" = false ]; then
    print_status "Starting local server for health check..."
    
    # Start server in background
    cd server
    python app.py &
    SERVER_PID=$!
    cd ..
    
    # Wait for server to start
    sleep 5
    
    # Health check
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "Health check passed - server is running"
    else
        print_error "Health check failed - server may not be running properly"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
    
    # Stop server
    kill $SERVER_PID 2>/dev/null || true
    print_success "Local health check completed"
fi

# Step 9: Generate deployment summary
print_status "Generating deployment summary..."

cat > deployment-summary.md << EOF
# Deployment Summary

**Date**: $(date)
**Environment**: $DEPLOY_ENV
**Frontend Build**: $BUILD_FRONTEND
**Docker Build**: $BUILD_DOCKER
**Deploy Target**: ${DEPLOY_TARGET:-"Local"}

## Files Deployed
- Frontend build: dist/
- Backend server: server/
- Docker configuration: Dockerfile
- Deployment config: render.yaml

## Next Steps
1. Configure environment variables
2. Set up SSL certificates (if needed)
3. Configure domain and DNS
4. Set up monitoring and logging
5. Test all endpoints

## Health Check
- Application: /health
- Frontend: /
- API docs: /docs

EOF

print_success "Deployment summary generated: deployment-summary.md"

# Final success message
echo ""
print_success "🎉 Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure your environment variables"
echo "2. Deploy to your hosting platform"
echo "3. Set up monitoring and SSL"
echo "4. Test the application"
echo ""
echo "For Render.com deployment:"
echo "- Push to your repository"
echo "- Connect to Render.com"
echo "- Configure environment variables"
echo "- Deploy!"
echo ""

if [ "$BUILD_DOCKER" = true ]; then
    echo "Docker commands:"
    echo "  Run: docker run -p 8000:8000 smb-cyber-health-check:$DEPLOY_ENV"
    echo "  Test: curl http://localhost:8000/health"
    echo ""
fi

print_success "Deployment script completed! 🚀"
