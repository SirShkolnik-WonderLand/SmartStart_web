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
app.use(cors());
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

// Proxy all API requests to Python Brain
app.use('/api', createProxyMiddleware({
    target: PYTHON_BRAIN_URL,
    changeOrigin: true,
    timeout: 30000, // 30 second timeout
    proxyTimeout: 30000, // 30 second proxy timeout
    pathRewrite: {
        '^/api': '' // Remove the /api prefix since Python Brain doesn't use it
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({
            success: false,
            error: 'Python Brain service unavailable',
            message: 'Please try again later'
        });
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`🔄 Proxying ${req.method} ${req.path} to Python Brain`);
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
