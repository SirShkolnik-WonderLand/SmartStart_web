# 🗄️ Database Operations Guide - SmartStart Platform

## 📚 Overview

Comprehensive guide for database operations, maintenance, and management in our SmartStart Platform. This covers everything from basic operations to advanced maintenance tasks.

**Last Updated:** September 18, 2025  
**Status:** ✅ **FULLY OPERATIONAL** - Complete RBAC system with real users  

---

## 🏗️ Database Architecture

### **Current Setup**
- **Database:** PostgreSQL 15 (Docker container)
- **ORM:** Prisma (Node.js services)
- **Direct Access:** psycopg2 (Python Brain)
- **Connection:** Docker network (`postgres:5432`)
- **Credentials:** `smartstart_user` / `smartstart_password`
- **Database Name:** `smartstart_db`

### **Services Connected**
- **Python Brain:** `http://localhost:5002` (Flask + psycopg2)
- **Node.js Proxy:** `http://localhost:3001` (Express + Prisma)
- **Frontend:** `http://localhost:3000` (Next.js + API calls)

---

## 🚀 Basic Operations

### **1. Start/Stop Database**
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Restart specific service
docker-compose -f docker-compose.dev.yml restart postgres

# View service status
docker-compose -f docker-compose.dev.yml ps
```

### **2. Connect to Database**
```bash
# Method 1: Through Docker container
docker-compose -f docker-compose.dev.yml exec postgres psql -U smartstart_user -d smartstart_db

# Method 2: Direct connection from host
psql -h localhost -p 5432 -U smartstart_user -d smartstart_db

# Method 3: Using connection string
psql "postgresql://smartstart_user:smartstart_password@localhost:5432/smartstart_db"
```

### **3. Basic SQL Operations**
```sql
-- List all tables
\dt

-- Describe table structure
\d "User"

-- List all databases
\l

-- List all users
\du

-- Show current database
SELECT current_database();

-- Show current user
SELECT current_user;

-- Exit psql
\q
```

---

## 📊 Data Management

### **User Management**
```sql
-- View all users
SELECT id, email, name, role, level, xp, reputation, "createdAt"
FROM "User" 
ORDER BY "createdAt" DESC;

-- Get user by email
SELECT * FROM "User" WHERE email = 'admin@alicesolutionsgroup.com';

-- Update user XP
UPDATE "User" 
SET xp = 1500, reputation = 150 
WHERE email = 'developer@alicesolutionsgroup.com';

-- Create new user
INSERT INTO "User" (
    id, email, username, name, "firstName", "lastName", 
    password, role, level, status, "createdAt", "updatedAt"
) VALUES (
    'user_123', 'newuser@example.com', 'newuser', 'New User', 
    'New', 'User', '$2b$12$hashedpassword', 'MEMBER', 'OWLET', 
    'ACTIVE', NOW(), NOW()
);
```

### **RBAC Management**
```sql
-- View all roles
SELECT * FROM "Role" ORDER BY name;

-- View all permissions
SELECT * FROM "Permission" ORDER BY resource, action;

-- Check user permissions
SELECT 
    u.email,
    r.name as role,
    p.name as permission,
    p.resource,
    p.action
FROM "User" u
JOIN "UserRole" ur ON u.id = ur."userId"
JOIN "Role" r ON ur."roleId" = r.id
JOIN "RolePermission" rp ON r.id = rp."roleId"
JOIN "Permission" p ON rp."permissionId" = p.id
WHERE u.email = 'admin@alicesolutionsgroup.com'
ORDER BY p.resource, p.action;

-- Assign role to user
INSERT INTO "UserRole" ("userId", "roleId", "assignedAt")
VALUES (
    (SELECT id FROM "User" WHERE email = 'newuser@example.com'),
    (SELECT id FROM "Role" WHERE name = 'MEMBER'),
    NOW()
);
```

### **Journey Management**
```sql
-- View journey stages
SELECT * FROM "JourneyStage" ORDER BY "order";

-- Check user journey progress
SELECT 
    u.email,
    js.name as stage,
    js."order",
    ujs.status,
    ujs."startedAt",
    ujs."completedAt"
FROM "User" u
JOIN "UserJourneyState" ujs ON u.id = ujs."userId"
JOIN "JourneyStage" js ON ujs."stageId" = js.id
ORDER BY u.email, js."order";

-- Update journey stage
UPDATE "UserJourneyState" 
SET status = 'COMPLETED', "completedAt" = NOW()
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'admin@alicesolutionsgroup.com')
AND "stageId" = (SELECT id FROM "JourneyStage" WHERE name = 'Profile Setup');
```

---

## 🔧 Maintenance Operations

### **Backup and Restore**
```bash
# Create full backup
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U smartstart_user smartstart_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Create compressed backup
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U smartstart_user -Z 9 smartstart_db > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Restore from backup
docker-compose -f docker-compose.dev.yml exec -T postgres psql -U smartstart_user smartstart_db < backup_20250918_120000.sql

# Restore from compressed backup
gunzip -c backup_20250918_120000.sql.gz | docker-compose -f docker-compose.dev.yml exec -T postgres psql -U smartstart_user smartstart_db
```

### **Database Reset**
```bash
# Method 1: Complete reset (removes all data)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d

# Method 2: Reset with schema initialization
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml exec postgres psql -U smartstart_user -d smartstart_db -f /docker-entrypoint-initdb.d/init-database.sql
```

### **Schema Management**
```bash
# Prisma operations
cd server
npx prisma generate          # Generate Prisma client
npx prisma db push           # Push schema to database
npx prisma db pull           # Pull schema from database
npx prisma studio            # Open visual database browser
npx prisma migrate dev       # Create and apply migration
npx prisma migrate reset     # Reset database and apply migrations
```

---

## 🔍 Monitoring and Diagnostics

### **Database Health Checks**
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('smartstart_db'));

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE datname = 'smartstart_db';

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### **Performance Monitoring**
```sql
-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- Check table statistics
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC;
```

---

## 🛠️ Advanced Operations

### **Data Migration**
```sql
-- Add new column
ALTER TABLE "User" ADD COLUMN "newField" VARCHAR(255);

-- Modify column
ALTER TABLE "User" ALTER COLUMN "xp" SET DEFAULT 0;

-- Add index
CREATE INDEX idx_user_email ON "User"(email);

-- Add unique constraint
ALTER TABLE "User" ADD CONSTRAINT unique_username UNIQUE (username);
```

### **Data Cleanup**
```sql
-- Clean up old audit logs (if any)
DELETE FROM "audit_log" WHERE "createdAt" < NOW() - INTERVAL '30 days';

-- Clean up inactive users
UPDATE "User" 
SET status = 'INACTIVE' 
WHERE "lastActive" < NOW() - INTERVAL '90 days' 
AND status = 'ACTIVE';

-- Clean up old sessions (if any)
DELETE FROM "Session" WHERE "expiresAt" < NOW();
```

### **Security Operations**
```sql
-- Change user password (hash with bcrypt first)
UPDATE "User" 
SET password = '$2b$12$newhashedpassword' 
WHERE email = 'admin@alicesolutionsgroup.com';

-- Revoke user access
UPDATE "User" 
SET status = 'SUSPENDED' 
WHERE email = 'suspicious@example.com';

-- Check user permissions
SELECT 
    u.email,
    r.name as role,
    p.name as permission
FROM "User" u
JOIN "UserRole" ur ON u.id = ur."userId"
JOIN "Role" r ON ur."roleId" = r.id
JOIN "RolePermission" rp ON r.id = rp."roleId"
JOIN "Permission" p ON rp."permissionId" = p.id
WHERE u.email = 'admin@alicesolutionsgroup.com';
```

---

## 🐛 Troubleshooting

### **Common Issues**

#### **1. Connection Refused**
```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.dev.yml ps postgres

# Check logs
docker-compose -f docker-compose.dev.yml logs postgres

# Restart PostgreSQL
docker-compose -f docker-compose.dev.yml restart postgres
```

#### **2. Authentication Failed**
```bash
# Check credentials
docker-compose -f docker-compose.dev.yml exec postgres psql -U smartstart_user -d smartstart_db

# Reset password
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -c "ALTER USER smartstart_user PASSWORD 'smartstart_password';"
```

#### **3. Database Not Found**
```bash
# Create database
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -c "CREATE DATABASE smartstart_db;"

# Grant permissions
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE smartstart_db TO smartstart_user;"
```

#### **4. Schema Issues**
```bash
# Reset Prisma schema
cd server
npx prisma db push --force-reset

# Pull schema from database
npx prisma db pull
```

### **Log Analysis**
```bash
# View PostgreSQL logs
docker-compose -f docker-compose.dev.yml logs postgres

# View Python Brain logs
docker-compose -f docker-compose.dev.yml logs python-brain

# View all logs
docker-compose -f docker-compose.dev.yml logs
```

---

## 📊 Data Analysis

### **User Analytics**
```sql
-- User registration trends
SELECT 
    DATE("createdAt") as date,
    COUNT(*) as new_users
FROM "User" 
GROUP BY DATE("createdAt") 
ORDER BY date DESC;

-- Role distribution
SELECT 
    role,
    COUNT(*) as count
FROM "User" 
GROUP BY role 
ORDER BY count DESC;

-- XP distribution
SELECT 
    CASE 
        WHEN xp < 100 THEN '0-99'
        WHEN xp < 500 THEN '100-499'
        WHEN xp < 1000 THEN '500-999'
        ELSE '1000+'
    END as xp_range,
    COUNT(*) as users
FROM "User" 
GROUP BY xp_range 
ORDER BY MIN(xp);
```

### **Journey Analytics**
```sql
-- Journey completion rates
SELECT 
    js.name as stage,
    COUNT(ujs.id) as total_users,
    COUNT(CASE WHEN ujs.status = 'COMPLETED' THEN 1 END) as completed,
    ROUND(
        COUNT(CASE WHEN ujs.status = 'COMPLETED' THEN 1 END) * 100.0 / COUNT(ujs.id), 
        2
    ) as completion_rate
FROM "JourneyStage" js
LEFT JOIN "UserJourneyState" ujs ON js.id = ujs."stageId"
GROUP BY js.id, js.name, js."order"
ORDER BY js."order";
```

---

## 🔐 Security Best Practices

### **Access Control**
```sql
-- Create read-only user
CREATE USER readonly_user WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE smartstart_db TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Revoke unnecessary permissions
REVOKE CREATE ON SCHEMA public FROM smartstart_user;
```

### **Audit Logging**
```sql
-- Enable audit logging (if not already enabled)
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1 second
SELECT pg_reload_conf();
```

---

## 📚 Related Documentation

- **Current Database Status:** `docs/06-database/current-database-status.md`
- **Prisma Schema Guide:** `docs/06-database/prisma-schema-guide.md`
- **Database Quick Reference:** `docs/06-database/database-quick-reference.md`
- **Database Architecture:** `docs/02-architecture/database-architecture.md`

---

**🎉 Comprehensive database operations guide for our fully operational system!**

**Last Updated:** September 18, 2025  
**Maintained by:** Udi Shkolnik  
**Status:** ✅ Production Ready
