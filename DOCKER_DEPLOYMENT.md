# 🐳 Docker Deployment Guide - Escheat Mail Service

## Why Docker is Better

### ✅ Advantages of Docker Deployment:

1. **Consistency**: Same environment across development, staging, and production
2. **Isolation**: Application runs in its own container, no conflicts with system packages
3. **Portability**: Deploy anywhere Docker runs (AWS, GCP, Azure, DigitalOcean, etc.)
4. **Scalability**: Easy horizontal scaling with multiple containers
5. **Version Control**: Exact version control of your application and dependencies
6. **Rollback**: Quick rollback to previous versions
7. **Resource Efficiency**: Smaller footprint than traditional VMs
8. **Security**: Isolated environment with minimal attack surface

## 🚀 Quick Docker Deployment

### Prerequisites
- Docker installed on your server
- Docker Compose installed
- Git access to your repository

## 🔧 Environment Variables in Docker

### How Environment Variables Work:
1. **Build-time**: Variables are embedded in the React build during Docker build
2. **Runtime**: Variables are available to the application
3. **Security**: `.env` file stays on host, not in container

### Required Environment Variables:
```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# CKEditor License Key
REACT_APP_CKEDITOR_LICENSE_KEY=your_ckeditor_license_key_here
```

### Step 1: Clone and Deploy
```bash
# Clone your repository
git clone https://github.com/ayushagwl/escheat-mail-service.git
cd escheat-mail-service

# Create environment file
cp env.example .env
# Edit .env with your production values

# Build and start with Docker Compose
docker-compose up -d --build
```

### Step 2: Verify Deployment
```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs -f escheat-mail-service

# Test health endpoint
curl http://localhost/health
```

## 🏗️ Detailed Docker Setup

### 1. Dockerfile Explanation

Our Dockerfile uses a **multi-stage build** approach:

```dockerfile
# Stage 1: Build the React application
FROM node:18-alpine AS builder
# ... build steps

# Stage 2: Production with Nginx
FROM nginx:alpine
# ... production setup
```

**Benefits:**
- Smaller final image (no Node.js in production)
- Better security (minimal attack surface)
- Faster builds (layer caching)

### 2. Docker Compose Features

```yaml
services:
  escheat-mail-service:
    build: .
    ports:
      - "80:80"
      - "443:443"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
```

**Features:**
- Automatic restart on failure
- Health checks
- Volume mounting for logs
- Network isolation

## 🌐 Deployment Options

### Option 1: Amazon Lightsail with Docker

```bash
# Connect to your Lightsail instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Deploy your application
git clone https://github.com/ayushagwl/escheat-mail-service.git
cd escheat-mail-service
docker-compose up -d --build
```

### Option 2: AWS EC2 with Docker

```bash
# Same Docker installation as above
# Then deploy with Docker Compose
```

### Option 3: DigitalOcean Droplet

```bash
# DigitalOcean provides Docker images
# Deploy directly with Docker Compose
```

### Option 4: Google Cloud Run (Serverless)

```bash
# Build and push to Google Container Registry
docker build -t gcr.io/your-project/escheat-mail-service .
docker push gcr.io/your-project/escheat-mail-service

# Deploy to Cloud Run
gcloud run deploy escheat-mail-service \
  --image gcr.io/your-project/escheat-mail-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 🔧 Docker Management Commands

### Basic Operations
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart escheat-mail-service

# Update and rebuild
docker-compose up -d --build
```

### Monitoring
```bash
# Check container status
docker-compose ps

# Monitor resource usage
docker stats

# View container details
docker inspect escheat-mail-service

# Execute commands in container
docker-compose exec escheat-mail-service sh
```

### Maintenance
```bash
# Clean up unused images
docker image prune -a

# Clean up unused volumes
docker volume prune

# Clean up everything
docker system prune -a
```

## 🔒 Security Best Practices

### 1. Non-Root User
```dockerfile
# Create non-root user
RUN adduser -S nextjs -u 1001
USER nextjs
```

### 2. Security Headers
```nginx
# Security headers in nginx.conf
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### 3. Environment Variables
```bash
# Use .env file for sensitive data
# Never commit .env to version control
```

### 4. Image Scanning
```bash
# Scan for vulnerabilities
docker scan escheat-mail-service
```

## 📊 Performance Optimization

### 1. Multi-Stage Build
- Reduces final image size by 80%
- Faster deployment times

### 2. Nginx Optimization
```nginx
# Gzip compression
gzip on;
gzip_types text/plain text/css application/javascript;

# Static asset caching
location ~* \.(js|css|png|jpg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Health Checks
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /var/www/escheat-mail-service
            git pull origin main
            docker-compose up -d --build
```

## 🚨 Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   # Check logs
   docker-compose logs escheat-mail-service
   
   # Check if port is in use
   netstat -tlnp | grep :80
   ```

2. **Build fails**
   ```bash
   # Clean build cache
   docker-compose build --no-cache
   
   # Check Dockerfile syntax
   docker build --dry-run .
   ```

3. **Environment variables not working**
   ```bash
   # Check if .env file exists
   ls -la .env
   
   # Verify environment in container
   docker-compose exec escheat-mail-service env
   ```

4. **Performance issues**
   ```bash
   # Monitor resource usage
   docker stats
   
   # Check nginx logs
   docker-compose exec escheat-mail-service tail -f /var/log/nginx/access.log
   ```

## 📈 Scaling with Docker

### Horizontal Scaling
```bash
# Scale to multiple instances
docker-compose up -d --scale escheat-mail-service=3
```

### Load Balancer Setup
```yaml
# Add load balancer service
services:
  nginx-lb:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    depends_on:
      - escheat-mail-service
```

## 💰 Cost Comparison

### Traditional Deployment vs Docker

| Aspect | Traditional | Docker |
|--------|-------------|--------|
| **Setup Time** | 30-60 minutes | 5-10 minutes |
| **Environment Consistency** | Manual | Automatic |
| **Scaling** | Complex | Simple |
| **Rollback** | Manual | One command |
| **Resource Usage** | Higher | Lower |
| **Maintenance** | More complex | Simpler |

## 🎯 Recommendation

**Docker is definitely the better choice** for your Escheat Mail Service because:

1. **Faster Deployment**: 5 minutes vs 30+ minutes
2. **Better Reliability**: Consistent environments
3. **Easier Scaling**: Simple horizontal scaling
4. **Better Security**: Isolated containers
5. **Simpler Maintenance**: One-command updates
6. **Portability**: Deploy anywhere Docker runs

## 🚀 Next Steps

1. **Choose your deployment platform** (Lightsail, EC2, DigitalOcean, etc.)
2. **Set up Docker** on your server
3. **Deploy with Docker Compose**
4. **Configure SSL** and domain
5. **Set up monitoring** and alerts

---

**Ready to deploy?** Start with the Quick Docker Deployment section above!
