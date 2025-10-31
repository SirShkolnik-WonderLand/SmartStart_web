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

## ✅ **What These Enable**

### **SMTP Variables:**
- ✅ Contact form email notifications
- ✅ Contact modal email notifications
- ✅ Service-specific email templates
- ✅ Enhanced lead tracking data in emails
- ✅ ISO Studio checklist emails
- ✅ ISO Studio QuickBot report emails

### **Analytics Variables:**
- ✅ Daily SEO analytics email reports
- ✅ Scheduled at 8 AM EST (configurable)

---

## ✅ **Important**

- ✅ `.env` files are in `.gitignore` (won't be committed)
- ✅ Never commit passwords or secrets
- ✅ Always use environment variables in production
- ✅ Test all forms after deployment

---

## 🧪 **Test After Deployment**

### **Contact Forms:**
1. Submit contact form (`/contact`) → Check email
2. Submit ContactModal (Homepage "Work With Us") → Check email
3. Verify admin email includes all lead data
4. Verify client receives auto-reply

### **ISO Studio:**
1. Request ISO checklist → Check email
2. Complete QuickBot assessment → Check email

### **All emails sent to:**
- **Admin:** `udi.shkolnik@alicesolutionsgroup.com`
- **From:** `support@alicesolutionsgroup.com`

---

## 📊 **Email Features Enabled**

- ✅ Enhanced lead tracking (page URL, referrer, timestamp)
- ✅ Service-specific email templates
- ✅ Complete lead profile in admin emails
- ✅ Personalized client auto-replies
- ✅ Budget, timeline, company size, industry data
- ✅ Lead source attribution

---

**Last Updated**: December 2024 - Enhanced email system with lead tracking
