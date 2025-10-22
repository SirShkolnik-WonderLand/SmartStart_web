# 🧪 LOCAL TESTING GUIDE
## Test Analytics Hub with Your Live Website

**Goal**: Connect analytics-hub (local) to stellar-den (local port 8080) and track real events!

---

## 🎯 **SETUP (5 Minutes)**

### **Step 1: Install Dependencies**

```bash
cd /Users/udishkolnik/web/SmartStart_web/analytics-hub

# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..

# Install tracker dependencies
cd tracker
npm install
cd ..
```

### **Step 2: Set Up Local Environment**

```bash
cd /Users/udishkolnik/web/SmartStart_web/analytics-hub

# Create .env file
cat > .env << 'EOF'
NODE_ENV=development
PORT=4000
HOST=localhost

# Use SQLite for quick local testing (no PostgreSQL needed!)
DATABASE_URL=sqlite://./analytics.db

# JWT
JWT_SECRET=local-dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Admin credentials
ADMIN_EMAIL=udi.shkolnik@alicesolutionsgroup.com
ADMIN_PASSWORD=DevPassword123!

# CORS (allow stellar-den on port 8080)
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173,https://alicesolutionsgroup.com

# Rate limiting (relaxed for dev)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
EOF
```

### **Step 3: Initialize Database (SQLite - Easy!)**

```bash
# Install better-sqlite3 for local dev
npm install better-sqlite3

# Create init script
cat > scripts/init-sqlite.js << 'EOF'
const Database = require('better-sqlite3');
const fs = require('fs');
const bcrypt = require('bcrypt');

// Create database
const db = new Database('./analytics.db');

// Read and execute schema (simplified for SQLite)
console.log('Creating tables...');

// Create tables manually for SQLite
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'admin',
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Create admin user
const password = 'DevPassword123!';
const hash = bcrypt.hashSync(password, 10);

db.prepare(`
  INSERT OR REPLACE INTO admin_users (email, password_hash, name, role)
  VALUES (?, ?, ?, ?)
`).run('udi.shkolnik@alicesolutionsgroup.com', hash, 'Udi Shkolnik', 'admin');

console.log('✅ Database initialized!');
console.log('✅ Admin user created: udi.shkolnik@alicesolutionsgroup.com');
console.log('✅ Password: DevPassword123!');

db.close();
EOF

# Run init script
node scripts/init-sqlite.js
```

---

## 🚀 **RUN LOCALLY (3 Terminals)**

### **Terminal 1: Analytics Hub Server**
```bash
cd /Users/udishkolnik/web/SmartStart_web/analytics-hub
npm run dev:server

# ✅ Server running on http://localhost:4000
# ✅ WebSocket on ws://localhost:4000
```

### **Terminal 2: Analytics Hub Dashboard**
```bash
cd /Users/udishkolnik/web/SmartStart_web/analytics-hub/client
npm run dev

# ✅ Dashboard running on http://localhost:5173
# Login: udi.shkolnik@alicesolutionsgroup.com
# Password: DevPassword123!
```

### **Terminal 3: Stellar-Den Website** (Already Running!)
```bash
cd /Users/udishkolnik/web/SmartStart_web/stellar-den
pnpm dev

# ✅ Website running on http://localhost:8080
```

---

## 📊 **TEST THE INTEGRATION**

### **1. Test Backend API**
```bash
# Health check
curl http://localhost:4000/health

# Expected:
# {"success":true,"status":"healthy","timestamp":"...","version":"1.0.0"}

# Track a test event
curl -X POST http://localhost:4000/api/v1/pageview \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-123",
    "pageUrl": "http://localhost:8080/",
    "pageTitle": "Home - AliceSolutions"
  }'

# Expected:
# {"success":true}
```

### **2. Login to Dashboard**
```
1. Open: http://localhost:5173/login
2. Email: udi.shkolnik@alicesolutionsgroup.com
3. Password: DevPassword123!
4. Click "Sign In"
5. ✅ You should see the dashboard!
```

### **3. Add Tracker to Stellar-Den**

Add this to your stellar-den App.tsx:

```typescript
// At the top of stellar-den/client/App.tsx
import { useEffect } from 'react';

// Inside the App component:
useEffect(() => {
  // Initialize analytics
  (window as any).analyticsHubConfig = {
    apiUrl: 'http://localhost:4000',
    autoTrack: true,
    trackOutbound: true,
    trackScroll: true,
  };

  // Load tracker script
  const script = document.createElement('script');
  script.src = 'http://localhost:4000/tracker.js';  // Use local for testing
  script.async = true;
  document.head.appendChild(script);

  console.log('✅ Analytics tracker loaded');
}, []);
```

### **4. Test Real Tracking**

```
1. Open stellar-den: http://localhost:8080
2. Navigate between pages
3. Click buttons
4. Fill forms
5. Open dashboard: http://localhost:5173
6. ✅ You should see real-time stats!
```

---

## 🎨 **WHAT YOU'LL SEE**

### **Dashboard (http://localhost:5173)**
```
┌──────────────────────────────────────────┐
│  📊 Analytics Hub                         │
├──────────────────────────────────────────┤
│  TODAY                                    │
│  👥 Visitors: 1    📄 Views: 5           │
│  🎯 Conversions: 0 ⏱️  Avg: 0:45          │
│                                           │
│  REAL-TIME                                │
│  🟢 1 online now                          │
│  📍 / (Homepage)                          │
│                                           │
│  TRAFFIC CHART                            │
│  [Beautiful animated line chart]         │
│                                           │
│  DEVICES          SOURCES                │
│  💻 Desktop 100%  Direct 100%            │
└──────────────────────────────────────────┘
```

### **Real-Time Page**
```
┌──────────────────────────────────────────┐
│  🔴 Real-Time Analytics                   │
├──────────────────────────────────────────┤
│  ACTIVE NOW                               │
│  👥 1 visitor  🌍 Toronto, CA            │
│                                           │
│  ACTIVE PAGES                             │
│  / (Homepage) • 1 visitor                │
│  /services • 0 visitors                  │
│                                           │
│  RECENT ACTIVITY                          │
│  👁️  Page View • / • Just now             │
│  🖱️  Click • Book a Call • 5s ago        │
│  📄 Page View • /services • 12s ago      │
└──────────────────────────────────────────┘
```

---

## 🔧 **TROUBLESHOOTING**

### **Issue: CORS errors**
```bash
# Make sure ALLOWED_ORIGINS in .env includes:
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173
```

### **Issue: Database errors**
```bash
# Recreate SQLite database:
rm analytics.db
node scripts/init-sqlite.js
```

### **Issue: Can't login**
```bash
# Reset admin password:
node -e "console.log(require('bcrypt').hashSync('DevPassword123!', 10))"
# Copy the hash and update in database
```

### **Issue: No events tracked**
```bash
# Check browser console (F12)
# Should see: "✅ Analytics tracker loaded"

# Check network tab
# Should see POST requests to http://localhost:4000/api/v1/pageview
```

---

## ✅ **SUCCESS CHECKLIST**

- [ ] Analytics server running on port 4000
- [ ] Dashboard running on port 5173
- [ ] Stellar-den running on port 8080
- [ ] Can login to dashboard
- [ ] Can see "0 visitors" initially
- [ ] Navigate stellar-den pages
- [ ] See visitor count increase in dashboard
- [ ] See real-time page list update
- [ ] See recent activity feed populate
- [ ] See traffic charts update

---

## 🎉 **WHEN WORKING:**

You'll have:
- ✅ **Self-hosted analytics** tracking your real website
- ✅ **Real-time dashboard** showing live data
- ✅ **Beautiful UI** with smooth animations
- ✅ **Privacy-compliant** tracking
- ✅ **Complete control** over your data

---

## 🚀 **NEXT: DEPLOY TO PRODUCTION**

Once local testing works:
1. Commit to Git
2. Push to GitHub
3. Render auto-deploys from render.yaml
4. Update stellar-den to use production analytics URL
5. **LIVE!** 🎉

---

*Local Testing Guide - Ready to test!*  
*Total setup time: ~5 minutes*  
*Let's see your analytics come to life!* ✨
