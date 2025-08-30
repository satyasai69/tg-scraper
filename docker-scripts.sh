#!/bin/bash

# Docker management scripts for Telegram Scraper
# Usage: ./docker-scripts.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
check_env() {
    if [ ! -f ".env" ]; then
        log_warning ".env file not found. Creating from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_info "Please edit .env file and add your BOT_TOKEN"
            return 1
        else
            log_error ".env.example not found. Please create .env file manually."
            return 1
        fi
    fi
    
    # Check if BOT_TOKEN is set
    if ! grep -q "BOT_TOKEN=.\+" .env; then
        log_error "BOT_TOKEN not set in .env file. Please add your Telegram bot token."
        return 1
    fi
    
    return 0
}

# Build the Docker image
build() {
    log_info "Building Docker image..."
    docker-compose build
    log_success "Docker image built successfully"
}

# Start the application in production mode
start() {
    if ! check_env; then
        return 1
    fi
    
    log_info "Starting Telegram Scraper in production mode..."
    docker-compose up -d
    
    # Wait a moment for the container to start
    sleep 5
    
    # Check if container is running
    if docker-compose ps | grep -q "Up"; then
        log_success "Application started successfully!"
        log_info "API available at: http://localhost:3000"
        log_info "Health check: http://localhost:3000/health"
        log_info "View logs with: ./docker-scripts.sh logs"
    else
        log_error "Failed to start application. Check logs with: ./docker-scripts.sh logs"
        return 1
    fi
}

# Start the application in development mode
dev() {
    if ! check_env; then
        return 1
    fi
    
    log_info "Starting Telegram Scraper in development mode..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
}

# Stop the application
stop() {
    log_info "Stopping Telegram Scraper..."
    docker-compose down
    log_success "Application stopped"
}

# Restart the application
restart() {
    log_info "Restarting Telegram Scraper..."
    stop
    start
}

# View logs
logs() {
    docker-compose logs -f
}

# Show status
status() {
    log_info "Container status:"
    docker-compose ps
    
    echo
    log_info "Resource usage:"
    docker stats --no-stream tg-scraper-app 2>/dev/null || log_warning "Container not running"
}

# Health check
health() {
    log_info "Checking application health..."
    
    if ! docker-compose ps | grep -q "Up"; then
        log_error "Container is not running"
        return 1
    fi
    
    # Test health endpoint
    if curl -s http://localhost:3000/health > /dev/null; then
        log_success "Application is healthy"
        curl -s http://localhost:3000/health | jq . 2>/dev/null || curl -s http://localhost:3000/health
    else
        log_error "Health check failed"
        return 1
    fi
}

# Clean up Docker resources
clean() {
    log_warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log_info "Cleaning up Docker resources..."
        docker-compose down -v --rmi all
        docker system prune -f
        log_success "Cleanup completed"
    else
        log_info "Cleanup cancelled"
    fi
}

# Update application
update() {
    log_info "Updating application..."
    git pull
    build
    restart
    log_success "Update completed"
}

# Show help
help() {
    echo "Docker management scripts for Telegram Scraper"
    echo
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  build     Build the Docker image"
    echo "  start     Start the application in production mode"
    echo "  dev       Start the application in development mode"
    echo "  stop      Stop the application"
    echo "  restart   Restart the application"
    echo "  logs      View application logs"
    echo "  status    Show container status and resource usage"
    echo "  health    Check application health"
    echo "  clean     Clean up Docker resources (removes everything)"
    echo "  update    Update application from git and restart"
    echo "  help      Show this help message"
    echo
    echo "Examples:"
    echo "  $0 start     # Start in production mode"
    echo "  $0 dev       # Start in development mode with hot reload"
    echo "  $0 logs      # View real-time logs"
    echo "  $0 health    # Check if application is running correctly"
}

# Main script logic
case "${1:-help}" in
    build)
        build
        ;;
    start)
        start
        ;;
    dev)
        dev
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    health)
        health
        ;;
    clean)
        clean
        ;;
    update)
        update
        ;;
    help|--help|-h)
        help
        ;;
    *)
        log_error "Unknown command: $1"
        echo
        help
        exit 1
        ;;
esac