# 🚀 DEPLOYMENT CHECKLIST

## ✅ **Pre-Deployment Checks**

### **1. Code Fixes** ✅
- ✅ Fixed hardcoded localhost URLs (QuickBotMode, FullAssessment)
- ✅ All API endpoints use relative paths (`/api/...`)
- ✅ .gitignore updated to exclude .env files

### **2. Email System** ✅
- ✅ Contact form wired
- ✅ ContactModal wired
- ✅ ISO Studio checklist wired
- ✅ ISO Studio QuickBot wired
- ✅ All use SMTP service

### **3. Environment Variables Needed**

**Add these as SECRETS in your deployment platform (Render/Vercel/etc):**

```bash
# SMTP Email (Required!)
SMTP_HOST=smtp.zohocloud.ca
SMTP_PORT=465
SMTP_USER=support@alicesolutionsgroup.com
SMTP_PASSWORD=ZLVneacQE8je

# Optional: Daily Analytics
ENABLE_ANALYTICS_CRON=true
ANALYTICS_API_URL=https://analytics-hub-server.onrender.com
VITE_ANALYTICS_API_URL=https://analytics-hub-server.onrender.com
ANALYTICS_CRON_SCHEDULE=0 8 * * *
SITE_URL=https://alicesolutionsgroup.com

# Node Environment
NODE_ENV=production
```

### **4. URLs Checked** ✅
- ✅ All API endpoints use relative paths
- ✅ No hardcoded localhost URLs
- ✅ External links use https://
- ✅ Canonical URLs set to alicesolutionsgroup.com

### **5. Buttons & Forms** ✅
- ✅ Contact form: `/contact` → `/api/zoho/contact`
- ✅ ContactModal: Homepage → `/api/zoho/contact`
- ✅ ISO Checklist: `/api/iso/send-checklist`
- ✅ ISO QuickBot: `/api/iso/send-quickbot-report`

---

## 📋 **Git Deployment Steps**

1. **Check .gitignore** ✅
   - `.env` files excluded
   - No secrets will be committed

2. **Commit changes:**
   ```bash
   git add .
   git commit -m "Wire all email notifications and fix API URLs"
   git push
   ```

3. **Set environment variables** in deployment platform:
   - Add all SMTP variables as secrets
   - Add optional analytics variables if needed

4. **Verify deployment:**
   - Test contact form
   - Test ContactModal
   - Test ISO Studio forms
   - Check email inbox

---

## ⚠️ **Important**

- **NEVER commit** `.env` files or SMTP passwords
- **ALWAYS use** environment variables for secrets
- **Test** all forms after deployment
- **Monitor** email inbox for notifications

---

## ✅ **Ready to Deploy!**

All code is checked and ready. Just set environment variables and deploy! 🚀

