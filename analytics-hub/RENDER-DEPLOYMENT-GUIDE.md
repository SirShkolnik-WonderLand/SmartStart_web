# 🚀 RENDER DEPLOYMENT GUIDE
## Deploy Analytics Hub with Your Live Website

**Status**: Ready to Deploy  
**Target**: https://www.alicesolutionsgroup.com (Live Production Site)

---

## 🎯 **DEPLOYMENT ARCHITECTURE**

```
┌──────────────────────────────────────────────────┐
│  CLOUDFLARE CDN                                  │
│  ├── alicesolutionsgroup.com (stellar-den)      │
│  └── Tracking Script (CDN cached)               │
└────────────────┬─────────────────────────────────┘
                 │
                 ↓ Track events
┌──────────────────────────────────────────────────┐
│  RENDER - Oregon Region                          │
│                                                   │
│  1️⃣  alicesolutionsgroup-website (Existing)      │
│      https://alicesolutionsgroup.com             │
│      Port: 8080                                  │
│      Status: ✅ LIVE                             │
│                                                   │
│  2️⃣  analytics-hub-server (NEW)                  │
│      https://analytics-alicesolutions.onrender.com│
│      Port: 4000                                  │
│      Status: 🚧 Ready to deploy                  │
│                                                   │
│  3️⃣  analytics-hub-dashboard (NEW)               │
│      https://admin-alicesolutions.onrender.com   │
│      Static Site                                 │
│      Status: 🚧 Ready to deploy                  │
│                                                   │
│  4️⃣  analytics-hub-db (NEW)                      │
│      PostgreSQL 15                               │
│      Plan: Starter (1GB)                         │
│      Status: 🚧 Ready to create                  │
└──────────────────────────────────────────────────┘
```

---

## 📋 **UPDATED render.yaml**

I've created a complete `render.yaml` that includes:

✅ **3 Services**:
1. `alicesolutionsgroup-website` (your existing site)
2. `analytics-hub-server` (new analytics API)
3. `analytics-hub-dashboard` (new admin dashboard)

✅ **1 Database**:
- `analytics-hub-db` (PostgreSQL 15)

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Test Locally** (First!)

```bash
# Terminal 1: Start Analytics Hub Server
cd /Users/udishkolnik/web/SmartStart_web/analytics-hub
cp .env.example .env

# Edit .env:
# DATABASE_URL=postgresql://localhost:5432/analytics_hub
# JWT_SECRET=your-local-secret
# ADMIN_EMAIL=udi.shkolnik@alicesolutionsgroup.com
# ADMIN_PASSWORD=YourPassword123!

npm install
npm run dev:server
# Server: http://localhost:4000

# Terminal 2: Start Analytics Hub Dashboard
cd /Users/udishkolnik/web/SmartStart_web/analytics-hub/client
npm install
npm run dev
# Dashboard: http://localhost:5173

# Terminal 3: Test with stellar-den (already running on 8080)
# Your website is already running!
```

### **Step 2: Initialize PostgreSQL Locally**

```bash
# Install PostgreSQL (if not installed)
# macOS: brew install postgresql@15

# Create local database
createdb analytics_hub

# Run schema
cd /Users/udishkolnik/web/SmartStart_web/analytics-hub
psql analytics_hub < server/database/schema.sql

# Create admin user
psql analytics_hub -c "
INSERT INTO admin_users (email, password_hash, name, role, active)
VALUES (
  'udi.shkolnik@alicesolutionsgroup.com',
  '\$2b\$10\$YourHashHere',  -- Generate with: node -e \"console.log(require('bcrypt').hashSync('YourPassword123!', 10))\"
  'Udi Shkolnik',
  'admin',
  TRUE
);
"
```

### **Step 3: Add Tracker to Stellar-Den**

Create a simple integration file for stellar-den:

```bash
# File: stellar-den/client/lib/analytics.tsx
```

I'll create this file for you!

### **Step 4: Deploy to Render**

```bash
# Commit everything
git add .
git commit -m "Add Analytics Hub - Self-hosted analytics platform"
git push origin main

# Render will automatically deploy from render.yaml!
```

---

## 🔧 **LOCAL TESTING SETUP**

Let me create the integration files now!

---

## 📊 **URLs After Deployment**

```
Main Website:
https://alicesolutionsgroup.com
https://www.alicesolutionsgroup.com

Analytics API:
https://analytics-alicesolutions.onrender.com
https://analytics-alicesolutions.onrender.com/health

Admin Dashboard:
https://admin-alicesolutions.onrender.com

Database:
Internal Render PostgreSQL (connected via DATABASE_URL)
```

---

## 💰 **COST BREAKDOWN**

```
Existing:
├── alicesolutionsgroup-website: $7/month (Starter)

New (Analytics Hub):
├── analytics-hub-server:        $7/month (Starter)
├── analytics-hub-dashboard:     $0 (Static site, 100GB free)
└── analytics-hub-db:            $7/month (Starter PostgreSQL, 1GB)

Total New Cost:  $14/month
Total All:       $21/month

vs Analytics SaaS:
Mixpanel:  $20-89/month  (Save $0-75/month)
Amplitude: $49-995/month (Save $28-981/month!)
```

---

## 🎯 **NEXT STEPS**

I'll now create:
1. ✅ Integration file for stellar-den (add tracker)
2. ✅ Local .env setup instructions
3. ✅ Database seed script
4. ✅ Quick start guide

Then you can:
1. Test locally
2. Deploy to Render
3. Start tracking real analytics!

Let me create the integration files now! 🚀
