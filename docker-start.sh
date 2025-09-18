#!/bin/bash

# SmartStart Docker Management Script
# This script manages the complete Docker deployment

set -e

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to build all services
build_services() {
    print_status "Building all services..."
    docker-compose build --no-cache
    print_success "All services built successfully"
}

# Function to start all services
start_services() {
    print_status "Starting all services..."
    docker-compose up -d
    print_success "All services started"
}

# Function to stop all services
stop_services() {
    print_status "Stopping all services..."
    docker-compose down
    print_success "All services stopped"
}

# Function to restart all services
restart_services() {
    print_status "Restarting all services..."
    docker-compose restart
    print_success "All services restarted"
}

# Function to show logs
show_logs() {
    print_status "Showing logs for all services..."
    docker-compose logs -f
}

# Function to show status
show_status() {
    print_status "Service status:"
    docker-compose ps
}

# Function to clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    print_success "Cleanup completed"
}

# Function to initialize database
init_database() {
    print_status "Initializing database..."
    
    # Wait for PostgreSQL to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    until docker-compose exec postgres pg_isready -U smartstart_user -d smartstart_db; do
        sleep 2
    done
    
    # Run database migrations
    print_status "Running database migrations..."
    docker-compose exec python-brain python -c "
import sys
sys.path.append('/app')
from database_connector_direct import db
print('Database connection test:', db.test_connection())
"
    
    print_success "Database initialized"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    docker-compose exec python-brain python -m pytest tests/ || true
    print_success "Tests completed"
}

# Main script logic
case "${1:-start}" in
    "build")
        check_docker
        build_services
        ;;
    "start")
        check_docker
        build_services
        start_services
        init_database
        show_status
        print_success "SmartStart platform is running!"
        print_status "Frontend: http://localhost:3000"
        print_status "API: http://localhost:3001"
        print_status "Python Brain: http://localhost:5000"
        print_status "PostgreSQL: localhost:5432"
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        check_docker
        restart_services
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    "init-db")
        init_database
        ;;
    "test")
        run_tests
        ;;
    *)
        echo "Usage: $0 {build|start|stop|restart|logs|status|cleanup|init-db|test}"
        echo ""
        echo "Commands:"
        echo "  build     - Build all Docker images"
        echo "  start     - Build and start all services (default)"
        echo "  stop      - Stop all services"
        echo "  restart   - Restart all services"
        echo "  logs      - Show logs for all services"
        echo "  status    - Show service status"
        echo "  cleanup   - Clean up Docker resources"
        echo "  init-db   - Initialize database"
        echo "  test      - Run tests"
        exit 1
        ;;
esac
