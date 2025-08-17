#!/bin/bash

# 🚀 Escheat Mail Service Deployment Script
# This script automates the deployment process to Amazon Lightsail

set -e  # Exit on any error

echo "🚀 Starting deployment of Escheat Mail Service..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    print_status "Node.js already installed: $(node --version)"
fi

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null; then
    print_status "Installing Nginx..."
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
else
    print_status "Nginx already installed"
fi

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
else
    print_status "PM2 already installed"
fi

# Install serve if not already installed
if ! command -v serve &> /dev/null; then
    print_status "Installing serve..."
    sudo npm install -g serve
else
    print_status "serve already installed"
fi

# Create logs directory
mkdir -p logs

# Install dependencies
print_status "Installing npm dependencies..."
npm install

# Build the application
print_status "Building the application..."
npm run build

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Please create it with your environment variables:"
    echo "REACT_APP_SUPABASE_URL=your_supabase_url"
    echo "REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo "REACT_APP_CKEDITOR_LICENSE_KEY=your_ckeditor_license_key"
    read -p "Press Enter to continue after creating .env file..."
fi

# Stop existing PM2 process if running
if pm2 list | grep -q "escheat-mail-service"; then
    print_status "Stopping existing PM2 process..."
    pm2 stop escheat-mail-service
    pm2 delete escheat-mail-service
fi

# Start application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup

print_status "Deployment completed successfully!"
print_status "Your application is now running on port 3000"
print_status "Use 'pm2 status' to check application status"
print_status "Use 'pm2 logs escheat-mail-service' to view logs"

# Display next steps
echo ""
echo "📋 Next Steps:"
echo "1. Configure Nginx (see DEPLOYMENT.md for details)"
echo "2. Set up SSL certificate with Certbot"
echo "3. Configure your domain DNS"
echo "4. Update Supabase allowed origins"
echo ""
echo "🔧 Useful Commands:"
echo "- Check status: pm2 status"
echo "- View logs: pm2 logs escheat-mail-service"
echo "- Restart app: pm2 restart escheat-mail-service"
echo "- Monitor: pm2 monit"
