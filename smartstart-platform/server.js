const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.APP_PORT || 3345;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://sql.js.org"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://sql.js.org", "http://localhost:3344", "http://localhost:3345"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["'self'", "blob:"],
        },
    },
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use(express.static(path.join(__dirname, 'website'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.wasm')) {
            res.setHeader('Content-Type', 'application/wasm');
        }
    }
}));

// API routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/api/stats', (req, res) => {
    res.json({
        totalUsers: 0, // TODO: Implement database stats
        totalVentures: 0,
        activeJourneys: 0,
        lastUpdated: new Date().toISOString()
    });
});

// Database API endpoints
app.get('/api/database/export', (req, res) => {
    // TODO: Implement database export
    res.json({ message: 'Database export endpoint - to be implemented' });
});

app.post('/api/database/import', (req, res) => {
    // TODO: Implement database import
    res.json({ message: 'Database import endpoint - to be implemented' });
});

// User API endpoints
app.get('/api/users/:id', (req, res) => {
    // TODO: Implement user retrieval
    res.json({ message: 'User endpoint - to be implemented' });
});

app.post('/api/users', (req, res) => {
    // TODO: Implement user creation
    res.json({ message: 'User creation endpoint - to be implemented' });
});

// Venture API endpoints
app.get('/api/ventures', (req, res) => {
    // TODO: Implement ventures retrieval
    res.json({ message: 'Ventures endpoint - to be implemented' });
});

app.post('/api/ventures', (req, res) => {
    // TODO: Implement venture creation
    res.json({ message: 'Venture creation endpoint - to be implemented' });
});

// Journey API endpoints
app.get('/api/journeys/:userId', (req, res) => {
    // TODO: Implement journey retrieval
    res.json({ message: 'Journey endpoint - to be implemented' });
});

app.post('/api/journeys', (req, res) => {
    // TODO: Implement journey creation
    res.json({ message: 'Journey creation endpoint - to be implemented' });
});

// Admin Analytics API endpoints
app.get('/api/admin/analytics', (req, res) => {
    // Mock analytics data for development
    const analyticsData = {
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

    res.json(analyticsData);
});

app.get('/api/admin/visitors', (req, res) => {
    // TODO: Implement real visitor tracking
    res.json({
        message: 'Visitor tracking endpoint - to be implemented',
        currentVisitors: Math.floor(Math.random() * 10) + 1
    });
});

app.post('/api/admin/track', (req, res) => {
    // TODO: Implement visitor tracking
    const { page, referrer, userAgent, ip } = req.body;
    console.log('Tracking:', { page, referrer, userAgent, ip });
    res.json({ success: true, message: 'Visit tracked' });
});

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
    // Check if the request is for an API endpoint
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }

    // Serve the main HTML file for all other routes
    res.sendFile(path.join(__dirname, 'website', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production' ?
            'Internal server error' :
            err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`📱 SmartStart App Server running on port ${PORT}`);
    console.log(`🔐 Private App: http://localhost:${PORT}`);
    console.log(`🌐 Public Website: http://localhost:3346`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📈 Stats: http://localhost:${PORT}/api/stats`);
    console.log(`\n🎯 AliceSolutionsGroup - SmartStart Platform`);
    console.log(`👨‍💻 Founder: Udi Shkolnik`);
    console.log(`📧 Contact: info@alicesolutionsgroup.com`);
    console.log(`\n✨ Ready to transform ideas into profitable SaaS businesses!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});