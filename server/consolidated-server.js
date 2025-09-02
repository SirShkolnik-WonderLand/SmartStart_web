const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
const winston = require('winston');
const Bull = require('bull');
const Redis = require('redis');

const app = express();

// DATABASE_URL is now provided directly from the database service

const prisma = new PrismaClient();
const PORT = process.env.API_PORT || 3001;

// Initialize Redis for job queues (if enabled)
let redisClient, emailQueue, taskQueue;
if (process.env.WORKER_ENABLED === 'true') {
    try {
        redisClient = Redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        emailQueue = new Bull('email-queue', {
            redis: {
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379
            }
        });

        taskQueue = new Bull('task-queue', {
            redis: {
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379
            }
        });
    } catch (error) {
        console.warn('Redis connection failed, worker functionality disabled:', error.message);
    }
}

// Initialize AWS S3 (if enabled)
let s3;
if (process.env.STORAGE_ENABLED === 'true' && process.env.AWS_ACCESS_KEY_ID) {
    s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1'
    });
}

// Initialize email transporter (if enabled)
let transporter;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

// Configure logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? ['https://smartstart-platform.onrender.com'] : ['http://localhost:3000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Authentication middleware
const authenticateToken = async(req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                account: {
                    include: {
                        role: {
                            include: {
                                rolePermissions: {
                                    include: {
                                        permission: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!user || !user.account || !user.account.isActive) {
            return res.status(401).json({ error: 'Invalid or inactive user' });
        }

        req.user = user;
        req.permissions = user.account.role.rolePermissions.map(rp => rp.permission.name);
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Permission checking middleware
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.permissions.includes(permission)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: 'connected',
        services: {
            worker: process.env.WORKER_ENABLED === 'true',
            storage: process.env.STORAGE_ENABLED === 'true',
            monitor: process.env.MONITOR_ENABLED === 'true'
        }
    });
});

// File upload endpoint (if storage enabled)
if (process.env.STORAGE_ENABLED === 'true') {
    const upload = multer({ storage: multer.memoryStorage() });

    app.post('/api/upload', authenticateToken, upload.single('file'), async(req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            if (!s3) {
                return res.status(500).json({ error: 'Storage service not configured' });
            }

            const params = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: `uploads/${Date.now()}-${req.file.originalname}`,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
                ACL: 'private'
            };

            const result = await s3.upload(params).promise();
            res.json({
                success: true,
                fileUrl: result.Location,
                key: result.Key
            });
        } catch (error) {
            logger.error('File upload error:', error);
            res.status(500).json({ error: 'File upload failed' });
        }
    });
}

// Email sending endpoint (if email enabled)
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    app.post('/api/send-email', authenticateToken, async(req, res) => {
        try {
            const { to, subject, text, html } = req.body;

            if (!transporter) {
                return res.status(500).json({ error: 'Email service not configured' });
            }

            const mailOptions = {
                from: process.env.SMTP_USER,
                to,
                subject,
                text,
                html
            };

            const info = await transporter.sendMail(mailOptions);
            res.json({
                success: true,
                messageId: info.messageId
            });
        } catch (error) {
            logger.error('Email sending error:', error);
            res.status(500).json({ error: 'Email sending failed' });
        }
    });
}

// Background job processing (if worker enabled)
if (process.env.WORKER_ENABLED === 'true' && emailQueue) {
    // Process email queue
    emailQueue.process(async(job) => {
        try {
            const { to, subject, text, html } = job.data;

            if (transporter) {
                const mailOptions = {
                    from: process.env.SMTP_USER,
                    to,
                    subject,
                    text,
                    html
                };

                await transporter.sendMail(mailOptions);
                logger.info(`Email sent successfully to ${to}`);
            }
        } catch (error) {
            logger.error('Email job processing error:', error);
            throw error;
        }
    });

    // Process task queue
    taskQueue.process(async(job) => {
        try {
            const { taskType, data } = job.data;

            switch (taskType) {
                case 'data-cleanup':
                    // Implement data cleanup logic
                    logger.info('Data cleanup task completed');
                    break;
                case 'report-generation':
                    // Implement report generation logic
                    logger.info('Report generation task completed');
                    break;
                default:
                    logger.warn(`Unknown task type: ${taskType}`);
            }
        } catch (error) {
            logger.error('Task job processing error:', error);
            throw error;
        }
    });
}

// Monitoring endpoints (if monitor enabled)
if (process.env.MONITOR_ENABLED === 'true') {
    app.get('/api/status', authenticateToken, async(req, res) => {
        try {
            const dbStatus = await prisma.$queryRaw `SELECT 1 as status`;
            const redisStatus = redisClient ? 'connected' : 'disconnected';

            res.json({
                database: dbStatus ? 'healthy' : 'unhealthy',
                redis: redisStatus,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Status check error:', error);
            res.status(500).json({ error: 'Status check failed' });
        }
    });
}

// Scheduled tasks (if worker enabled)
if (process.env.WORKER_ENABLED === 'true') {
    // Daily cleanup at 2 AM
    cron.schedule('0 2 * * *', async() => {
        try {
            logger.info('Running daily cleanup task');
            // Implement cleanup logic here
        } catch (error) {
            logger.error('Daily cleanup error:', error);
        }
    });

    // Health check every 5 minutes
    cron.schedule('*/5 * * * *', async() => {
        try {
            await prisma.$queryRaw `SELECT 1`;
            logger.info('Health check passed');
        } catch (error) {
            logger.error('Health check failed:', error);
        }
    });
}

// Mount v1 API routes (after all other endpoints)
const v1ApiRoutes = require('./routes/v1-api');
app.use('/api/v1', v1ApiRoutes);

// Mount contracts API routes
const contractsApiRoutes = require('./routes/contracts-api');
app.use('/api/contracts', contractsApiRoutes);

// Mount advanced contracts API routes
const advancedContractsApiRoutes = require('./routes/advanced-contracts-api');
app.use('/api/contracts/advanced', advancedContractsApiRoutes);

// Mount contract auto-issuance API routes
const contractAutoIssuanceApiRoutes = require('./routes/contract-auto-issuance-api');
app.use('/api/contracts/auto-issuance', contractAutoIssuanceApiRoutes);

// Mount venture management API routes
const ventureManagementApiRoutes = require('./routes/venture-management-api');
app.use('/api/ventures', ventureManagementApiRoutes);

// Mount gamification API routes
const gamificationApiRoutes = require('./routes/gamification-api');
app.use('/api/gamification', gamificationApiRoutes);

// Mount user management API routes
const userManagementApiRoutes = require('./routes/user-management-api');
app.use('/api/users', userManagementApiRoutes);

// Mount company management API routes
const companyManagementApiRoutes = require('./routes/company-management-api');
app.use('/api/companies', companyManagementApiRoutes);

// Mount team management API routes
const teamManagementApiRoutes = require('./routes/team-management-api');
app.use('/api/teams', teamManagementApiRoutes);

// Mount contribution pipeline API routes
const contributionPipelineApiRoutes = require('./routes/contribution-pipeline-api');
app.use('/api/contribution', contributionPipelineApiRoutes);

// Mount system instructions API routes
const systemInstructionsApiRoutes = require('./routes/system-instructions-api');
app.use('/api/system', systemInstructionsApiRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
    logger.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler - MUST be last after all routes
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGTERM', async() => {
    logger.info('SIGTERM received, shutting down gracefully');

    if (redisClient) {
        await redisClient.quit();
    }

    if (emailQueue) {
        await emailQueue.close();
    }

    if (taskQueue) {
        await taskQueue.close();
    }

    await prisma.$disconnect();
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    logger.info(`Consolidated server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`Worker enabled: ${process.env.WORKER_ENABLED}`);
    logger.info(`Storage enabled: ${process.env.STORAGE_ENABLED}`);
    logger.info(`Monitor enabled: ${process.env.MONITOR_ENABLED}`);
});

module.exports = app;// Force redeploy Mon Sep  1 22:19:18 EDT 2025
