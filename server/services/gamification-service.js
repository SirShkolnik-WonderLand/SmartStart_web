const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

class GamificationService {
  constructor() {
    this.xpThresholds = {
      1: 0,      // Level 1 starts at 0 XP
      2: 100,    // Level 2 requires 100 XP
      3: 250,    // Level 3 requires 250 XP
      4: 500,    // Level 4 requires 500 XP
      5: 900,    // Level 5 requires 900 XP
      6: 1400,   // Level 6 requires 1400 XP
      7: 2000,   // Level 7 requires 2000 XP
      8: 2700,   // Level 8 requires 2700 XP
      9: 3500,   // Level 9 requires 3500 XP
      10: 4400   // Level 10 requires 4400 XP
    };
  }

  // ===== XP & LEVEL MANAGEMENT =====

  /**
   * Calculate XP for task completion
   */
  calculateTaskXP(taskTier, qualityScore, reviewerCredibility) {
    const tierBaseXP = {
      'S': 100,  // Strategic/High Impact
      'A': 70,   // Advanced/Complex
      'B': 40,   // Basic/Standard
      'C': 25    // Simple/Quick
    };

    const qualityMultiplier = {
      5: 1.4,    // Excellent
      4: 1.2,    // Good
      3: 1.0,    // OK
      2: 0.8,    // Weak
      1: 0.6     // Poor
    };

    const baseXP = tierBaseXP[taskTier] || tierBaseXP['B'];
    const quality = qualityMultiplier[qualityScore] || 1.0;
    const reviewer = Math.min(Math.max(reviewerCredibility, 0.7), 1.1);

    return Math.round(baseXP * quality * reviewer);
  }

  /**
   * Award XP to user and check for level up
   */
  async awardXP(userId, xpAmount, source = 'task_completion') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userProfile: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create or update user profile
    let profile = user.userProfile;
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId,
          nickname: user.name || user.email.split('@')[0],
          level: 1,
          xp: 0,
          repScore: 50
        }
      });
    }

    // Add XP
    const newXP = profile.xp + xpAmount;
    const newLevel = this.calculateLevel(newXP);

    // Update profile
    profile = await prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        xp: newXP,
        level: newLevel
      }
    });

    // Log XP gain
    await this.logWormAudit('USER', userId, 'AWARD_XP', {
      xpAmount,
      newTotal: newXP,
      levelGained: newLevel > profile.level,
      source
    });

    return {
      xpGained: xpAmount,
      newTotal: newXP,
      newLevel,
      levelUp: newLevel > profile.level
    };
  }

  /**
   * Calculate level based on XP
   */
  calculateLevel(xp) {
    let level = 1;
    for (let i = 2; i <= 10; i++) {
      if (xp >= this.xpThresholds[i]) {
        level = i;
      } else {
        break;
      }
    }
    return level;
  }

  // ===== REPUTATION MANAGEMENT =====

  /**
   * Update reputation score with decay
   */
  async updateReputation(userId, dailyGain = 0) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Apply daily decay: rep(t+1) = 0.995 * rep(t) + dailyGain
    const decayedRep = Math.floor(profile.repScore * 0.995);
    const newRep = Math.min(100, Math.max(0, decayedRep + dailyGain));

    const updatedProfile = await prisma.userProfile.update({
      where: { id: profile.id },
      data: { repScore: newRep }
    });

    return updatedProfile.repScore;
  }

  /**
   * Calculate daily reputation gain
   */
  async calculateDailyRepGain(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get XP gained today
    const xpGain = await this.getXPForPeriod(userId, today, new Date());
    
    // Get endorsements received today
    const endorsements = await prisma.endorsement.findMany({
      where: {
        endorsedId: userId,
        createdAt: { gte: today }
      },
      include: { endorser: { include: { userProfile: true } } }
    });

    const endorsementWeight = endorsements.reduce((sum, end) => {
      const endorserTrust = end.endorser.userProfile?.repScore || 50;
      return sum + (end.weight * endorserTrust / 100);
    }, 0);

    // Get badges earned today
    const badgesEarned = await prisma.userBadge.findMany({
      where: {
        userId,
        awardedAt: { gte: today }
      }
    });

    // Calculate daily gain: xpGain/10 + endorsementsWeighted/5 + badgesToday*20
    const dailyGain = Math.min(50, 
      (xpGain / 10) + 
      (endorsementWeight / 5) + 
      (badgesEarned.length * 20)
    );

    return Math.max(0, dailyGain);
  }

  /**
   * Get XP for a specific time period
   */
  async getXPForPeriod(userId, startDate, endDate) {
    // This would need to be implemented based on your XP tracking system
    // For now, return 0 as placeholder
    return 0;
  }

  // ===== BUZ TOKEN MANAGEMENT =====

  /**
   * Issue BUZ tokens for task completion
   */
  async issueBUZ(userId, taskId, baseAmount, qualityMultiplier, reviewerCredibility) {
    // Verify user can receive BUZ
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userProfile: true }
    });

    if (!user || !user.userProfile) {
      throw new Error('User profile not found');
    }

    if (user.userProfile.repScore < 60) {
      throw new Error('User reputation too low to receive BUZ');
    }

    // Check daily BUZ cap
    const dailyCap = 2000;
    const todayBUZ = await this.getDailyBUZIssued(userId);
    const availableBUZ = Math.max(0, dailyCap - todayBUZ);

    if (availableBUZ <= 0) {
      throw new Error('Daily BUZ cap reached');
    }

    // Calculate BUZ amount
    const buzAmount = Math.min(
      Math.round(baseAmount * qualityMultiplier * reviewerCredibility),
      availableBUZ
    );

    if (buzAmount <= 0) {
      return { buzIssued: 0, reason: 'Amount too small or cap reached' };
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          buzBalance: 0,
          pendingLock: 0
        }
      });
    }

    // Update wallet balance
    const newBalance = wallet.buzBalance + buzAmount;
    wallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { buzBalance: newBalance }
    });

    // Create ledger entry
    const ledgerEntry = await prisma.walletLedger.create({
      data: {
        walletId: wallet.id,
        type: 'BUZ_EARN',
        amount: buzAmount,
        refTaskId: taskId,
        note: `Task completion reward`,
        prevHash: await this.getLastWalletHash(wallet.id),
        hash: await this.calculateWalletHash(wallet.id, buzAmount, 'BUZ_EARN')
      }
    });

    // Log WORM audit
    await this.logWormAudit('WALLET', wallet.id, 'ISSUE_BUZ', {
      userId,
      taskId,
      buzAmount,
      newBalance,
      ledgerEntryId: ledgerEntry.id
    });

    return {
      buzIssued: buzAmount,
      newBalance,
      ledgerEntryId: ledgerEntry.id
    };
  }

  /**
   * Get BUZ issued today for a user
   */
  async getDailyBUZIssued(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) return 0;

    const todayEntries = await prisma.walletLedger.findMany({
      where: {
        walletId: wallet.id,
        type: 'BUZ_EARN',
        createdAt: { gte: today }
      }
    });

    return todayEntries.reduce((sum, entry) => sum + entry.amount, 0);
  }

  /**
   * Get last wallet hash for chain
   */
  async getLastWalletHash(walletId) {
    const lastEntry = await prisma.walletLedger.findFirst({
      where: { walletId },
      orderBy: { createdAt: 'desc' }
    });

    return lastEntry?.hash || null;
  }

  /**
   * Calculate wallet hash for WORM chain
   */
  async calculateWalletHash(walletId, amount, type) {
    const lastHash = await this.getLastWalletHash(walletId);
    const payload = `${walletId}:${amount}:${type}:${Date.now()}`;
    const hashInput = lastHash ? `${lastHash}:${payload}` : payload;
    
    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }

  // ===== BADGE EVALUATION =====

  /**
   * Evaluate and award badges for a user
   */
  async evaluateBadges(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userProfile: true,
        userBadges: { include: { badge: true } },
        userSkills: true,
        endorsementsReceived: true
      }
    });

    if (!user || !user.userProfile) {
      return [];
    }

    const awardedBadges = [];

    // Get all available badges
    const availableBadges = await prisma.badge.findMany({
      where: {
        id: { notIn: user.userBadges.map(ub => ub.badgeId) }
      }
    });

    for (const badge of availableBadges) {
      if (await this.evaluateBadgeRule(user, badge)) {
        const userBadge = await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
            context: { awardedAt: new Date().toISOString() }
          }
        });

        awardedBadges.push(userBadge);

        // Log badge award
        await this.logWormAudit('USER', userId, 'AWARD_BADGE', {
          badgeId: badge.id,
          badgeCode: badge.code,
          context: userBadge.context
        });
      }
    }

    return awardedBadges;
  }

  /**
   * Evaluate if a user qualifies for a badge
   */
  async evaluateBadgeRule(user, badge) {
    if (badge.ruleType === 'MANUAL') {
      return false; // Manual badges are awarded by admins
    }

    if (badge.ruleType === 'THRESHOLD') {
      return this.evaluateThresholdRule(user, badge.ruleJson);
    }

    if (badge.ruleType === 'COMPOSITE') {
      return this.evaluateCompositeRule(user, badge.ruleJson);
    }

    return false;
  }

  /**
   * Evaluate threshold-based badge rules
   */
  async evaluateThresholdRule(user, rule) {
    if (!rule.conditions) return false;

    for (const condition of rule.conditions) {
      const metric = await this.getUserMetric(user.id, condition.metric);
      
      if (condition.gte && metric < condition.gte) return false;
      if (condition.lte && metric > condition.lte) return false;
      if (condition.eq && metric !== condition.eq) return false;
      if (condition.gt && metric <= condition.gt) return false;
      if (condition.lt && metric >= condition.lt) return false;
    }

    return true;
  }

  /**
   * Evaluate composite badge rules
   */
  async evaluateCompositeRule(user, rule) {
    if (rule.all) {
      for (const condition of rule.all) {
        const metric = await this.getUserMetric(user.id, condition.metric);
        
        if (condition.gte && metric < condition.gte) return false;
        if (condition.lte && metric > condition.lte) return false;
        if (condition.eq && metric !== condition.eq) return false;
      }
      return true;
    }

    if (rule.any) {
      for (const condition of rule.any) {
        const metric = await this.getUserMetric(user.id, condition.metric);
        
        if (condition.gte && metric >= condition.gte) return true;
        if (condition.lte && metric <= condition.lte) return true;
        if (condition.eq && metric === condition.eq) return true;
      }
      return false;
    }

    return false;
  }

  /**
   * Get user metric for badge evaluation
   */
  async getUserMetric(userId, metricName) {
    switch (metricName) {
      case 'tasksAccepted':
        return await this.getTasksAccepted(userId);
      
      case 'daysSinceJoin':
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return 0;
        const daysSinceJoin = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceJoin;
      
      case 'kycStatus':
        // This would need to be implemented based on your KYC system
        return 'PASSED'; // Placeholder
      
      case 'deviceCompliantDays':
        // This would need to be implemented based on your device posture system
        return 90; // Placeholder
      
      case 'policyViolations':
        // This would need to be implemented based on your policy system
        return 0; // Placeholder
      
      case 'helpfulReviews':
        return await this.getHelpfulReviews(userId);
      
      case 'agreementRate':
        return await this.getReviewAgreementRate(userId);
      
      case 'endorsementsGiven':
        return await this.getEndorsementsGiven(userId);
      
      case 'endorsementQuality':
        return await this.getEndorsementQuality(userId);
      
      case 'equityConversions':
        return await this.getEquityConversions(userId);
      
      case 'quarterNumber':
        return Math.floor(new Date().getMonth() / 3) + 1;
      
      default:
        return 0;
    }
  }

  // ===== HELPER METHODS =====

  async getTasksAccepted(userId) {
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: 'COMPLETED' // Assuming you have a completed status
      }
    });
    return tasks.length;
  }

  async getHelpfulReviews(userId) {
    const reviews = await prisma.review.findMany({
      where: {
        reviewerId: userId,
        decision: 'APPROVED'
      }
    });
    return reviews.length;
  }

  async getReviewAgreementRate(userId) {
    // This would need to be implemented based on your review system
    return 0.85; // Placeholder
  }

  async getEndorsementsGiven(userId) {
    const endorsements = await prisma.endorsement.findMany({
      where: { endorserId: userId }
    });
    return endorsements.length;
  }

  async getEndorsementQuality(userId) {
    const endorsements = await prisma.endorsement.findMany({
      where: { endorserId: userId }
    });
    
    if (endorsements.length === 0) return 0;
    
    const totalWeight = endorsements.reduce((sum, end) => sum + end.weight, 0);
    return totalWeight / endorsements.length;
  }

  async getEquityConversions(userId) {
    const conversions = await prisma.equityConversion.findMany({
      where: {
        userId,
        status: 'SETTLED'
      }
    });
    return conversions.length;
  }

  // ===== WORM AUDIT LOGGING =====

  /**
   * Log WORM audit entry
   */
  async logWormAudit(scope, refId, action, details) {
    const lastAudit = await prisma.wormAudit.findFirst({
      where: { scope },
      orderBy: { createdAt: 'desc' }
    });

    const prevHash = lastAudit?.hash || null;
    const payload = JSON.stringify({ scope, refId, action, details, timestamp: Date.now() });
    const hash = crypto.createHash('sha256').update(prevHash ? `${prevHash}:${payload}` : payload).digest('hex');

    return await prisma.wormAudit.create({
      data: {
        scope,
        refId,
        action,
        details,
        prevHash,
        hash
      }
    });
  }

  // ===== DAILY MAINTENANCE =====

  /**
   * Run daily maintenance tasks
   */
  async runDailyMaintenance() {
    console.log('🔄 Running daily gamification maintenance...');

    // Get all users with profiles
    const users = await prisma.user.findMany({
      where: { userProfile: { isNot: null } },
      include: { userProfile: true }
    });

    for (const user of users) {
      try {
        // Update reputation with decay
        const dailyGain = await this.calculateDailyRepGain(user.id);
        await this.updateReputation(user.id, dailyGain);

        // Evaluate badges
        await this.evaluateBadges(user.id);

        console.log(`✅ Processed user: ${user.email}`);
      } catch (error) {
        console.error(`❌ Error processing user ${user.email}:`, error);
      }
    }

    console.log('✅ Daily maintenance completed');
  }
}

module.exports = GamificationService;
