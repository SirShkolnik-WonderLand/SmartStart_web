# 🔐 Environment Variables for Deployment

## ⚠️ **CRITICAL: Add These as SECRETS**

These must be added as **environment variables/secrets** in your deployment platform (Render, Vercel, etc.), NOT committed to git.

---

## **Required Variables**

```bash
# SMTP Email Configuration (REQUIRED!)
SMTP_HOST=smtp.zohocloud.ca
SMTP_PORT=465
SMTP_USER=support@alicesolutionsgroup.com
SMTP_PASSWORD=ZLVneacQE8je
```

---

## **Optional Variables**

```bash
# Daily Analytics Reports
ENABLE_ANALYTICS_CRON=true
ANALYTICS_API_URL=https://analytics-hub-server.onrender.com
VITE_ANALYTICS_API_URL=https://analytics-hub-server.onrender.com
ANALYTICS_CRON_SCHEDULE=0 8 * * *
SITE_URL=https://alicesolutionsgroup.com

# Node Environment
NODE_ENV=production
```

---

## **How to Add in Render**

1. Go to your Render dashboard
2. Select your service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add each variable above as a secret
6. Redeploy

---

## **How to Add in Vercel**

1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Add each variable above
4. Redeploy

---

## ✅ **Important**

- ✅ `.env` files are in `.gitignore` (won't be committed)
- ✅ Never commit passwords or secrets
- ✅ Always use environment variables in production
- ✅ Test all forms after deployment

---

## 🧪 **Test After Deployment**

1. Submit contact form → Check email
2. Submit ContactModal → Check email
3. Request ISO checklist → Check email
4. Complete QuickBot → Check email

All should send emails to: `udi.shkolnik@alicesolutionsgroup.com`

