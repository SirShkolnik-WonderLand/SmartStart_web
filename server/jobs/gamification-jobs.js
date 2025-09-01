const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const GamificationService = require('../services/gamification-service');

const prisma = new PrismaClient();
const gamificationService = new GamificationService();

class GamificationJobs {
  constructor() {
    this.isRunning = false;
  }

  // ===== JOB SCHEDULING =====

  /**
   * Start all scheduled jobs
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Gamification jobs already running');
      return;
    }

    console.log('🚀 Starting gamification background jobs...');

    // Daily maintenance at 2 AM
    this.scheduleDailyMaintenance();
    
    // Badge evaluation every hour
    this.scheduleBadgeEvaluation();
    
    // Conversion window lifecycle every 15 minutes
    this.scheduleConversionWindowLifecycle();
    
    // WORM hash chain maintenance every 5 minutes
    this.scheduleWormMaintenance();

    this.isRunning = true;
    console.log('✅ Gamification jobs started successfully');
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Gamification jobs not running');
      return;
    }

    console.log('🛑 Stopping gamification background jobs...');
    
    // Stop all cron jobs
    cron.getTasks().forEach(task => task.stop());
    
    this.isRunning = false;
    console.log('✅ Gamification jobs stopped successfully');
  }

  // ===== JOB IMPLEMENTATIONS =====

  /**
   * Schedule daily maintenance tasks
   */
  scheduleDailyMaintenance() {
    // Run at 2 AM every day
    cron.schedule('0 2 * * *', async () => {
      console.log('🔄 Running daily gamification maintenance...');
      
      try {
        await this.runDailyMaintenance();
        console.log('✅ Daily maintenance completed successfully');
      } catch (error) {
        console.error('❌ Daily maintenance failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    console.log('📅 Scheduled daily maintenance at 2 AM UTC');
  }

  /**
   * Schedule badge evaluation
   */
  scheduleBadgeEvaluation() {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
      console.log('🏆 Running badge evaluation...');
      
      try {
        await this.runBadgeEvaluation();
        console.log('✅ Badge evaluation completed successfully');
      } catch (error) {
        console.error('❌ Badge evaluation failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    console.log('📅 Scheduled badge evaluation every hour');
  }

  /**
   * Schedule conversion window lifecycle management
   */
  scheduleConversionWindowLifecycle() {
    // Run every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      console.log('🔄 Managing conversion window lifecycle...');
      
      try {
        await this.manageConversionWindows();
        console.log('✅ Conversion window management completed');
      } catch (error) {
        console.error('❌ Conversion window management failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    console.log('📅 Scheduled conversion window management every 15 minutes');
  }

  /**
   * Schedule WORM hash chain maintenance
   */
  scheduleWormMaintenance() {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      console.log('🔗 Maintaining WORM hash chains...');
      
      try {
        await this.maintainWormChains();
        console.log('✅ WORM maintenance completed');
      } catch (error) {
        console.error('❌ WORM maintenance failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    console.log('📅 Scheduled WORM maintenance every 5 minutes');
  }

  // ===== JOB EXECUTION =====

  /**
   * Run daily maintenance tasks
   */
  async runDailyMaintenance() {
    const startTime = Date.now();
    console.log('🔄 Starting daily maintenance...');

    // Get all users with profiles
    const users = await prisma.user.findMany({
      where: { userProfile: { isNot: null } },
      include: { userProfile: true }
    });

    console.log(`📊 Processing ${users.length} users...`);

    let processedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Update reputation with decay
        const dailyGain = await gamificationService.calculateDailyRepGain(user.id);
        await gamificationService.updateReputation(user.id, dailyGain);

        // Evaluate badges
        const awardedBadges = await gamificationService.evaluateBadges(user.id);
        
        if (awardedBadges.length > 0) {
          console.log(`🏆 User ${user.email} earned ${awardedBadges.length} new badges`);
        }

        processedCount++;
        
        if (processedCount % 100 === 0) {
          console.log(`📈 Processed ${processedCount}/${users.length} users...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing user ${user.email}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Daily maintenance completed in ${duration}ms`);
    console.log(`📊 Results: ${processedCount} processed, ${errorCount} errors`);
  }

  /**
   * Run badge evaluation for all users
   */
  async runBadgeEvaluation() {
    const startTime = Date.now();
    console.log('🏆 Starting badge evaluation...');

    // Get users who haven't been evaluated recently
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const users = await prisma.user.findMany({
      where: {
        userProfile: { isNot: null },
        OR: [
          { userBadges: { none: {} } },
          { userBadges: { some: { awardedAt: { lt: oneHourAgo } } } }
        ]
      },
      include: { userProfile: true }
    });

    console.log(`📊 Evaluating badges for ${users.length} users...`);

    let awardedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        const awardedBadges = await gamificationService.evaluateBadges(user.id);
        awardedCount += awardedBadges.length;
        
        if (awardedBadges.length > 0) {
          console.log(`🎉 User ${user.email} earned ${awardedBadges.length} badges`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error evaluating badges for ${user.email}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Badge evaluation completed in ${duration}ms`);
    console.log(`📊 Results: ${awardedCount} badges awarded, ${errorCount} errors`);
  }

  /**
   * Manage conversion window lifecycle
   */
  async manageConversionWindows() {
    console.log('🔄 Managing conversion windows...');

    const now = new Date();

    try {
      // Open scheduled windows
      const scheduledWindows = await prisma.conversionWindow.findMany({
        where: {
          status: 'SCHEDULED',
          opensAt: { lte: now }
        }
      });

      for (const window of scheduledWindows) {
        await prisma.conversionWindow.update({
          where: { id: window.id },
          data: { status: 'OPEN' }
        });
        console.log(`🟢 Opened conversion window: ${window.id}`);
      }

      // Close expired windows
      const expiredWindows = await prisma.conversionWindow.findMany({
        where: {
          status: 'OPEN',
          closesAt: { lt: now }
        }
      });

      for (const window of expiredWindows) {
        await prisma.conversionWindow.update({
          where: { id: window.id },
          data: { status: 'CLOSED' }
        });
        console.log(`🔴 Closed conversion window: ${window.id}`);

        // Expire pending conversions
        await prisma.equityConversion.updateMany({
          where: {
            windowId: window.id,
            status: 'PENDING'
          },
          data: { status: 'EXPIRED' }
        });
      }

      // Finalize closed windows after grace period
      const gracePeriod = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours
      const finalizeWindows = await prisma.conversionWindow.findMany({
        where: {
          status: 'CLOSED',
          closesAt: { lt: gracePeriod }
        }
      });

      for (const window of finalizeWindows) {
        await prisma.conversionWindow.update({
          where: { id: window.id },
          data: { status: 'FINALIZED' }
        });
        console.log(`🏁 Finalized conversion window: ${window.id}`);
      }

    } catch (error) {
      console.error('❌ Error managing conversion windows:', error);
    }
  }

  /**
   * Maintain WORM hash chains
   */
  async maintainWormChains() {
    console.log('🔗 Maintaining WORM hash chains...');

    try {
      // Check for orphaned WORM entries (missing prevHash)
      const orphanedEntries = await prisma.wormAudit.findMany({
        where: {
          prevHash: null
        },
        orderBy: { createdAt: 'asc' }
      });

      if (orphanedEntries.length > 0) {
        console.log(`⚠️  Found ${orphanedEntries.length} orphaned WORM entries`);
        
        // Rebuild hash chains for orphaned entries
        for (const entry of orphanedEntries) {
          await this.rebuildWormChain(entry.scope);
        }
      }

      // Check for broken wallet hash chains
      const brokenWallets = await this.findBrokenWalletChains();
      
      if (brokenWallets.length > 0) {
        console.log(`⚠️  Found ${brokenWallets.length} broken wallet hash chains`);
        
        for (const walletId of brokenWallets) {
          await this.rebuildWalletChain(walletId);
        }
      }

    } catch (error) {
      console.error('❌ Error maintaining WORM chains:', error);
    }
  }

  /**
   * Rebuild WORM hash chain for a scope
   */
  async rebuildWormChain(scope) {
    console.log(`🔧 Rebuilding WORM chain for scope: ${scope}`);

    const entries = await prisma.wormAudit.findMany({
      where: { scope },
      orderBy: { createdAt: 'asc' }
    });

    let prevHash = null;
    
    for (const entry of entries) {
      const payload = JSON.stringify({ 
        scope: entry.scope, 
        refId: entry.refId, 
        action: entry.action, 
        details: entry.details, 
        timestamp: entry.createdAt.getTime() 
      });
      
      const hash = crypto.createHash('sha256')
        .update(prevHash ? `${prevHash}:${payload}` : payload)
        .digest('hex');

      if (entry.hash !== hash) {
        await prisma.wormAudit.update({
          where: { id: entry.id },
          data: { 
            prevHash,
            hash 
          }
        });
        console.log(`🔗 Fixed hash for entry: ${entry.id}`);
      }

      prevHash = hash;
    }
  }

  /**
   * Find wallets with broken hash chains
   */
  async findBrokenWalletChains() {
    const wallets = await prisma.wallet.findMany();
    const brokenWallets = [];

    for (const wallet of wallets) {
      const entries = await prisma.walletLedger.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'asc' }
      });

      let prevHash = null;
      let isBroken = false;

      for (const entry of entries) {
        const payload = `${wallet.id}:${entry.amount}:${entry.type}:${entry.createdAt.getTime()}`;
        const expectedHash = crypto.createHash('sha256')
          .update(prevHash ? `${prevHash}:${payload}` : payload)
          .digest('hex');

        if (entry.hash !== expectedHash) {
          isBroken = true;
          break;
        }

        prevHash = entry.hash;
      }

      if (isBroken) {
        brokenWallets.push(wallet.id);
      }
    }

    return brokenWallets;
  }

  /**
   * Rebuild wallet hash chain
   */
  async rebuildWalletChain(walletId) {
    console.log(`🔧 Rebuilding wallet hash chain for: ${walletId}`);

    const entries = await prisma.walletLedger.findMany({
      where: { walletId },
      orderBy: { createdAt: 'asc' }
    });

    let prevHash = null;
    
    for (const entry of entries) {
      const payload = `${walletId}:${entry.amount}:${entry.type}:${entry.createdAt.getTime()}`;
      const hash = crypto.createHash('sha256')
        .update(prevHash ? `${prevHash}:${payload}` : payload)
        .digest('hex');

      if (entry.hash !== hash) {
        await prisma.walletLedger.update({
          where: { id: entry.id },
          data: { 
            prevHash,
            hash 
          }
        });
        console.log(`🔗 Fixed hash for ledger entry: ${entry.id}`);
      }

      prevHash = hash;
    }
  }

  // ===== MANUAL JOB TRIGGERS =====

  /**
   * Manually trigger daily maintenance
   */
  async triggerDailyMaintenance() {
    console.log('🔄 Manually triggering daily maintenance...');
    await this.runDailyMaintenance();
  }

  /**
   * Manually trigger badge evaluation
   */
  async triggerBadgeEvaluation() {
    console.log('🏆 Manually triggering badge evaluation...');
    await this.runBadgeEvaluation();
  }

  /**
   * Manually trigger conversion window management
   */
  async triggerConversionWindowManagement() {
    console.log('🔄 Manually triggering conversion window management...');
    await this.manageConversionWindows();
  }

  /**
   * Manually trigger WORM maintenance
   */
  async triggerWormMaintenance() {
    console.log('🔗 Manually triggering WORM maintenance...');
    await this.maintainWormChains();
  }

  // ===== HEALTH CHECK =====

  /**
   * Get job health status
   */
  getHealthStatus() {
    return {
      isRunning: this.isRunning,
      jobs: {
        dailyMaintenance: cron.getTasks().some(task => task.description === 'daily-maintenance'),
        badgeEvaluation: cron.getTasks().some(task => task.description === 'badge-evaluation'),
        conversionWindows: cron.getTasks().some(task => task.description === 'conversion-windows'),
        wormMaintenance: cron.getTasks().some(task => task.description === 'worm-maintenance')
      },
      lastRun: {
        dailyMaintenance: this.lastDailyMaintenance,
        badgeEvaluation: this.lastBadgeEvaluation,
        conversionWindows: this.lastConversionWindows,
        wormMaintenance: this.lastWormMaintenance
      }
    };
  }
}

module.exports = GamificationJobs;
