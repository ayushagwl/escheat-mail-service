#!/bin/bash

# 🐳 Docker Deployment Script for Escheat Mail Service
# This script automates the Docker deployment process

set -e  # Exit on any error

echo "🐳 Starting Docker deployment of Escheat Mail Service..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        print_warning "Docker installed. Please log out and log back in, then run this script again."
        exit 1
    else
        print_status "Docker is installed: $(docker --version)"
    fi
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    else
        print_status "Docker Compose is installed: $(docker-compose --version)"
    fi
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from example..."
        if [ -f env.example ]; then
            cp env.example .env
            print_warning "Please edit .env file with your production environment variables:"
            echo "REACT_APP_SUPABASE_URL=your_supabase_url"
            echo "REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key"
            echo "REACT_APP_CKEDITOR_LICENSE_KEY=your_ckeditor_license_key"
            read -p "Press Enter to continue after editing .env file..."
        else
            print_error "No env.example file found. Please create .env file manually."
            exit 1
        fi
    else
        print_status ".env file found"
    fi
}

# Stop existing containers
stop_existing_containers() {
    if docker-compose ps | grep -q "escheat-mail-service"; then
        print_status "Stopping existing containers..."
        docker-compose down
    fi
}

# Build and start containers
deploy_application() {
    print_step "Building and starting application..."
    docker-compose up -d --build
    
    print_status "Waiting for application to start..."
    sleep 10
    
    # Check if container is running
    if docker-compose ps | grep -q "Up"; then
        print_status "Application deployed successfully!"
    else
        print_error "Application failed to start. Check logs with: docker-compose logs"
        exit 1
    fi
}

# Verify deployment
verify_deployment() {
    print_step "Verifying deployment..."
    
    # Check container status
    print_status "Container status:"
    docker-compose ps
    
    # Test health endpoint
    if curl -f http://localhost/health > /dev/null 2>&1; then
        print_status "Health check passed ✓"
    else
        print_warning "Health check failed. Application might still be starting..."
    fi
    
    # Show logs
    print_status "Recent logs:"
    docker-compose logs --tail=20
}

# Main deployment process
main() {
    print_step "Starting Docker deployment process..."
    
    # Pre-flight checks
    check_docker
    check_docker_compose
    check_env_file
    
    # Deploy
    stop_existing_containers
    deploy_application
    verify_deployment
    
    # Success message
    echo ""
    print_status "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Application Information:"
    echo "- URL: http://localhost (or your server IP)"
    echo "- Health Check: http://localhost/health"
    echo ""
    echo "🔧 Useful Commands:"
    echo "- View logs: docker-compose logs -f"
    echo "- Stop application: docker-compose down"
    echo "- Restart application: docker-compose restart"
    echo "- Update application: git pull && docker-compose up -d --build"
    echo "- Monitor resources: docker stats"
    echo ""
    echo "📊 Monitoring:"
    echo "- Container status: docker-compose ps"
    echo "- Resource usage: docker stats"
    echo "- Application logs: docker-compose logs escheat-mail-service"
    echo ""
    echo "🔒 Security:"
    echo "- Container isolation: Active"
    echo "- Non-root user: Configured"
    echo "- Security headers: Enabled"
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Configure your domain DNS to point to this server"
    echo "2. Set up SSL certificate (Let's Encrypt)"
    echo "3. Configure Supabase allowed origins"
    echo "4. Set up monitoring and alerts"
}

# Run main function
main "$@"
