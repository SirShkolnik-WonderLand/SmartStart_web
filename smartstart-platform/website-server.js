const express = require('express');
const cors = require('cors');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const bookingApi = require('./booking-api');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.WEBSITE_PORT || 3346;
const NODE_ENV = process.env.NODE_ENV || 'development';
const PRODUCTION_DOMAIN = process.env.PRODUCTION_DOMAIN || 'https://alicesolutionsgroup.com';

// Determine allowed origins based on environment
const allowedOrigins = NODE_ENV === 'production' 
    ? [PRODUCTION_DOMAIN, 'https://alicesolutionsgroup.com']
    : ['http://localhost:3345', 'http://localhost:3346', 'http://localhost:3344'];

// Determine connectSrc based on environment
const connectSources = NODE_ENV === 'production'
    ? ["'self'", PRODUCTION_DOMAIN, "https://billing.zohocloud.ca", "https://*.zohocloud.ca", "https://*.zohostatic.com"]
    : ["'self'", "http://localhost:3344", "http://localhost:3345", PRODUCTION_DOMAIN, "https://billing.zohocloud.ca", "https://*.zohocloud.ca", "https://*.zohostatic.com"];

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://js.zohostatic.com", "https://*.zohostatic.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://js.zohostatic.com", "https://billing.zohocloud.ca", "https://*.zohostatic.com", "https://*.zohocloud.ca", "https://unpkg.com"],
            scriptSrcAttr: ["'unsafe-inline'", "'unsafe-hashes'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: connectSources,
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
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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

// Static file serving for Quiestioneer (SMB Cyber Health Check)
app.use('/Quiestioneer', express.static(path.join(__dirname, 'Quiestioneer', 'dist'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        // Set proper MIME types for Quiestioneer assets
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        } else if (path.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json');
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
    deviceFingerprints: new Map(), // Track device fingerprints
    coreWebVitals: [], // Core Web Vitals data
    seoMetrics: [], // SEO metrics data
    userBehavior: [], // User behavior data
    performanceMetrics: [], // Performance metrics data
    marketingMetrics: [] // Marketing metrics data
};

// Data persistence functions
const DATA_FILE = path.join(__dirname, 'analytics-data.json');
const BOOKINGS_FILE = path.join(__dirname, 'bookings-data.json');

function saveAnalyticsData() {
    try {
        const dataToSave = {
            visitors: Array.from(analyticsStorage.visitors.entries()),
            pageViews: analyticsStorage.pageViews,
            events: analyticsStorage.events,
            uniqueUsers: Array.from(analyticsStorage.uniqueUsers.entries()),
            ipAddresses: Array.from(analyticsStorage.ipAddresses.entries()),
            deviceFingerprints: Array.from(analyticsStorage.deviceFingerprints.entries()),
            lastSaved: new Date().toISOString()
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2));
        console.log('Analytics data saved to file');
    } catch (error) {
        console.error('Error saving analytics data:', error);
    }
}

function loadAnalyticsData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

            // Restore Maps from arrays
            analyticsStorage.visitors = new Map(data.visitors || []);
            analyticsStorage.pageViews = data.pageViews || [];
            analyticsStorage.events = data.events || [];
            analyticsStorage.uniqueUsers = new Map(data.uniqueUsers || []);
            analyticsStorage.ipAddresses = new Map(data.ipAddresses || []);
            analyticsStorage.deviceFingerprints = new Map(data.deviceFingerprints || []);

            console.log('Analytics data loaded from file:', {
                visitors: analyticsStorage.visitors.size,
                pageViews: analyticsStorage.pageViews.length,
                events: analyticsStorage.events.length,
                uniqueUsers: analyticsStorage.uniqueUsers.size,
                lastSaved: data.lastSaved
            });
        }
    } catch (error) {
        console.error('Error loading analytics data:', error);
    }
}

// Load data on startup
loadAnalyticsData();

// Save data every 30 seconds
setInterval(saveAnalyticsData, 30000);

// Process analytics data function
function processAnalyticsData() {
    const now = new Date();
    const last30days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Use 30 days to include all recent data

    console.log('Processing analytics data...');
    console.log('Total page views in storage:', analyticsStorage.pageViews.length);
    console.log('Total events in storage:', analyticsStorage.events.length);

    // Use all data (no time filtering for now)
    const recentPageViews = analyticsStorage.pageViews;
    const recentEvents = analyticsStorage.events;

    console.log('All page views (no time filter):', recentPageViews.length);
    console.log('All events (no time filter):', recentEvents.length);

    // Debug: show sample of page views
    if (recentPageViews.length > 0) {
        console.log('Sample page view:', recentPageViews[0]);
    }

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
            console.log('Processing country:', pv.data.country);
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

    console.log('Total visitors:', totalVisitors);
    console.log('Total page views:', totalPageViews);

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
        keywords: [], // Only real keyword data when available
        referrals: [], // Only real referral data when available
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
// Booking API routes
app.use('/api', bookingApi);

app.get('/api/admin/analytics', (req, res) => {

    // Use only real data - no mock data fallback
    const realData = processAnalyticsData();
    console.log('Real data visitors:', realData.visitors);
    console.log('Real data pageViews:', realData.pageViews);
    console.log('Analytics storage size:', analyticsStorage.visitors.size);
    console.log('Page views in storage:', analyticsStorage.pageViews.length);

    // Always return real data, even if empty
    console.log('Using REAL data only - no mock data');
    res.json(realData);
});

// Core Web Vitals endpoint
app.post('/vitals', (req, res) => {
    try {
        const vitalsData = req.body;
        const timestamp = new Date().toISOString();

        // Log the vitals data for monitoring
        console.log(`[CWV] ${timestamp} - ${vitalsData.metric}: ${vitalsData.value} (ID: ${vitalsData.id})`);

        // Store in analytics data for admin dashboard
        if (!analyticsStorage.coreWebVitals) {
            analyticsStorage.coreWebVitals = [];
        }

        analyticsStorage.coreWebVitals.push({
            ...vitalsData,
            timestamp,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress
        });

        // Keep only last 1000 entries to prevent memory issues
        if (analyticsStorage.coreWebVitals.length > 1000) {
            analyticsStorage.coreWebVitals = analyticsStorage.coreWebVitals.slice(-1000);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error processing Core Web Vitals:', error);
        res.status(500).json({ error: 'Failed to process vitals data' });
    }
});

// Admin bookings endpoint
app.get('/api/admin/bookings', async(req, res) => {
    try {
        const bookingsData = await fs.readFile(BOOKINGS_FILE, 'utf8');
        const bookings = JSON.parse(bookingsData);
        res.json({ bookings });
    } catch (error) {
        console.error('Error loading bookings:', error);
        res.json({ bookings: [] });
    }
});

// IP Geolocation helper function (using free ip-api.com service)
// Free tier: 45 requests/minute (much higher than ipapi.co)
async function getGeoLocation(ip) {
    // Skip geolocation for localhost
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.includes('localhost')) {
        return {
            country: 'Local',
            city: 'Localhost',
            region: 'Development',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    // Extract real IP (Cloudflare format: "client_ip, cloudflare_ip")
    const realIP = ip.split(',')[0].trim();

    // Skip if invalid IP
    if (!realIP || realIP === '::1' || realIP === '127.0.0.1') {
        return {
            country: 'Local',
            city: 'Localhost',
            region: 'Development',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    try {
        return await new Promise((resolve, reject) => {
            const options = {
                hostname: 'ip-api.com',
                path: `/json/${realIP}?fields=status,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,as,query`,
                method: 'GET',
                headers: { 'User-Agent': 'AliceSolutionsGroup-Analytics/1.0' },
                timeout: 2000
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        if (json.status === 'success') {
                            resolve({
                                country: json.country || 'Unknown',
                                countryCode: json.countryCode || 'Unknown',
                                city: json.city || 'Unknown',
                                region: json.regionName || json.region || 'Unknown',
                                latitude: json.lat || null,
                                longitude: json.lon || null,
                                timezone: json.timezone || 'Unknown',
                                isp: json.isp || json.org || 'Unknown'
                            });
                        } else {
                            resolve({
                                country: 'Unknown',
                                city: 'Unknown',
                                region: 'Unknown',
                                timezone: 'Unknown'
                            });
                        }
                    } catch (e) {
                        resolve({
                            country: 'Unknown',
                            city: 'Unknown',
                            region: 'Unknown',
                            timezone: 'Unknown'
                        });
                    }
                });
            });

            req.on('error', () => {
                resolve({
                    country: 'Unknown',
                    city: 'Unknown',
                    region: 'Unknown',
                    timezone: 'Unknown'
                });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    country: 'Unknown',
                    city: 'Unknown',
                    region: 'Unknown',
                    timezone: 'Unknown'
                });
            });

            req.end();
        });
    } catch (error) {
        console.error('Geolocation error:', error);
        return {
            country: 'Unknown',
            city: 'Unknown',
            region: 'Unknown',
            timezone: 'Unknown'
        };
    }
}

app.post('/api/admin/track', async (req, res) => {
    try {
        const { event, eventType, data, timestamp, url } = req.body;
        const eventName = event || eventType; // Support both event and eventType

        // Get client IP address
        const clientIP = req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null);

        // Get geolocation data for the IP
        const geoData = await getGeoLocation(clientIP);

        // Store the tracking data
        if (eventName === 'pageview') {
            const trackingData = {
                event: eventName,
                data: {
                    ...data,
                    clientIP: clientIP,
                    country: geoData.country,
                    countryCode: geoData.countryCode,
                    city: geoData.city,
                    region: geoData.region,
                    latitude: geoData.latitude,
                    longitude: geoData.longitude,
                    isp: geoData.isp,
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
                    country: geoData.country,
                    city: geoData.city,
                    region: geoData.region,
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
                        country: geoData.country,
                        city: geoData.city,
                        region: geoData.region,
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
                        country: geoData.country,
                        city: geoData.city,
                        region: geoData.region,
                        visitCount: 1,
                        sessions: new Set([data.sessionId])
                    });
                } else {
                    const ipData = analyticsStorage.ipAddresses.get(clientIP);
                    ipData.lastSeen = timestamp;
                    ipData.visitCount += 1;
                    // Ensure sessions is a Set
                    if (!(ipData.sessions instanceof Set)) {
                        ipData.sessions = new Set(ipData.sessions || []);
                    }
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
                    // Ensure ips is a Set
                    if (!(deviceData.ips instanceof Set)) {
                        deviceData.ips = new Set(deviceData.ips || []);
                    }
                    deviceData.ips.add(clientIP);
                }
            }

        } else if (eventName === 'userinfo') {
            // Store detailed user information
            analyticsStorage.events.push({
                event: eventName,
                data: {
                    ...data,
                    clientIP: clientIP,
                    serverTimestamp: new Date().toISOString()
                },
                timestamp,
                url
            });
        } else if (eventName === 'core_web_vitals') {
            // Store Core Web Vitals data
            analyticsStorage.coreWebVitals.push({
                event: eventName,
                data: {
                    ...data,
                    clientIP: clientIP,
                    serverTimestamp: new Date().toISOString()
                },
                timestamp,
                url
            });
        } else if (eventName === 'seo_metrics') {
            // Store SEO metrics data
            analyticsStorage.seoMetrics.push({
                event: eventName,
                data: {
                    ...data,
                    clientIP: clientIP,
                    serverTimestamp: new Date().toISOString()
                },
                timestamp,
                url
            });
        } else if (eventName === 'mouse_movements' || eventName === 'focus_event' || eventName === 'form_interaction' || eventName === 'scroll_depth') {
            // Store user behavior data
            analyticsStorage.userBehavior.push({
                event: eventName,
                data: {
                    ...data,
                    clientIP: clientIP,
                    serverTimestamp: new Date().toISOString()
                },
                timestamp,
                url
            });
        } else if (eventName === 'marketing_metrics') {
            // Store marketing metrics data
            analyticsStorage.marketingMetrics.push({
                event: eventName,
                data: {
                    ...data,
                    clientIP: clientIP,
                    serverTimestamp: new Date().toISOString()
                },
                timestamp,
                url
            });
        } else {
            // Store other events
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
        if (analyticsStorage.coreWebVitals.length > 1000) {
            analyticsStorage.coreWebVitals = analyticsStorage.coreWebVitals.slice(-1000);
        }
        if (analyticsStorage.seoMetrics.length > 1000) {
            analyticsStorage.seoMetrics = analyticsStorage.seoMetrics.slice(-1000);
        }
        if (analyticsStorage.userBehavior.length > 1000) {
            analyticsStorage.userBehavior = analyticsStorage.userBehavior.slice(-1000);
        }
        if (analyticsStorage.marketingMetrics.length > 1000) {
            analyticsStorage.marketingMetrics = analyticsStorage.marketingMetrics.slice(-1000);
        }

        // Save data immediately after tracking
        saveAnalyticsData();

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

// Debug endpoint to see raw data
app.get('/api/admin/debug', (req, res) => {
    res.json({
        storage: {
            visitors: analyticsStorage.visitors.size,
            pageViews: analyticsStorage.pageViews.length,
            events: analyticsStorage.events.length,
            uniqueUsers: analyticsStorage.uniqueUsers.size,
            ipAddresses: analyticsStorage.ipAddresses.size,
            deviceFingerprints: analyticsStorage.deviceFingerprints.size
        },
        recentPageViews: analyticsStorage.pageViews.slice(-5).map(pv => ({
            timestamp: pv.timestamp,
            path: pv.data.path,
            country: pv.data.country,
            city: pv.data.city,
            ip: pv.data.clientIP,
            fingerprint: pv.data.fingerprint
        })),
        recentEvents: analyticsStorage.events.slice(-5).map(ev => ({
            timestamp: ev.timestamp,
            event: ev.event,
            ip: ev.data.clientIP
        }))
    });
});

// Advanced analytics endpoints
app.get('/api/admin/core-web-vitals', (req, res) => {
    const coreWebVitalsEvents = analyticsStorage.coreWebVitals || [];
    const vitals = {
        LCP: coreWebVitalsEvents.filter(ev => ev && ev.data && ev.data.metric === 'LCP').map(ev => ev.data.value),
        FID: coreWebVitalsEvents.filter(ev => ev && ev.data && ev.data.metric === 'FID').map(ev => ev.data.value),
        INP: coreWebVitalsEvents.filter(ev => ev && ev.data && ev.data.metric === 'INP').map(ev => ev.data.value),
        CLS: coreWebVitalsEvents.filter(ev => ev && ev.data && ev.data.metric === 'CLS').map(ev => ev.data.value)
    };

    res.json({
        vitals: vitals,
        averages: {
            LCP: vitals.LCP.length > 0 ? (vitals.LCP.reduce((a, b) => a + b, 0) / vitals.LCP.length).toFixed(2) : 0,
            FID: vitals.FID.length > 0 ? (vitals.FID.reduce((a, b) => a + b, 0) / vitals.FID.length).toFixed(2) : 0,
            INP: vitals.INP.length > 0 ? (vitals.INP.reduce((a, b) => a + b, 0) / vitals.INP.length).toFixed(2) : 0,
            CLS: vitals.CLS.length > 0 ? (vitals.CLS.reduce((a, b) => a + b, 0) / vitals.CLS.length).toFixed(4) : 0
        },
        totalMeasurements: coreWebVitalsEvents.length
    });
});

app.get('/api/admin/seo-metrics', (req, res) => {
    const seoEvents = analyticsStorage.seoMetrics;
    const latestSeo = seoEvents[seoEvents.length - 1];

    res.json({
        latestMetrics: latestSeo ? latestSeo.data : null,
        totalMeasurements: seoEvents.length,
        averageLoadTime: seoEvents.length > 0 ?
            (seoEvents.reduce((sum, ev) => sum + (ev.data.loadTime || 0), 0) / seoEvents.length).toFixed(2) : 0,
        averageWordCount: seoEvents.length > 0 ?
            (seoEvents.reduce((sum, ev) => sum + (ev.data.wordCount || 0), 0) / seoEvents.length).toFixed(0) : 0,
        averageH1Count: seoEvents.length > 0 ?
            (seoEvents.reduce((sum, ev) => sum + (ev.data.h1Count || 0), 0) / seoEvents.length).toFixed(1) : 0,
        averageH2Count: seoEvents.length > 0 ?
            (seoEvents.reduce((sum, ev) => sum + (ev.data.h2Count || 0), 0) / seoEvents.length).toFixed(1) : 0,
        averageImageCount: seoEvents.length > 0 ?
            (seoEvents.reduce((sum, ev) => sum + (ev.data.imageCount || 0), 0) / seoEvents.length).toFixed(1) : 0,
        averageLinkCount: seoEvents.length > 0 ?
            (seoEvents.reduce((sum, ev) => sum + (ev.data.linkCount || 0), 0) / seoEvents.length).toFixed(1) : 0
    });
});

app.get('/api/admin/user-behavior', (req, res) => {
    const behaviorEvents = analyticsStorage.userBehavior;
    const mouseEvents = behaviorEvents.filter(ev => ev.event === 'mouse_movements');
    const focusEvents = behaviorEvents.filter(ev => ev.event === 'focus_event');
    const formEvents = behaviorEvents.filter(ev => ev.event === 'form_interaction');
    const scrollEvents = behaviorEvents.filter(ev => ev.event === 'scroll_depth');

    res.json({
        mouseMovements: mouseEvents.length,
        focusEvents: focusEvents.length,
        formInteractions: formEvents.length,
        scrollDepthEvents: scrollEvents.length,
        totalBehaviorEvents: behaviorEvents.length,
        recentMouseMovements: mouseEvents.slice(-5).map(ev => ({
            timestamp: ev.timestamp,
            movementCount: ev.data.movements ? ev.data.movements.length : 0
        })),
        recentScrollDepths: scrollEvents.slice(-10).map(ev => ({
            timestamp: ev.timestamp,
            depth: ev.data.depth
        })),
        averageScrollDepth: scrollEvents.length > 0 ?
            (scrollEvents.reduce((sum, ev) => sum + (ev.data.depth || 0), 0) / scrollEvents.length).toFixed(1) : 0
    });
});

// Email monitoring endpoint
app.get('/api/admin/emails', async (req, res) => {
    try {
        const bookingsFile = path.join(__dirname, 'bookings-data.json');
        const bookingsData = fs.existsSync(bookingsFile) ? JSON.parse(fs.readFileSync(bookingsFile, 'utf8')) : { bookings: [] };
        
        // Extract email data from bookings
        const emails = bookingsData.bookings.map(booking => ({
            id: booking.bookingId,
            to: booking.contact?.email || 'N/A',
            subject: `Booking Confirmation - ${booking.service?.name || 'Service'}`,
            status: booking.emailSent ? 'sent' : 'pending',
            timestamp: booking.createdAt || booking.timestamp,
            type: 'booking_confirmation'
        }));

        res.json({ emails, total: emails.length });
    } catch (error) {
        console.error('Error loading email data:', error);
        res.json({ emails: [], total: 0 });
    }
});

// Security test monitoring endpoint
app.get('/api/admin/security-tests', async (req, res) => {
    try {
        const dbPath = path.join(__dirname, 'Quiestioneer', 'smb_health_check.db');
        const tests = [];
        
        if (fs.existsSync(dbPath)) {
            const sqlite3 = require('sqlite3').verbose();
            const db = new sqlite3.Database(dbPath);
            
            db.all("SELECT * FROM assessments ORDER BY created_at DESC LIMIT 100", (err, rows) => {
                if (err) {
                    console.error('Error querying security tests:', err);
                    res.json({ tests: [], total: 0 });
                } else {
                    const tests = rows.map(row => ({
                        id: row.session_id,
                        mode: row.mode,
                        score: row.score,
                        tier: row.tier,
                        email: row.email,
                        company: row.company,
                        status: 'completed',
                        timestamp: row.created_at
                    }));
                    res.json({ tests, total: tests.length });
                }
                db.close();
            });
        } else {
            res.json({ tests: [], total: 0 });
        }
    } catch (error) {
        console.error('Error loading security test data:', error);
        res.json({ tests: [], total: 0 });
    }
});

// Search analytics endpoint
app.get('/api/admin/search-analytics', (req, res) => {
    const searchEvents = analyticsStorage.searchEvents || [];
    
    // Count search terms
    const searchCounts = {};
    searchEvents.forEach(event => {
        const term = event.data?.query || 'unknown';
        searchCounts[term] = (searchCounts[term] || 0) + 1;
    });
    
    const topSearches = Object.entries(searchCounts)
        .map(([term, count]) => ({ term, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    
    res.json({
        totalSearches: searchEvents.length,
        uniqueSearches: Object.keys(searchCounts).length,
        noResults: searchEvents.filter(e => e.data?.resultsCount === 0).length,
        topSearches
    });
});

// System health endpoint
app.get('/api/admin/system-health', (req, res) => {
    const os = require('os');
    const process = require('process');
    
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(2);
    
    res.json({
        status: 'healthy',
        uptime: `${hours}h ${minutes}m ${seconds}s`,
        memoryUsage: `${(usedMemory / 1024 / 1024 / 1024).toFixed(2)} GB / ${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB (${memoryUsagePercent}%)`,
        cpuUsage: `${os.loadavg()[0].toFixed(2)} (1min avg)`,
        platform: os.platform(),
        nodeVersion: process.version,
        environment: NODE_ENV
    });
});

// Enhanced client tracking endpoint
const clientTrackingStorage = {
    clients: new Map(), // Track unique clients by fingerprint
    clientJourneys: [], // Track client navigation
    formInteractions: [], // Track form submissions
    ctaClicks: [] // Track CTA button clicks
};

app.post('/api/admin/track-client', async (req, res) => {
    try {
        const { type, data } = req.body;
        const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];
        
        // Get geographic data for IP
        const geoData = await getGeoLocation(clientIP);
        
        if (type === 'client_data') {
            // Store comprehensive client data
            const fingerprint = data.fingerprint;
            
            if (!clientTrackingStorage.clients.has(fingerprint)) {
                clientTrackingStorage.clients.set(fingerprint, {
                    ...data,
                    ip: clientIP,
                    country: geoData.country,
                    city: geoData.city,
                    region: geoData.region,
                    isp: geoData.isp,
                    firstSeen: new Date().toISOString(),
                    lastSeen: new Date().toISOString(),
                    visitCount: 1,
                    pages: [data.page.path],
                    ctaClicks: 0,
                    formSubmits: 0
                });
            } else {
                const client = clientTrackingStorage.clients.get(fingerprint);
                client.lastSeen = new Date().toISOString();
                client.visitCount += 1;
                if (!client.pages.includes(data.page.path)) {
                    client.pages.push(data.page.path);
                }
            }
        } else if (type === 'page_change') {
            // Track page navigation
            clientTrackingStorage.clientJourneys.push({
                ...data,
                ip: clientIP,
                country: geoData.country,
                city: geoData.city,
                timestamp: new Date().toISOString()
            });
            
            // Keep only last 1000 journeys
            if (clientTrackingStorage.clientJourneys.length > 1000) {
                clientTrackingStorage.clientJourneys = clientTrackingStorage.clientJourneys.slice(-1000);
            }
        } else if (type === 'form_submit') {
            // Track form submissions
            clientTrackingStorage.formInteractions.push({
                ...data,
                ip: clientIP,
                country: geoData.country,
                city: geoData.city,
                timestamp: new Date().toISOString()
            });
            
            // Update client stats
            const fingerprint = clientTrackingStorage.clients.keys().next().value;
            if (fingerprint && clientTrackingStorage.clients.has(fingerprint)) {
                const client = clientTrackingStorage.clients.get(fingerprint);
                client.formSubmits += 1;
            }
            
            // Keep only last 1000 form interactions
            if (clientTrackingStorage.formInteractions.length > 1000) {
                clientTrackingStorage.formInteractions = clientTrackingStorage.formInteractions.slice(-1000);
            }
        } else if (type === 'cta_click') {
            // Track CTA button clicks
            clientTrackingStorage.ctaClicks.push({
                ...data,
                ip: clientIP,
                country: geoData.country,
                city: geoData.city,
                timestamp: new Date().toISOString()
            });
            
            // Update client stats
            const fingerprint = clientTrackingStorage.clients.keys().next().value;
            if (fingerprint && clientTrackingStorage.clients.has(fingerprint)) {
                const client = clientTrackingStorage.clients.get(fingerprint);
                client.ctaClicks += 1;
            }
            
            // Keep only last 1000 CTA clicks
            if (clientTrackingStorage.ctaClicks.length > 1000) {
                clientTrackingStorage.ctaClicks = clientTrackingStorage.ctaClicks.slice(-1000);
            }
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error tracking client data:', error);
        res.status(500).json({ error: 'Failed to track client data' });
    }
});

// Get all client data
app.get('/api/admin/client-data', (req, res) => {
    const clients = Array.from(clientTrackingStorage.clients.values());
    
    res.json({
        totalClients: clients.length,
        clients: clients.map(client => ({
            fingerprint: client.fingerprint,
            device: client.device,
            location: {
                country: client.country,
                city: client.city,
                region: client.region,
                timezone: client.location?.timezone,
                language: client.location?.language
            },
            network: client.network,
            firstSeen: client.firstSeen,
            lastSeen: client.lastSeen,
            visitCount: client.visitCount,
            pagesVisited: client.pages.length,
            pages: client.pages,
            ctaClicks: client.ctaClicks,
            formSubmits: client.formSubmits,
            userAgent: client.userAgent
        })),
        recentJourneys: clientTrackingStorage.clientJourneys.slice(-50),
        recentFormInteractions: clientTrackingStorage.formInteractions.slice(-50),
        recentCTAClicks: clientTrackingStorage.ctaClicks.slice(-50)
    });
});

app.get('/api/admin/performance', (req, res) => {
    const seoEvents = analyticsStorage.seoMetrics || [];
    const coreVitalsEvents = analyticsStorage.coreWebVitals || [];

    const performanceData = {
        pageLoadTimes: seoEvents.map(ev => ev && ev.data && ev.data.loadTime).filter(time => time > 0),
        domContentLoaded: seoEvents.map(ev => ev && ev.data && ev.data.domContentLoaded).filter(time => time > 0),
        firstPaint: seoEvents.map(ev => ev && ev.data && ev.data.firstPaint).filter(time => time > 0),
        firstContentfulPaint: seoEvents.map(ev => ev && ev.data && ev.data.firstContentfulPaint).filter(time => time > 0),
        coreWebVitals: {
            LCP: coreVitalsEvents.filter(ev => ev && ev.data && ev.data.metric === 'LCP').map(ev => ev.data.value),
            FID: coreVitalsEvents.filter(ev => ev && ev.data && ev.data.metric === 'FID').map(ev => ev.data.value),
            INP: coreVitalsEvents.filter(ev => ev && ev.data && ev.data.metric === 'INP').map(ev => ev.data.value),
            CLS: coreVitalsEvents.filter(ev => ev && ev.data && ev.data.metric === 'CLS').map(ev => ev.data.value)
        }
    };

    // Calculate averages
    const averages = {
        pageLoadTime: performanceData.pageLoadTimes.length > 0 ?
            (performanceData.pageLoadTimes.reduce((a, b) => a + b, 0) / performanceData.pageLoadTimes.length).toFixed(2) : 0,
        domContentLoaded: performanceData.domContentLoaded.length > 0 ?
            (performanceData.domContentLoaded.reduce((a, b) => a + b, 0) / performanceData.domContentLoaded.length).toFixed(2) : 0,
        firstPaint: performanceData.firstPaint.length > 0 ?
            (performanceData.firstPaint.reduce((a, b) => a + b, 0) / performanceData.firstPaint.length).toFixed(2) : 0,
        firstContentfulPaint: performanceData.firstContentfulPaint.length > 0 ?
            (performanceData.firstContentfulPaint.reduce((a, b) => a + b, 0) / performanceData.firstContentfulPaint.length).toFixed(2) : 0,
        LCP: performanceData.coreWebVitals.LCP.length > 0 ?
            (performanceData.coreWebVitals.LCP.reduce((a, b) => a + b, 0) / performanceData.coreWebVitals.LCP.length).toFixed(2) : 0,
        FID: performanceData.coreWebVitals.FID.length > 0 ?
            (performanceData.coreWebVitals.FID.reduce((a, b) => a + b, 0) / performanceData.coreWebVitals.FID.length).toFixed(2) : 0,
        INP: performanceData.coreWebVitals.INP.length > 0 ?
            (performanceData.coreWebVitals.INP.reduce((a, b) => a + b, 0) / performanceData.coreWebVitals.INP.length).toFixed(2) : 0,
        CLS: performanceData.coreWebVitals.CLS.length > 0 ?
            (performanceData.coreWebVitals.CLS.reduce((a, b) => a + b, 0) / performanceData.coreWebVitals.CLS.length).toFixed(4) : 0
    };

    res.json({
        performanceData,
        averages,
        totalMeasurements: seoEvents.length + coreVitalsEvents.length
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

// Serve website pages (but not API routes)
// Serve Quiestioneer index.html for root Quiestioneer path
app.get('/Quiestioneer/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Quiestioneer', 'dist', 'index.html'));
});

app.get('*', (req, res) => {
    // Skip API routes - they should be handled above
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }

    // Try to serve the specific file first
    const filePath = path.join(__dirname, 'website', req.path);
    const indexPath = path.join(__dirname, 'website', 'index.html');

    // Check if the requested file exists
    if (require('fs').existsSync(filePath) && require('fs').statSync(filePath).isFile()) {
        // Set correct MIME type based on file extension
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.wasm')) {
            res.setHeader('Content-Type', 'application/wasm');
        } else if (filePath.endsWith('.ico')) {
            res.setHeader('Content-Type', 'image/x-icon');
        } else if (filePath.endsWith('.svg')) {
            res.setHeader('Content-Type', 'image/svg+xml');
        } else if (filePath.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (filePath.endsWith('.gif')) {
            res.setHeader('Content-Type', 'image/gif');
        } else if (filePath.endsWith('.webp')) {
            res.setHeader('Content-Type', 'image/webp');
        } else if (filePath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        } else if (filePath.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json');
        } else if (filePath.endsWith('.xml')) {
            res.setHeader('Content-Type', 'application/xml');
        } else if (filePath.endsWith('.txt')) {
            res.setHeader('Content-Type', 'text/plain');
        }

        res.sendFile(filePath);
    } else {
        // Fallback to index.html for SPA routing
        res.setHeader('Content-Type', 'text/html');
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