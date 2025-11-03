# Daily Reports Fix Plan

## Issues Found

### 1. ✅ FIXED: Learn More Button Tracking
- **Problem:** Learn More buttons from EcosystemBento, Services, and UpcomingEvents weren't tracking button context
- **Solution:** 
  - Added `buttonContext` to ContactModal leadSource
  - Automatically detects which button opened the modal (SmartStart Hub, ISO Studio, Services, Events)
  - Passes context to backend for tracking in `howDidYouHear` field
  - **Status:** ✅ Implemented

### 2. 🔍 INVESTIGATING: Reports Not Being Sent

#### Possible Causes:

**A. Cron Job Not Starting**
- **Condition:** `NODE_ENV === 'production'` OR `ENABLE_ANALYTICS_CRON === 'true'`
- **Check:** Server logs for "Daily reports cron jobs started" message
- **Fix:** Set `ENABLE_ANALYTICS_CRON=true` in Render environment variables

**B. SMTP Configuration Missing**
- **Required:** `SMTP_PASSWORD` or `SMTP_APP_PASSWORD`
- **Check:** Server logs for "SMTP_PASSWORD: ***SET***" or "***MISSING***"
- **Fix:** Add SMTP credentials to Render environment variables

**C. Analytics Hub API Authentication**
- **Required:** `ANALYTICS_ADMIN_PASSWORD`
- **Check:** Reports will fail if Analytics Hub API returns 401
- **Fix:** Set `ANALYTICS_ADMIN_PASSWORD` in Render

**D. Cron Schedule Timezone**
- **Schedule:** 8:00 AM EST (Traffic), 9:00 AM EST (Lead)
- **Issue:** Server timezone may differ
- **Fix:** Verify server timezone matches EST

**E. No Data to Report**
- **Traffic Report:** Skips if no analytics data
- **Lead Report:** Skips if no leads today or yesterday
- **Check:** Verify data exists in Analytics Hub and lead storage

## Diagnostic Steps

### 1. Check Server Logs
Look for these messages on server startup:
```
📅 Starting daily reports cron jobs...
   NODE_ENV: production
   ENABLE_ANALYTICS_CRON: true
   SMTP_PASSWORD: ***SET***
✅ Daily reports cron jobs started
```

If you see:
```
⚠️ Daily reports cron jobs NOT started
   💡 To enable: Set ENABLE_ANALYTICS_CRON=true or NODE_ENV=production
```
Then cron is NOT running.

### 2. Check Cron Execution
Look for scheduled messages:
```
[2025-01-15T08:00:00.000Z] 📊 Running daily traffic & SEO report...
[2025-01-15T08:00:05.000Z] ✅ Daily traffic report sent successfully
```

If you see errors:
```
❌ Failed to send daily traffic report: [error message]
```
Check the error details.

### 3. Test Manual Trigger
```bash
curl -X POST https://alicesolutionsgroup.com/api/zoho/reports/traffic
curl -X POST https://alicesolutionsgroup.com/api/zoho/reports/leads
```

### 4. Verify Environment Variables in Render
Required variables:
- `NODE_ENV=production` (or `ENABLE_ANALYTICS_CRON=true`)
- `SMTP_HOST=smtp.zohocloud.ca`
- `SMTP_PORT=465`
- `SMTP_USER=support@alicesolutionsgroup.com`
- `SMTP_PASSWORD=<your-app-password>` ⚠️ **CRITICAL**
- `ANALYTICS_ADMIN_PASSWORD=<your-password>` ⚠️ **CRITICAL**

## Fixes Applied

### ✅ Enhanced Logging
- Added detailed startup logging in `server/index.ts`
- Added timestamped logging in cron jobs
- Shows which variables are set/missing

### ✅ Better Error Handling
- Cron jobs now log full error details including stack traces
- Helps identify specific failure points

### ✅ Button Context Tracking
- ContactModal now tracks which button opened it
- Context passed to backend for lead tracking
- Appears in "Leads by Source" reports

## Next Steps

1. **Deploy these changes**
2. **Check Render logs** for startup messages
3. **Verify environment variables** are set
4. **Test manual trigger** to verify email delivery
5. **Check scheduled execution** at 8 AM and 9 AM EST

## Expected Log Output

**On Server Start:**
```
📅 Starting daily reports cron jobs...
   NODE_ENV: production
   ENABLE_ANALYTICS_CRON: undefined
   SMTP_HOST: smtp.zohocloud.ca
   SMTP_USER: support@alicesolutionsgroup.com
   SMTP_PASSWORD: ***SET***
📅 Daily Traffic Report scheduled: 0 8 * * *
📅 Daily Lead Report scheduled: 0 9 * * *
✅ All daily reports cron jobs started
   - Traffic Report: 8:00 AM daily
   - Lead Report: 9:00 AM daily
✅ Daily reports cron jobs started
```

**At 8:00 AM:**
```
[2025-01-15T13:00:00.000Z] 📊 Running daily traffic & SEO report...
[2025-01-15T13:00:05.000Z] ✅ Daily traffic report sent successfully
```

**At 9:00 AM:**
```
[2025-01-15T14:00:00.000Z] 💼 Running daily lead generation report...
[2025-01-15T14:00:02.000Z] ✅ Daily lead report sent successfully
```

