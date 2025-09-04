# 🗄️ SmartStart Database Connection & Testing Guide

## 📋 Overview

This guide provides comprehensive instructions for connecting to the SmartStart PostgreSQL database, understanding the schema, and performing various tests using curl commands and direct database access.

## 🔐 Database Credentials

### Production Database (Render.com)
- **Hostname**: `dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com`
- **Port**: `5432`
- **Database**: `smartstart`
- **Username**: `smartstart_user`
- **Password**: `aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh`
- **Service ID**: `dpg-d2r25k7diees73dp78a0-a`
- **Region**: Oregon (US West)
- **PostgreSQL Version**: 16
- **Instance Type**: Basic-256mb (256 MB RAM, 0.1 CPU, 15 GB Storage)

## 🔗 Connection Methods

### 1. Direct PSQL Connection
```bash
PGPASSWORD=aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh psql -h dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com -U smartstart_user smartstart
```

### 2. Connection String
```
postgresql://smartstart_user:aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh@dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com/smartstart
```

### 3. Environment Variable
```bash
export DATABASE_URL="postgresql://smartstart_user:aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh@dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com/smartstart"
```

## 🏗️ Database Schema

### Core Tables

#### User Table
```sql
CREATE TABLE "User" (
    id                      TEXT PRIMARY KEY,
    email                   TEXT UNIQUE NOT NULL,
    name                    TEXT,
    "firstName"             TEXT,
    "lastName"              TEXT,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL,
    "tenantId"              TEXT DEFAULT 'default',
    level                   "UserLevel" NOT NULL DEFAULT 'OWLET',
    xp                      INTEGER NOT NULL DEFAULT 0,
    reputation              INTEGER NOT NULL DEFAULT 0,
    status                  "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastActive"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalPortfolioValue"   DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activeProjectsCount"   INTEGER NOT NULL DEFAULT 0,
    "totalContributions"    INTEGER NOT NULL DEFAULT 0,
    "totalEquityOwned"      DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageEquityPerProject" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "portfolioDiversity"    INTEGER NOT NULL DEFAULT 0,
    "lastEquityEarned"      TIMESTAMP(3),
    username                TEXT UNIQUE,
    password                TEXT,
    role                    TEXT DEFAULT 'TEAM_MEMBER'
);
```

#### Account Table
```sql
CREATE TABLE "Account" (
    id              TEXT PRIMARY KEY,
    email           TEXT UNIQUE NOT NULL,
    password        TEXT,
    "roleId"        TEXT NOT NULL,
    "userId"        TEXT UNIQUE NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive"      BOOLEAN NOT NULL DEFAULT true,
    "lastLogin"     TIMESTAMP(3),
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil"   TIMESTAMP(3),
    "mfaEnabled"    BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret"     TEXT,
    
    FOREIGN KEY ("roleId") REFERENCES "Role"(id),
    FOREIGN KEY ("userId") REFERENCES "User"(id)
);
```

#### Role Table
```sql
CREATE TABLE "Role" (
    id          TEXT PRIMARY KEY,
    name        TEXT UNIQUE NOT NULL,
    level       INTEGER NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
```

#### Session Table
```sql
CREATE TABLE "Session" (
    id          TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    token       TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastUsed"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("accountId") REFERENCES "Account"(id)
);
```

### Enums

#### UserLevel
```sql
CREATE TYPE "UserLevel" AS ENUM (
    'OWLET', 'NESTLING', 'FLEDGLING', 'JUNIOR', 'SENIOR', 
    'LEAD', 'PRINCIPAL', 'ARCHITECT', 'EXPERT', 'MASTER'
);
```

#### UserStatus
```sql
CREATE TYPE "UserStatus" AS ENUM (
    'ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'
);
```

## 🧪 Testing Commands

### Database Connection Tests

#### 1. Basic Connection Test
```bash
PGPASSWORD=aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh psql -h dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com -U smartstart_user smartstart -c "SELECT version();"
```

#### 2. Check User Count
```bash
PGPASSWORD=aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh psql -h dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com -U smartstart_user smartstart -c "SELECT COUNT(*) FROM \"User\";"
```

#### 3. Check Account Count
```bash
PGPASSWORD=aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh psql -h dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com -U smartstart_user smartstart -c "SELECT COUNT(*) FROM \"Account\";"
```

#### 4. List All Roles
```bash
PGPASSWORD=aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh psql -h dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com -U smartstart_user smartstart -c "SELECT name, level FROM \"Role\" ORDER BY level;"
```

#### 5. Check GUEST Role Exists
```bash
PGPASSWORD=aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh psql -h dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com -U smartstart_user smartstart -c "SELECT name FROM \"Role\" WHERE name = 'GUEST';"
```

### API Endpoint Tests

#### 1. Health Check
```bash
curl -sS -X GET https://smartstart-api.onrender.com/health -w "\nHTTP Status: %{http_code}\n"
```

#### 2. API Routes List
```bash
curl -sS -X GET https://smartstart-api.onrender.com/api/routes -w "\nHTTP Status: %{http_code}\n" | head -20
```

#### 3. Authentication Health
```bash
curl -sS -X GET https://smartstart-api.onrender.com/api/auth/health -w "\nHTTP Status: %{http_code}\n"
```

#### 4. User Registration Test
```bash
curl -sS -X POST https://smartstart-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"test123","name":"Test User"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

#### 5. User Login Test
```bash
curl -sS -X POST https://smartstart-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"test123"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

#### 6. User Profile Check (Requires Token)
```bash
curl -sS -X GET https://smartstart-api.onrender.com/api/auth/me \
  -H "Cookie: auth-token=YOUR_TOKEN_HERE" \
  -w "\nHTTP Status: %{http_code}\n"
```

### Business Logic API Tests

#### 1. Users API Health
```bash
curl -sS -X GET https://smartstart-api.onrender.com/api/users/health -w "\nHTTP Status: %{http_code}\n"
```

#### 2. Journey State Health
```bash
curl -sS -X GET https://smartstart-api.onrender.com/api/journey-state/health -w "\nHTTP Status: %{http_code}\n"
```

#### 3. Documents API Health
```bash
curl -sS -X GET https://smartstart-api.onrender.com/api/documents/health -w "\nHTTP Status: %{http_code}\n"
```

#### 4. Migration Status
```bash
curl -sS -X GET https://smartstart-api.onrender.com/api/migration/status -w "\nHTTP Status: %{http_code}\n"
```

### Frontend Tests

#### 1. Main Application
```bash
curl -sS -X GET https://smartstart-cli-web.onrender.com -w "\nHTTP Status: %{http_code}\n" | head -10
```

#### 2. Dashboard Page
```bash
curl -sS -X GET https://smartstart-cli-web.onrender.com/dashboard -w "\nHTTP Status: %{http_code}\n" | head -10
```

## 🔍 Common Queries

### User Management
```sql
-- Get all users with their account status
SELECT u.email, u.name, u.status, a."isActive", a."lastLogin"
FROM "User" u
JOIN "Account" a ON u.id = a."userId"
ORDER BY u."createdAt" DESC;

-- Get users by role
SELECT u.email, u.name, r.name as role_name, r.level
FROM "User" u
JOIN "Account" a ON u.id = a."userId"
JOIN "Role" r ON a."roleId" = r.id
ORDER BY r.level DESC;

-- Check active sessions
SELECT s.token, s."expiresAt", s."lastUsed", u.email
FROM "Session" s
JOIN "Account" a ON s."accountId" = a.id
JOIN "User" u ON a."userId" = u.id
WHERE s."expiresAt" > NOW();
```

### System Health
```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('smartstart')) as database_size;

-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Connection count
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE datname = 'smartstart';
```

## 🚨 Troubleshooting

### Connection Issues

#### 1. "Server has closed the connection"
- **Cause**: Firewall blocking external connections
- **Solution**: The database has access control enabled. Only Render services can connect internally.

#### 2. "Authentication failed"
- **Cause**: Incorrect credentials
- **Solution**: Verify username/password from Render dashboard

#### 3. "Database does not exist"
- **Cause**: Wrong database name
- **Solution**: Use `smartstart` as the database name

### API Issues

#### 1. 502 Bad Gateway
- **Cause**: Server not responding
- **Solution**: Check server logs, restart service

#### 2. 404 Not Found
- **Cause**: Route not mounted
- **Solution**: Check `/api/routes` endpoint

#### 3. 401 Unauthorized
- **Cause**: Missing or invalid token
- **Solution**: Check authentication flow

## 📊 Current System Status

### Database Statistics
- **Total Users**: 23
- **Active Users**: 23
- **Total Roles**: 11 (GUEST to SUPER_ADMIN)
- **Active Sessions**: Variable
- **Database Size**: ~0.67% of 15GB used

### API Endpoints
- **Total Routes**: 200+
- **Authentication**: ✅ Healthy
- **User Management**: ✅ Healthy
- **Journey System**: ✅ Healthy (11 stages, 11 gates)
- **Documents**: ✅ Healthy
- **Migration**: ✅ Available

### Frontend
- **Main App**: ✅ Loading
- **Dashboard**: ✅ Loading
- **Theme**: ✅ Dark theme applied
- **Navigation**: ✅ All routes accessible

## 🔧 Maintenance Commands

### Database Maintenance
```bash
# Run migrations
curl -X POST https://smartstart-api.onrender.com/api/migration/migrate

# Check migration status
curl -X GET https://smartstart-api.onrender.com/api/migration/status

# Clean up expired sessions
PGPASSWORD=aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh psql -h dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com -U smartstart_user smartstart -c "DELETE FROM \"Session\" WHERE \"expiresAt\" < NOW();"
```

### System Monitoring
```bash
# Check all service health
curl -sS https://smartstart-api.onrender.com/health
curl -sS https://smartstart-cli-web.onrender.com

# Monitor database connections
PGPASSWORD=aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh psql -h dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com -U smartstart_user smartstart -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'smartstart';"
```

## 📝 Notes

- **Access Control**: The database has firewall protection - only Render services can connect internally
- **Backup**: Automatic backups are handled by Render
- **Scaling**: Currently on Basic-256mb plan, can be upgraded as needed
- **Security**: All connections use SSL/TLS encryption
- **Monitoring**: Use Render dashboard for logs and metrics

---

*Last Updated: September 4, 2025*
*Database Version: PostgreSQL 16*
*API Version: 2.0.1*
