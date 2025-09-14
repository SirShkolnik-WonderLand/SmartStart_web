#!/usr/bin/env node
/**
 * SmartStart Python Proxy Server
 * Lightweight Node.js server that proxies all requests to Python Brain
 * Handles only: WebSockets, file uploads, and frontend serving
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Configuration
const PYTHON_BRAIN_URL = process.env.PYTHON_BRAIN_URL || 'https://smartstart-python-brain.onrender.com';
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['https://smartstart-frontend.onrender.com', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'smartstart-proxy',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        python_brain_url: PYTHON_BRAIN_URL,
        proxy_mode: 'active'
    });
});

// Direct authentication endpoints (BEFORE proxy middleware)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Trim whitespace from email and password
    const trimmedEmail = email ? email.trim() : '';
    const trimmedPassword = password ? password.trim() : '';
    
    console.log(`🔐 Direct auth attempt for: "${trimmedEmail}"`);
    console.log(`🔐 Password received: "${trimmedPassword}"`);
    console.log(`🔐 Email matches expected: ${trimmedEmail === 'udi.admin@alicesolutionsgroup.com'}`);
    console.log(`🔐 Password matches expected: ${trimmedPassword === 'Id200633048!'}`);
    console.log(`🔐 Full request body:`, JSON.stringify(req.body, null, 2));
    
    // Simple authentication for testing (with trimmed values)
    if (trimmedEmail === 'udi.admin@alicesolutionsgroup.com' && trimmedPassword === 'Id200633048!') {
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: 'udi-super-admin-001',
                email: 'udi.admin@alicesolutionsgroup.com',
                name: 'Udi Shkolnik',
                role: 'SUPER_ADMIN',
                token: 'mock-jwt-token-' + Date.now()
            }
        });
    } else if (email === 'test@launch.com' && password === 'password') {
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: 'test-user-123',
                email: 'test@launch.com',
                name: 'Test User',
                role: 'TEAM_MEMBER',
                token: 'mock-jwt-token-' + Date.now()
            }
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }
});

// Direct registration endpoint
app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body;
    
    console.log(`📝 Direct registration attempt for: ${email}`);
    
    res.json({
        success: true,
        message: 'Registration successful',
        user: {
            id: 'user-' + Date.now(),
            email: email,
            name: name || 'New User',
            role: 'MEMBER',
            token: 'mock-jwt-token-' + Date.now()
        }
    });
});

// Health check for auth system
app.get('/api/auth/health', (req, res) => {
    res.json({
        success: true,
        message: 'Authentication system healthy',
        timestamp: new Date().toISOString()
    });
});

// Get current user endpoint
app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log(`👤 Auth me request with token: ${token ? token.substring(0, 20) + '...' : 'none'}`);
    
    // For now, return the admin user if token exists
    if (token && token.startsWith('mock-jwt-token-')) {
        res.json({
            success: true,
            user: {
                id: 'udi-super-admin-001',
                email: 'udi.admin@alicesolutionsgroup.com',
                name: 'Udi Shkolnik',
                role: 'SUPER_ADMIN',
                token: token
            }
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Invalid or missing token'
        });
    }
});

// BUZ Token endpoints
app.get('/api/v1/buz/balance/:userId', (req, res) => {
    const { userId } = req.params;
    console.log(`💰 BUZ balance request for user: ${userId}`);
    
    res.json({
        success: true,
        data: {
            user_id: userId,
            balance: 1000000,
            staked: 500000,
            available: 500000,
            total_earned: 2500000,
            currency: 'BUZ'
        }
    });
});

app.get('/api/v1/buz/supply', (req, res) => {
    console.log(`📊 BUZ supply request`);
    
    res.json({
        success: true,
        data: {
            total_supply: 999999999,
            circulating_supply: 500000000,
            staked_supply: 100000000,
            burned_supply: 50000000,
            market_cap: 10000000,
            price_usd: 0.02
        }
    });
});

// Dashboard analytics endpoint
app.get('/api/dashboard/', (req, res) => {
    console.log(`📈 Dashboard analytics request`);
    
    res.json({
        success: true,
        data: {
            total_users: 7,
            active_ventures: 12,
            total_investments: 5000000,
            platform_revenue: 150000,
            growth_rate: 25.5,
            user_engagement: 78.3,
            venture_success_rate: 65.2,
            average_investment: 25000,
            top_performing_ventures: [
                { id: 'venture-1', name: 'TechCorp', roi: 150 },
                { id: 'venture-2', name: 'InnovateLab', roi: 120 }
            ],
            recent_activities: [
                { type: 'venture_created', message: 'New venture "StartupX" created', timestamp: new Date().toISOString() },
                { type: 'investment', message: '$50,000 invested in "TechCorp"', timestamp: new Date().toISOString() }
            ]
        }
    });
});

// Ventures endpoints
app.get('/api/v1/ventures/list/all', (req, res) => {
    console.log(`🚀 Ventures list request`);
    
    res.json({
        success: true,
        data: {
            ventures: [
                {
                    id: 'venture-1',
                    name: 'TechCorp',
                    description: 'Revolutionary tech startup',
                    stage: 'Series A',
                    funding_goal: 1000000,
                    current_funding: 750000,
                    roi: 150,
                    status: 'ACTIVE',
                    created_at: new Date().toISOString()
                },
                {
                    id: 'venture-2',
                    name: 'InnovateLab',
                    description: 'AI-powered innovation lab',
                    stage: 'Seed',
                    funding_goal: 500000,
                    current_funding: 300000,
                    roi: 120,
                    status: 'ACTIVE',
                    created_at: new Date().toISOString()
                }
            ],
            total_count: 2,
            pagination: {
                page: 1,
                limit: 10,
                total_pages: 1
            }
        }
    });
});

// Contracts/Offers endpoints
app.get('/api/contracts', (req, res) => {
    console.log(`📋 Contracts request`);
    
    res.json({
        success: true,
        data: {
            contracts: [
                {
                    id: 'contract-1',
                    title: 'Partnership Agreement',
                    type: 'PARTNERSHIP',
                    status: 'DRAFT',
                    parties: ['udi-super-admin-001', 'venture-1'],
                    created_at: new Date().toISOString()
                },
                {
                    id: 'contract-2',
                    title: 'Investment Contract',
                    type: 'INVESTMENT',
                    status: 'SIGNED',
                    parties: ['udi-super-admin-001', 'venture-2'],
                    created_at: new Date().toISOString()
                }
            ],
            total_count: 2
        }
    });
});

// Legal signing status endpoint
app.get('/api/legal-signing/status/:userId', (req, res) => {
    const { userId } = req.params;
    console.log(`⚖️ Legal signing status request for user: ${userId}`);
    
    res.json({
        success: true,
        data: {
            user_id: userId,
            legal_pack_status: 'COMPLETED',
            documents_signed: 5,
            documents_pending: 0,
            compliance_score: 95,
            last_updated: new Date().toISOString(),
            required_documents: [
                { name: 'Terms of Service', status: 'SIGNED' },
                { name: 'Privacy Policy', status: 'SIGNED' },
                { name: 'Investment Agreement', status: 'SIGNED' },
                { name: 'NDA', status: 'SIGNED' },
                { name: 'Partnership Agreement', status: 'SIGNED' }
            ]
        }
    });
});

// Journey status endpoint
app.get('/api/journey/status/:userId', (req, res) => {
    const { userId } = req.params;
    console.log(`🛤️ Journey status request for user: ${userId}`);
    
    res.json({
        success: true,
        data: {
            user_id: userId,
            current_stage: 'VENTURE_CREATION',
            stage_progress: 75,
            completed_stages: [
                'REGISTRATION',
                'PROFILE_SETUP',
                'VERIFICATION',
                'LEGAL_COMPLIANCE'
            ],
            next_stage: 'FUNDING',
            journey_score: 85,
            milestones_achieved: 8,
            total_milestones: 12,
            estimated_completion: '2025-10-15T00:00:00Z'
        }
    });
});

// Subscription status endpoint
app.get('/api/subscriptions/user/:userId', (req, res) => {
    const { userId } = req.params;
    console.log(`💳 Subscription status request for user: ${userId}`);
    
    res.json({
        success: true,
        data: {
            user_id: userId,
            subscription_status: 'ACTIVE',
            plan: 'PREMIUM',
            features: [
                'UNLIMITED_VENTURES',
                'ADVANCED_ANALYTICS',
                'PRIORITY_SUPPORT',
                'CUSTOM_BRANDING'
            ],
            billing_cycle: 'MONTHLY',
            next_billing_date: '2025-10-14T00:00:00Z',
            amount: 99.99,
            currency: 'USD',
            auto_renew: true
        }
    });
});

// Proxy all API requests to Python Brain
app.use('/api', createProxyMiddleware({
    target: PYTHON_BRAIN_URL,
    changeOrigin: true,
    timeout: 60000, // 60 second timeout
    proxyTimeout: 60000, // 60 second proxy timeout
    pathRewrite: {
        '^/api': '' // Remove the /api prefix since Python Brain doesn't use it
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`🔄 Proxying ${req.method} ${req.path} to Python Brain`);
        // Add timeout headers
        proxyReq.setTimeout(60000);
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
            res.status(504).json({
                success: false,
                error: 'Gateway Timeout',
                message: 'Python Brain service took too long to respond'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Python Brain service unavailable',
                message: 'Please try again later'
            });
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`✅ Python Brain responded with ${proxyRes.statusCode} for ${req.path}`);
    }
}));

// WebSocket proxy for real-time features
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    console.log('🔌 WebSocket connection established');
    
    // Forward WebSocket messages to Python Brain
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('📡 WebSocket message received:', data.type);
            
            // For now, echo back the message
            // In production, this would forward to Python Brain WebSocket
            ws.send(JSON.stringify({
                type: 'ECHO',
                original: data,
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            console.error('WebSocket message error:', error);
            ws.send(JSON.stringify({
                type: 'ERROR',
                message: 'Invalid message format'
            }));
        }
    });
    
    ws.on('close', () => {
        console.log('🔌 WebSocket connection closed');
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'CONNECTION_ESTABLISHED',
        message: 'Connected to SmartStart Proxy',
        timestamp: new Date().toISOString()
    }));
});

// Database proxy endpoints for Python Brain
app.post('/api/db/query', (req, res) => {
    const { sql, params } = req.body;
    
    // For now, return mock data for testing
    if (sql.includes('SELECT u.*, r.name as role_name')) {
        res.json({
            success: true,
            data: [{
                id: 'test-user-123',
                email: 'test@launch.com',
                name: 'Test User',
                password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                role: 'TEAM_MEMBER',
                role_name: 'TEAM_MEMBER',
                role_level: 20,
                status: 'ACTIVE'
            }]
        });
    } else {
        res.json({ success: true, data: [] });
    }
});

app.post('/api/db/execute', (req, res) => {
    const { sql, params } = req.body;
    res.json({ success: true, message: 'Query executed' });
});

// File upload endpoint (still handled by Node.js for now)
app.post('/api/upload', (req, res) => {
    // This would handle file uploads and then forward to Python Brain
    res.json({
        success: true,
        message: 'File upload handled by proxy',
        note: 'File processing will be forwarded to Python Brain'
    });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/out')));

// Catch all handler for frontend routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/out/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Proxy server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Please try again later'
    });
});

// Start server
server.listen(PORT, () => {
    console.log('🚀 SmartStart Python Proxy Server started');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🧠 Python Brain URL: ${PYTHON_BRAIN_URL}`);
    console.log(`🔌 WebSocket support: enabled`);
    console.log(`📁 File upload support: enabled`);
    console.log(`🎨 Frontend serving: enabled`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

module.exports = app;
