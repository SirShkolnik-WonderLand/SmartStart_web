const { PrismaClient } = require('@prisma/client');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const winston = require('winston');
const axios = require('axios');

const prisma = new PrismaClient();

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'worker.log' })
  ]
});

// Email transporter
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Quarterly Equity Rebalancing Job
const runQuarterlyRebalancing = async () => {
  logger.info('Starting quarterly equity rebalancing...');
  
  try {
    // Get all active ventures
    const ventures = await prisma.project.findMany({
      where: { deletedAt: null },
      include: {
        capEntries: {
          where: { holderType: 'USER' }
        },
        members: {
          include: {
            user: true
          }
        }
      }
    });

    for (const venture of ventures) {
      logger.info(`Processing venture: ${venture.name}`);
      
      // Calculate contribution scores for the quarter
      const contributions = await prisma.contribution.findMany({
        where: {
          task: {
            projectId: venture.id
          },
          status: 'APPROVED',
          acceptedAt: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
          }
        },
        include: {
          contributor: true,
          task: true
        }
      });

      // Group contributions by user
      const userContributions = {};
      contributions.forEach(contribution => {
        const userId = contribution.contributorId;
        if (!userContributions[userId]) {
          userContributions[userId] = [];
        }
        userContributions[userId].push(contribution);
      });

      // Calculate contribution scores
      const userScores = {};
      Object.entries(userContributions).forEach(([userId, contribs]) => {
        const totalScore = contribs.reduce((sum, contrib) => {
          return sum + (contrib.effort * contrib.impact * contrib.quality);
        }, 0);
        userScores[userId] = totalScore;
      });

      // Find median score
      const scores = Object.values(userScores).sort((a, b) => a - b);
      const medianScore = scores[Math.floor(scores.length / 2)] || 0;

      // Calculate equity adjustments (max ±2% per quarter)
      const adjustments = {};
      Object.entries(userScores).forEach(([userId, score]) => {
        const currentEquity = venture.capEntries.find(entry => 
          entry.holderId === userId
        )?.pct || 0;

        const scoreDiff = score - medianScore;
        const totalDiff = Object.values(userScores).reduce((sum, s) => 
          sum + Math.abs(s - medianScore), 0
        );

        if (totalDiff > 0) {
          const adjustment = (scoreDiff / totalDiff) * 2; // Max 2% adjustment
          adjustments[userId] = Math.max(-2, Math.min(2, adjustment));
        }
      });

      // Apply adjustments
      for (const [userId, adjustment] of Object.entries(adjustments)) {
        if (Math.abs(adjustment) > 0.1) { // Only adjust if change > 0.1%
          await prisma.capTableEntry.updateMany({
            where: {
              projectId: venture.id,
              holderId: userId,
              holderType: 'USER'
            },
            data: {
              pct: {
                increment: adjustment
              }
            }
          });

          logger.info(`Adjusted equity for user ${userId} in venture ${venture.name}: ${adjustment}%`);
        }
      }
    }

    logger.info('Quarterly equity rebalancing completed successfully');
  } catch (error) {
    logger.error('Quarterly rebalancing failed:', error);
  }
};

// Dunning Job (Payment Collection)
const runDunningProcess = async () => {
  logger.info('Starting dunning process...');
  
  try {
    // Find ventures with overdue payments
    const overdueVentures = await prisma.project.findMany({
      where: {
        deletedAt: null,
        // Add payment status logic here
      },
      include: {
        owner: true
      }
    });

    for (const venture of overdueVentures) {
      logger.info(`Processing dunning for venture: ${venture.name}`);
      
      // Send dunning emails
      const transporter = createEmailTransporter();
      
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: venture.owner.email,
        subject: 'Payment Overdue - SmartStart Platform',
        html: `
          <h2>Payment Overdue</h2>
          <p>Dear ${venture.owner.name},</p>
          <p>Your payment for venture "${venture.name}" is overdue. Please update your payment method to avoid service suspension.</p>
          <p>Best regards,<br>SmartStart Team</p>
        `
      });

      logger.info(`Dunning email sent for venture: ${venture.name}`);
    }

    logger.info('Dunning process completed');
  } catch (error) {
    logger.error('Dunning process failed:', error);
  }
};

// IT Pack Provisioning Job
const provisionITPack = async (ventureId) => {
  logger.info(`Provisioning IT pack for venture: ${ventureId}`);
  
  try {
    // Create M365 tenant (placeholder)
    const m365TenantId = `tenant_${ventureId}_${Date.now()}`;
    
    // Create GitHub organization (placeholder)
    const githubOrg = `smartstart-${ventureId}`;
    
    // Create Render service (placeholder)
    const renderServiceId = `service_${ventureId}`;
    
    // Update venture with IT pack info
    await prisma.project.update({
      where: { id: ventureId },
      data: {
        // Add IT pack fields here
      }
    });

    logger.info(`IT pack provisioned for venture: ${ventureId}`);
  } catch (error) {
    logger.error(`IT pack provisioning failed for venture ${ventureId}:`, error);
  }
};

// Contract Generation Job
const generateContracts = async (ventureId) => {
  logger.info(`Generating contracts for venture: ${ventureId}`);
  
  try {
    const venture = await prisma.project.findUnique({
      where: { id: ventureId },
      include: {
        owner: true,
        members: {
          include: {
            user: true
          }
        }
      }
    });

    // Generate Founder Agreement
    const founderContract = {
      ventureId,
      type: 'FOUNDER_AGREEMENT',
      content: `Founder Agreement for ${venture.name}`,
      signers: [{ userId: venture.ownerId, name: venture.owner.name }]
    };

    // Generate Contributor Agreements
    const contributorContracts = venture.members.map(member => ({
      ventureId,
      type: 'CONTRIBUTOR_AGREEMENT',
      content: `Contributor Agreement for ${member.user.name}`,
      signers: [{ userId: member.userId, name: member.user.name }]
    }));

    // Save contracts to database
    await prisma.contract.createMany({
      data: [founderContract, ...contributorContracts]
    });

    logger.info(`Contracts generated for venture: ${ventureId}`);
  } catch (error) {
    logger.error(`Contract generation failed for venture ${ventureId}:`, error);
  }
};

// Health Check Job
const runHealthChecks = async () => {
  logger.info('Running health checks...');
  
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database health check: OK');

    // Check API server
    try {
      const apiResponse = await axios.get(`${process.env.API_URL || 'http://localhost:3001'}/api/health`);
      logger.info('API server health check: OK');
    } catch (error) {
      logger.error('API server health check: FAILED');
    }

    // Check web service
    try {
      const webResponse = await axios.get(`${process.env.WEB_URL || 'http://localhost:3000'}`);
      logger.info('Web service health check: OK');
    } catch (error) {
      logger.error('Web service health check: FAILED');
    }

    logger.info('Health checks completed');
  } catch (error) {
    logger.error('Health checks failed:', error);
  }
};

// Setup scheduled jobs
const setupScheduledJobs = () => {
  // Quarterly equity rebalancing (1st day of quarter at 2 AM)
  cron.schedule('0 2 1 */3 *', runQuarterlyRebalancing);
  logger.info('Scheduled quarterly equity rebalancing');

  // Daily dunning process (6 AM daily)
  cron.schedule('0 6 * * *', runDunningProcess);
  logger.info('Scheduled daily dunning process');

  // Health checks (every 30 minutes)
  cron.schedule('*/30 * * * *', runHealthChecks);
  logger.info('Scheduled health checks');

  // Weekly contract generation (Mondays at 9 AM)
  cron.schedule('0 9 * * 1', async () => {
    const newVentures = await prisma.project.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    for (const venture of newVentures) {
      await generateContracts(venture.id);
    }
  });
  logger.info('Scheduled weekly contract generation');
};

// Start worker
const startWorker = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    // Setup scheduled jobs
    setupScheduledJobs();
    logger.info('✅ Scheduled jobs configured');

    // Run initial health check
    await runHealthChecks();

    logger.info('🚀 Background worker started successfully');
    logger.info('📊 Environment:', process.env.NODE_ENV);
  } catch (error) {
    logger.error('❌ Failed to start worker:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('🛑 Shutting down worker gracefully...');
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

startWorker();
