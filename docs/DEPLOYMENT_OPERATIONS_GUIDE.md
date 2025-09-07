# SmartStart Legal Document Deployment & Operations Guide
## Complete Deployment and Operations Framework

**Version:** 2.0  
**Last Updated:** September 2025  
**Governing Law:** Ontario, Canada

---

## Overview

This guide provides comprehensive deployment procedures, operational protocols, monitoring strategies, and maintenance procedures for the SmartStart legal document management system.

---

## Deployment Architecture

### **System Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Static    │    │   Load Balancer │    │   Backup        │
│   Assets        │    │   (Nginx)       │    │   Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Environment Configuration**
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:5000
    depends_on:
      - backend

  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/smartstart
      - JWT_SECRET=your-jwt-secret
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:13
    environment:
      - POSTGRES_DB=smartstart
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./prisma/migrations:/docker-entrypoint-initdb.d

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  redis_data:
```

---

## Pre-Deployment Checklist

### **Code Quality**
- [ ] All tests passing (unit, integration, e2e)
- [ ] Code coverage ≥ 90%
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Documentation updated

### **Database Preparation**
- [ ] Database migrations tested
- [ ] Seed data validated
- [ ] Backup procedures tested
- [ ] Performance indexes created
- [ ] Connection pooling configured

### **Security Configuration**
- [ ] SSL certificates installed
- [ ] Environment variables secured
- [ ] API rate limiting configured
- [ ] CORS policies set
- [ ] Authentication tokens secured

### **Infrastructure**
- [ ] Server resources allocated
- [ ] Load balancer configured
- [ ] CDN setup completed
- [ ] Monitoring tools installed
- [ ] Log aggregation configured

---

## Deployment Procedures

### **1. Database Deployment**
```bash
#!/bin/bash
# deploy-database.sh

set -e

echo "Starting database deployment..."

# Backup existing database
echo "Creating backup..."
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
echo "Running migrations..."
npx prisma migrate deploy

# Seed data
echo "Seeding data..."
npx prisma db seed

# Verify deployment
echo "Verifying deployment..."
npx prisma db execute --file verify-deployment.sql

echo "Database deployment completed successfully!"
```

### **2. Backend Deployment**
```bash
#!/bin/bash
# deploy-backend.sh

set -e

echo "Starting backend deployment..."

# Install dependencies
echo "Installing dependencies..."
npm ci --production

# Build application
echo "Building application..."
npm run build

# Run tests
echo "Running tests..."
npm test

# Start application
echo "Starting application..."
pm2 start ecosystem.config.js --env production

# Health check
echo "Performing health check..."
sleep 10
curl -f http://localhost:5000/health || exit 1

echo "Backend deployment completed successfully!"
```

### **3. Frontend Deployment**
```bash
#!/bin/bash
# deploy-frontend.sh

set -e

echo "Starting frontend deployment..."

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build application
echo "Building application..."
npm run build

# Run tests
echo "Running tests..."
npm test

# Deploy to CDN
echo "Deploying to CDN..."
aws s3 sync out/ s3://smartstart-frontend --delete

# Invalidate CDN cache
echo "Invalidating CDN cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"

echo "Frontend deployment completed successfully!"
```

### **4. Complete Deployment**
```bash
#!/bin/bash
# deploy.sh

set -e

echo "Starting complete deployment..."

# Pre-deployment checks
echo "Running pre-deployment checks..."
./scripts/pre-deployment-checks.sh

# Database deployment
echo "Deploying database..."
./scripts/deploy-database.sh

# Backend deployment
echo "Deploying backend..."
./scripts/deploy-backend.sh

# Frontend deployment
echo "Deploying frontend..."
./scripts/deploy-frontend.sh

# Post-deployment verification
echo "Running post-deployment verification..."
./scripts/post-deployment-verification.sh

echo "Complete deployment finished successfully!"
```

---

## Configuration Management

### **Environment Variables**
```bash
# .env.production
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/smartstart
DATABASE_POOL_SIZE=20
DATABASE_TIMEOUT=30000

# Authentication
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# API Configuration
API_RATE_LIMIT=100
API_RATE_WINDOW=900000
CORS_ORIGIN=https://smartstart.com

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=smartstart-documents

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
LOG_FORMAT=json

# Legal Document Configuration
DOCUMENT_STORAGE_PATH=/app/documents
SIGNATURE_VERIFICATION_ENABLED=true
AUDIT_LOG_RETENTION_DAYS=2555
```

### **Nginx Configuration**
```nginx
# nginx.conf
upstream backend {
    server backend:5000;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name smartstart.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name smartstart.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # API routes
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }

    # Frontend routes
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Rate limiting
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
}
```

---

## Monitoring and Observability

### **Application Monitoring**
```javascript
// server/monitoring/health-check.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const redis = require('redis');

const router = express.Router();
const prisma = new PrismaClient();
const redisClient = redis.createClient(process.env.REDIS_URL);

router.get('/health', async (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {}
    };

    try {
        // Database health check
        await prisma.$queryRaw`SELECT 1`;
        health.services.database = 'healthy';
    } catch (error) {
        health.services.database = 'unhealthy';
        health.status = 'unhealthy';
    }

    try {
        // Redis health check
        await redisClient.ping();
        health.services.redis = 'healthy';
    } catch (error) {
        health.services.redis = 'unhealthy';
        health.status = 'unhealthy';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
});

router.get('/metrics', async (req, res) => {
    const metrics = {
        timestamp: new Date().toISOString(),
        database: {
            connections: await prisma.$queryRaw`SELECT count(*) FROM pg_stat_activity`,
            queries: await prisma.$queryRaw`SELECT count(*) FROM pg_stat_statements`
        },
        redis: {
            memory: await redisClient.memory('usage'),
            keys: await redisClient.dbSize()
        },
        application: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
        }
    };

    res.json(metrics);
});

module.exports = router;
```

### **Logging Configuration**
```javascript
// server/utils/logger.js
const winston = require('winston');
const { Logtail } = require('@logtail/node');

const logtail = new Logtail(process.env.LOGTAIL_TOKEN);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

// Add Logtail transport for production
if (process.env.NODE_ENV === 'production') {
    logger.add(new winston.transports.Stream({
        stream: logtail
    }));
}

module.exports = logger;
```

### **Performance Monitoring**
```javascript
// server/middleware/performance.js
const logger = require('../utils/logger');

const performanceMiddleware = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: duration,
            userAgent: req.get('User-Agent'),
            ip: req.ip
        };

        if (duration > 1000) {
            logger.warn('Slow request detected', logData);
        } else {
            logger.info('Request completed', logData);
        }
    });

    next();
};

module.exports = performanceMiddleware;
```

---

## Backup and Recovery

### **Database Backup**
```bash
#!/bin/bash
# backup-database.sh

set -e

BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/smartstart_backup_$DATE.sql"

echo "Starting database backup..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to S3
aws s3 cp "$BACKUP_FILE.gz" s3://smartstart-backups/database/

# Clean up old backups (keep last 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Database backup completed: $BACKUP_FILE.gz"
```

### **Document Backup**
```bash
#!/bin/bash
# backup-documents.sh

set -e

DOCUMENTS_DIR="/app/documents"
BACKUP_DIR="/backups/documents"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Starting document backup..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create tar archive
tar -czf "$BACKUP_DIR/documents_backup_$DATE.tar.gz" -C $DOCUMENTS_DIR .

# Upload to S3
aws s3 cp "$BACKUP_DIR/documents_backup_$DATE.tar.gz" s3://smartstart-backups/documents/

# Clean up old backups (keep last 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Document backup completed: documents_backup_$DATE.tar.gz"
```

### **Recovery Procedures**
```bash
#!/bin/bash
# restore-database.sh

set -e

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Starting database restore from $BACKUP_FILE..."

# Download backup from S3 if needed
if [[ $BACKUP_FILE == s3://* ]]; then
    aws s3 cp $BACKUP_FILE /tmp/restore.sql.gz
    BACKUP_FILE="/tmp/restore.sql.gz"
fi

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE | psql $DATABASE_URL
else
    psql $DATABASE_URL < $BACKUP_FILE
fi

echo "Database restore completed successfully!"
```

---

## Security Operations

### **Security Monitoring**
```javascript
// server/middleware/security.js
const logger = require('../utils/logger');

const securityMiddleware = (req, res, next) => {
    // Log suspicious activity
    const suspiciousPatterns = [
        /\.\./,  // Directory traversal
        /<script/i,  // XSS attempts
        /union.*select/i,  // SQL injection
        /eval\(/i,  // Code injection
    ];

    const url = req.url;
    const userAgent = req.get('User-Agent') || '';

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(url) || pattern.test(userAgent)) {
            logger.warn('Suspicious activity detected', {
                ip: req.ip,
                url: url,
                userAgent: userAgent,
                pattern: pattern.toString()
            });
            
            res.status(400).json({ error: 'Bad Request' });
            return;
        }
    }

    next();
};

module.exports = securityMiddleware;
```

### **Rate Limiting**
```javascript
// server/middleware/rate-limit.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient(process.env.REDIS_URL);

const createRateLimit = (windowMs, max, message) => {
    return rateLimit({
        store: new RedisStore({
            client: redisClient,
            prefix: 'rl:'
        }),
        windowMs: windowMs,
        max: max,
        message: { error: message },
        standardHeaders: true,
        legacyHeaders: false
    });
};

// API rate limiting
const apiRateLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // limit each IP to 100 requests per windowMs
    'Too many requests from this IP, please try again later.'
);

// Document signing rate limiting
const documentSignRateLimit = createRateLimit(
    60 * 1000, // 1 minute
    5, // limit each IP to 5 document signings per minute
    'Too many document signing attempts, please try again later.'
);

module.exports = {
    apiRateLimit,
    documentSignRateLimit
};
```

---

## Maintenance Procedures

### **Regular Maintenance Tasks**
```bash
#!/bin/bash
# maintenance.sh

set -e

echo "Starting maintenance tasks..."

# Database maintenance
echo "Running database maintenance..."
psql $DATABASE_URL -c "VACUUM ANALYZE;"
psql $DATABASE_URL -c "REINDEX DATABASE smartstart;"

# Clean up old audit logs
echo "Cleaning up old audit logs..."
psql $DATABASE_URL -c "DELETE FROM document_audit_log WHERE created_at < NOW() - INTERVAL '7 years';"

# Clean up old sessions
echo "Cleaning up old sessions..."
psql $DATABASE_URL -c "DELETE FROM sessions WHERE expires_at < NOW();"

# Update statistics
echo "Updating database statistics..."
psql $DATABASE_URL -c "ANALYZE;"

# Clean up temporary files
echo "Cleaning up temporary files..."
find /tmp -name "smartstart_*" -mtime +1 -delete

# Check disk space
echo "Checking disk space..."
df -h

# Check memory usage
echo "Checking memory usage..."
free -h

echo "Maintenance tasks completed successfully!"
```

### **Health Check Script**
```bash
#!/bin/bash
# health-check.sh

set -e

echo "Running health checks..."

# Check database connectivity
echo "Checking database connectivity..."
psql $DATABASE_URL -c "SELECT 1;" > /dev/null || exit 1

# Check Redis connectivity
echo "Checking Redis connectivity..."
redis-cli -u $REDIS_URL ping > /dev/null || exit 1

# Check API health
echo "Checking API health..."
curl -f http://localhost:5000/health > /dev/null || exit 1

# Check frontend health
echo "Checking frontend health..."
curl -f http://localhost:3000 > /dev/null || exit 1

# Check disk space
echo "Checking disk space..."
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "Warning: Disk usage is ${DISK_USAGE}%"
    exit 1
fi

# Check memory usage
echo "Checking memory usage..."
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEMORY_USAGE -gt 90 ]; then
    echo "Warning: Memory usage is ${MEMORY_USAGE}%"
    exit 1
fi

echo "All health checks passed!"
```

---

## Incident Response

### **Incident Response Plan**
```bash
#!/bin/bash
# incident-response.sh

INCIDENT_TYPE=$1
SEVERITY=$2

case $INCIDENT_TYPE in
    "database")
        echo "Database incident detected. Severity: $SEVERITY"
        ./scripts/backup-database.sh
        ./scripts/restore-database.sh $LATEST_BACKUP
        ;;
    "api")
        echo "API incident detected. Severity: $SEVERITY"
        pm2 restart backend
        ;;
    "frontend")
        echo "Frontend incident detected. Severity: $SEVERITY"
        pm2 restart frontend
        ;;
    "security")
        echo "Security incident detected. Severity: $SEVERITY"
        ./scripts/security-lockdown.sh
        ;;
    *)
        echo "Unknown incident type: $INCIDENT_TYPE"
        exit 1
        ;;
esac
```

### **Alerting Configuration**
```yaml
# alerts.yml
groups:
  - name: smartstart-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: DatabaseDown
        expr: up{job="database"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database is down"
          description: "Database has been down for more than 1 minute"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is above 90%"
```

---

## Performance Optimization

### **Database Optimization**
```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY idx_user_document_status_user_id ON user_document_status(user_id);
CREATE INDEX CONCURRENTLY idx_user_document_status_status ON user_document_status(status);
CREATE INDEX CONCURRENTLY idx_document_signatures_document_id ON document_signatures(document_id);
CREATE INDEX CONCURRENTLY idx_document_signatures_user_id ON document_signatures(user_id);
CREATE INDEX CONCURRENTLY idx_document_signatures_timestamp ON document_signatures(timestamp);
CREATE INDEX CONCURRENTLY idx_document_audit_log_user_id ON document_audit_log(user_id);
CREATE INDEX CONCURRENTLY idx_document_audit_log_timestamp ON document_audit_log(timestamp);

-- Query optimization
EXPLAIN ANALYZE SELECT * FROM user_document_status WHERE user_id = 'user123' AND status = 'signed';

-- Partitioning for large tables
CREATE TABLE document_audit_log_2025 PARTITION OF document_audit_log
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### **Application Optimization**
```javascript
// server/utils/cache.js
const redis = require('redis');
const redisClient = redis.createClient(process.env.REDIS_URL);

const cache = {
    async get(key) {
        try {
            const value = await redisClient.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    },

    async set(key, value, ttl = 3600) {
        try {
            await redisClient.setex(key, ttl, JSON.stringify(value));
        } catch (error) {
            console.error('Cache set error:', error);
        }
    },

    async del(key) {
        try {
            await redisClient.del(key);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }
};

module.exports = cache;
```

---

## Compliance and Auditing

### **Audit Log Analysis**
```sql
-- Audit log queries
SELECT 
    user_id,
    document_id,
    action,
    COUNT(*) as action_count,
    MIN(timestamp) as first_action,
    MAX(timestamp) as last_action
FROM document_audit_log
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY user_id, document_id, action
ORDER BY action_count DESC;

-- User activity summary
SELECT 
    u.email,
    u.rbac_level,
    COUNT(dal.id) as total_actions,
    COUNT(DISTINCT dal.document_id) as documents_accessed
FROM users u
LEFT JOIN document_audit_log dal ON u.id = dal.user_id
WHERE dal.timestamp >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email, u.rbac_level
ORDER BY total_actions DESC;
```

### **Compliance Reporting**
```javascript
// server/utils/compliance.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateComplianceReport = async (startDate, endDate) => {
    const report = {
        period: { startDate, endDate },
        generatedAt: new Date().toISOString(),
        summary: {},
        details: {}
    };

    // Document signing summary
    const signingSummary = await prisma.documentSignature.groupBy({
        by: ['document_id'],
        where: {
            timestamp: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        },
        _count: {
            id: true
        }
    });

    report.summary.documentSignings = signingSummary;

    // User activity summary
    const userActivity = await prisma.documentAuditLog.groupBy({
        by: ['user_id', 'action'],
        where: {
            timestamp: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        },
        _count: {
            id: true
        }
    });

    report.summary.userActivity = userActivity;

    // RBAC level changes
    const rbacChanges = await prisma.userRbacLog.findMany({
        where: {
            timestamp: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        },
        include: {
            user: {
                select: { email: true, name: true }
            }
        }
    });

    report.details.rbacChanges = rbacChanges;

    return report;
};

module.exports = { generateComplianceReport };
```

---

**This deployment and operations guide ensures the SmartStart legal document management system is deployed securely, monitored effectively, and maintained properly.**

*Last updated: September 2025*  
*Compliant with Canadian law and international best practices*
