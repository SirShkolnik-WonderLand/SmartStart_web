const express = require('express');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const winston = require('winston');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.MONITOR_PORT || 3003;

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'monitor.log' })
  ]
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://smartstart-platform.onrender.com']
    : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Service URLs
const SERVICES = {
  api: process.env.API_URL || 'http://localhost:3001',
  web: process.env.WEB_URL || 'http://localhost:3000',
  worker: process.env.WORKER_URL || 'http://localhost:3001', // Worker doesn't have HTTP endpoint
  storage: process.env.STORAGE_URL || 'http://localhost:3002'
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    service: 'monitor'
  });
});

// Comprehensive system health check
app.get('/api/health', async (req, res) => {
  const healthReport = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services: {},
    database: {},
    overall: 'healthy'
  };

  try {
    // Check database
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;
    
    healthReport.database = {
      status: 'healthy',
      latency: `${dbLatency}ms`,
      connection: 'active'
    };
  } catch (error) {
    healthReport.database = {
      status: 'unhealthy',
      error: error.message,
      connection: 'failed'
    };
    healthReport.overall = 'unhealthy';
  }

  // Check API service
  try {
    const apiStart = Date.now();
    const apiResponse = await axios.get(`${SERVICES.api}/api/health`, { timeout: 5000 });
    const apiLatency = Date.now() - apiStart;
    
    healthReport.services.api = {
      status: 'healthy',
      latency: `${apiLatency}ms`,
      response: apiResponse.data
    };
  } catch (error) {
    healthReport.services.api = {
      status: 'unhealthy',
      error: error.message,
      latency: 'timeout'
    };
    healthReport.overall = 'unhealthy';
  }

  // Check web service
  try {
    const webStart = Date.now();
    const webResponse = await axios.get(SERVICES.web, { timeout: 5000 });
    const webLatency = Date.now() - webStart;
    
    healthReport.services.web = {
      status: 'healthy',
      latency: `${webLatency}ms`,
      statusCode: webResponse.status
    };
  } catch (error) {
    healthReport.services.web = {
      status: 'unhealthy',
      error: error.message,
      statusCode: error.response?.status || 'timeout'
    };
    healthReport.overall = 'unhealthy';
  }

  // Check storage service
  try {
    const storageStart = Date.now();
    const storageResponse = await axios.get(`${SERVICES.storage}/health`, { timeout: 5000 });
    const storageLatency = Date.now() - storageStart;
    
    healthReport.services.storage = {
      status: 'healthy',
      latency: `${storageLatency}ms`,
      response: storageResponse.data
    };
  } catch (error) {
    healthReport.services.storage = {
      status: 'unhealthy',
      error: error.message,
      latency: 'timeout'
    };
    healthReport.overall = 'unhealthy';
  }

  // Check worker (indirectly through database)
  try {
    const workerCheck = await prisma.$queryRaw`
      SELECT COUNT(*) as job_count 
      FROM "SystemSetting" 
      WHERE category = 'worker' AND key = 'last_job_run'
    `;
    
    healthReport.services.worker = {
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      jobCount: workerCheck[0]?.job_count || 0
    };
  } catch (error) {
    healthReport.services.worker = {
      status: 'unhealthy',
      error: error.message
    };
    healthReport.overall = 'unhealthy';
  }

  const statusCode = healthReport.overall === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthReport);
});

// System metrics endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      users: {},
      projects: {},
      transactions: {},
      system: {}
    };

    // User metrics
    const userStats = await prisma.user.groupBy({
      by: ['level'],
      _count: {
        id: true
      }
    });

    metrics.users.total = await prisma.user.count();
    metrics.users.byLevel = userStats.reduce((acc, stat) => {
      acc[stat.level] = stat._count.id;
      return acc;
    }, {});

    // Project metrics
    metrics.projects.total = await prisma.project.count({
      where: { deletedAt: null }
    });
    metrics.projects.active = await prisma.project.count({
      where: { 
        deletedAt: null,
        status: 'ACTIVE'
      }
    });

    // Transaction metrics
    metrics.transactions.total = await prisma.transaction.count();
    metrics.transactions.pending = await prisma.transaction.count({
      where: { status: 'PENDING' }
    });
    metrics.transactions.completed = await prisma.transaction.count({
      where: { status: 'COMPLETED' }
    });

    // System metrics
    metrics.system.documents = await prisma.legalDocument.count();
    metrics.system.tasks = await prisma.task.count();
    metrics.system.contributions = await prisma.contribution.count();

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    logger.error('Metrics collection error:', error);
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
});

// Performance monitoring endpoint
app.get('/api/performance', async (req, res) => {
  try {
    const performance = {
      timestamp: new Date().toISOString(),
      database: {},
      services: {}
    };

    // Database performance
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    performance.database.latency = Date.now() - dbStart;

    // Service performance checks
    const serviceChecks = await Promise.allSettled([
      axios.get(`${SERVICES.api}/api/health`, { timeout: 5000 }),
      axios.get(SERVICES.web, { timeout: 5000 }),
      axios.get(`${SERVICES.storage}/health`, { timeout: 5000 })
    ]);

    performance.services.api = {
      latency: serviceChecks[0].status === 'fulfilled' ? 
        Date.now() - (serviceChecks[0].value.config.metadata?.startTime || Date.now()) : 'timeout',
      status: serviceChecks[0].status
    };

    performance.services.web = {
      latency: serviceChecks[1].status === 'fulfilled' ? 
        Date.now() - (serviceChecks[1].value.config.metadata?.startTime || Date.now()) : 'timeout',
      status: serviceChecks[1].status
    };

    performance.services.storage = {
      latency: serviceChecks[2].status === 'fulfilled' ? 
        Date.now() - (serviceChecks[2].value.config.metadata?.startTime || Date.now()) : 'timeout',
      status: serviceChecks[2].status
    };

    res.json({
      success: true,
      performance
    });
  } catch (error) {
    logger.error('Performance monitoring error:', error);
    res.status(500).json({ error: 'Failed to collect performance data' });
  }
});

// Error logs endpoint
app.get('/api/logs', async (req, res) => {
  try {
    const { level = 'error', limit = 100 } = req.query;
    
    // In a real implementation, you'd query your logging system
    // For now, we'll return a placeholder
    const logs = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Monitor service started',
        service: 'monitor'
      }
    ];

    res.json({
      success: true,
      logs: logs.slice(0, parseInt(limit))
    });
  } catch (error) {
    logger.error('Log retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
});

// System status dashboard endpoint
app.get('/api/status', async (req, res) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV,
      services: {},
      alerts: []
    };

    // Check each service
    const serviceChecks = await Promise.allSettled([
      axios.get(`${SERVICES.api}/api/health`, { timeout: 3000 }),
      axios.get(SERVICES.web, { timeout: 3000 }),
      axios.get(`${SERVICES.storage}/health`, { timeout: 3000 })
    ]);

    // API service status
    if (serviceChecks[0].status === 'fulfilled') {
      status.services.api = {
        status: 'online',
        responseTime: 'fast',
        lastCheck: new Date().toISOString()
      };
    } else {
      status.services.api = {
        status: 'offline',
        error: serviceChecks[0].reason?.message || 'Unknown error',
        lastCheck: new Date().toISOString()
      };
      status.alerts.push('API service is offline');
    }

    // Web service status
    if (serviceChecks[1].status === 'fulfilled') {
      status.services.web = {
        status: 'online',
        responseTime: 'fast',
        lastCheck: new Date().toISOString()
      };
    } else {
      status.services.web = {
        status: 'offline',
        error: serviceChecks[1].reason?.message || 'Unknown error',
        lastCheck: new Date().toISOString()
      };
      status.alerts.push('Web service is offline');
    }

    // Storage service status
    if (serviceChecks[2].status === 'fulfilled') {
      status.services.storage = {
        status: 'online',
        responseTime: 'fast',
        lastCheck: new Date().toISOString()
      };
    } else {
      status.services.storage = {
        status: 'offline',
        error: serviceChecks[2].reason?.message || 'Unknown error',
        lastCheck: new Date().toISOString()
      };
      status.alerts.push('Storage service is offline');
    }

    // Database status
    try {
      await prisma.$queryRaw`SELECT 1`;
      status.services.database = {
        status: 'online',
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      status.services.database = {
        status: 'offline',
        error: error.message,
        lastCheck: new Date().toISOString()
      };
      status.alerts.push('Database is offline');
    }

    res.json({
      success: true,
      status
    });
  } catch (error) {
    logger.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check system status' });
  }
});

// Alert endpoint for receiving alerts from other services
app.post('/api/alerts', (req, res) => {
  try {
    const { service, level, message, data } = req.body;
    
    logger.log(level || 'info', `Alert from ${service}: ${message}`, { data });
    
    res.json({
      success: true,
      message: 'Alert received and logged'
    });
  } catch (error) {
    logger.error('Alert processing error:', error);
    res.status(500).json({ error: 'Failed to process alert' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Monitor service error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    app.listen(PORT, () => {
      logger.info(`🚀 Monitor Service running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`📈 Status dashboard: http://localhost:${PORT}/api/status`);
    });
  } catch (error) {
    logger.error('❌ Failed to start monitor service:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('🛑 Shutting down monitor service gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
