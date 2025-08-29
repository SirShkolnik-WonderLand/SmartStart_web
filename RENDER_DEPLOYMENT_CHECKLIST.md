# 🚀 Render.com Deployment Checklist

## ✅ **Pre-Deployment Checklist**

### **Repository Setup**
- [x] Code pushed to GitHub repository
- [x] `render.yaml` blueprint configured
- [x] All environment variables documented
- [x] Health check endpoints implemented
- [x] Build scripts properly configured

### **Render.com Setup**
- [ ] Create Render account at [render.com](https://render.com)
- [ ] Connect GitHub repository
- [ ] Select "Blueprint Instance" deployment
- [ ] Verify repository selection

## 🚀 **Deployment Steps**

### **Step 1: Create Blueprint Instance**
1. Go to [render.com](https://render.com)
2. Click "New +" → "Blueprint Instance"
3. Connect your GitHub account
4. Select `udishkolnik/SmartStart` repository
5. Click "Create Blueprint Instance"

### **Step 2: Monitor Deployment**
Render will automatically:
- [ ] Create PostgreSQL database (`smartstart-db`)
- [ ] Deploy API service (`smartstart-api`)
- [ ] Deploy web service (`smartstart-web`)
- [ ] Run database migrations
- [ ] Configure environment variables
- [ ] Set up health checks

### **Step 3: Verify Services**
After deployment completes:

#### **Check API Health**
```bash
curl https://your-api-name.onrender.com/health
# Expected: {"ok": true}
```

#### **Check API Version**
```bash
curl https://your-api-name.onrender.com/version
# Expected: {"name": "smartstart-api", "version": "dev"}
```

#### **Check Web App**
```bash
curl https://your-web-name.onrender.com
# Expected: HTML response (200 OK)
```

## 🔧 **Post-Deployment Configuration**

### **Environment Variables (Auto-configured)**
- ✅ `DATABASE_URL` - From Render database
- ✅ `NEXT_PUBLIC_API_URL` - From API service URL
- ✅ `WEB_ORIGIN` - From web service URL
- ✅ `JWT_SECRET` - Auto-generated
- ✅ `SESSION_SECRET` - Auto-generated
- ✅ `NODE_ENV` - Set to production
- ✅ Rate limiting configurations
- ✅ RBAC and security settings

### **Optional: Database Seeding**
If you want to add sample data:
1. Go to Render dashboard
2. Select your database service
3. Click "Connect" → "External Database"
4. Use the connection string to connect and run:
```sql
-- Add sample data here if needed
```

### **Optional: Custom Domain**
1. Go to your web service in Render dashboard
2. Settings → Custom Domains
3. Add your domain and configure DNS

## 🧪 **Testing Your Deployment**

### **Demo Accounts**
Use these accounts to test the platform:
- **Admin**: `admin@smartstart.com` / `admin123`
- **Owner**: `owner@demo.local` / `owner123`
- **Contributor**: `contrib@demo.local` / `contrib123`

### **Test Scenarios**
1. **Authentication**: Login with demo accounts
2. **Projects**: Create and manage projects
3. **Community**: Post ideas, create polls, send messages
4. **Admin**: Access admin dashboard and user management
5. **API**: Test API endpoints via health checks

## 📊 **Monitoring & Maintenance**

### **Render Dashboard Features**
- **Logs**: Real-time application logs
- **Metrics**: Performance and usage statistics
- **Health Checks**: Automatic service monitoring
- **Database**: Connection and query monitoring

### **Health Check Endpoints**
- **Web**: `https://your-web-name.onrender.com/`
- **API**: `https://your-api-name.onrender.com/health`
- **Version**: `https://your-api-name.onrender.com/version`

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Build Failures**
- Check Node.js version (should be 18+)
- Verify pnpm version (should be 8+)
- Check build logs in Render dashboard

#### **Database Connection Issues**
- Verify `DATABASE_URL` environment variable
- Check database service status
- Review migration logs

#### **Environment Variable Issues**
- Verify all required variables are set
- Check service dependencies are linked
- Review environment variable logs

### **Support Resources**
- [Render Documentation](https://render.com/docs)
- [SmartStart Deployment Guide](./docs/DEPLOYMENT.md)
- [Troubleshooting Guide](./docs/DEPLOYMENT.md#troubleshooting)

## 🎉 **Success Indicators**

Your deployment is successful when:
- ✅ All services show "Live" status in Render dashboard
- ✅ Health checks return `{"ok": true}`
- ✅ Web app loads without errors
- ✅ API endpoints respond correctly
- ✅ Database migrations completed successfully
- ✅ Authentication works with demo accounts

---

**🎯 Ready to deploy? Follow the steps above and your SmartStart platform will be live on Render.com!**
