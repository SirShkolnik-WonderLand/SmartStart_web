# 🚀 Analytics Hub - Quick Start Guide

Welcome to Analytics Hub! This guide will help you get started in minutes.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Adding Tracking to Your Website](#adding-tracking-to-your-website)
- [Accessing the Dashboard](#accessing-the-dashboard)
- [Email Reports](#email-reports)

---

## Prerequisites

- **Node.js** 18+ installed
- **PNPM** or **NPM** package manager
- **Email account** (for sending reports)

---

## Installation

### 1. Install Dependencies

```bash
cd analytics-hub
npm install
```

### 2. Install Client Dependencies

```bash
cd client
npm install
cd ..
```

---

## Configuration

### 1. Create Environment File

Create a `.env` file in the `analytics-hub` directory:

```env
# Server Configuration
PORT=4000
HOST=localhost
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Admin User
ADMIN_EMAIL=udi.shkolnik@alicesolutionsgroup.com
ADMIN_PASSWORD=DevPassword123!

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Email Configuration (Optional - for reports)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Analytics Hub <your-email@gmail.com>
```

### 2. Create Client Environment File

Create a `.env` file in the `analytics-hub/client` directory:

```env
VITE_API_URL=http://localhost:4000
VITE_ANALYTICS_API_URL=http://localhost:4000
```

---

## Running the Application

### Development Mode (Recommended)

**Terminal 1 - Start Backend:**
```bash
cd analytics-hub
npm run dev:server
```

**Terminal 2 - Start Dashboard:**
```bash
cd analytics-hub/client
npm run dev
```

Your analytics hub is now running:
- **Backend API**: http://localhost:4000
- **Dashboard**: http://localhost:5173
- **WebSocket**: ws://localhost:4000

---

## Adding Tracking to Your Website

### Method 1: Script Tag (Easiest)

Add this script to your website's `<head>` or before `</body>`:

```html
<script>
  (function(){
    const API_URL = 'http://localhost:4000';
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
  })();
</script>
```

### Method 2: React Integration

```tsx
// In your main App.tsx or App.js
import { useEffect } from 'react';

const App = () => {
  useEffect(() => {
    const analyticsConfig = {
      apiUrl: 'http://localhost:4000',
      autoTrack: true,
    };

    (window as any).analyticsHubConfig = analyticsConfig;

    const script = document.createElement('script');
    script.src = `${analyticsConfig.apiUrl}/tracker.js`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  return <div>Your App</div>;
};
```

### Track Custom Events

```javascript
// Track a button click
analyticsHub.trackEvent('button_clicked', {
  buttonName: 'Sign Up',
  section: 'Hero'
});

// Track a conversion
analyticsHub.trackConversion('Newsletter Signup', 1);

// Track a custom page view
analyticsHub.trackPageView();
```

---

## Accessing the Dashboard

1. **Open Dashboard**: http://localhost:5173
2. **Login** with your admin credentials:
   - **Email**: `udi.shkolnik@alicesolutionsgroup.com`
   - **Password**: `DevPassword123!`

### Dashboard Features

- **📊 Dashboard** - Overview with real-time stats
- **⚡ Real-time** - Live visitor tracking with interactive map
- **📈 Analytics** - Deep-dive analytics with AI insights
- **🔍 SEO Metrics** - Keyword rankings, Core Web Vitals
- **🛡️ Security** - Security monitoring and threat detection
- **📄 Pages** - Page performance analytics
- **🌐 Sources** - Traffic source breakdown
- **👥 Visitors** - Visitor insights and behavior
- **🎯 Goals** - Conversion tracking
- **⚙️ Settings** - Admin preferences

---

## Email Reports

### Configure Email Settings

Update your `.env` file with SMTP credentials:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### For Gmail Users

1. Enable 2-Factor Authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in `SMTP_PASS`

### Send a Report

```bash
curl -X POST http://localhost:4000/api/admin/reports/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "recipient@example.com",
    "frequency": "weekly",
    "data": {
      "dateRange": {
        "startDate": "2024-10-01",
        "endDate": "2024-10-22"
      },
      "overview": {
        "totalVisitors": 1250,
        "totalSessions": 1800,
        "totalPageViews": 3200,
        "totalConversions": 45,
        "conversionRate": 2.5,
        "bounceRate": 35.2,
        "avgSessionDuration": 180
      },
      "topPages": [],
      "topSources": [],
      "devices": []
    }
  }'
```

---

## 🎯 Next Steps

1. ✅ **Customize** - Update branding, colors, and settings
2. ✅ **Monitor** - Check your dashboard for real-time data
3. ✅ **Export** - Generate PDF/CSV reports
4. ✅ **Deploy** - Deploy to production (see DEPLOYMENT.md)
5. ✅ **Scale** - Add more tracking points and goals

---

## 🆘 Troubleshooting

### Dashboard Not Loading?
- Check if backend is running on port 4000
- Verify CORS settings in `.env`

### No Data Showing?
- Verify tracking script is installed correctly
- Check browser console for errors
- Ensure API URL is correct

### Email Reports Not Sending?
- Verify SMTP credentials
- Check spam/junk folder
- Test connection: `POST /api/admin/reports/test`

---

## 📚 Additional Resources

- **API Documentation**: See `API-DOCS.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Advanced Features**: See `ADVANCED.md`

---

## 🎉 You're Ready!

Your Analytics Hub is now fully operational! Start tracking, analyzing, and growing your business with powerful insights.

**Need help?** Contact: udi.shkolnik@alicesolutionsgroup.com

---

**Built with ❤️ by AliceSolutions Group**
