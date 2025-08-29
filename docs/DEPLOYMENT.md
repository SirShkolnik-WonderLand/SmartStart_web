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

### **render.yaml Configuration (Latest)**
```yaml
services:
  - type: web
    name: smartstart-web
    env: node
    rootDir: apps/web
    plan: free
    buildCommand: |
      corepack enable
      pnpm install --frozen-lockfile
      pnpm --filter @smartstart/web build
    startCommand: pnpm --filter @smartstart/web start
    healthCheckPath: /
    envVars:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_API_URL
        fromService:
          name: smartstart-api
          type: web
          property: url
      - key: WEB_ORIGIN
        fromService:
          name: smartstart-web
          type: web
          property: url
      - key: JWT_SECRET
        generateValue: true
    autoDeploy: true
    buildFilter:
      paths:
        - apps/web/**
        - package.json
        - pnpm-lock.yaml
        - pnpm-workspace.yaml

  - type: web
    name: smartstart-api
    env: node
    rootDir: apps/api
    plan: free
    buildCommand: |
      corepack enable
      pnpm install --frozen-lockfile
      pnpm prisma:generate
      pnpm build
    startCommand: |
      pnpm prisma migrate deploy
      pnpm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: smartstart-db
          property: connectionString
      - key: PORT
        value: 3001
      - key: WEB_ORIGIN
        fromService:
          name: smartstart-web
          type: web
          property: url
      - key: JWT_SECRET
        generateValue: true
      - key: SESSION_SECRET
        generateValue: true
      - key: CORS_ORIGIN
        fromService:
          name: smartstart-web
          type: web
          property: url
      - key: RATE_LIMIT_WINDOW_MS
        value: 900000
      - key: RATE_LIMIT_MAX_REQUESTS
        value: 100
      - key: AUTH_RATE_LIMIT
        value: 5
      - key: API_RATE_LIMIT
        value: 100
      - key: IDEAS_RATE_LIMIT
        value: 30
      - key: POLLS_RATE_LIMIT
        value: 30
      - key: ENABLE_AUDIT_LOGGING
        value: true
      - key: AUDIT_LOG_RETENTION_DAYS
        value: 365
      - key: ENABLE_RBAC
        value: true
      - key: ENABLE_RATE_LIMITING
        value: true
      - key: OWNER_MIN_PCT
        value: 35
      - key: ALICE_CAP_PCT
        value: 25
      - key: CONTRIBUTION_MIN_PCT
        value: 0.5
      - key: CONTRIBUTION_MAX_PCT
        value: 5.0
      - key: DEFAULT_PAGE_SIZE
        value: 20
      - key: MAX_PAGE_SIZE
        value: 100
    autoDeploy: true
    buildFilter:
      paths:
        - apps/api/**
        - prisma/**
        - package.json
        - pnpm-lock.yaml
        - pnpm-workspace.yaml

databases:
  - name: smartstart-db
    plan: free
    ipAllowList: []
    maxConnections: 10
```

### **Render.com Best Practices Applied**

#### **✅ Build Optimization**
- **Frozen Lockfile**: Uses `--frozen-lockfile` for consistent builds
- **Corepack Enable**: Ensures proper pnpm version management
- **Build Filters**: Only rebuilds when relevant files change
- **Multi-line Commands**: Proper command structure for complex builds

#### **✅ Health Checks**
- **Web Health Check**: `/` endpoint for frontend monitoring
- **API Health Check**: `/health` endpoint for backend monitoring
- **Database Connectivity**: Automatic connection testing

#### **✅ Environment Variables**
- **Auto-generated Secrets**: JWT_SECRET and SESSION_SECRET
- **Service Dependencies**: Automatic URL linking between services
- **Production Settings**: NODE_ENV and security configurations
- **Rate Limiting**: Configurable limits for different endpoints

#### **✅ Security Configuration**
- **CORS Protection**: Proper origin restrictions
- **Rate Limiting**: Multiple tiers (auth, API, ideas, polls)
- **Audit Logging**: Comprehensive security event tracking
- **RBAC Enforcement**: Role-based access control enabled

#### **✅ Performance Optimization**
- **Database Connections**: Limited to 10 concurrent connections
- **Build Caching**: Efficient dependency management
- **Auto-deployment**: Automatic updates on code changes

### **Step 5: Post-Deployment Setup**

#### **Verify Services**
```bash
# Check web app health
curl https://your-web-app.onrender.com

# Check API health
curl https://your-api-app.onrender.com/health

# Check API version
curl https://your-api-app.onrender.com/version
```

#### **Database Seeding (Optional)**
```bash
# Connect to your Render database and run:
# This can be done via Render's database console or CLI
```

#### **Environment Verification**
1. **Web App**: Should load without errors
2. **API Health**: Should return `{"ok": true}`
3. **Database**: Should be accessible and migrated
4. **Authentication**: Login should work with demo accounts

### **Step 6: Custom Domain (Optional)**
1. Go to your Render dashboard
2. Select your web service
3. Go to "Settings" → "Custom Domains"
4. Add your domain and configure DNS

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
JWT_SECRET=your-jwt-secret-key-here

# API Configuration
PORT=3001
NODE_ENV=production

# Web Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com
WEB_ORIGIN=https://your-web-domain.com
```

### **Optional Environment Variables**
```bash
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT=5
API_RATE_LIMIT=100
IDEAS_RATE_LIMIT=30
POLLS_RATE_LIMIT=30

# Audit Logging
AUDIT_LOG_RETENTION_DAYS=365
ENABLE_AUDIT_LOGGING=true

# Feature Flags
ENABLE_RBAC=true
ENABLE_RATE_LIMITING=true

# Business Logic
OWNER_MIN_PCT=35
ALICE_CAP_PCT=25
CONTRIBUTION_MIN_PCT=0.5
CONTRIBUTION_MAX_PCT=5.0

# Pagination
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

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

# API version
GET /version
# Response: {"name": "smartstart-api", "version": "1.0.0"}
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

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Build Failures**
```bash
# Check Node.js version
node --version  # Should be 18+

# Check pnpm version
pnpm --version  # Should be 8+

# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### **Database Connection Issues**
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Check Prisma client
pnpm prisma generate
pnpm prisma db push
```

#### **Environment Variable Issues**
```bash
# Verify environment variables
echo $DATABASE_URL
echo $NODE_ENV
echo $PORT

# Check Render environment variables in dashboard
```

#### **Health Check Failures**
```bash
# Test health endpoints
curl https://your-api.onrender.com/health
curl https://your-web.onrender.com/

# Check service logs in Render dashboard
```

### **Performance Issues**

#### **Slow API Responses**
- Check database query performance
- Verify indexes are created
- Monitor connection pool usage
- Check rate limiting settings

#### **Build Time Optimization**
- Use build filters in render.yaml
- Optimize Docker layers
- Use caching strategies
- Minimize dependencies

## 📚 **Additional Resources**

### **Documentation**
- [Render.com Documentation](https://render.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practices-performance.html)

### **Monitoring Tools**
- [Render Logs](https://render.com/docs/logs)
- [Database Monitoring](https://render.com/docs/databases)
- [Health Checks](https://render.com/docs/health-checks)

### **Security Resources**
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Rate Limiting Best Practices](https://express-rate-limit.mintlify.app/)

---

**🎉 Your SmartStart platform is now ready for production deployment!**

For support and questions, please refer to the troubleshooting section or create an issue in the repository.
