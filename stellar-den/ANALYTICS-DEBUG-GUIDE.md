# Analytics Debugging Guide

## Why Your Daily Reports Show Zero Visitors

Your analytics system **requires cookie consent** to track visitors. If you or your friends have:
- Clicked "Reject All" on the cookie banner
- Never seen the banner (already had consent set)
- Cleared cookies after rejecting

Then **analytics will NOT track** those visits.

## Quick Fix: Check Your Consent Status

### Step 1: Open Browser Console
1. Visit https://alicesolutionsgroup.com
2. Press `F12` or Right-click → Inspect
3. Go to "Console" tab

### Step 2: Check For Analytics Logs
You should see logs like:
```
[Analytics] Consent preferences: {analytics: true, ...}
[Analytics] Analytics tracking ENABLED
[Analytics] Tracking initial pageview
```

### Step 3: Check What You See

**If you see:**
```
[Analytics] No consent cookie found - waiting for user consent
```
**Solution:** The cookie banner should appear. Click "Accept All".

**If you see:**
```
[Analytics] Analytics tracking disabled by user preference
```
**Solution:** You clicked "Reject All" before. See "How to Reset Consent" below.

**If you see:**
```
[Analytics] Analytics tracking ENABLED
[Analytics] Tracking initial pageview
```
**Great!** Analytics is working. Your visit is being tracked.

## How to Reset Consent and Enable Tracking

### Option 1: Use Cookie Preferences Link (Easiest)
1. Scroll to the bottom of the page
2. Click "Cookie Preferences" in the footer
3. Toggle "Analytics Cookies" to ON
4. Click "Save Preferences"
5. Refresh the page
6. Check console - should see "Analytics tracking ENABLED"

### Option 2: Clear Consent Cookie (Quick)
Run this in browser console:
```javascript
// Clear the consent cookie
document.cookie = "asg_consent_preferences=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

// Reload the page
location.reload();
```

Then click "Accept All" when the banner appears.

### Option 3: Manually Enable Analytics (Developer)
Run this in browser console:
```javascript
// Set analytics consent to TRUE
document.cookie = "asg_consent_preferences=" + encodeURIComponent(JSON.stringify({
  essential: true,
  analytics: true,
  marketing: true,
  timestamp: new Date().toISOString(),
  version: "1.0"
})) + "; path=/; max-age=31536000; SameSite=Lax; Secure";

// Track current pageview
window.analyticsHub?.trackPageView();

// Reload to verify
setTimeout(() => location.reload(), 1000);
```

## Verify Analytics is Working

### Test 1: Check Console Logs
After enabling consent, refresh the page and check console:
```
✅ [Analytics] Analytics tracking ENABLED
✅ [Analytics] Tracking initial pageview
```

### Test 2: Check Analytics Hub
```bash
curl https://alicesolutionsgroup.com/api/analytics/stats | jq
```

Should show visitors (though it might take a few minutes to process).

### Test 3: Manual Pageview
```javascript
// Run in console
window.analyticsHub.trackPageView();
console.log('Pageview tracked!');
```

## Tell Your Friends

**Everyone who visits needs to accept cookies!**

Send them this message:
```
When you visit alicesolutionsgroup.com, please:
1. Look for the cookie consent banner at the bottom
2. Click "Accept All"
3. This helps us track site visitors!
```

## Common Issues

### Issue: "Banner never appears"
**Cause:** You already have consent set (probably rejected).
**Fix:** Use Option 2 or 3 above to reset/enable.

### Issue: "I accepted but reports still show zero"
**Cause:** Analytics Hub might be down or authentication issues.
**Fix:** Check server logs at Render dashboard → Logs → Search for "[Analytics]"

### Issue: "Console shows errors"
**Cause:** Analytics Hub API might be unavailable.
**Fix:** The API falls back gracefully, but check https://analytics-hub-server.onrender.com/health

## Developer Notes

### Analytics Flow
1. Page loads → Check `asg_consent_preferences` cookie
2. If `analytics: true` → Track pageview immediately
3. If no consent → Wait up to 20 seconds for user to accept
4. When user accepts → Track pageview + dispatch event

### Consent Cookie Structure
```json
{
  "essential": true,
  "analytics": true,
  "marketing": true,
  "timestamp": "2025-11-07T02:40:00.000Z",
  "version": "1.0"
}
```

### Analytics Hub Endpoints
- **Track Pageview:** `POST https://analytics-hub-server.onrender.com/api/v1/pageview`
- **Track Event:** `POST https://analytics-hub-server.onrender.com/api/v1/event`
- **Get Stats:** `GET https://alicesolutionsgroup.com/api/analytics/stats`

## Need Help?

Check the browser console logs - they now include detailed analytics debugging info!

