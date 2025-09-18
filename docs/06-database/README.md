# 🗄️ Database Documentation - SmartStart Platform

## 📚 Overview

Complete database documentation for the SmartStart Platform, including schema, operations, and management guides. This is our comprehensive reference for all database-related work.

**Last Updated:** September 18, 2025  
**Status:** ✅ **FULLY OPERATIONAL** - Complete RBAC system with real users  

---

## 📋 Documentation Index

### **🔧 Current Status & Operations**
- **[Current Database Status](current-database-status.md)** - Complete overview of our current database setup
- **[Database Operations Guide](database-operations-guide.md)** - Comprehensive operations and maintenance guide
- **[Database Quick Reference](database-quick-reference.md)** - Quick reference for common operations

### **🏗️ Schema & Architecture**
- **[Prisma Schema Guide](prisma-schema-guide.md)** - Complete Prisma schema documentation
- **[Database Architecture](database-architecture.md)** - Overall database architecture and design
- **[Connection Guide](connection-guide.md)** - Database connection methods and credentials

### **📊 Data Management**
- **[Data Dictionary](data-dictionary.md)** - Complete data dictionary and field definitions
- **[Database Status](database-status.md)** - Database status and health monitoring
- **[Database Complete Status](database-complete-status.md)** - Complete database implementation status

---

## 🎯 Quick Start

### **1. Current Database Status**
Our database is **fully operational** with:
- **5 Users** created with complete RBAC system
- **8 Core Tables** with proper relationships
- **Docker + PostgreSQL** setup for development
- **Python Brain + Node.js** services connected

### **2. Connection Details**
```bash
# Database Connection
Host: localhost (or postgres from Docker)
Port: 5432
Database: smartstart_db
User: smartstart_user
Password: smartstart_password

# Connection String
postgresql://smartstart_user:smartstart_password@localhost:5432/smartstart_db
```

### **3. Quick Commands**
```bash
# Start database
docker-compose -f docker-compose.dev.yml up -d

# Connect to database
docker-compose -f docker-compose.dev.yml exec postgres psql -U smartstart_user -d smartstart_db

# Test Python Brain
curl http://localhost:5002/api/health
```

---

## 👥 Current Users

| **Email** | **Password** | **Role** | **Level** | **XP** |
|-----------|--------------|----------|-----------|--------|
| admin@alicesolutionsgroup.com | SuperAdmin123! | SUPER_ADMIN | DRAGON | 10,000 |
| manager@alicesolutionsgroup.com | Admin123! | ADMIN | PHOENIX | 5,000 |
| developer@alicesolutionsgroup.com | Member123! | MEMBER | OWLET | 1,000 |
| designer@alicesolutionsgroup.com | Member123! | MEMBER | OWLET | 800 |
| visitor@example.com | Guest123! | GUEST | OWLET | 100 |

---

## 🏗️ Database Architecture

### **Core Tables (8 Tables)**
- **User** - User accounts and profiles
- **Role** - RBAC roles (SUPER_ADMIN, ADMIN, MANAGER, MEMBER, GUEST)
- **Permission** - Granular permissions (user:read, venture:write, etc.)
- **RolePermission** - Role-permission mappings
- **UserRole** - User-role assignments
- **JourneyStage** - Onboarding journey stages
- **UserJourneyState** - Individual user progress tracking
- **BillingPlan** - Subscription plans
- **Subscription** - User subscriptions

### **Key Features**
- **RBAC System** - Complete role-based access control
- **Journey Tracking** - User onboarding progress
- **Gamification** - XP, levels, reputation system
- **Subscription Management** - Billing and subscription tracking

---

## 🔧 Common Operations

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

---

## 🚀 Development Workflow

### **1. Start Development Environment**
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Check status
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

### **2. Database Operations**
```bash
# Connect to database
docker-compose -f docker-compose.dev.yml exec postgres psql -U smartstart_user -d smartstart_db

# Prisma operations
cd server
npx prisma studio  # Visual database browser
npx prisma generate # Generate Prisma client
npx prisma db push  # Push schema changes
```

### **3. Testing**
```bash
# Test Python Brain
curl http://localhost:5002/api/health

# Test authentication
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@alicesolutionsgroup.com", "password": "SuperAdmin123!"}'
```

---

## 🔐 Security Features

### **RBAC System**
- **5 Roles** - SUPER_ADMIN, ADMIN, MANAGER, MEMBER, GUEST
- **20+ Permissions** - Granular access control
- **User-Role Assignments** - Flexible role management
- **Permission Checking** - Server-side validation

### **Data Security**
- **Password Hashing** - bcrypt encryption
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Comprehensive data validation
- **Audit Logging** - Complete action tracking

---

## 📊 Monitoring & Maintenance

### **Health Checks**
```bash
# Database health
curl http://localhost:5002/api/health

# User authentication
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@alicesolutionsgroup.com", "password": "SuperAdmin123!"}'
```

### **Backup & Restore**
```bash
# Create backup
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U smartstart_user smartstart_db > backup.sql

# Restore backup
docker-compose -f docker-compose.dev.yml exec -T postgres psql -U smartstart_user smartstart_db < backup.sql
```

---

## 🐛 Troubleshooting

### **Common Issues**
1. **Connection Refused** - Check if PostgreSQL is running
2. **Authentication Failed** - Verify credentials
3. **Schema Issues** - Run Prisma operations
4. **Permission Denied** - Check RBAC assignments

### **Quick Fixes**
```bash
# Restart services
docker-compose -f docker-compose.dev.yml restart

# Reset database
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d

# Check logs
docker-compose -f docker-compose.dev.yml logs -f postgres
```

---

## 📚 Related Documentation

### **Architecture**
- **System Architecture:** `docs/02-architecture/system-architecture.md`
- **API Architecture:** `docs/02-architecture/api-architecture.md`
- **Frontend Architecture:** `docs/02-architecture/frontend-architecture.md`

### **Development**
- **Development Guide:** `docs/03-development/development-guide.md`
- **API Reference:** `docs/05-api/api-reference.md`
- **Security Guide:** `docs/07-security/security-overview.md`

### **Deployment**
- **Deployment Guide:** `docs/04-deployment/deployment-quick-start.md`
- **Render Best Practices:** `docs/04-deployment/render-best-practices.md`

---

## 🎯 Next Steps

### **Immediate Tasks**
1. **Add More Users** - Create test users for different roles
2. **Test RBAC** - Verify permission enforcement
3. **Journey Testing** - Test onboarding flow
4. **API Testing** - Verify all endpoints work

### **Future Enhancements**
1. **Data Seeding** - Create comprehensive test data
2. **Performance Testing** - Load testing with more users
3. **Backup Strategy** - Automated backup system
4. **Monitoring** - Database performance monitoring

---

**🎉 Our database is fully operational and ready for development!**

**Last Updated:** September 18, 2025  
**Maintained by:** Udi Shkolnik  
**Status:** ✅ Production Ready
