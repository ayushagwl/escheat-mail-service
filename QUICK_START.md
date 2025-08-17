# ⚡ Quick Start Guide - Amazon Lightsail Deployment

## Prerequisites Checklist
- [ ] AWS Account with Lightsail access
- [ ] Domain name (optional but recommended)
- [ ] Supabase project configured
- [ ] SSH key pair ready

## 🚀 5-Minute Deployment

### Step 1: Create Lightsail Instance
1. Go to [AWS Lightsail Console](https://console.aws.amazon.com/lightsail/)
2. Click "Create instance"
3. Choose:
   - **Platform**: Linux/Unix
   - **OS**: Ubuntu 20.04 LTS
   - **Plan**: At least 1GB RAM, 1 vCPU ($5/month)
   - **Name**: `escheat-mail-service`
4. Click "Create instance"

### Step 2: Configure Networking
1. Go to "Networking" tab
2. Add ports:
   - HTTP (80)
   - HTTPS (443)
3. Save changes

### Step 3: Connect and Deploy
```bash
# Connect to your instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Clone your repository
cd /var/www
sudo git clone https://github.com/ayushagwl/escheat-mail-service.git
sudo chown -R ubuntu:ubuntu escheat-mail-service
cd escheat-mail-service

# Run the automated deployment script
./deploy.sh
```

### Step 4: Configure Environment Variables
```bash
# Create .env file
nano .env

# Add your production environment variables:
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
REACT_APP_CKEDITOR_LICENSE_KEY=your_license_key_here
```

### Step 5: Configure Nginx
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/escheat-mail-service
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
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
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/escheat-mail-service /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: SSL Certificate (Optional)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## ✅ Verification

### Check Application Status
```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Test application
curl http://localhost:3000
```

### Access Your Application
- **IP Address**: `http://your-instance-ip`
- **Domain**: `https://your-domain.com` (after SSL setup)

## 🔧 Common Commands

### Application Management
```bash
# Check status
pm2 status

# View logs
pm2 logs escheat-mail-service

# Restart application
pm2 restart escheat-mail-service

# Monitor resources
pm2 monit
```

### Nginx Management
```bash
# Check status
sudo systemctl status nginx

# Reload configuration
sudo systemctl reload nginx

# View logs
sudo tail -f /var/log/nginx/access.log
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
npm install
npm run build
pm2 restart escheat-mail-service
```

## 🚨 Troubleshooting

### Application Not Loading
```bash
# Check if app is running
pm2 status

# Check logs
pm2 logs escheat-mail-service

# Check port
netstat -tlnp | grep 3000
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### Environment Variables
```bash
# Check if .env exists
ls -la .env

# Restart after changing .env
pm2 restart escheat-mail-service
```

## 📞 Support

- **AWS Lightsail**: [AWS Support](https://aws.amazon.com/support/)
- **Application Issues**: Check GitHub issues
- **Supabase**: [Supabase Support](https://supabase.com/support)

---

**Need Help?** Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
