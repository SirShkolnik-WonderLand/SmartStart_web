#!/bin/bash

# 🚀 Start Analytics Hub with ngrok tunnel
# This script starts your local analytics server and exposes it via ngrok

echo "🚀 Starting Analytics Hub with ngrok tunnel..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Installing..."
    brew install ngrok/ngrok/ngrok
fi

# Start ngrok in the background
echo "🌐 Starting ngrok tunnel on port 4000..."
ngrok http 4000 > /dev/null &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get the public URL
echo "📡 Getting ngrok public URL..."
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Could not get ngrok URL. Please start ngrok manually:"
    echo "   ngrok http 4000"
    exit 1
fi

echo ""
echo "✅ ngrok tunnel started!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 PUBLIC URL: $NGROK_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Add this tracking script to your live website:"
echo ""
echo "<script>"
echo "(function(){"
echo "  const API_URL = '$NGROK_URL';"
echo "  let sessionId = sessionStorage.getItem('ah_session') || Math.random().toString(36).substring(7);"
echo "  sessionStorage.setItem('ah_session', sessionId);"
echo "  "
echo "  function track(type, data) {"
echo "    fetch(API_URL + '/api/v1/' + type, {"
echo "      method: 'POST',"
echo "      headers: {'Content-Type': 'application/json'},"
echo "      body: JSON.stringify({...data, sessionId}),"
echo "      keepalive: true"
echo "    }).catch(e => console.log('Analytics:', e));"
echo "  }"
echo "  "
echo "  window.analyticsHub = {"
echo "    trackEvent: (name, props) => track('event', {event: {eventType: 'custom', eventName: name, pageUrl: location.href, properties: props, sessionId}}),"
echo "    trackConversion: (name, val) => track('conversion', {goalName: name, goalValue: val, pageUrl: location.href}),"
echo "    trackPageView: () => track('pageview', {pageUrl: location.href, pageTitle: document.title})"
echo "  };"
echo "  "
echo "  track('pageview', {pageUrl: location.href, pageTitle: document.title});"
echo "  console.log('✅ Analytics tracking active:', API_URL);"
echo "})();"
echo "</script>"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "2. Test the connection:"
echo "   curl $NGROK_URL/health"
echo ""
echo "3. Open your dashboard:"
echo "   http://localhost:5173"
echo ""
echo "4. Visit your live website and watch real-time data!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 ngrok web interface: http://localhost:4040"
echo "📊 Analytics Dashboard: http://localhost:5173"
echo "🌐 Public API: $NGROK_URL"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Keep script running
wait $NGROK_PID
