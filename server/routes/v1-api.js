const express = require('express');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

// Import services
const GamificationService = require('../services/gamification-service');
const gamificationService = new GamificationService();

// ===== MIDDLEWARE =====

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // This would need to be implemented with your JWT verification
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;
    
    // For now, use a placeholder user ID
    req.user = { id: 'sample-user-id' };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Permission middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    // This would check user permissions
    // For now, allow all authenticated users
    next();
  };
};

// ===== PROFILES & GAMIFICATION =====

/**
 * GET /profiles/:userId - Get public profile
 */
router.get('/profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            createdAt: true
          }
        },
        userSkills: {
          include: {
            skill: true
          }
        },
        userBadges: {
          include: {
            badge: true
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get portfolio preview (public items only)
    const portfolioItems = await prisma.portfolioItem.findMany({
      where: {
        userId,
        isPublic: true
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    // Get wallet stats (public subset)
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    const response = {
      userId: profile.userId,
      nickname: profile.nickname,
      avatar: profile.avatarFileId ? `/api/files/${profile.avatarFileId}` : null,
      bio: profile.bio,
      location: profile.location,
      websiteUrl: profile.websiteUrl,
      level: profile.level,
      repScore: profile.repScore,
      skills: profile.userSkills.map(us => ({
        name: us.skill.name,
        level: us.level,
        verified: !!us.verifiedBy
      })),
      badges: profile.userBadges.map(ub => ({
        code: ub.badge.code,
        title: ub.badge.title,
        description: ub.badge.description,
        icon: ub.badge.icon,
        awardedAt: ub.awardedAt
      })),
      portfolio: portfolioItems.map(item => ({
        title: item.title,
        summary: item.summary,
        buzEarned: item.buzEarned,
        impactScore: item.impactScore
      })),
      stats: {
        totalBUZ: wallet?.buzBalance || 0,
        totalPortfolioItems: portfolioItems.length
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PATCH /profiles/me - Update own profile
 */
router.patch('/profiles/me', authenticateToken, async (req, res) => {
  try {
    const { nickname, theme, bio, location, websiteUrl } = req.body;
    const userId = req.user.id;

    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const updatedProfile = await prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        nickname: nickname || profile.nickname,
        theme: theme || profile.theme,
        bio: bio !== undefined ? bio : profile.bio,
        location: location !== undefined ? location : profile.location,
        websiteUrl: websiteUrl !== undefined ? websiteUrl : profile.websiteUrl
      }
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * POST /profiles/me/skills - Add skill to profile
 */
router.post('/profiles/me/skills', authenticateToken, async (req, res) => {
  try {
    const { skillId, level, evidenceUrl } = req.body;
    const userId = req.user.id;

    // Verify skill exists
    const skill = await prisma.skill.findUnique({
      where: { id: skillId }
    });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Create or update user skill
    const userSkill = await prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId,
          skillId
        }
      },
      update: {
        level,
        evidenceUrl
      },
      create: {
        userId,
        skillId,
        level,
        evidenceUrl
      }
    });

    res.json(userSkill);
  } catch (error) {
    console.error('Skill addition error:', error);
    res.status(500).json({ error: 'Failed to add skill' });
  }
});

/**
 * POST /profiles/me/endorse - Endorse another user
 */
router.post('/profiles/me/endorse', authenticateToken, async (req, res) => {
  try {
    const { endorsedId, skillId, weight, note } = req.body;
    const endorserId = req.user.id;

    // Rate limiting: max 5 endorsements per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEndorsements = await prisma.endorsement.count({
      where: {
        endorserId,
        createdAt: { gte: today }
      }
    });

    if (todayEndorsements >= 5) {
      return res.status(429).json({ error: 'Daily endorsement limit reached' });
    }

    // Create endorsement
    const endorsement = await prisma.endorsement.create({
      data: {
        endorserId,
        endorsedId,
        skillId,
        weight: Math.min(Math.max(weight, 1), 5),
        note: note?.substring(0, 200)
      }
    });

    res.json(endorsement);
  } catch (error) {
    console.error('Endorsement error:', error);
    res.status(500).json({ error: 'Failed to create endorsement' });
  }
});

// ===== BADGES =====

/**
 * GET /badges - Get all badges
 */
router.get('/badges', async (req, res) => {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { createdAt: 'asc' }
    });

    res.json(badges);
  } catch (error) {
    console.error('Badges fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

/**
 * POST /badges/:code/award - Award badge to user (admin/system only)
 */
router.post('/badges/:code/award', authenticateToken, requirePermission('ADMIN'), async (req, res) => {
  try {
    const { code } = req.params;
    const { userId } = req.body;

    const badge = await prisma.badge.findUnique({
      where: { code }
    });

    if (!badge) {
      return res.status(404).json({ error: 'Badge not found' });
    }

    // Check if user already has this badge
    const existingBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.id
        }
      }
    });

    if (existingBadge) {
      return res.status(400).json({ error: 'User already has this badge' });
    }

    const userBadge = await prisma.userBadge.create({
      data: {
        userId,
        badgeId: badge.id,
        context: { manuallyAwarded: true, awardedBy: req.user.id }
      }
    });

    res.json(userBadge);
  } catch (error) {
    console.error('Badge award error:', error);
    res.status(500).json({ error: 'Failed to award badge' });
  }
});

// ===== PORTFOLIO =====

/**
 * GET /profiles/:userId/portfolio - Get user portfolio
 */
router.get('/profiles/:userId/portfolio', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const portfolioItems = await prisma.portfolioItem.findMany({
      where: {
        userId,
        isPublic: true
      },
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { createdAt: 'desc' },
      include: {
        file: {
          select: {
            filename: true,
            mimeType: true
          }
        }
      }
    });

    res.json(portfolioItems);
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

/**
 * POST /portfolio - Add portfolio item
 */
router.post('/portfolio', authenticateToken, async (req, res) => {
  try {
    const { title, summary, fileId, externalUrl, taskId } = req.body;
    const userId = req.user.id;

    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        userId,
        title,
        summary,
        fileId,
        externalUrl,
        taskId
      }
    });

    res.json(portfolioItem);
  } catch (error) {
    console.error('Portfolio item creation error:', error);
    res.status(500).json({ error: 'Failed to create portfolio item' });
  }
});

// ===== WALLET & BUZ =====

/**
 * GET /wallet/me - Get wallet info
 */
router.get('/wallet/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

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

    // Get last 100 ledger entries
    const ledgerEntries = await prisma.walletLedger.findMany({
      where: { walletId: wallet.id },
      take: 100,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      wallet,
      recentTransactions: ledgerEntries
    });
  } catch (error) {
    console.error('Wallet fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

/**
 * GET /conversion-windows/active - Get active conversion windows
 */
router.get('/conversion-windows/active', async (req, res) => {
  try {
    const now = new Date();
    
    const activeWindows = await prisma.conversionWindow.findMany({
      where: {
        status: 'OPEN',
        opensAt: { lte: now },
        closesAt: { gte: now }
      },
      orderBy: { closesAt: 'asc' }
    });

    res.json(activeWindows);
  } catch (error) {
    console.error('Conversion windows fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch conversion windows' });
  }
});

/**
 * POST /equity/convert - Convert BUZ to equity
 */
router.post('/equity/convert', authenticateToken, async (req, res) => {
  try {
    const { windowId, buzAmount, ventureId } = req.body;
    const userId = req.user.id;

    // Verify conversion window is active
    const window = await prisma.conversionWindow.findUnique({
      where: { id: windowId }
    });

    if (!window || window.status !== 'OPEN') {
      return res.status(400).json({ error: 'Conversion window not active' });
    }

    // Verify user has enough BUZ
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet || wallet.buzBalance < buzAmount) {
      return res.status(400).json({ error: 'Insufficient BUZ balance' });
    }

    // Calculate equity amount
    const equityBps = Math.round((buzAmount * window.equityRateBps) / 10000);

    // Create conversion request
    const conversion = await prisma.equityConversion.create({
      data: {
        userId,
        windowId,
        buzUsed: buzAmount,
        equityGrantedBp: equityBps,
        ventureId,
        status: 'PENDING'
      }
    });

    // Lock BUZ in wallet
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        buzBalance: wallet.buzBalance - buzAmount,
        pendingLock: wallet.pendingLock + buzAmount
      }
    });

    // Create ledger entry
    await prisma.walletLedger.create({
      data: {
        walletId: wallet.id,
        type: 'BUZ_LOCK',
        amount: -buzAmount,
        refEquityId: conversion.id,
        note: `Locked for equity conversion`,
        prevHash: await getLastWalletHash(wallet.id),
        hash: await calculateWalletHash(wallet.id, -buzAmount, 'BUZ_LOCK')
      }
    });

    res.json(conversion);
  } catch (error) {
    console.error('Equity conversion error:', error);
    res.status(500).json({ error: 'Failed to convert BUZ to equity' });
  }
});

// ===== CLIENTS & DOCUMENTS =====

/**
 * GET /clients - Get user's clients
 */
router.get('/clients', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const clients = await prisma.client.findMany({
      where: { ownerUserId: userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(clients);
  } catch (error) {
    console.error('Clients fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

/**
 * POST /clients - Create new client
 */
router.post('/clients', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, organization, tags } = req.body;
    const ownerUserId = req.user.id;

    const client = await prisma.client.create({
      data: {
        ownerUserId,
        name,
        email,
        phone,
        organization,
        tags: tags || []
      }
    });

    res.json(client);
  } catch (error) {
    console.error('Client creation error:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

/**
 * POST /documents - Upload document
 */
router.post('/documents', authenticateToken, async (req, res) => {
  try {
    const { title, fileId, docType } = req.body;
    const ownerUserId = req.user.id;

    // Get file checksum
    const file = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const document = await prisma.userDocument.create({
      data: {
        ownerUserId,
        title,
        fileId,
        docType,
        checksumSha256: file.checksumSha256
      }
    });

    res.json(document);
  } catch (error) {
    console.error('Document creation error:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

/**
 * POST /documents/:id/share - Share document
 */
router.post('/documents/:id/share', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { toUserId, clientId, canView, canComment, canSign, expiresAt } = req.body;
    const fromUserId = req.user.id;

    // Verify document ownership
    const document = await prisma.userDocument.findUnique({
      where: { id }
    });

    if (!document || document.ownerUserId !== fromUserId) {
      return res.status(403).json({ error: 'Document not found or access denied' });
    }

    const docShare = await prisma.docShare.create({
      data: {
        documentId: id,
        fromUserId,
        toUserId,
        clientId,
        canView: canView !== undefined ? canView : true,
        canComment: canComment !== undefined ? canComment : false,
        canSign: canSign !== undefined ? canSign : false,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    res.json(docShare);
  } catch (error) {
    console.error('Document share error:', error);
    res.status(500).json({ error: 'Failed to share document' });
  }
});

// ===== SIGNATURES =====

/**
 * POST /signatures - Request signature
 */
router.post('/signatures', authenticateToken, async (req, res) => {
  try {
    const { documentId, signerUserId, signerEmail, expiresAt } = req.body;
    const requestedById = req.user.id;

    // Verify document ownership
    const document = await prisma.userDocument.findUnique({
      where: { id: documentId }
    });

    if (!document || document.ownerUserId !== requestedById) {
      return res.status(403).json({ error: 'Document not found or access denied' });
    }

    const signatureRequest = await prisma.signatureRequest.create({
      data: {
        documentId,
        requestedById,
        signerUserId,
        signerEmail,
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
      }
    });

    res.json(signatureRequest);
  } catch (error) {
    console.error('Signature request error:', error);
    res.status(500).json({ error: 'Failed to create signature request' });
  }
});

/**
 * POST /signatures/:id/sign - Sign document
 */
router.post('/signatures/:id/sign', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { signatureBlob } = req.body;
    const signerUserId = req.user.id;

    const signatureRequest = await prisma.signatureRequest.findUnique({
      where: { id },
      include: { document: true }
    });

    if (!signatureRequest) {
      return res.status(404).json({ error: 'Signature request not found' });
    }

    if (signatureRequest.status !== 'PENDING') {
      return res.status(400).json({ error: 'Signature request not pending' });
    }

    if (signatureRequest.signerUserId && signatureRequest.signerUserId !== signerUserId) {
      return res.status(403).json({ error: 'Not authorized to sign this document' });
    }

    // Verify signature (this would need proper cryptographic verification)
    const signatureHash = crypto.createHash('sha256')
      .update(signatureRequest.document.checksumSha256 + signerUserId + Date.now())
      .digest('hex');

    // Update signature request
    const updatedRequest = await prisma.signatureRequest.update({
      where: { id },
      data: {
        status: 'SIGNED',
        signedAt: new Date(),
        signatureHash
      }
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Document signing error:', error);
    res.status(500).json({ error: 'Failed to sign document' });
  }
});

// ===== EVENTS (for background workers) =====

/**
 * POST /events/task/accepted - Task acceptance event
 */
router.post('/events/task/accepted', async (req, res) => {
  try {
    const { taskId } = req.body;

    // This would trigger the gamification service
    // For now, just acknowledge the event
    console.log(`Task accepted event: ${taskId}`);

    res.json({ status: 'processed' });
  } catch (error) {
    console.error('Task event error:', error);
    res.status(500).json({ error: 'Failed to process task event' });
  }
});

// ===== HELPER FUNCTIONS =====

async function getLastWalletHash(walletId) {
  const lastEntry = await prisma.walletLedger.findFirst({
    where: { walletId },
    orderBy: { createdAt: 'desc' }
  });

  return lastEntry?.hash || null;
}

async function calculateWalletHash(walletId, amount, type) {
  const lastHash = await getLastWalletHash(walletId);
  const payload = `${walletId}:${amount}:${type}:${Date.now()}`;
  const hashInput = lastHash ? `${lastHash}:${payload}` : payload;
  
  return crypto.createHash('sha256').update(hashInput).digest('hex');
}

module.exports = router;
