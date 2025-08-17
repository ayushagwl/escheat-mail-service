# 🚀 Amazon Lightsail Deployment Guide

## Overview
This guide will help you deploy your Escheat Mail Service to Amazon Lightsail.

## Prerequisites
- AWS Account
- Lightsail instance (Ubuntu 20.04 LTS recommended)
- Domain name (optional but recommended)
- Supabase project configured

## Step 1: Create Lightsail Instance

### 1.1 Launch Instance
1. Go to AWS Lightsail Console
2. Click "Create instance"
3. Choose "Linux/Unix" platform
4. Select "Ubuntu 20.04 LTS"
5. Choose your preferred plan (at least 1GB RAM, 1 vCPU)
6. Name your instance (e.g., "escheat-mail-service")
7. Click "Create instance"

### 1.2 Configure Networking
1. Go to "Networking" tab
2. Add custom ports:
   - HTTP (80)
   - HTTPS (443)
   - SSH (22) - already open
3. Save changes

## Step 2: Connect to Your Instance

### 2.1 SSH Access
```bash
# Download the default key pair from Lightsail console
# Or use your own SSH key

# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip
```

### 2.2 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

## Step 3: Install Required Software

### 3.1 Install Node.js and npm
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3.2 Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3.3 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

## Step 4: Deploy Your Application

### 4.1 Clone Repository
```bash
# Navigate to web directory
cd /var/www

# Clone your repository
sudo git clone https://github.com/ayushagwl/escheat-mail-service.git
sudo chown -R ubuntu:ubuntu escheat-mail-service
cd escheat-mail-service
```

### 4.2 Install Dependencies
```bash
npm install
```

### 4.3 Build Application
```bash
npm run build
```

### 4.4 Configure Environment Variables
```bash
# Create production .env file
sudo nano .env

# Add your production environment variables:
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_CKEDITOR_LICENSE_KEY=your_ckeditor_license_key
```

### 4.5 Configure PM2
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'escheat-mail-service',
    script: 'serve',
    args: '-s build -l 3000',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Install serve globally
sudo npm install -g serve

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 5: Configure Nginx

### 5.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/escheat-mail-service
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS (optional)
    # return 301 https://$server_name$request_uri;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Serve static files directly
    location /static/ {
        alias /var/www/escheat-mail-service/build/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.2 Enable Site
```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/escheat-mail-service /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 6: SSL Certificate (Optional but Recommended)

### 6.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Step 7: Configure Supabase

### 7.1 Update Supabase Settings
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Add your production domain to allowed origins
4. Update RLS policies if needed

### 7.2 Environment Variables
Make sure your production environment variables are correctly set:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_CKEDITOR_LICENSE_KEY`

## Step 8: Monitoring and Maintenance

### 8.1 PM2 Commands
```bash
# Check application status
pm2 status

# View logs
pm2 logs escheat-mail-service

# Restart application
pm2 restart escheat-mail-service

# Monitor resources
pm2 monit
```

### 8.2 Nginx Commands
```bash
# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Reload Nginx configuration
sudo systemctl reload nginx
```

## Step 9: Backup and Updates

### 9.1 Backup Strategy
```bash
# Create backup script
cat > backup.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/escheat-mail-service"
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/escheat-mail-service

# Backup Nginx configuration
tar -czf $BACKUP_DIR/nginx_$DATE.tar.gz /etc/nginx/sites-available/escheat-mail-service

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh
```

### 9.2 Update Process
```bash
# Pull latest changes
cd /var/www/escheat-mail-service
git pull origin main

# Install dependencies
npm install

# Build application
npm run build

# Restart application
pm2 restart escheat-mail-service
```

## Troubleshooting

### Common Issues

1. **Application not loading**
   - Check PM2 status: `pm2 status`
   - Check logs: `pm2 logs escheat-mail-service`
   - Verify port 3000 is running: `netstat -tlnp | grep 3000`

2. **Nginx errors**
   - Check Nginx status: `sudo systemctl status nginx`
   - Test configuration: `sudo nginx -t`
   - Check logs: `sudo tail -f /var/log/nginx/error.log`

3. **Environment variables**
   - Verify .env file exists and has correct values
   - Restart PM2 after changing environment variables

4. **SSL issues**
   - Check certificate status: `sudo certbot certificates`
   - Renew if needed: `sudo certbot renew`

## Security Considerations

1. **Firewall Configuration**
   - Only open necessary ports (22, 80, 443)
   - Use AWS Security Groups

2. **Regular Updates**
   - Keep system packages updated
   - Regularly update Node.js and npm
   - Monitor for security patches

3. **Backup Strategy**
   - Regular backups of application and configuration
   - Test restore procedures

## Performance Optimization

1. **Nginx Caching**
   - Configure static file caching
   - Enable gzip compression

2. **PM2 Clustering**
   - Use multiple instances for better performance
   - Monitor resource usage

3. **CDN Integration**
   - Consider using CloudFront for global distribution
   - Cache static assets

## Support

For issues related to:
- **AWS Lightsail**: AWS Support
- **Application**: Check logs and GitHub issues
- **Supabase**: Supabase Support

---

**Note**: This guide assumes a basic deployment. For production environments, consider additional security measures, monitoring, and backup strategies.
