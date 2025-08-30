import express from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import SmartContractService from '../services/SmartContractService.js';

const router = express.Router();
const smartContractService = new SmartContractService();

// ============================================================================
// CONTRACT OFFERS
// ============================================================================

/**
 * Create a new contract offer
 * POST /smart-contracts/offers
 */
router.post('/offers', authenticateToken, requireRole(['OWNER', 'ADMIN']), async (req, res) => {
  try {
    const {
      projectId,
      recipientId,
      equityPercentage,
      vestingSchedule,
      contributionType,
      effortRequired,
      impactExpected,
      terms,
      deliverables,
      milestones
    } = req.body;

    // Validate required fields
    if (!projectId || !recipientId || !equityPercentage || !contributionType || !effortRequired) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user has permission to create contracts for this project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.ownerId !== req.user?.id && !req.user?.role.includes('ADMIN')) {
      return res.status(403).json({ error: 'Insufficient permissions to create contracts for this project' });
    }

    const contractOffer = await smartContractService.createContractOffer({
      projectId,
      recipientId,
      equityPercentage,
      vestingSchedule: vestingSchedule || 'IMMEDIATE',
      contributionType,
      effortRequired,
      impactExpected: impactExpected || 3,
      terms: terms || 'Standard equity agreement',
      deliverables: deliverables || [],
      milestones: milestones || [],
      createdBy: req.user?.id || '',
    });

    res.status(201).json(contractOffer);
  } catch (error: any) {
    console.error('Create contract offer error:', error);
    res.status(500).json({ error: error.message || 'Failed to create contract offer' });
  }
});

/**
 * Get contract offers for a user
 * GET /smart-contracts/offers/user/:userId
 */
router.get('/offers/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only see their own offers unless they're admin
    if (req.user?.id !== userId && !req.user?.role.includes('ADMIN')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const offers = await prisma.contractOffer.findMany({
      where: { recipientId: userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            summary: true,
            owner: { select: { id: true, name: true, email: true } }
          }
        },
        recipient: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(offers);
  } catch (error) {
    console.error('Get user contract offers error:', error);
    res.status(500).json({ error: 'Failed to get contract offers' });
  }
});

/**
 * Get contract offers for a project
 * GET /smart-contracts/offers/project/:projectId
 */
router.get('/offers/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if user has access to this project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const hasAccess = project.ownerId === req.user?.id || 
                     project.members.some(m => m.userId === req.user?.id) ||
                     req.user?.role.includes('ADMIN');

    if (!hasAccess) {
      return res.status(403).json({ error: 'Insufficient permissions to view project contracts' });
    }

    const offers = await prisma.contractOffer.findMany({
      where: { projectId },
      include: {
        recipient: { select: { id: true, name: true, email: true } },
        signatures: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(offers);
  } catch (error) {
    console.error('Get project contract offers error:', error);
    res.status(500).json({ error: 'Failed to get project contract offers' });
  }
});

/**
 * Accept a contract offer
 * POST /smart-contracts/offers/:contractId/accept
 */
router.post('/offers/:contractId/accept', authenticateToken, async (req, res) => {
  try {
    const { contractId } = req.params;
    
    const updatedContract = await smartContractService.acceptContractOffer(contractId, req.user?.id || '');
    
    res.json(updatedContract);
  } catch (error: any) {
    console.error('Accept contract offer error:', error);
    res.status(500).json({ error: error.message || 'Failed to accept contract offer' });
  }
});

/**
 * Reject a contract offer
 * POST /smart-contracts/offers/:contractId/reject
 */
router.post('/offers/:contractId/reject', authenticateToken, async (req, res) => {
  try {
    const { contractId } = req.params;
    const { reason } = req.body;
    
    const updatedContract = await smartContractService.rejectContractOffer(contractId, req.user?.id || '', reason);
    
    res.json(updatedContract);
  } catch (error: any) {
    console.error('Reject contract offer error:', error);
    res.status(500).json({ error: error.message || 'Failed to reject contract offer' });
  }
});

// ============================================================================
// EQUITY CALCULATIONS
// ============================================================================

/**
 * Calculate optimal equity for a contribution
 * POST /smart-contracts/calculate-equity
 */
router.post('/calculate-equity', authenticateToken, async (req, res) => {
  try {
    const { effort, impact, quality, collaboration, projectValue } = req.body;
    
    if (!effort || !impact) {
      return res.status(400).json({ error: 'Effort and impact are required' });
    }

    const calculation = smartContractService.calculateOptimalEquity(
      effort,
      impact,
      quality || 3,
      collaboration || 3,
      projectValue || 0
    );

    res.json(calculation);
  } catch (error) {
    console.error('Calculate equity error:', error);
    res.status(500).json({ error: 'Failed to calculate equity' });
  }
});

/**
 * Get equity calculation history for a user
 * GET /smart-contracts/equity-history/:userId
 */
router.get('/equity-history/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only see their own history unless they're admin
    if (req.user?.id !== userId && !req.user?.role.includes('ADMIN')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const equityHistory = await prisma.capTableEntry.findMany({
      where: {
        holderType: 'USER',
        holderId: userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            summary: true,
            totalValue: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(equityHistory);
  } catch (error) {
    console.error('Get equity history error:', error);
    res.status(500).json({ error: 'Failed to get equity history' });
  }
});

// ============================================================================
// PORTFOLIO INSIGHTS
// ============================================================================

/**
 * Get comprehensive portfolio insights for a user
 * GET /smart-contracts/portfolio-insights/:userId
 */
router.get('/portfolio-insights/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only see their own insights unless they're admin
    if (req.user?.id !== userId && !req.user?.role.includes('ADMIN')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const insights = await smartContractService.getUserPortfolioInsights(userId);
    
    res.json(insights);
  } catch (error) {
    console.error('Get portfolio insights error:', error);
    res.status(500).json({ error: 'Failed to get portfolio insights' });
  }
});

/**
 * Update user portfolio metrics
 * POST /smart-contracts/update-portfolio/:userId
 */
router.post('/update-portfolio/:userId', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const insights = await smartContractService.updateUserPortfolioMetrics(userId);
    
    res.json(insights);
  } catch (error) {
    console.error('Update portfolio metrics error:', error);
    res.status(500).json({ error: 'Failed to update portfolio metrics' });
  }
});

// ============================================================================
// VESTING MANAGEMENT
// ============================================================================

/**
 * Get vesting schedules for a user
 * GET /smart-contracts/vesting/:userId
 */
router.get('/vesting/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only see their own vesting unless they're admin
    if (req.user?.id !== userId && !req.user?.role.includes('ADMIN')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const vestingSchedules = await prisma.equityVesting.findMany({
      where: { beneficiaryId: userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            summary: true
          }
        },
        contract: {
          select: {
            id: true,
            contributionType: true,
            effortRequired: true
          }
        },
        vestingEvents: {
          orderBy: { vestingDate: 'desc' }
        }
      },
      orderBy: { vestingStart: 'desc' }
    });

    res.json(vestingSchedules);
  } catch (error) {
    console.error('Get vesting schedules error:', error);
    res.status(500).json({ error: 'Failed to get vesting schedules' });
  }
});

/**
 * Process vesting events (admin only, typically called by cron job)
 * POST /smart-contracts/process-vesting
 */
router.post('/process-vesting', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await smartContractService.processVestingEvents();
    
    res.json(result);
  } catch (error) {
    console.error('Process vesting events error:', error);
    res.status(500).json({ error: 'Failed to process vesting events' });
  }
});

// ============================================================================
// CONTRACT ANALYTICS
// ============================================================================

/**
 * Get contract analytics for a project
 * GET /smart-contracts/analytics/project/:projectId
 */
router.get('/analytics/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check project access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const hasAccess = project.ownerId === req.user?.id || 
                     project.members.some(m => m.userId === req.user?.id) ||
                     req.user?.role.includes('ADMIN');

    if (!hasAccess) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Get contract statistics
    const [totalOffers, acceptedOffers, pendingOffers, totalEquityGranted] = await Promise.all([
      prisma.contractOffer.count({ where: { projectId } }),
      prisma.contractOffer.count({ where: { projectId, status: 'ACCEPTED' } }),
      prisma.contractOffer.count({ where: { projectId, status: 'PENDING' } }),
      prisma.contractOffer.aggregate({
        where: { projectId, status: 'ACCEPTED' },
        _sum: { equityPercentage: true }
      })
    ]);

    const analytics = {
      totalOffers,
      acceptedOffers,
      pendingOffers,
      totalEquityGranted: totalEquityGranted._sum.equityPercentage || 0,
      acceptanceRate: totalOffers > 0 ? (acceptedOffers / totalOffers) * 100 : 0,
      averageEquityPerContract: acceptedOffers > 0 ? (totalEquityGranted._sum.equityPercentage || 0) / acceptedOffers : 0
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get project contract analytics error:', error);
    res.status(500).json({ error: 'Failed to get contract analytics' });
  }
});

/**
 * Get global contract analytics (admin only)
 * GET /smart-contracts/analytics/global
 */
router.get('/analytics/global', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const [totalContracts, activeContracts, totalEquityGranted, averageEquity] = await Promise.all([
      prisma.contractOffer.count(),
      prisma.contractOffer.count({ where: { status: 'ACCEPTED' } }),
      prisma.contractOffer.aggregate({
        where: { status: 'ACCEPTED' },
        _sum: { equityPercentage: true }
      }),
      prisma.contractOffer.aggregate({
        where: { status: 'ACCEPTED' },
        _avg: { equityPercentage: true }
      })
    ]);

    const analytics = {
      totalContracts,
      activeContracts,
      totalEquityGranted: totalEquityGranted._sum.equityPercentage || 0,
      averageEquity: averageEquity._avg.equityPercentage || 0,
      contractSuccessRate: totalContracts > 0 ? (activeContracts / totalContracts) * 100 : 0
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get global contract analytics error:', error);
    res.status(500).json({ error: 'Failed to get global analytics' });
  }
});

export default router;
