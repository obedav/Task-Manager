# 🚀 Production Deployment Guide

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)
- MongoDB Atlas account (for production database)
- Domain name with SSL certificate
- Deployment platform account (Railway, Heroku, Vercel, etc.)

## 🔧 Environment Setup

### Backend Environment Variables

Create `backend/.env` with the following variables:

```bash
# Production Environment
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here-minimum-32-characters
JWT_EXPIRE=30d
JWT_REFRESH_SECRET=your-refresh-token-secret-key-here
JWT_REFRESH_EXPIRE=7d

# Security
BCRYPT_SALT_ROUNDS=12

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### Frontend Environment Variables

Create `frontend/.env.production` with:

```bash
# Production Environment
VITE_ENVIRONMENT=production
VITE_API_URL=https://your-backend-domain.com/api
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=TaskFlow

# Analytics (optional)
VITE_GA_TRACKING_ID=your-google-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
```

## 🐳 Docker Deployment

### 1. Build and Deploy with Docker Compose

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 2. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: taskflow-backend-prod
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: ${MONGODB_URI}
      JWT_SECRET: ${JWT_SECRET}
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}
    ports:
      - "5000:5000"
    networks:
      - taskflow-network
    healthcheck:
      test: ["CMD", "node", "scripts/health-check.js"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: taskflow-frontend-prod
    restart: unless-stopped
    environment:
      VITE_ENVIRONMENT: production
      VITE_API_URL: ${VITE_API_URL}
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - taskflow-network

networks:
  taskflow-network:
    driver: bridge
```

## ☁️ Platform-Specific Deployment

### Railway Deployment

#### Backend
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy from `backend` directory
4. Set build command: `npm install && npm start`

#### Frontend
1. Create new service in Railway
2. Set environment variables
3. Deploy from `frontend` directory
4. Set build command: `npm run build:production`
5. Set start command: `npm start`

### Heroku Deployment

#### Backend
```bash
# Create Heroku app
heroku create your-taskflow-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set ALLOWED_ORIGINS=https://your-frontend-domain.com

# Deploy
git subtree push --prefix backend heroku main
```

#### Frontend
```bash
# Create Heroku app
heroku create your-taskflow-frontend

# Set buildpacks
heroku buildpacks:set heroku/nodejs
heroku buildpacks:add heroku/static

# Set environment variables
heroku config:set VITE_ENVIRONMENT=production
heroku config:set VITE_API_URL=https://your-backend-domain.com/api

# Deploy
git subtree push --prefix frontend heroku main
```

### Vercel Deployment

#### Frontend
1. Connect GitHub repository to Vercel
2. Set root directory to `frontend`
3. Set build command: `npm run build:production`
4. Set output directory: `dist`
5. Configure environment variables

## 🔒 Security Checklist

- [ ] HTTPS enabled on all domains
- [ ] Strong JWT secrets (32+ characters)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Database connection secured
- [ ] Environment variables not exposed
- [ ] Error logging configured
- [ ] Health checks implemented

## 📊 Monitoring Setup

### Health Checks
```bash
# Backend health check
curl https://your-backend-domain.com/api/health

# Frontend health check
curl https://your-frontend-domain.com/health
```

### Logging
- Set up centralized logging (e.g., Papertrail, Loggly)
- Configure error reporting (Sentry)
- Monitor application metrics

### Performance
- Set up CDN for static assets
- Enable gzip compression
- Monitor Core Web Vitals
- Set up uptime monitoring

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `ALLOWED_ORIGINS` environment variable
   - Verify frontend domain is included

2. **Database Connection**
   - Verify MongoDB URI format
   - Check network connectivity
   - Ensure database user has proper permissions

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

4. **Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify variable values are correct

### Debug Commands

```bash
# Check environment variables
node scripts/check-env.js

# Test database connection
node scripts/health-check.js

# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check container status
docker-compose ps
```

## 📈 Post-Deployment

1. **Test all functionality**
   - User registration/login
   - Task CRUD operations
   - Settings and preferences
   - Mobile responsiveness

2. **Performance testing**
   - Load testing with tools like Artillery
   - Monitor response times
   - Check memory usage

3. **Security audit**
   - Run security scans
   - Check for vulnerabilities
   - Verify SSL configuration

4. **Backup strategy**
   - Set up database backups
   - Configure automated backups
   - Test restore procedures

## 🔄 CI/CD Pipeline

Consider setting up automated deployment:

1. **GitHub Actions** for automated testing
2. **Docker Hub** for image registry
3. **Automated deployment** on push to main branch
4. **Rollback procedures** for quick recovery

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review application logs
3. Verify environment configuration
4. Test locally with Docker Compose 