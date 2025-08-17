# Multi-stage build for production React app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application with environment variables
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_SUPABASE_ANON_KEY
ARG REACT_APP_CKEDITOR_LICENSE_KEY

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom global nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx cache directories and set permissions
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/scgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/run/nginx && \
    chown -R nginx:nginx /var/cache/nginx \
    /var/run/nginx \
    /usr/share/nginx/html \
    /etc/nginx/nginx.conf

# Switch to nginx user
USER nginx

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
