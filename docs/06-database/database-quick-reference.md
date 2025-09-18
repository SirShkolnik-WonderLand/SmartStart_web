# 🗄️ Database Quick Reference - SmartStart Platform

## 📚 Overview

Quick reference guide for common database operations, connection strings, and troubleshooting in our SmartStart Platform.

**Last Updated:** September 18, 2025  
**Status:** ✅ **FULLY OPERATIONAL** - Complete RBAC system with real users  

---

## 🚀 Quick Start

### **1. Start Database**
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Check status
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f postgres
```

### **2. Connect to Database**
```bash
# Direct PostgreSQL access
docker-compose -f docker-compose.dev.yml exec postgres psql -U smartstart_user -d smartstart_db

# Or from host
psql -h localhost -p 5432 -U smartstart_user -d smartstart_db
```

### **3. Test Python Brain**
```bash
# Test API
curl http://localhost:5002/api/health

# Test login
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@alicesolutionsgroup.com", "password": "SuperAdmin123!"}'
```

---

## 🔗 Connection Strings

### **Python Brain (psycopg2)**
```python
DATABASE_URL = "postgresql://smartstart_user:smartstart_password@postgres:5432/smartstart_db"
```

### **Node.js/Prisma**
```bash
DATABASE_URL = "postgresql://smartstart_user:smartstart_password@localhost:5432/smartstart_db"
```

### **Direct Access**
```bash
postgresql://smartstart_user:smartstart_password@localhost:5432/smartstart_db
```

---

## 👥 Current Users

| **Email** | **Password** | **Role** | **Level** |
|-----------|--------------|----------|-----------|
| admin@alicesolutionsgroup.com | SuperAdmin123! | SUPER_ADMIN | DRAGON |
| manager@alicesolutionsgroup.com | Admin123! | ADMIN | PHOENIX |
| developer@alicesolutionsgroup.com | Member123! | MEMBER | OWLET |
| designer@alicesolutionsgroup.com | Member123! | MEMBER | OWLET |
| visitor@example.com | Guest123! | GUEST | OWLET |

---

## 📊 Common Queries

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

## 🔧 Database Management

### **Backup Database**
```bash
# Create backup
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U smartstart_user smartstart_db > backup.sql

# Restore backup
docker-compose -f docker-compose.dev.yml exec -T postgres psql -U smartstart_user smartstart_db < backup.sql
```

### **Reset Database**
```bash
# Stop and remove volumes
docker-compose -f docker-compose.dev.yml down -v

# Start fresh
docker-compose -f docker-compose.dev.yml up -d

# Re-initialize schema
docker-compose -f docker-compose.dev.yml exec postgres psql -U smartstart_user -d smartstart_db -f /docker-entrypoint-initdb.d/init-database.sql
```

### **Prisma Operations**
```bash
# Generate Prisma client
npx prisma generate

# Open Prisma Studio
npx prisma studio

# Sync schema
npx prisma db push

# Pull schema from database
npx prisma db pull
```

---

## 🐛 Troubleshooting

### **Connection Issues**
```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.dev.yml ps postgres

# Check logs
docker-compose -f docker-compose.dev.yml logs postgres

# Restart PostgreSQL
docker-compose -f docker-compose.dev.yml restart postgres
```

### **Python Brain Issues**
```bash
# Check Python Brain logs
docker-compose -f docker-compose.dev.yml logs python-brain

# Restart Python Brain
docker-compose -f docker-compose.dev.yml restart python-brain

# Test connection
curl http://localhost:5002/api/health
```

### **Frontend Issues**
```bash
# Check frontend logs
docker-compose -f docker-compose.dev.yml logs frontend

# Restart frontend
docker-compose -f docker-compose.dev.yml restart frontend
```

---

## 📋 Table Structure

### **Core Tables**
- **User** - User accounts and profiles
- **Role** - RBAC roles
- **Permission** - Granular permissions
- **RolePermission** - Role-permission mappings
- **UserRole** - User-role assignments
- **JourneyStage** - Onboarding stages
- **UserJourneyState** - User progress
- **BillingPlan** - Subscription plans
- **Subscription** - User subscriptions

### **Key Columns**
- **User.id** - Primary key
- **User.email** - Unique identifier
- **User.role** - SUPER_ADMIN, ADMIN, MANAGER, MEMBER, GUEST
- **User.level** - DRAGON, PHOENIX, OWLET
- **User.xp** - Experience points
- **User.reputation** - Reputation score

---

## 🔐 RBAC Quick Reference

### **Roles**
- **SUPER_ADMIN** - Full system access
- **ADMIN** - High-level management
- **MANAGER** - Team management
- **MEMBER** - Standard user access
- **GUEST** - Read-only access

### **Permissions Format**
- **Resource:Action** (e.g., `user:read`, `venture:write`)
- **Resources:** user, venture, legal, system, subscription
- **Actions:** read, write, delete, admin

### **Permission Checking**
```typescript
// Check if user has permission
const hasPermission = await hasPermission(userId, 'user', 'read')
```

---

## 🚀 Development Commands

### **Start Development**
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Start frontend locally
cd frontend && npm run dev

# Start Python Brain locally
cd python-services && python refactored_brain.py
```

### **Testing**
```bash
# Test API endpoints
curl http://localhost:5002/api/health
curl http://localhost:5002/api/users

# Test authentication
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@alicesolutionsgroup.com", "password": "SuperAdmin123!"}'
```

### **Database Operations**
```bash
# Connect to database
docker-compose -f docker-compose.dev.yml exec postgres psql -U smartstart_user -d smartstart_db

# View tables
\dt

# Describe table
\d "User"

# Exit
\q
```

---

## 📚 Related Documentation

- **Current Database Status:** `docs/06-database/current-database-status.md`
- **Prisma Schema Guide:** `docs/06-database/prisma-schema-guide.md`
- **Database Architecture:** `docs/02-architecture/database-architecture.md`
- **API Reference:** `docs/05-api/api-reference.md`

---

**🎉 Quick reference for our fully operational database system!**

**Last Updated:** September 18, 2025  
**Maintained by:** Udi Shkolnik  
**Status:** ✅ Production Ready
