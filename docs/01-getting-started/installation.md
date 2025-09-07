# 🚀 SmartStart Platform - Installation Guide

## 📋 Prerequisites

Before installing the SmartStart Platform, ensure you have the following:

### **System Requirements**
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **PostgreSQL**: Version 13 or higher (for local development)
- **Git**: Latest version

### **Development Tools**
- **VS Code** (recommended) with extensions:
  - Prisma
  - TypeScript
  - ESLint
  - Prettier
- **Postman** or **Insomnia** for API testing
- **pgAdmin** or **DBeaver** for database management

## 🏗️ Installation Steps

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/udishkolnik/SmartStart.git
cd SmartStart
```

### **Step 2: Install Dependencies**

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install server dependencies
cd ../server
npm install
```

### **Step 3: Environment Configuration**

Create environment files:

```bash
# Root directory
cp env.example .env

# Frontend directory
cd frontend
cp .env.example .env.local

# Server directory
cd ../server
cp .env.example .env
```

### **Step 4: Database Setup**

#### **Option A: Local PostgreSQL**
```bash
# Create database
createdb smartstart

# Set DATABASE_URL in .env
DATABASE_URL="postgresql://username:password@localhost:5432/smartstart"
```

#### **Option B: Use Production Database**
```bash
# Use the production database URL
DATABASE_URL="postgresql://smartstart_user:aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh@dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com/smartstart"
```

### **Step 5: Database Migration**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### **Step 6: Start Development Servers**

```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend development server
cd frontend
npm run dev
```

## 🔧 Configuration

### **Environment Variables**

#### **Root .env**
```bash
# Database
DATABASE_URL="postgresql://user:pass@host:port/db"

# JWT Secret
JWT_SECRET="your-secret-key"

# Node Environment
NODE_ENV="development"
```

#### **Frontend .env.local**
```bash
# API Base URL
NEXT_PUBLIC_API_URL="http://localhost:3001"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### **Server .env**
```bash
# Port
PORT=3001

# Database
DATABASE_URL="postgresql://user:pass@host:port/db"

# JWT
JWT_SECRET="your-secret-key"

# Services
WORKER_ENABLED=false
STORAGE_ENABLED=false
MONITOR_ENABLED=false
```

## 🧪 Verification

### **Test Backend API**
```bash
# Health check
curl http://localhost:3001/api/health

# System status
curl http://localhost:3001/api/system/status
```

### **Test Frontend**
1. Open http://localhost:3000
2. Verify the application loads
3. Test login/register functionality

### **Test Database Connection**
```bash
# Open Prisma Studio
npx prisma studio

# Or connect directly
psql $DATABASE_URL
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Database Connection Failed**
- Verify DATABASE_URL is correct
- Check if PostgreSQL is running
- Ensure database exists

#### **Port Already in Use**
- Change PORT in .env files
- Kill existing processes: `lsof -ti:3000 | xargs kill`

#### **Prisma Client Not Generated**
```bash
npx prisma generate
```

#### **Migration Issues**
```bash
# Reset database (careful!)
npx prisma migrate reset

# Or force deploy
npx prisma migrate deploy --force
```

## 📚 Next Steps

After successful installation:

1. **Read the [Quick Start Guide](quick-start.md)**
2. **Follow the [User Journey Guide](user-journey.md)**
3. **Explore the [API Reference](../05-api/api-reference.md)**
4. **Check the [Development Guide](../03-development/development-guide.md)**

## 🆘 Getting Help

- **Documentation**: Check other guides in this documentation
- **Issues**: Create an issue in the repository
- **API Problems**: Review [API Reference](../05-api/api-reference.md)
- **Database Issues**: See [Database Guide](../06-database/connection-guide.md)

---

**🎉 You're ready to start building with SmartStart Platform!** 🚀
