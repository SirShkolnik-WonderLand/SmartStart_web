# 🚀 Manual Deployment to Render.com

Since the `render.yaml` blueprint approach isn't working, here's how to deploy manually:

## 📋 **Step 1: Create Database**

1. Go to [Render.com Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"PostgreSQL"**
3. **Name:** `smartstart-db`
4. **Plan:** `Free`
5. **Region:** Choose closest to you
6. Click **"Create Database"**
7. **Save the connection string** - you'll need it for the API service

## 📋 **Step 2: Create API Service**

1. Click **"New"** → **"Web Service"**
2. **Connect your GitHub repo:** `udishkolnik/SmartStart`
3. **Name:** `smartstart-api`
4. **Runtime:** `Node`
5. **Build Command:** `npm ci --only=production && npx prisma generate`
6. **Start Command:** `npm run start:api`
7. **Plan:** `Free`

### **Environment Variables:**
```
DATABASE_URL = [Your database connection string from Step 1]
JWT_SECRET = [Generate a random string]
NEXTAUTH_SECRET = [Generate a random string]
API_PORT = 3001
NODE_ENV = production
WORKER_ENABLED = true
STORAGE_ENABLED = true
MONITOR_ENABLED = true
```

8. Click **"Create Web Service"**

## 📋 **Step 3: Create Frontend Service**

1. Click **"New"** → **"Web Service"**
2. **Connect your GitHub repo:** `udishkolnik/SmartStart`
3. **Name:** `smartstart-platform`
4. **Runtime:** `Node`
5. **Build Command:** `npm ci --only=production && npx prisma generate && npm run build`
6. **Start Command:** `npm start`
7. **Plan:** `Free`

### **Environment Variables:**
```
DATABASE_URL = [Same database connection string]
JWT_SECRET = [Same JWT_SECRET from API]
NEXTAUTH_SECRET = [Same NEXTAUTH_SECRET from API]
NEXTAUTH_URL = https://[your-frontend-service-name].onrender.com
NEXT_PUBLIC_API_URL = https://[your-api-service-name].onrender.com
NODE_ENV = production
```

8. Click **"Create Web Service"**

## 🔧 **Post-Deployment Setup**

1. **Run Database Migrations:**
   - Go to your API service logs
   - The service should automatically run Prisma migrations

2. **Seed the Database:**
   - You can run: `npm run db:seed:v1` locally with the production DATABASE_URL

## 🌐 **Your URLs Will Be:**
- **Frontend:** `https://smartstart-platform.onrender.com`
- **API:** `https://smartstart-api.onrender.com`
- **Database:** Managed by Render

## ✅ **Why This Approach Works:**
- **No YAML parsing issues**
- **Full control over each service**
- **Easier to debug and modify**
- **Same end result as blueprint**

---

**Need help?** Check the `RENDER_TROUBLESHOOTING.md` file for more details.
