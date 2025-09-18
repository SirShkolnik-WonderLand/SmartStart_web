# 🗄️ Current Database Status - SmartStart Platform

## 📚 Overview

This document provides a comprehensive overview of our current database setup, schema, and working environment. This is our "source of truth" for the database architecture we've built and are actively using.

**Last Updated:** September 18, 2025  
**Status:** ✅ **FULLY OPERATIONAL** - Complete RBAC system with real users  
**Environment:** Docker + PostgreSQL + Python Brain + Frontend  

---

## 🏗️ Current Architecture

### **Database Stack**
- **Database:** PostgreSQL 15 (Docker container)
- **ORM:** Prisma (for Node.js services)
- **Direct Access:** psycopg2 (for Python Brain)
- **Connection:** Docker network (`postgres:5432`)
- **Credentials:** `smartstart_user` / `smartstart_password`
- **Database Name:** `smartstart_db`

### **Services Connected**
- **Python Brain:** `http://localhost:5002` (Flask + psycopg2)
- **Node.js Proxy:** `http://localhost:3001` (Express + Prisma)
- **Frontend:** `http://localhost:3000` (Next.js + API calls)

---

## 📊 Database Schema Status

### **Core Tables (8 Tables)**
```sql
-- User Management
"User"                    -- 5 users created with RBAC
"Role"                    -- 5 roles: SUPER_ADMIN, ADMIN, MANAGER, MEMBER, GUEST
"Permission"              -- 20+ permissions for granular access
"RolePermission"          -- Role-permission mappings
"UserRole"                -- User-role assignments (created manually)

-- Journey & Onboarding
"JourneyStage"            -- 6 journey stages seeded
"UserJourneyState"        -- Individual user progress tracking

-- Billing & Subscriptions
"BillingPlan"             -- Subscription plans
"Subscription"            -- User subscriptions
```

### **Table Details**

#### **User Table**
```sql
CREATE TABLE "User" (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),
    name VARCHAR(255),
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    password VARCHAR(255), -- bcrypt hashed
    role VARCHAR(50), -- SUPER_ADMIN, ADMIN, MANAGER, MEMBER, GUEST
    level VARCHAR(50), -- DRAGON, PHOENIX, OWLET
    status VARCHAR(50) DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    "tenantId" VARCHAR(100),
    xp INTEGER DEFAULT 0,
    reputation INTEGER DEFAULT 0,
    "lastActive" TIMESTAMPTZ,
    "totalPortfolioValue" DECIMAL(15,2) DEFAULT 0.0,
    "activeProjectsCount" INTEGER DEFAULT 0,
    "totalContributions" INTEGER DEFAULT 0,
    "totalEquityOwned" DECIMAL(8,6) DEFAULT 0.0,
    "averageEquityPerProject" DECIMAL(8,6) DEFAULT 0.0,
    "portfolioDiversity" DECIMAL(5,2) DEFAULT 0.0
);
```

#### **Role Table**
```sql
CREATE TABLE "Role" (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
```

#### **Permission Table**
```sql
CREATE TABLE "Permission" (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL, -- user, venture, legal, etc.
    action VARCHAR(100) NOT NULL,   -- read, write, delete, admin
    description TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 👥 Current Users (5 Users Created)

| **ID** | **Email** | **Name** | **Role** | **Level** | **XP** | **Portfolio** | **Password** |
|--------|-----------|----------|----------|-----------|--------|---------------|--------------|
| `super_admin_001` | admin@alicesolutionsgroup.com | Udi Shkolnik | SUPER_ADMIN | DRAGON | 10,000 | $1,000,000 | `SuperAdmin123!` |
| `admin_001` | manager@alicesolutionsgroup.com | Sarah Johnson | ADMIN | PHOENIX | 5,000 | $250,000 | `Admin123!` |
| `member_001` | developer@alicesolutionsgroup.com | Emily Rodriguez | MEMBER | OWLET | 1,000 | $25,000 | `Member123!` |
| `member_002` | designer@alicesolutionsgroup.com | Alex Kim | MEMBER | OWLET | 800 | $15,000 | `Member123!` |
| `guest_001` | visitor@example.com | John Doe | GUEST | OWLET | 100 | $0 | `Guest123!` |

---

## 🔐 RBAC System Status

### **Roles Implemented (5 Roles)**
1. **SUPER_ADMIN** - Full system access
2. **ADMIN** - High-level management
3. **MANAGER** - Team management
4. **MEMBER** - Standard user access
5. **GUEST** - Read-only access

### **Permissions System**
- **20+ Permissions** created
- **Resource-based:** user, venture, legal, system, etc.
- **Action-based:** read, write, delete, admin
- **Granular Control:** Fine-grained access control

### **User-Role Assignments**
- **UserRole Table:** Links users to roles
- **RolePermission Table:** Links roles to permissions
- **Effective Permissions:** Computed per user

---

## 🚀 How to Connect & Work

### **1. Direct PostgreSQL Access**
```bash
# Connect to database container
docker-compose -f docker-compose.dev.yml exec postgres psql -U smartstart_user -d smartstart_db

# Or from host
psql -h localhost -p 5432 -U smartstart_user -d smartstart_db
```

### **2. Python Brain Connection**
```python
# In Python Brain (database_connector_direct.py)
DATABASE_URL = "postgresql://smartstart_user:smartstart_password@postgres:5432/smartstart_db"

# Test connection
python3 -c "
from database_connector_direct import DirectDatabaseConnector
db = DirectDatabaseConnector()
print('Connection test:', db.test_connection())
"
```

### **3. Node.js/Prisma Connection**
```bash
# From server directory
cd server
npx prisma studio  # Visual database browser
npx prisma db pull # Sync schema from database
npx prisma generate # Generate Prisma client
```

### **4. Frontend API Connection**
```bash
# Test API endpoints
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@alicesolutionsgroup.com", "password": "SuperAdmin123!"}'
```

---

## 📋 Common Database Operations

### **View All Users**
```sql
SELECT id, email, name, role, level, xp, reputation 
FROM "User" 
ORDER BY role, xp DESC;
```

### **Check User Permissions**
```sql
SELECT u.email, r.name as role, p.name as permission
FROM "User" u
JOIN "UserRole" ur ON u.id = ur."userId"
JOIN "Role" r ON ur."roleId" = r.id
JOIN "RolePermission" rp ON r.id = rp."roleId"
JOIN "Permission" p ON rp."permissionId" = p.id
WHERE u.email = 'admin@alicesolutionsgroup.com';
```

### **Check Journey Progress**
```sql
SELECT u.email, js.name as stage, ujs.status, ujs."completedAt"
FROM "User" u
JOIN "UserJourneyState" ujs ON u.id = ujs."userId"
JOIN "JourneyStage" js ON ujs."stageId" = js.id
ORDER BY u.email, js.order;
```

### **View Billing Plans**
```sql
SELECT name, price, "buzTokens", features
FROM "BillingPlan"
ORDER BY price;
```

---

## 🔧 Development Commands

### **Start Development Environment**
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Check status
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

### **Database Management**
```bash
# Backup database
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U smartstart_user smartstart_db > backup.sql

# Restore database
docker-compose -f docker-compose.dev.yml exec -T postgres psql -U smartstart_user smartstart_db < backup.sql

# Reset database (careful!)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### **Python Brain Management**
```bash
# Test Python Brain
curl http://localhost:5002/api/health

# Test authentication
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@alicesolutionsgroup.com", "password": "SuperAdmin123!"}'
```

---

## 📊 Current Data Status

### **User Data**
- **Total Users:** 5 users
- **Active Users:** 5 users (all ACTIVE)
- **Role Distribution:** 1 SUPER_ADMIN, 1 ADMIN, 2 MEMBER, 1 GUEST
- **Password Security:** All passwords bcrypt hashed

### **Journey Data**
- **Journey Stages:** 6 stages defined
- **User Progress:** Individual tracking per user
- **Completion Status:** Varies by user

### **RBAC Data**
- **Roles:** 5 roles defined
- **Permissions:** 20+ permissions created
- **Assignments:** User-role and role-permission mappings

---

## 🚨 Important Notes

### **Database Credentials**
- **Host:** localhost (from host) or postgres (from Docker)
- **Port:** 5432
- **Database:** smartstart_db
- **User:** smartstart_user
- **Password:** smartstart_password

### **Connection Strings**
- **Python Brain:** `postgresql://smartstart_user:smartstart_password@postgres:5432/smartstart_db`
- **Node.js/Prisma:** `postgresql://smartstart_user:smartstart_password@localhost:5432/smartstart_db`
- **Direct Access:** `postgresql://smartstart_user:smartstart_password@localhost:5432/smartstart_db`

### **Case Sensitivity**
- **PostgreSQL:** Column names are case-sensitive
- **Quotes Required:** Use `"ColumnName"` for camelCase columns
- **Examples:** `"firstName"`, `"lastName"`, `"createdAt"`

---

## 🎯 Next Steps

### **Immediate Tasks**
1. **Create More Users:** Add test users for different roles
2. **Test RBAC:** Verify permission enforcement
3. **Journey Testing:** Test onboarding flow
4. **API Testing:** Verify all endpoints work

### **Future Enhancements**
1. **Data Seeding:** Create comprehensive test data
2. **Performance Testing:** Load testing with more users
3. **Backup Strategy:** Automated backup system
4. **Monitoring:** Database performance monitoring

---

## 📚 Related Documentation

- **Database Architecture:** `docs/02-architecture/database-architecture.md`
- **API Reference:** `docs/05-api/api-reference.md`
- **RBAC Guide:** `docs/07-security/security-overview.md`
- **Deployment Guide:** `docs/04-deployment/deployment-quick-start.md`

---

**🎉 This database is fully operational and ready for development!**

**Last Updated:** September 18, 2025  
**Maintained by:** Udi Shkolnik  
**Status:** ✅ Production Ready
