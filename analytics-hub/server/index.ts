/**
 * ANALYTICS HUB - MAIN SERVER
 * Express + Socket.IO for real-time analytics
 */

import 'dotenv/config';
import express, { type Express, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import { testConnection, closeDatabase } from './config/database.js';
import { corsMiddleware } from './middleware/cors.middleware.js';
import { requestLogger, errorLogger } from './middleware/logger.middleware.js';
import { generalLimiter, trackingLimiter, authLimiter } from './middleware/rate-limit.middleware.js';
import analyticsRoutes from './routes/analytics.routes.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import { getActiveVisitors } from './services/eventTracker.js';

// Environment configuration
const PORT = parseInt(process.env.PORT || '4000');
const HOST = process.env.HOST || 'localhost';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Create Express app
const app: Express = express();

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server for real-time updates
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Temporarily disable CSP to fix script loading
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false, // Allow cross-origin resource access
  })
);

// CORS
app.use(corsMiddleware);

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Request logging
app.use(requestLogger);

// ============================================================================
// API ROUTES
// ============================================================================

// Health check (no rate limiting)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Temporary migration endpoint (no auth required)
app.post('/migrate', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Running database migrations...');
    
    // Read the minimal schema file
    const fs = await import('fs');
    const path = await import('path');
    const schemaPath = path.join(process.cwd(), 'complete-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    const { pool } = await import('./config/database.js');
    await pool.query(schemaSQL);
    
    console.log('✅ Database migrations completed successfully');
    return res.status(200).json({
      success: true,
      message: 'Database migrations completed successfully'
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Migration failed',
      details: (error as Error).message
    });
  }
});

// Temporary admin user creation endpoint (no auth required)
app.post('/create-admin', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Creating admin user...');
    
    const { pool } = await import('./config/database.js');
    const result = await pool.query(`
      INSERT INTO admin_users (email, password_hash, role) 
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE SET password_hash = $2
      RETURNING id, email, role
    `, ['udi.shkolnik@alicesolutionsgroup.com', '$2b$10$w41ghnIB.yE./lMW13BOIuGFDjpJl/qBYQdv7gsyzJ5/x.DpKMcEG', 'admin']);
    
    console.log('✅ Admin user created/updated successfully');
    return res.status(200).json({
      success: true,
      message: 'Admin user created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Admin user creation failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Admin user creation failed',
      details: (error as Error).message
    });
  }
});

// Database connection test endpoint
app.get('/db-test', async (req: Request, res: Response) => {
  try {
    const { testConnection, checkHealth } = await import('./config/database.js');
    const isConnected = await testConnection();
    const health = await checkHealth();
    
    return res.status(200).json({
      success: true,
      connected: isConnected,
      health: health,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: (error as Error).message,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    });
  }
});
app.get('/tracker.js', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  // Override security headers for cross-origin script loading
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  // For now, serve the raw TypeScript (in production, use built version)
  res.send(`
    (function(){
      const API_URL = '${IS_PRODUCTION ? process.env.RENDER_EXTERNAL_URL : 'http://localhost:4000'}';
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
      
      if (window.analyticsHubConfig?.autoTrack !== false) {
        track('pageview', {pageUrl: location.href, pageTitle: document.title});
      }
    })();
  `);
});

// Debug route (temporary, no auth required)
app.get('/api/debug', async (req: Request, res: Response) => {
  try {
    const { findUserByEmail } = await import('./services/authService.simple.js');
    const { db } = await import('./config/database.simple.js');
    
    const user = await findUserByEmail('udi.shkolnik@alicesolutionsgroup.com');
    const allUsers = db.read('users');
    
    return res.status(200).json({
      success: true,
      adminUser: user,
      allUsers: allUsers,
      env: {
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? '***' : 'NOT_SET',
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Create admin user endpoint (temporary)
app.post('/api/create-admin', async (req: Request, res: Response) => {
  try {
    const crypto = await import('crypto');
    const { db } = await import('./config/database.simple.js');
    
    const email = process.env.ADMIN_EMAIL || 'udi.shkolnik@alicesolutionsgroup.com';
    const password = process.env.ADMIN_PASSWORD || 'DevPassword123!';
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    
    // Check if user already exists
    const existingUser = db.findOne('users', (u: any) => u.email === email);
    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: 'Admin user already exists',
        user: existingUser,
        hash: hash
      });
    }
    
    // Create new admin user
    const newUser = db.insert('users', {
      email,
      password_hash: hash,
      name: 'Udi Shkolnik',
      role: 'admin',
      active: true,
      canExport: true,
      canEditGoals: true,
      canManageUsers: true,
      loginCount: 0,
    });
    
    return res.status(200).json({
      success: true,
      message: 'Admin user created',
      user: newUser,
      hash: hash
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Analytics routes (public, with tracking rate limit)
app.use('/api/v1', trackingLimiter, analyticsRoutes);

// Auth routes (with auth rate limit) - moved to /api/auth to avoid conflict
app.use('/api/auth', authLimiter, authRoutes);

// Admin routes (protected, with general rate limit)
app.use('/api/admin', generalLimiter, adminRoutes);

// Reports routes (protected)
app.use('/api/admin/reports', generalLimiter, reportsRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Error logger
app.use(errorLogger);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    error: IS_PRODUCTION ? 'Internal server error' : err.message,
    ...(IS_PRODUCTION ? {} : { stack: err.stack }),
  });
});

// ============================================================================
// WEBSOCKET (Real-Time Updates)
// ============================================================================

// Track connected clients
let connectedClients = 0;

io.on('connection', (socket) => {
  connectedClients++;
  console.log(`✅ Client connected (${connectedClients} total)`);

  // Send initial real-time data
  socket.emit('connected', {
    message: 'Connected to Analytics Hub',
    timestamp: new Date().toISOString(),
  });

  // Handle client requests
  socket.on('getRealtimeStats', async () => {
    try {
      const stats = await getActiveVisitors();
      socket.emit('realtimeStats', stats);
    } catch (error) {
      console.error('Error getting realtime stats:', error);
      // Don't crash if database tables don't exist yet
      if ((error as Error).message?.includes('relation') && (error as Error).message?.includes('does not exist')) {
        socket.emit('realtimeStats', {
          activeVisitors: 0,
          activeSessions: 0,
          activePages: [],
        });
        return;
      }
      socket.emit('error', { message: 'Failed to get realtime stats' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    connectedClients--;
    console.log(`❌ Client disconnected (${connectedClients} remaining)`);
  });
});

// Broadcast real-time updates to all connected clients (every 5 seconds)
setInterval(async () => {
  if (connectedClients > 0) {
    try {
      const stats = await getActiveVisitors();
      io.emit('realtimeUpdate', {
        activeVisitors: stats.activeVisitors,
        activeSessions: stats.activeSessions,
        activePages: stats.activePages,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error broadcasting realtime update:', error);
      // Don't crash the server if database tables don't exist yet
      if ((error as Error).message?.includes('relation') && (error as Error).message?.includes('does not exist')) {
        console.log('⚠️  Database tables not created yet. Skipping realtime updates.');
        return;
      }
    }
  }
}, 5000);

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  try {
    console.log('🚀 Starting Analytics Hub Server...\n');

    // Test database connection
    console.log('📊 Testing database connection...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ Database connection failed. Exiting...');
      process.exit(1);
    }

    // Start HTTP server
    httpServer.listen(PORT, HOST, () => {
      console.log('\n✅ Analytics Hub Server Started!\n');
      console.log(`🌐 Server:     http://${HOST}:${PORT}`);
      console.log(`📊 Health:     http://${HOST}:${PORT}/health`);
      console.log(`🔌 WebSocket:  ws://${HOST}:${PORT}`);
      console.log(`📈 API:        http://${HOST}:${PORT}/api/v1`);
      console.log(`🔐 Admin:      http://${HOST}:${PORT}/api/admin`);
      console.log(`\n⚙️  Environment: ${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}\n`);
      console.log('🎯 Ready to track analytics!\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

async function gracefulShutdown(signal: string) {
  console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);

  // Close HTTP server
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
  });

  // Close WebSocket connections
  io.close(() => {
    console.log('✅ WebSocket server closed');
  });

  // Close database connection
  await closeDatabase();

  console.log('✅ Shutdown complete. Goodbye!\n');
  process.exit(0);
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server
startServer();

// Export for testing
export { app, io };
