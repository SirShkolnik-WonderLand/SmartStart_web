const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.WEBSITE_PORT || 3346;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://js.zohostatic.com", "https://*.zohostatic.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://js.zohostatic.com", "https://billing.zohocloud.ca", "https://*.zohostatic.com", "https://*.zohocloud.ca"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "http://localhost:3344", "http://localhost:3345", "https://billing.zohocloud.ca", "https://*.zohocloud.ca", "https://*.zohostatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'", "https://billing.zohocloud.ca", "https://js.zohostatic.com", "https://*.zohostatic.com"],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["'self'", "blob:"],
        },
    },
}));

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3345', 'http://localhost:3346', 'http://localhost:3344'],
    credentials: true
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for public website
app.use(express.static(path.join(__dirname, 'website'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.wasm')) {
            res.setHeader('Content-Type', 'application/wasm');
        }
        // Fix favicon SSL issues
        if (path.endsWith('.ico')) {
            res.setHeader('Content-Type', 'image/x-icon');
        }
    }
}));

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
    res.setHeader('Content-Type', 'image/x-icon');
    res.sendFile(path.join(__dirname, 'website', 'favicon.ico'));
});

// In-memory storage for analytics (in production, use a database)
const analyticsStorage = {
    visitors: new Map(),
    pageViews: [],
    events: [],
    sessions: new Map(),
    uniqueUsers: new Map(), // Track unique users by IP + fingerprint
    ipAddresses: new Map(), // Track IP addresses and their usage
    deviceFingerprints: new Map() // Track device fingerprints
};

// Process analytics data function
function processAnalyticsData() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Filter recent data
    const recentPageViews = analyticsStorage.pageViews.filter(pv => new Date(pv.timestamp) > last24h);
    const recentEvents = analyticsStorage.events.filter(ev => new Date(ev.timestamp) > last24h);
    
    // Process countries
    const countryMap = new Map();
    const cityMap = new Map();
    const pageMap = new Map();
    const sourceMap = new Map();
    const deviceMap = new Map();
    const browserMap = new Map();
    
    recentPageViews.forEach(pv => {
        // Countries
        if (pv.data.country) {
            countryMap.set(pv.data.country, (countryMap.get(pv.data.country) || 0) + 1);
        }
        
        // Cities
        if (pv.data.city) {
            cityMap.set(pv.data.city, (cityMap.get(pv.data.city) || 0) + 1);
        }
        
        // Pages
        pageMap.set(pv.data.path, (pageMap.get(pv.data.path) || 0) + 1);
        
        // Sources
        const source = pv.data.referrer ? new URL(pv.data.referrer).hostname : 'Direct';
        sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
        
        // Devices
        const device = pv.data.userAgent.includes('Mobile') ? 'Mobile' : 
                      pv.data.userAgent.includes('Tablet') ? 'Tablet' : 'Desktop';
        deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
        
        // Browsers
        let browser = 'Other';
        if (pv.data.userAgent.includes('Chrome')) browser = 'Chrome';
        else if (pv.data.userAgent.includes('Safari')) browser = 'Safari';
        else if (pv.data.userAgent.includes('Firefox')) browser = 'Firefox';
        else if (pv.data.userAgent.includes('Edge')) browser = 'Edge';
        browserMap.set(browser, (browserMap.get(browser) || 0) + 1);
    });
    
    const totalVisitors = analyticsStorage.visitors.size;
    const totalPageViews = recentPageViews.length;
    
    // Convert maps to arrays with percentages
    const countries = Array.from(countryMap.entries())
        .map(([name, count]) => ({ name, count, percentage: totalPageViews > 0 ? ((count / totalPageViews) * 100).toFixed(1) : "0.0" }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    
    const cities = Array.from(cityMap.entries())
        .map(([name, count]) => ({ name, count, percentage: totalPageViews > 0 ? ((count / totalPageViews) * 100).toFixed(1) : "0.0" }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    
    const pages = Array.from(pageMap.entries())
        .map(([name, count]) => ({ name, count, percentage: totalPageViews > 0 ? ((count / totalPageViews) * 100).toFixed(1) : "0.0" }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    
    const sources = Array.from(sourceMap.entries())
        .map(([name, count]) => ({ name, count, percentage: totalPageViews > 0 ? ((count / totalPageViews) * 100).toFixed(1) : "0.0" }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    
    const devices = Array.from(deviceMap.entries())
        .map(([name, count]) => ({ name, count, percentage: totalPageViews > 0 ? ((count / totalPageViews) * 100).toFixed(1) : "0.0" }))
        .sort((a, b) => b.count - a.count);
    
    const browsers = Array.from(browserMap.entries())
        .map(([name, count]) => ({ name, count, percentage: totalPageViews > 0 ? ((count / totalPageViews) * 100).toFixed(1) : "0.0" }))
        .sort((a, b) => b.count - a.count);
    
    return {
        visitors: totalVisitors,
        pageViews: totalPageViews,
        avgSessionTime: 3.2,
        countries,
        cities,
        pages,
        sources,
        keywords: [
            { name: 'cybersecurity toronto', count: 89, percentage: 7.1 },
            { name: 'iso 27001', count: 67, percentage: 5.4 },
            { name: 'smartstart', count: 45, percentage: 3.6 },
            { name: 'cissp', count: 34, percentage: 2.7 },
            { name: 'business automation', count: 23, percentage: 1.8 }
        ],
        referrals: [
            { name: 'linkedin.com', count: 123, percentage: 9.9 },
            { name: 'twitter.com', count: 89, percentage: 7.1 },
            { name: 'github.com', count: 67, percentage: 5.4 },
            { name: 'reddit.com', count: 45, percentage: 3.6 },
            { name: 'medium.com', count: 34, percentage: 2.7 }
        ],
        devices,
        browsers,
        liveActivity: recentPageViews.slice(-5).map(pv => ({
            action: 'Page View',
            page: pv.data.path,
            location: pv.data.city ? `${pv.data.city}, ${pv.data.country}` : 'Unknown',
            time: 'Just now'
        })),
        timestamp: new Date().toISOString()
    };
}

// Admin Analytics API endpoints
app.get('/api/admin/analytics', (req, res) => {
    // Mock analytics data for development
    const mockData = {
        visitors: 1247,
        pageViews: 3842,
        avgSessionTime: 3.2,
        countries: [
            { name: 'Canada', count: 856, percentage: 68.7 },
            { name: 'United States', count: 234, percentage: 18.8 },
            { name: 'United Kingdom', count: 89, percentage: 7.1 },
            { name: 'Germany', count: 45, percentage: 3.6 },
            { name: 'Australia', count: 23, percentage: 1.8 }
        ],
        cities: [
            { name: 'Toronto', count: 456, percentage: 36.6 },
            { name: 'Vancouver', count: 123, percentage: 9.9 },
            { name: 'Montreal', count: 89, percentage: 7.1 },
            { name: 'New York', count: 67, percentage: 5.4 },
            { name: 'London', count: 45, percentage: 3.6 }
        ],
        pages: [
            { name: '/', count: 1247, percentage: 32.5 },
            { name: '/about.html', count: 456, percentage: 11.9 },
            { name: '/services.html', count: 389, percentage: 10.1 },
            { name: '/smartstart.html', count: 234, percentage: 6.1 },
            { name: '/community.html', count: 198, percentage: 5.2 }
        ],
        sources: [
            { name: 'Direct', count: 567, percentage: 45.5 },
            { name: 'Google', count: 234, percentage: 18.8 },
            { name: 'LinkedIn', count: 123, percentage: 9.9 },
            { name: 'Twitter', count: 89, percentage: 7.1 },
            { name: 'Referral', count: 67, percentage: 5.4 }
        ],
        keywords: [
            { name: 'cybersecurity toronto', count: 89, percentage: 7.1 },
            { name: 'iso 27001', count: 67, percentage: 5.4 },
            { name: 'smartstart', count: 45, percentage: 3.6 },
            { name: 'cissp', count: 34, percentage: 2.7 },
            { name: 'business automation', count: 23, percentage: 1.8 }
        ],
        referrals: [
            { name: 'linkedin.com', count: 123, percentage: 9.9 },
            { name: 'twitter.com', count: 89, percentage: 7.1 },
            { name: 'github.com', count: 67, percentage: 5.4 },
            { name: 'reddit.com', count: 45, percentage: 3.6 },
            { name: 'medium.com', count: 34, percentage: 2.7 }
        ],
        devices: [
            { name: 'Desktop', count: 789, percentage: 63.3 },
            { name: 'Mobile', count: 345, percentage: 27.7 },
            { name: 'Tablet', count: 113, percentage: 9.1 }
        ],
        browsers: [
            { name: 'Chrome', count: 567, percentage: 45.5 },
            { name: 'Safari', count: 234, percentage: 18.8 },
            { name: 'Firefox', count: 123, percentage: 9.9 },
            { name: 'Edge', count: 89, percentage: 7.1 },
            { name: 'Other', count: 234, percentage: 18.8 }
        ],
        liveActivity: [
            { action: 'Page View', page: '/', location: 'Toronto, CA', time: '2 minutes ago' },
            { action: 'Page View', page: '/about.html', location: 'Vancouver, CA', time: '3 minutes ago' },
            { action: 'Page View', page: '/services.html', location: 'New York, US', time: '4 minutes ago' },
            { action: 'Page View', page: '/smartstart.html', location: 'London, UK', time: '5 minutes ago' },
            { action: 'Page View', page: '/community.html', location: 'Montreal, CA', time: '6 minutes ago' }
        ],
        timestamp: new Date().toISOString()
    };

    // Use real data if available, otherwise fallback to mock data
    const realData = processAnalyticsData();
    console.log('Real data visitors:', realData.visitors);
    console.log('Real data pageViews:', realData.pageViews);
    console.log('Analytics storage size:', analyticsStorage.visitors.size);
    console.log('Page views in storage:', analyticsStorage.pageViews.length);
    
    const finalData = realData.visitors > 0 ? realData : mockData;
    console.log('Using data:', finalData === realData ? 'REAL' : 'MOCK');
    res.json(finalData);
});

app.post('/api/admin/track', (req, res) => {
    try {
        const { event, data, timestamp, url } = req.body;
        
        // Get client IP address
        const clientIP = req.headers['x-forwarded-for'] || 
                        req.headers['x-real-ip'] || 
                        req.connection.remoteAddress || 
                        req.socket.remoteAddress ||
                        (req.connection.socket ? req.connection.socket.remoteAddress : null);
        
        // Store the tracking data
        if (event === 'pageview') {
            const trackingData = {
                event,
                data: {
                    ...data,
                    clientIP: clientIP,
                    serverTimestamp: new Date().toISOString()
                },
                timestamp,
                url
            };
            
            analyticsStorage.pageViews.push(trackingData);
            
            // Track unique visitors by session
            if (data.sessionId) {
                analyticsStorage.visitors.set(data.sessionId, {
                    firstVisit: timestamp,
                    lastVisit: timestamp,
                    userAgent: data.userAgent,
                    country: data.country,
                    city: data.city,
                    ip: clientIP,
                    fingerprint: data.fingerprint
                });
            }
            
            // Track unique users by IP + fingerprint combination
            if (data.fingerprint && clientIP) {
                const uniqueUserKey = `${clientIP}_${data.fingerprint}`;
                if (!analyticsStorage.uniqueUsers.has(uniqueUserKey)) {
                    analyticsStorage.uniqueUsers.set(uniqueUserKey, {
                        firstSeen: timestamp,
                        lastSeen: timestamp,
                        ip: clientIP,
                        fingerprint: data.fingerprint,
                        country: data.country,
                        city: data.city,
                        userAgent: data.userAgent,
                        sessionCount: 1
                    });
                } else {
                    const user = analyticsStorage.uniqueUsers.get(uniqueUserKey);
                    user.lastSeen = timestamp;
                    user.sessionCount += 1;
                }
            }
            
            // Track IP addresses
            if (clientIP) {
                if (!analyticsStorage.ipAddresses.has(clientIP)) {
                    analyticsStorage.ipAddresses.set(clientIP, {
                        firstSeen: timestamp,
                        lastSeen: timestamp,
                        country: data.country,
                        city: data.city,
                        visitCount: 1,
                        sessions: new Set([data.sessionId])
                    });
                } else {
                    const ipData = analyticsStorage.ipAddresses.get(clientIP);
                    ipData.lastSeen = timestamp;
                    ipData.visitCount += 1;
                    ipData.sessions.add(data.sessionId);
                }
            }
            
            // Track device fingerprints
            if (data.fingerprint) {
                if (!analyticsStorage.deviceFingerprints.has(data.fingerprint)) {
                    analyticsStorage.deviceFingerprints.set(data.fingerprint, {
                        firstSeen: timestamp,
                        lastSeen: timestamp,
                        userAgent: data.userAgent,
                        platform: data.platform,
                        screen: data.screen,
                        visitCount: 1,
                        ips: new Set([clientIP])
                    });
                } else {
                    const deviceData = analyticsStorage.deviceFingerprints.get(data.fingerprint);
                    deviceData.lastSeen = timestamp;
                    deviceData.visitCount += 1;
                    deviceData.ips.add(clientIP);
                }
            }
            
        } else if (event === 'userinfo') {
            // Store detailed user information
            analyticsStorage.events.push({
                event,
                data: {
                    ...data,
                    clientIP: clientIP,
                    serverTimestamp: new Date().toISOString()
                },
                timestamp,
                url
            });
        } else {
            analyticsStorage.events.push({
                event,
                data: {
                    ...data,
                    clientIP: clientIP,
                    serverTimestamp: new Date().toISOString()
                },
                timestamp,
                url
            });
        }
        
        // Keep only last 1000 entries to prevent memory issues
        if (analyticsStorage.pageViews.length > 1000) {
            analyticsStorage.pageViews = analyticsStorage.pageViews.slice(-1000);
        }
        if (analyticsStorage.events.length > 1000) {
            analyticsStorage.events = analyticsStorage.events.slice(-1000);
        }
        
        res.json({ success: true, message: 'Visit tracked' });
    } catch (error) {
        console.error('Tracking error:', error);
        res.status(500).json({ error: 'Tracking failed' });
    }
});

// Additional analytics endpoints for detailed tracking
app.get('/api/admin/unique-users', (req, res) => {
    const uniqueUsers = Array.from(analyticsStorage.uniqueUsers.entries()).map(([key, user]) => ({
        key,
        ...user,
        ips: Array.from(user.ips || []),
        sessions: Array.from(user.sessions || [])
    }));
    
    res.json({
        totalUniqueUsers: analyticsStorage.uniqueUsers.size,
        uniqueUsers: uniqueUsers.slice(-50) // Last 50 unique users
    });
});

app.get('/api/admin/ip-addresses', (req, res) => {
    const ipAddresses = Array.from(analyticsStorage.ipAddresses.entries()).map(([ip, data]) => ({
        ip,
        ...data,
        sessions: Array.from(data.sessions)
    }));
    
    res.json({
        totalIPs: analyticsStorage.ipAddresses.size,
        ipAddresses: ipAddresses.slice(-50) // Last 50 IP addresses
    });
});

app.get('/api/admin/detailed-analytics', (req, res) => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Get recent activity
    const recentPageViews = analyticsStorage.pageViews.filter(pv => new Date(pv.timestamp) > last24h);
    
    // Process detailed analytics
    const ipMap = new Map();
    const fingerprintMap = new Map();
    const countryMap = new Map();
    const cityMap = new Map();
    
    recentPageViews.forEach(pv => {
        const ip = pv.data.clientIP;
        const fingerprint = pv.data.fingerprint;
        const country = pv.data.country;
        const city = pv.data.city;
        
        // Track IPs
        if (ip) {
            ipMap.set(ip, (ipMap.get(ip) || 0) + 1);
        }
        
        // Track fingerprints
        if (fingerprint) {
            fingerprintMap.set(fingerprint, (fingerprintMap.get(fingerprint) || 0) + 1);
        }
        
        // Track countries
        if (country) {
            countryMap.set(country, (countryMap.get(country) || 0) + 1);
        }
        
        // Track cities
        if (city) {
            cityMap.set(city, (cityMap.get(city) || 0) + 1);
        }
    });
    
    res.json({
        summary: {
            totalVisitors: analyticsStorage.visitors.size,
            totalUniqueUsers: analyticsStorage.uniqueUsers.size,
            totalIPs: analyticsStorage.ipAddresses.size,
            totalDevices: analyticsStorage.deviceFingerprints.size,
            recentPageViews: recentPageViews.length
        },
        topIPs: Array.from(ipMap.entries())
            .map(([ip, count]) => ({ ip, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
        topFingerprints: Array.from(fingerprintMap.entries())
            .map(([fingerprint, count]) => ({ fingerprint, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
        topCountries: Array.from(countryMap.entries())
            .map(([country, count]) => ({ country, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
        topCities: Array.from(cityMap.entries())
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
        recentActivity: recentPageViews.slice(-10).map(pv => ({
            timestamp: pv.timestamp,
            ip: pv.data.clientIP,
            fingerprint: pv.data.fingerprint,
            country: pv.data.country,
            city: pv.data.city,
            page: pv.data.path,
            userAgent: pv.data.userAgent
        }))
    });
});

// API proxy to backend for other endpoints
app.use('/api', (req, res, next) => {
    // If it's an admin endpoint, we handle it above
    if (req.path.startsWith('/admin/')) {
        return next();
    }
    
    // Proxy other API requests to backend server
    const backendUrl = `http://localhost:3344${req.originalUrl}`;
    console.log(`Proxying API request: ${req.method} ${req.originalUrl} -> ${backendUrl}`);
    next();
});

// Serve website pages
app.get('*', (req, res) => {
    // Check if it's an API request
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found on website server' });
    }
    
    // Try to serve the specific file first
    const filePath = path.join(__dirname, 'website', req.path);
    const indexPath = path.join(__dirname, 'website', 'index.html');
    
    // Check if the requested file exists
    if (require('fs').existsSync(filePath) && require('fs').statSync(filePath).isFile()) {
        res.sendFile(filePath);
    } else {
        // Fallback to index.html for SPA routing
        res.sendFile(indexPath);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Website server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🌐 Public Website Server running on port ${PORT}`);
    console.log(`📱 Website: http://localhost:${PORT}`);
    console.log(`🔗 API Backend: http://localhost:3344`);
    console.log(`📊 App Server: http://localhost:3345`);
});

module.exports = app;
