/**
 * SmartStart Python Gateway
 * Routes all business logic to Python Brain while keeping Node.js as lightweight API gateway
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authenticateToken } = require('./middleware/auth');
const router = express.Router();

// Python Brain configuration
const PYTHON_BRAIN_URL = process.env.PYTHON_BRAIN_URL || 'http://localhost:5000';

// Create proxy middleware for Python Brain
const pythonBrainProxy = createProxyMiddleware({
    target: PYTHON_BRAIN_URL,
    changeOrigin: true,
    timeout: 30000,
    onError: (err, req, res) => {
        console.error('Python Brain Proxy Error:', err);
        res.status(503).json({
            success: false,
            message: 'Python Brain service unavailable',
            error: err.message
        });
    },
    onProxyReq: (proxyReq, req, res) => {
        // Forward authentication headers
        if (req.headers.authorization) {
            proxyReq.setHeader('authorization', req.headers.authorization);
        }
        
        // Add request metadata
        proxyReq.setHeader('x-nodejs-gateway', 'true');
        proxyReq.setHeader('x-request-id', req.id || Date.now());
        
        console.log(`🔄 Proxying ${req.method} ${req.path} to Python Brain`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`✅ Python Brain response: ${proxyRes.statusCode} for ${req.path}`);
    }
});

// ===== PYTHON BRAIN ROUTES =====

// Main brain processing endpoint
router.post('/process', authenticateToken, pythonBrainProxy);

// User analytics and behavior analysis
router.get('/analyze/user/:userId', authenticateToken, pythonBrainProxy);
router.post('/analyze/user', authenticateToken, pythonBrainProxy);

// Venture analysis and predictions
router.get('/analyze/venture/:ventureId', authenticateToken, pythonBrainProxy);
router.post('/analyze/venture', authenticateToken, pythonBrainProxy);

// Legal document processing
router.post('/process/legal', authenticateToken, pythonBrainProxy);
router.get('/legal/analysis/:entityId', authenticateToken, pythonBrainProxy);

// ML predictions and recommendations
router.post('/predict', authenticateToken, pythonBrainProxy);
router.get('/recommendations/:userId', authenticateToken, pythonBrainProxy);

// Analytics and insights
router.post('/analytics', authenticateToken, pythonBrainProxy);
router.get('/analytics/platform', authenticateToken, pythonBrainProxy);
router.get('/analytics/user/:userId', authenticateToken, pythonBrainProxy);

// Opportunity matching
router.post('/match/opportunities', authenticateToken, pythonBrainProxy);
router.get('/opportunities/matches/:userId', authenticateToken, pythonBrainProxy);

// Network analysis
router.post('/analyze/network', authenticateToken, pythonBrainProxy);
router.get('/network/analysis/:userId', authenticateToken, pythonBrainProxy);

// Dashboard data
router.get('/dashboard/:userId', authenticateToken, pythonBrainProxy);

// Gamification analysis
router.post('/gamification/analyze', authenticateToken, pythonBrainProxy);
router.get('/gamification/leaderboard', authenticateToken, pythonBrainProxy);

// BUZ token analysis
router.post('/buz/analyze', authenticateToken, pythonBrainProxy);
router.get('/buz/predictions/:userId', authenticateToken, pythonBrainProxy);

// Umbrella relationship analysis
router.post('/umbrella/analyze', authenticateToken, pythonBrainProxy);
router.get('/umbrella/network/:userId', authenticateToken, pythonBrainProxy);

// Team collaboration analysis
router.post('/team/analyze', authenticateToken, pythonBrainProxy);
router.get('/team/efficiency/:teamId', authenticateToken, pythonBrainProxy);

// ===== NODE.JS ONLY ROUTES (Keep lightweight) =====

// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'python-gateway',
        timestamp: new Date().toISOString(),
        python_brain_url: PYTHON_BRAIN_URL,
        version: '1.0.0'
    });
});

// Python Brain connectivity test
router.get('/test-python', async (req, res) => {
    try {
        const fetch = require('node-fetch');
        const response = await fetch(`${PYTHON_BRAIN_URL}/health`, {
            timeout: 5000
        });
        
        if (response.ok) {
            const data = await response.json();
            res.json({
                success: true,
                message: 'Python Brain is accessible',
                python_brain_status: data,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(503).json({
                success: false,
                message: 'Python Brain is not responding properly',
                status: response.status,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'Cannot connect to Python Brain',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ===== LEGACY API COMPATIBILITY =====

// Route legacy API calls to Python Brain with transformation
router.use('/legacy/*', authenticateToken, (req, res, next) => {
    // Transform legacy API calls to Python Brain format
    const transformedReq = {
        ...req,
        url: req.url.replace('/legacy', ''),
        headers: {
            ...req.headers,
            'x-legacy-api': 'true'
        }
    };
    
    // Use Python Brain proxy
    pythonBrainProxy(transformedReq, res, next);
});

// ===== ERROR HANDLING =====

// Handle Python Brain connection errors
router.use((err, req, res, next) => {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        res.status(503).json({
            success: false,
            message: 'Python Brain service is not available',
            error: 'Service unavailable',
            timestamp: new Date().toISOString()
        });
    } else {
        next(err);
    }
});

// 404 handler for unmatched routes
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found in Python Gateway',
        available_routes: [
            'POST /process',
            'GET /analyze/user/:userId',
            'GET /analyze/venture/:ventureId',
            'POST /process/legal',
            'POST /predict',
            'GET /recommendations/:userId',
            'POST /analytics',
            'GET /analytics/platform',
            'POST /match/opportunities',
            'POST /analyze/network',
            'GET /dashboard/:userId'
        ],
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
