# 🔑 SmartStart Platform - Database Connection Guide

## 📋 Overview

This guide provides comprehensive information about connecting to the SmartStart Platform's production database on Render.com. The platform uses a PostgreSQL database with comprehensive schema and multiple connection options.

## 🎯 **What We've Accomplished**

### **✅ Complete Infrastructure Deployment**
- **Database Service**: `smartstart-db` - PostgreSQL on Render Basic-256mb plan
- **API Service**: `smartstart-api` - Node.js API on Render Starter plan
- **Total Cost**: $17.50/month for production-ready infrastructure

### **✅ Comprehensive Database Schema**
- **Full Prisma Schema**: Applied with all tables and relationships
- **Migration System**: Proper Prisma migrations deployed
- **Seed Data**: Initial data populated for testing
- **Production Ready**: All tables, indexes, and constraints created

### **✅ Working API Endpoints**
- **Health Check**: `/api/health` - Database connection status
- **Test Endpoints**: `/api/v1/test/*` - Full CRUD operations
- **Migration Endpoint**: `/api/v1/migrate` - Database management
- **Seed Endpoint**: `/api/v1/seed` - Data population

## 🔑 **Database Connection Details**

### **Production Database Credentials**
- **Service Name**: `smartstart-db`
- **Host**: `dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com`
- **Port**: `5432`
- **Database**: `smartstart`
- **Username**: `smartstart_user`
- **Password**: `aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh`
- **Region**: Oregon (US West)

### **Connection URLs**

#### **Internal (Render Services)**
```bash
postgresql://smartstart_user:aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh@dpg-d2r25k7diees73dp78a0-a/smartstart
```
*Use this for service-to-service communication within Render*

#### **External (Local Development)**
```bash
postgresql://smartstart_user:aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh@dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com/smartstart
```
*Use this for local development and external tools*

## 🚀 **Connection Methods**

### **Method 1: Render CLI (Recommended for Management)**

#### **Install Render CLI**
```bash
# macOS
brew install render

# Windows
scoop install render

# Linux
curl -sL https://render.com/download.sh | sh
```

#### **Connect to Database**
```bash
# Login to Render
render login

# Connect to database
render psql dpg-d2r25k7diees73dp78a0-a
```

### **Method 2: Direct PSQL Connection**

#### **Using PSQL Command**
```bash
PGPASSWORD=aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh psql -h dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com -U smartstart_user -d smartstart
```

#### **Using Environment Variable**
```bash
export PGPASSWORD=aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh
psql -h dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com -U smartstart_user -d smartstart
```

### **Method 3: Environment Variables for Development**

#### **Set Database URL**
```bash
export DATABASE_URL="postgresql://smartstart_user:aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh@dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com/smartstart"
```

#### **Run Prisma Commands**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database (careful!)
npx prisma migrate reset
```

### **Method 4: Database Management Tools**

#### **pgAdmin**
- **Host**: `dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com`
- **Port**: `5432`
- **Database**: `smartstart`
- **Username**: `smartstart_user`
- **Password**: `aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh`

#### **DBeaver**
- **Driver**: PostgreSQL
- **Host**: `dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com`
- **Port**: `5432`
- **Database**: `smartstart`
- **Username**: `smartstart_user`
- **Password**: `aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh`

## 🗄️ **Database Schema Overview**

### **Core Tables Deployed**
- **User Management**: User, Account, Role, Permission, Session
- **Project Management**: Project, Task, Sprint, Contribution
- **Equity & Legal**: ContractOffer, EquityVesting, LegalEntity, LegalDocument
- **Community**: Badge, Skill, Kudos, Message, Poll
- **Governance**: CoopGovernance, ComplianceRecord, AuditEvent
- **And much more!**

### **Schema Verification**
```bash
# Check what tables exist
\dt

# View table structure
\d+ "User"

# Check indexes
\di

# View constraints
\d+ "User"
```

## 🧪 **Testing the Connection**

### **1. Health Check via API**
```bash
curl -s https://smartstart-api.onrender.com/api/health | jq '.'
```

### **2. Database Status Check**
```bash
curl -s https://smartstart-api.onrender.com/api/v1/test/status | jq '.'
```

### **3. Test CRUD Operations**
```bash
# Create test user
curl -X POST https://smartstart-api.onrender.com/api/v1/test/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "level": "WISE_OWL", "xp": 150}'

# Get all test data
curl -s https://smartstart-api.onrender.com/api/v1/test/data | jq '.'
```

## 🔒 **Security Best Practices**

### **Connection Security**
- ✅ **Use Internal URLs** for Render service-to-service communication
- ✅ **Use External URLs** for local development and external tools
- ✅ **Store Credentials Securely** - Never commit passwords to git
- ✅ **Use Environment Variables** for sensitive data
- ✅ **Limit Access** - Only share credentials with team members

### **Database Security**
- ✅ **Connection Pooling** - Use Prisma's built-in connection management
- ✅ **Parameterized Queries** - Always use Prisma ORM (prevents SQL injection)
- ✅ **Role-Based Access** - Implement proper user permissions
- ✅ **Audit Logging** - All changes are logged for compliance

## 🚨 **Troubleshooting**

### **Common Connection Issues**

#### **Connection Refused**
```bash
# Check if service is running
curl -s https://smartstart-api.onrender.com/api/health

# Verify database credentials
render psql dpg-d2r25k7diees73dp78a0-a
```

#### **Authentication Failed**
```bash
# Verify password is correct
# Check if username exists
# Ensure database name is correct
```

#### **SSL Connection Issues**
```bash
# Add SSL mode to connection string
postgresql://user:pass@host:port/db?sslmode=require
```

### **Getting Help**
1. **Check Render Dashboard** - Service status and logs
2. **Verify Credentials** - Ensure all connection details are correct
3. **Check Network** - Ensure your network allows outbound connections
4. **Contact Support** - Render support for infrastructure issues

## 📚 **Additional Resources**

### **Documentation**
- **[Main README](../README.md)** - Platform overview and quick start
- **[Deployment Guide](DEPLOYMENT_QUICK_START.md)** - Complete deployment process
- **[API Reference](API_REFERENCE.md)** - All available endpoints
- **[System Architecture](SYSTEM_ARCHITECTURE.md)** - Overall system design

### **Tools & Scripts**
- **Test Scripts**: `test-api.sh`, `test-full-api.sh` - API testing
- **SSH Credentials**: `RENDER_SSH_CREDENTIALS.md` - SSH access setup
- **Render Blueprint**: `render.yaml` - Infrastructure configuration

---

## 🎉 **Ready to Connect!**

You now have everything you need to connect to the SmartStart Platform's production database:

1. **Multiple connection methods** for different use cases
2. **Complete credentials** and connection strings
3. **Working API endpoints** for testing and development
4. **Comprehensive documentation** for troubleshooting

**Start building amazing things with your fully functional backend!** 🚀✨
