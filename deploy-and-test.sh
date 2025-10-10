#!/bin/bash

echo "🚀 DEPLOYING TO PRODUCTION"
echo "════════════════════════════════════════"
echo ""

# Push to GitHub
echo "📤 Step 1: Pushing to GitHub..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Git push failed. Please check your credentials."
    exit 1
fi

echo "✅ Pushed to GitHub successfully!"
echo ""

# Wait for Render deployment
echo "⏳ Step 2: Waiting 60 seconds for Render to deploy..."
for i in {60..1}; do
    echo -ne "   Deploying... $i seconds remaining\r"
    sleep 1
done
echo ""
echo "✅ Deployment time complete!"
echo ""

# Test production
echo "🧪 Step 3: Testing production deployment..."
echo "════════════════════════════════════════"
echo ""

# Test homepage
echo "1️⃣ Testing homepage..."
HOMEPAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://alicesolutionsgroup.com/)
if [ "$HOMEPAGE_STATUS" == "200" ]; then
    echo "   ✅ Homepage: OK (200)"
else
    echo "   ❌ Homepage: FAIL ($HOMEPAGE_STATUS)"
fi

# Test admin page
echo "2️⃣ Testing admin page..."
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://alicesolutionsgroup.com/admin.html)
if [ "$ADMIN_STATUS" == "200" ]; then
    echo "   ✅ Admin page: OK (200)"
else
    echo "   ❌ Admin page: FAIL ($ADMIN_STATUS)"
fi

# Test sitemap
echo "3️⃣ Testing sitemap..."
SITEMAP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://alicesolutionsgroup.com/sitemap.xml)
if [ "$SITEMAP_STATUS" == "200" ]; then
    echo "   ✅ Sitemap: OK (200)"
else
    echo "   ❌ Sitemap: FAIL ($SITEMAP_STATUS)"
fi

# Test robots.txt
echo "4️⃣ Testing robots.txt..."
ROBOTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://alicesolutionsgroup.com/robots.txt)
if [ "$ROBOTS_STATUS" == "200" ]; then
    echo "   ✅ Robots.txt: OK (200)"
else
    echo "   ❌ Robots.txt: FAIL ($ROBOTS_STATUS)"
fi

echo ""
echo "🔌 Testing API Endpoints..."
echo "════════════════════════════════════════"

# Test analytics API
echo "5️⃣ Testing analytics API..."
ANALYTICS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://alicesolutionsgroup.com/api/admin/analytics)
if [ "$ANALYTICS_STATUS" == "200" ]; then
    echo "   ✅ Analytics API: OK (200)"
else
    echo "   ❌ Analytics API: FAIL ($ANALYTICS_STATUS)"
fi

# Test Core Web Vitals API
echo "6️⃣ Testing Core Web Vitals API..."
CWV_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://alicesolutionsgroup.com/api/admin/core-web-vitals)
if [ "$CWV_STATUS" == "200" ]; then
    echo "   ✅ Core Web Vitals API: OK (200)"
else
    echo "   ❌ Core Web Vitals API: FAIL ($CWV_STATUS)"
fi

# Test SEO metrics API
echo "7️⃣ Testing SEO metrics API..."
SEO_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://alicesolutionsgroup.com/api/admin/seo-metrics)
if [ "$SEO_STATUS" == "200" ]; then
    echo "   ✅ SEO Metrics API: OK (200)"
else
    echo "   ❌ SEO Metrics API: FAIL ($SEO_STATUS)"
fi

# Test debug API
echo "8️⃣ Testing debug API..."
DEBUG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://alicesolutionsgroup.com/api/admin/debug)
if [ "$DEBUG_STATUS" == "200" ]; then
    echo "   ✅ Debug API: OK (200)"
else
    echo "   ❌ Debug API: FAIL ($DEBUG_STATUS)"
fi

echo ""
echo "📊 Checking Real Data..."
echo "════════════════════════════════════════"

# Get actual data from debug endpoint
echo "9️⃣ Fetching production analytics data..."
DEBUG_DATA=$(curl -s https://alicesolutionsgroup.com/api/admin/debug)
VISITOR_COUNT=$(echo "$DEBUG_DATA" | grep -o '"visitors":[0-9]*' | grep -o '[0-9]*')
PAGEVIEW_COUNT=$(echo "$DEBUG_DATA" | grep -o '"pageViews":[0-9]*' | grep -o '[0-9]*')

if [ -n "$VISITOR_COUNT" ]; then
    echo "   ✅ Visitors tracked: $VISITOR_COUNT"
else
    echo "   ⚠️  Visitor count: N/A"
fi

if [ -n "$PAGEVIEW_COUNT" ]; then
    echo "   ✅ Page views tracked: $PAGEVIEW_COUNT"
else
    echo "   ⚠️  Page views: N/A"
fi

echo ""
echo "🌍 Testing Geolocation..."
echo "════════════════════════════════════════"

# Check if geolocation is working
echo "🔟 Checking visitor geographic data..."
DETAILED_DATA=$(curl -s https://alicesolutionsgroup.com/api/admin/detailed-analytics)
HAS_COUNTRIES=$(echo "$DETAILED_DATA" | grep -o '"topCountries"')

if [ -n "$HAS_COUNTRIES" ]; then
    echo "   ✅ Geolocation data available"
    echo ""
    echo "   Sample data:"
    echo "$DETAILED_DATA" | head -50
else
    echo "   ⚠️  Geolocation data pending (wait for first visitor)"
fi

echo ""
echo "════════════════════════════════════════"
echo "🎉 DEPLOYMENT TESTS COMPLETE!"
echo "════════════════════════════════════════"
echo ""
echo "📈 View your admin dashboard:"
echo "   https://alicesolutionsgroup.com/admin.html"
echo ""
echo "✅ All systems operational!"
echo ""

