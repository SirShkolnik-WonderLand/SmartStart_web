# 🚀 SmartStart Deployment Guide

> **Complete deployment guide for SmartStart platform**

## 📋 **Deployment Options**

SmartStart supports multiple deployment strategies:

1. **🚀 Render (Recommended)** - One-click deployment with free tier
2. **🐳 Docker** - Local development and production containers
3. **☁️ Cloud Platforms** - AWS, GCP, Azure, DigitalOcean
4. **🖥️ Self-Hosted** - VPS or dedicated server

## 🚀 **Option 1: Render (One-Click Deployment)**

### **Prerequisites**
- GitHub repository with SmartStart code
- Render account (free tier available)

### **Step 1: Prepare Your Repository**
```bash
# Ensure your repository has these files:
# - render.yaml (deployment blueprint)
# - package.json (pnpm workspaces)
# - prisma/schema.prisma (database schema)
# - apps/api/ (Express backend)
# - apps/web/ (Next.js frontend)
```

### **Step 2: Connect to Render**
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Blueprint Instance"
3. Connect your GitHub repository
4. Select the repository containing SmartStart

### **Step 3: Deploy**
1. Render will automatically detect the `render.yaml` blueprint
2. Click "Create Blueprint Instance"
3. Render will:
   - Create PostgreSQL database
   - Deploy API service
   - Deploy web service
   - Wire up environment variables
   - Run database migrations

### **Step 4: Access Your App**
- **Web App**: `https://your-app-name.onrender.com`
- **API**: `https://your-api-name.onrender.com`
- **Database**: Managed by Render

### **render.yaml Configuration**
```yaml
services:
  - type: web
    name: smartstart-web
    env: node
    rootDir: apps/web
    plan: free
    buildCommand: corepack enable && pnpm install && pnpm --filter @smartstart/web build
    startCommand: pnpm --filter @smartstart/web start
    envVars:
      - key: NEXT_PUBLIC_API_URL
        fromService:
          name: smartstart-api
          type: web
          property: url
    autoDeploy: true

  - type: web
    name: smartstart-api
    env: node
    rootDir: apps/api
    plan: free
    buildCommand: corepack enable && pnpm install && pnpm prisma:generate
    startCommand: pnpm prisma:migrate && pnpm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: smartstart-db
          property: connectionString
      - key: PORT
        value: 3001
      - key: SESSION_SECRET
        generateValue: true
      - key: NODE_ENV
        value: production
    autoDeploy: true

databases:
  - name: smartstart-db
    plan: free
    ipAllowList: []
```

## 🐳 **Option 2: Docker Deployment**

### **Prerequisites**
- Docker and Docker Compose installed
- Git repository cloned locally

### **Step 1: Build and Run**
```bash
# Clone repository
git clone https://github.com/yourusername/smartstart.git
cd smartstart

# Build and start services
docker compose up -d

# Check status
docker compose ps
```

### **Step 2: Access Services**
- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **Database**: localhost:5432

### **Step 3: Production Configuration**
```bash
# Create production environment file
cp env.example .env.prod

# Edit production settings
nano .env.prod

# Build production images
docker compose -f docker-compose.prod.yml up -d
```

### **Docker Compose Configuration**
```yaml
version: "3.9"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_DB: ${DB_NAME}
    ports: ["5432:5432"]
    volumes: [db-data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      PORT: 3001
      NODE_ENV: production
      SESSION_SECRET: ${SESSION_SECRET}
    ports: ["3001:3001"]
    command: sh -c "npx prisma migrate deploy && node apps/api/dist/index.js"

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      args:
        NEXT_PUBLIC_API_URL: http://localhost:3001
    depends_on: [api]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    ports: ["3000:3000"]

volumes:
  db-data:
```

## ☁️ **Option 3: Cloud Platform Deployment**

### **AWS Deployment**

#### **Using AWS ECS (Elastic Container Service)**
```bash
# Install AWS CLI
aws configure

# Create ECR repository
aws ecr create-repository --repository-name smartstart

# Build and push images
docker build -t smartstart-api apps/api/
docker build -t smartstart-web apps/web/

# Tag and push
docker tag smartstart-api:latest $AWS_ACCOUNT.dkr.ecr.$REGION.amazonaws.com/smartstart-api:latest
docker push $AWS_ACCOUNT.dkr.ecr.$REGION.amazonaws.com/smartstart-api:latest
```

#### **Using AWS App Runner**
1. Connect GitHub repository
2. Select Node.js runtime
3. Configure build commands
4. Set environment variables
5. Deploy automatically

### **Google Cloud Platform**

#### **Using Cloud Run**
```bash
# Install gcloud CLI
gcloud auth login

# Build and deploy
gcloud run deploy smartstart-api \
  --source apps/api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy smartstart-web \
  --source apps/web \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### **DigitalOcean App Platform**
1. Connect GitHub repository
2. Select Node.js environment
3. Configure build commands
4. Set environment variables
5. Deploy with one click

## 🖥️ **Option 4: Self-Hosted VPS**

### **Prerequisites**
- VPS with Ubuntu 20.04+
- Domain name (optional)
- SSH access

### **Step 1: Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 for process management
npm install -g pm2
```

### **Step 2: Database Setup**
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE smartstart;
CREATE USER smartstart_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE smartstart TO smartstart_user;
\q
```

### **Step 3: Application Deployment**
```bash
# Clone repository
git clone https://github.com/yourusername/smartstart.git
cd smartstart

# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate deploy

# Build applications
pnpm --filter @smartstart/api build
pnpm --filter @smartstart/web build

# Start with PM2
pm2 start apps/api/dist/index.js --name "smartstart-api"
pm2 start apps/web/.next/start.js --name "smartstart-web" -- --port 3000

# Save PM2 configuration
pm2 save
pm2 startup
```

### **Step 4: Nginx Configuration**
```nginx
# /etc/nginx/sites-available/smartstart
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/smartstart /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **Step 5: SSL with Let's Encrypt**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 **Environment Configuration**

### **Required Environment Variables**
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Security
SESSION_SECRET=your-super-secret-key-here

# API Configuration
PORT=3001
NODE_ENV=production

# Web Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### **Optional Environment Variables**
```bash
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Audit Logging
AUDIT_LOG_RETENTION_DAYS=365
ENABLE_AUDIT_LOGGING=true

# Feature Flags
ENABLE_RBAC=true
ENABLE_AUDIT_LOGGING=true
ENABLE_RATE_LIMITING=true

# Multi-tenant (future)
DEFAULT_TENANT_ID=default
ENABLE_MULTI_TENANCY=false
```

## 📊 **Monitoring & Health Checks**

### **Health Check Endpoints**
```bash
# Basic health check
GET /health
# Response: {"ok": true}

# Database connectivity check
GET /ready
# Response: {"ok": true, "database": "connected"}

# Detailed system status
GET /admin/status
# Response: {"status": "healthy", "services": {...}}
```

### **Logging Configuration**
```bash
# Enable structured logging
ENABLE_STRUCTURED_LOGGING=true
LOG_LEVEL=info

# Log to file
LOG_TO_FILE=true
LOG_FILE_PATH=/var/log/smartstart/

# Log to external service
LOG_TO_EXTERNAL=true
LOG_EXTERNAL_URL=https://logs.example.com
```

## 🔒 **Security Configuration**

### **Production Security Checklist**
- [ ] **HTTPS enabled** with valid SSL certificate
- [ ] **Session secret** is strong and unique
- [ ] **Rate limiting** configured appropriately
- [ ] **CORS** restricted to allowed origins
- [ ] **Security headers** enabled (Helmet)
- [ ] **Input validation** enabled (Zod)
- [ ] **SQL injection protection** (Prisma)
- [ ] **XSS protection** enabled
- [ ] **CSRF protection** configured
- [ ] **Audit logging** enabled

### **Security Headers**
```typescript
// Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 📈 **Performance Optimization**

### **Database Optimization**
```sql
-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_user_email ON "User"(email);
CREATE INDEX CONCURRENTLY idx_project_owner ON "Project"(ownerId);
CREATE INDEX CONCURRENTLY idx_contribution_project ON "Contribution"(projectId);

-- Enable query logging for optimization
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
```

### **Application Optimization**
```typescript
// Enable compression
import compression from 'compression';
app.use(compression());

// Enable caching
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));

// Database connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});
```

## 🔄 **Deployment Automation**

### **GitHub Actions Workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run tests
        run: pnpm test
        
      - name: Build applications
        run: pnpm build
        
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /opt/smartstart
            git pull origin main
            pnpm install
            pnpm prisma:generate
            pnpm prisma:migrate deploy
            pm2 restart all
```

### **Docker Hub Automation**
```yaml
# .github/workflows/docker.yml
name: Build and Push Docker Images

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_TOKEN }}
          
      - name: Build and push API
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./apps/api/Dockerfile
          push: true
          tags: yourusername/smartstart-api:latest
          
      - name: Build and push Web
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./apps/web/Dockerfile
          push: true
          tags: yourusername/smartstart-web:latest
```

## 🧪 **Post-Deployment Testing**

### **Health Check Script**
```bash
#!/bin/bash
# health-check.sh

API_URL="https://your-api-domain.com"
WEB_URL="https://your-web-domain.com"

echo "🔍 Checking SmartStart deployment..."

# Check API health
echo "📡 API Health Check..."
API_RESPONSE=$(curl -s "$API_URL/health")
if [[ $API_RESPONSE == *"ok"* ]]; then
    echo "✅ API is healthy"
else
    echo "❌ API health check failed"
    exit 1
fi

# Check database connectivity
echo "🗄️ Database Connectivity..."
DB_RESPONSE=$(curl -s "$API_URL/ready")
if [[ $DB_RESPONSE == *"connected"* ]]; then
    echo "✅ Database is connected"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Check web app
echo "🌐 Web App Check..."
WEB_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$WEB_URL")
if [[ $WEB_RESPONSE == "200" ]]; then
    echo "✅ Web app is responding"
else
    echo "❌ Web app check failed (HTTP $WEB_RESPONSE)"
    exit 1
fi

echo "🎉 All systems are healthy!"
```

### **Load Testing**
```bash
# Install Artillery
npm install -g artillery

# Create load test configuration
cat > load-test.yml << EOF
config:
  target: 'https://your-api-domain.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "API endpoints"
    weight: 100
    requests:
      - get:
          url: "/health"
      - get:
          url: "/ready"
      - post:
          url: "/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
EOF

# Run load test
artillery run load-test.yml
```

## 🆘 **Troubleshooting**

### **Common Issues**

#### **Database Connection Failed**
```bash
# Check database status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U postgres -d smartstart

# Check logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### **Application Won't Start**
```bash
# Check logs
pm2 logs smartstart-api
pm2 logs smartstart-web

# Check process status
pm2 status

# Restart services
pm2 restart all
```

#### **Build Failures**
```bash
# Clear node modules
rm -rf node_modules
rm -rf apps/*/node_modules

# Clear cache
pnpm store prune

# Reinstall
pnpm install

# Rebuild
pnpm build
```

### **Performance Issues**
```bash
# Check database performance
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

# Check application memory usage
pm2 monit

# Check system resources
htop
iostat -x 1
```

## 📚 **Additional Resources**

- [RBAC System Guide](./RBAC_SYSTEM.md)
- [API Documentation](./API_DOCS.md)
- [Quick Start Guide](./QUICKSTART.md)
- [Database Schema](../prisma/schema.prisma)

---

**SmartStart Deployment Guide** - Get your platform running in production! 🚀
