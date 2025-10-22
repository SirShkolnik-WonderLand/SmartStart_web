# 🌐 Connect Local Analytics Hub to Live Website

This guide will help you connect your **local analytics dashboard** to track real data from your **live website** at www.alicesolutionsgroup.com.

## 🎯 Overview

**What we're doing:**
- Your analytics hub runs locally (localhost:4000)
- Your live website (alicesolutionsgroup.com) sends tracking data to your local server
- You view real-time data on your local dashboard (localhost:5173)

**Why this works:**
- Test with real production traffic
- No changes to production servers needed
- Safe testing environment
- Zero downtime for your live site

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Expose Your Local Server to the Internet

Since your website is live on the internet, it needs to reach your local analytics server. We'll use **ngrok** to create a secure tunnel.

#### Install ngrok:
```bash
# macOS
brew install ngrok

# Or download from: https://ngrok.com/download
```

#### Start ngrok tunnel:
```bash
ngrok http 4000
```

**You'll see output like:**
```
Forwarding  https://abc123.ngrok.io -> http://localhost:4000
```

**Copy that URL!** (e.g., `https://abc123.ngrok.io`) - this is your **PUBLIC_ANALYTICS_URL**

---

### Step 2: Update Your Live Website Tracking Script

Add this script to your live website at **www.alicesolutionsgroup.com**:

#### Option A: Add to `stellar-den/client/App.tsx`

```tsx
useEffect(() => {
  const analyticsConfig = {
    // Use your ngrok URL here!
    apiUrl: 'https://YOUR_NGROK_URL.ngrok.io',  // 👈 Replace with your ngrok URL
    autoTrack: true,
    trackOutbound: true,
    trackScroll: true,
  };

  (window as any).analyticsHubConfig = analyticsConfig;

  const script = document.createElement('script');
  script.src = `${analyticsConfig.apiUrl}/tracker.js`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  console.log('✅ Analytics Hub initialized with:', analyticsConfig.apiUrl);
}, []);
```

#### Option B: Add Directly to HTML (Quick Test)

Add this to your live site's `<head>` or before `</body>`:

```html
<script>
(function(){
  // Replace with your ngrok URL!
  const API_URL = 'https://YOUR_NGROK_URL.ngrok.io';
  
  let sessionId = sessionStorage.getItem('ah_session') || Math.random().toString(36).substring(7);
  sessionStorage.setItem('ah_session', sessionId);
  
  function track(type, data) {
    fetch(API_URL + '/api/v1/' + type, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({...data, sessionId}),
      keepalive: true
    }).catch(e => console.log('Analytics:', e));
  }
  
  window.analyticsHub = {
    trackEvent: (name, props) => track('event', {event: {eventType: 'custom', eventName: name, pageUrl: location.href, properties: props, sessionId}}),
    trackConversion: (name, val) => track('conversion', {goalName: name, goalValue: val, pageUrl: location.href}),
    trackPageView: () => track('pageview', {pageUrl: location.href, pageTitle: document.title})
  };
  
  // Auto-track page views
  track('pageview', {pageUrl: location.href, pageTitle: document.title});
  
  console.log('✅ Analytics tracking active:', API_URL);
})();
</script>
```

---

### Step 3: Update CORS Settings

Your local analytics server needs to accept requests from your live site.

**Check/Update** `/analytics-hub/.env`:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://www.alicesolutionsgroup.com,https://alicesolutionsgroup.com
```

**Then restart your server:**
```bash
# Stop current server (Ctrl+C if needed)
cd /Users/udishkolnik/web/SmartStart_web/analytics-hub
npm run dev:server
```

---

### Step 4: Test the Connection

1. **Verify ngrok is running:**
   ```bash
   curl https://YOUR_NGROK_URL.ngrok.io/health
   ```
   Should return: `{"success":true,"status":"healthy"}`

2. **Visit your live website:**
   ```
   https://www.alicesolutionsgroup.com
   ```

3. **Check browser console:**
   - Should see: `✅ Analytics tracking active: https://YOUR_NGROK_URL.ngrok.io`

4. **Open your local dashboard:**
   ```
   http://localhost:5173
   ```
   - Login with: `udi.shkolnik@alicesolutionsgroup.com`
   - You should see **REAL VISITORS** appearing!

---

## 🎨 What You'll See

Once connected, your local dashboard will show:

✅ **Real-time visitors** from your live site  
✅ **Actual page views** with URLs from alicesolutionsgroup.com  
✅ **Geographic data** from real visitors  
✅ **Device breakdown** (mobile, desktop, tablet)  
✅ **Traffic sources** (Google, direct, social)  
✅ **Live visitor map** with real locations  

---

## 🔍 Troubleshooting

### Issue: No data showing up

**Check 1: Verify tracking script is loaded**
```javascript
// In browser console on your live site:
console.log(window.analyticsHub);
// Should show: {trackEvent: ƒ, trackConversion: ƒ, trackPageView: ƒ}
```

**Check 2: Check network requests**
- Open DevTools → Network tab
- Visit your live site
- Look for requests to `YOUR_NGROK_URL.ngrok.io/api/v1/pageview`
- Should return: `200 OK`

**Check 3: Verify ngrok tunnel**
```bash
curl https://YOUR_NGROK_URL.ngrok.io/health
```

**Check 4: Check CORS**
```bash
curl -X OPTIONS https://YOUR_NGROK_URL.ngrok.io/api/v1/pageview \
  -H "Origin: https://www.alicesolutionsgroup.com" \
  -H "Access-Control-Request-Method: POST"
```

### Issue: CORS errors in browser

**Update** `/analytics-hub/server/middleware/cors.middleware.ts`:
```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://www.alicesolutionsgroup.com',
  'https://alicesolutionsgroup.com',
  /\.ngrok\.io$/  // Allow all ngrok domains
];
```

Then **restart server**.

### Issue: Ngrok session expired

Free ngrok URLs expire. Just:
1. Restart ngrok: `ngrok http 4000`
2. Get new URL
3. Update tracking script with new URL
4. Redeploy/refresh your live site

---

## 🚀 Pro Tips

### 1. **Keep ngrok URL consistent** (Paid Feature)
```bash
ngrok http 4000 --subdomain=alice-analytics
# Now always: https://alice-analytics.ngrok.io
```

### 2. **Test specific events**
```javascript
// In browser console on your live site:
analyticsHub.trackEvent('test_event', { source: 'manual_test' });
```

### 3. **Monitor in real-time**
- Keep dashboard open: http://localhost:5173/realtime
- Visit your live site in another browser
- Watch yourself appear on the map! 🗺️

### 4. **Test conversions**
```javascript
// In browser console:
analyticsHub.trackConversion('Newsletter Signup', 1);
```

---

## 📊 Next Steps

Once you've verified everything works:

1. ✅ **Collect Real Data** - Let it run for a few hours/days
2. ✅ **Generate Reports** - Export PDF/CSV with real data
3. ✅ **Deploy to Production** - Move analytics to Render
4. ✅ **Update Website** - Point to production analytics URL

---

## 🎯 Quick Command Reference

```bash
# Start local analytics server
cd /Users/udishkolnik/web/SmartStart_web/analytics-hub
npm run dev:server

# Start local dashboard
cd /Users/udishkolnik/web/SmartStart_web/analytics-hub/client
npm run dev

# Start ngrok tunnel
ngrok http 4000

# Test connection
curl https://YOUR_NGROK_URL.ngrok.io/health

# Test tracking
curl -X POST https://YOUR_NGROK_URL.ngrok.io/api/v1/pageview \
  -H "Content-Type: application/json" \
  -d '{"pageUrl":"https://www.alicesolutionsgroup.com/","pageTitle":"Test","sessionId":"test-123"}'
```

---

## ✨ You're Connected!

Your local analytics hub is now tracking **real visitors** from your **live website**!

**Dashboard**: http://localhost:5173  
**API**: Your ngrok URL  
**Live Site**: https://www.alicesolutionsgroup.com  

---

**Need help?** Contact: udi.shkolnik@alicesolutionsgroup.com

**Built with ❤️ by AliceSolutions Group**
