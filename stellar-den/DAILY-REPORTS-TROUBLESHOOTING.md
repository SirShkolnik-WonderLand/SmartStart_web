# 🔍 Daily Reports Troubleshooting Guide

## ❌ **PROBLEM: No Daily Reports Received**

If you're not receiving daily reports, check these:

---

## 🔧 **STEP 1: Check Environment Variables in Render**

The cron jobs **only run** if:
1. `NODE_ENV=production` (automatically set by Render)
2. **OR** `ENABLE_ANALYTICS_CRON=true`

### **Required Variables in Render:**
```bash
# Required for cron jobs to run
NODE_ENV=production
# OR
ENABLE_ANALYTICS_CRON=true

# Required for email sending
SMTP_HOST=smtp.zohocloud.ca
SMTP_PORT=465
SMTP_USER=support@alicesolutionsgroup.com
SMTP_PASSWORD=ZLVneacQE8je

# Required for Analytics Hub access
ANALYTICS_ADMIN_PASSWORD=your_password_here

# Optional but recommended
ANALYTICS_API_URL=https://analytics-hub-server.onrender.com
SITE_URL=https://alicesolutionsgroup.com
```

---

## 📅 **STEP 2: Verify Cron Schedule**

Daily reports are scheduled for:
- **Traffic Report:** 8:00 AM EST (`0 8 * * *`)
- **Lead Report:** 9:00 AM EST (`0 9 * * *`)

To check if cron jobs started:
1. Check Render logs for: `"✅ All daily reports cron jobs started"`
2. Look for: `"📅 Daily Traffic Report scheduled:"`
3. Look for: `"📅 Daily Lead Report scheduled:"`

---

## 🧪 **STEP 3: Manual Testing**

### **Test Traffic Report:**
```bash
curl -X POST https://alicesolutionsgroup.com/api/zoho/reports/traffic
```

Expected response:
```json
{
  "success": true,
  "message": "Traffic report sent successfully"
}
```

If you get `"No analytics data available"`:
- Analytics Hub API might not have data yet
- Check Analytics Hub server is running: `https://analytics-hub-server.onrender.com`
- Verify authentication is working

### **Test Lead Report:**
```bash
curl -X POST https://alicesolutionsgroup.com/api/zoho/reports/leads
```

Expected response:
```json
{
  "success": true,
  "message": "Lead report sent successfully"
}
```

---

## 📊 **STEP 4: Check Current Visitor Data**

Run the visitor data script:
```bash
cd stellar-den
pnpm tsx scripts/show-visitors-data.ts
```

This will show:
- ✅ Total visitors, pageviews, sessions
- ✅ Recent pageviews (top pages)
- ✅ Stored leads
- ✅ Active visitors

---

## 🔍 **STEP 5: Check Render Logs**

1. Go to Render Dashboard
2. Select your service
3. Click **Logs** tab
4. Look for:
   - `"📅 Daily Traffic Report scheduled"`
   - `"📊 Running daily traffic & SEO report..."`
   - `"✅ Daily traffic report sent successfully"` or error messages

### **Common Log Messages:**
- ✅ `"✅ All daily reports cron jobs started"` → Cron is active
- ❌ `"❌ Failed to send daily traffic report"` → Check email/SMTP config
- ❌ `"No analytics data available"` → Analytics Hub API issue

---

## 📧 **STEP 6: Verify Email Configuration**

Reports are sent to: `udi.shkolnik@alicesolutionsgroup.com`

Check:
1. ✅ SMTP credentials are correct in Render
2. ✅ Email isn't going to spam
3. ✅ Email address is correct
4. ✅ SMTP server (`smtp.zohocloud.ca`) is accessible from Render

---

## 🚨 **Common Issues & Fixes**

### **Issue 1: "No analytics data available"**
**Problem:** Analytics Hub API has no data or isn't accessible

**Fix:**
1. Check Analytics Hub server: `https://analytics-hub-server.onrender.com`
2. Verify `ANALYTICS_ADMIN_PASSWORD` is set in Render
3. Wait 24 hours after deploying tracking (needs data to collect)
4. Visit your site a few times to generate tracking data

### **Issue 2: Cron jobs not starting**
**Problem:** `NODE_ENV` or `ENABLE_ANALYTICS_CRON` not set

**Fix:**
1. In Render → Environment tab
2. Add: `ENABLE_ANALYTICS_CRON=true`
3. Redeploy service

### **Issue 3: Reports sent but not received**
**Problem:** Email delivery issue

**Fix:**
1. Check spam folder
2. Verify SMTP credentials in Render
3. Test email sending manually:
   ```bash
   curl -X POST https://alicesolutionsgroup.com/api/zoho/reports/traffic
   ```
4. Check Render logs for email errors

### **Issue 4: Empty reports**
**Problem:** No visitors/leads to report

**Fix:**
- Reports will be sent even with zero data
- Wait for actual traffic/leads to generate data
- Reports are sent daily at scheduled times regardless of data

---

## ✅ **Quick Checklist**

- [ ] `ENABLE_ANALYTICS_CRON=true` in Render (or `NODE_ENV=production`)
- [ ] SMTP credentials configured in Render
- [ ] `ANALYTICS_ADMIN_PASSWORD` set in Render
- [ ] Render logs show cron jobs started
- [ ] Manual report trigger works
- [ ] Analytics Hub server is accessible
- [ ] Email not in spam folder
- [ ] Site has been visited (to generate data)

---

## 📞 **Need Help?**

1. Check Render logs first
2. Run manual report triggers
3. Run `show-visitors-data.ts` script
4. Check environment variables in Render

---

**Last Updated:** November 3, 2025

