#!/bin/bash

# SmartStart Live Development Environment
# This script starts the backend in Docker and frontend locally for live development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_dev() {
    echo -e "${PURPLE}[DEV]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to start backend services
start_backend() {
    print_status "Starting backend services in Docker..."
    docker-compose -f docker-compose.dev.yml up -d
    print_success "Backend services started"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for Python Brain
    print_status "Waiting for Python Brain..."
    until curl -s http://localhost:5002/health > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Python Brain is ready"
    
    # Wait for Node.js Proxy
    print_status "Waiting for Node.js Proxy..."
    until curl -s http://localhost:3001/health > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Node.js Proxy is ready"
}

# Function to start frontend locally
start_frontend() {
    print_status "Starting frontend in development mode..."
    
    # Check if frontend directory exists
    if [ ! -d "frontend" ]; then
        print_error "Frontend directory not found!"
        exit 1
    fi
    
    # Navigate to frontend directory
    cd frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    # Set environment variables for development
    export NEXT_PUBLIC_API_URL=http://localhost:3001
    export NEXT_PUBLIC_WS_URL=ws://localhost:3001
    export NEXT_PUBLIC_PYTHON_BRAIN_URL=http://localhost:5002
    export NODE_ENV=development
    
    print_dev "Starting Next.js development server..."
    print_dev "Frontend will be available at: http://localhost:3000"
    print_dev "Backend API: http://localhost:5002"
    print_dev "Proxy API: http://localhost:3001"
    
    # Start the development server
    npm run dev
}

# Function to show service status
show_status() {
    print_status "Service Status:"
    echo ""
    echo "🐳 Docker Services:"
    docker-compose -f docker-compose.dev.yml ps
    echo ""
    echo "🌐 URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:5002"
    echo "  Proxy API: http://localhost:3001"
    echo "  Database: localhost:5432"
    echo ""
}

# Function to stop all services
stop_all() {
    print_status "Stopping all services..."
    docker-compose -f docker-compose.dev.yml down
    print_success "All services stopped"
}

# Function to show logs
show_logs() {
    print_status "Showing Docker logs..."
    docker-compose -f docker-compose.dev.yml logs -f
}

# Function to restart backend
restart_backend() {
    print_status "Restarting backend services..."
    docker-compose -f docker-compose.dev.yml restart
    print_success "Backend services restarted"
}

# Function to test API
test_api() {
    print_status "Testing API endpoints..."
    
    echo "Testing Python Brain health..."
    curl -s http://localhost:5002/health | jq . || echo "Python Brain not responding"
    
    echo "Testing Node.js Proxy health..."
    curl -s http://localhost:3001/health | jq . || echo "Node.js Proxy not responding"
    
    echo "Testing registration..."
    curl -s -X POST http://localhost:5002/api/auth/register \
        -H "Content-Type: application/json" \
        -d '{"firstName":"Dev","lastName":"User","email":"dev@example.com","password":"devpass123"}' | jq . || echo "Registration failed"
}

# Main script logic
case "${1:-start}" in
    "start")
        check_docker
        start_backend
        wait_for_services
        show_status
        start_frontend
        ;;
    "backend")
        check_docker
        start_backend
        wait_for_services
        show_status
        ;;
    "frontend")
        start_frontend
        ;;
    "stop")
        stop_all
        ;;
    "restart")
        restart_backend
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "test")
        test_api
        ;;
    *)
        echo "SmartStart Live Development Environment"
        echo ""
        echo "Usage: $0 {start|backend|frontend|stop|restart|logs|status|test}"
        echo ""
        echo "Commands:"
        echo "  start     - Start backend in Docker + frontend locally (default)"
        echo "  backend   - Start only backend services in Docker"
        echo "  frontend  - Start only frontend locally"
        echo "  stop      - Stop all Docker services"
        echo "  restart   - Restart backend services"
        echo "  logs      - Show Docker logs"
        echo "  status    - Show service status"
        echo "  test      - Test API endpoints"
        echo ""
        echo "🌐 URLs:"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend API: http://localhost:5000"
        echo "  Proxy API: http://localhost:3001"
        echo "  Database: localhost:5432"
        exit 1
        ;;
esac
