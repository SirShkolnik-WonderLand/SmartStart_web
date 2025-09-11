const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// ===== UMBRELLA NETWORK REVENUE SHARING SYSTEM =====

// Calculate revenue share for a venture
router.post('/calculate/:ventureId', authenticateToken, async(req, res) => {
    try {
        const { ventureId } = req.params;
        const {
            totalRevenue,
            calculationPeriod = 'monthly',
            customShares = null
        } = req.body;

        if (!totalRevenue || totalRevenue <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Total revenue must be greater than 0'
            });
        }

        // Get venture details
        const venture = await prisma.venture.findUnique({
            where: { id: ventureId },
            include: {
                team: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                },
                umbrellaNetwork: {
                    include: {
                        revenueSharingRules: true
                    }
                }
            }
        });

        if (!venture) {
            return res.status(404).json({
                success: false,
                error: 'Venture not found'
            });
        }

        // Calculate revenue shares
        const revenueShares = await calculateRevenueShares(
            venture,
            totalRevenue,
            calculationPeriod,
            customShares
        );

        // Create revenue calculation record
        const calculation = await prisma.revenueCalculation.create({
            data: {
                ventureId,
                totalRevenue,
                calculationPeriod,
                calculationDate: new Date(),
                status: 'PENDING',
                metadata: JSON.stringify({
                    customShares,
                    calculatedShares: revenueShares
                })
            }
        });

        res.json({
            success: true,
            data: {
                calculation,
                revenueShares,
                summary: {
                    totalRevenue,
                    totalShares: revenueShares.reduce((sum, share) => sum + share.amount, 0),
                    participantCount: revenueShares.length
                }
            }
        });

    } catch (error) {
        console.error('Error calculating revenue share:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate revenue share'
        });
    }
});

// Execute revenue distribution
router.post('/distribute/:calculationId', authenticateToken, async(req, res) => {
    try {
        const { calculationId } = req.params;
        const {
            distributionMethod = 'AUTOMATIC',
                paymentProcessor = 'STRIPE',
                notes = null
        } = req.body;

        // Get calculation details
        const calculation = await prisma.revenueCalculation.findUnique({
            where: { id: calculationId },
            include: {
                venture: {
                    include: {
                        team: true,
                        umbrellaNetwork: true
                    }
                }
            }
        });

        if (!calculation) {
            return res.status(404).json({
                success: false,
                error: 'Revenue calculation not found'
            });
        }

        if (calculation.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                error: 'Calculation is not in pending status'
            });
        }

        // Parse calculated shares from metadata
        const metadata = JSON.parse(calculation.metadata || '{}');
        const calculatedShares = metadata.calculatedShares || [];

        // Create distribution records
        const distributions = [];
        for (const share of calculatedShares) {
            const distribution = await prisma.revenueDistribution.create({
                data: {
                    calculationId,
                    recipientId: share.recipientId,
                    recipientType: share.recipientType,
                    amount: share.amount,
                    percentage: share.percentage,
                    distributionMethod,
                    paymentProcessor,
                    status: 'PENDING',
                    notes: notes || `Revenue share for ${share.recipientName}`,
                    scheduledAt: new Date()
                }
            });
            distributions.push(distribution);
        }

        // Update calculation status
        await prisma.revenueCalculation.update({
            where: { id: calculationId },
            data: {
                status: 'DISTRIBUTED',
                distributedAt: new Date()
            }
        });

        res.json({
            success: true,
            data: {
                calculation,
                distributions,
                summary: {
                    totalDistributed: distributions.reduce((sum, dist) => sum + dist.amount, 0),
                    distributionCount: distributions.length
                }
            }
        });

    } catch (error) {
        console.error('Error distributing revenue:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to distribute revenue'
        });
    }
});

// Get revenue sharing history for venture
router.get('/history/:ventureId', authenticateToken, async(req, res) => {
    try {
        const { ventureId } = req.params;
        const { page = 1, limit = 20, status } = req.query;

        const whereClause = {
            ventureId,
            ...(status && { status })
        };

        const [calculations, totalCount] = await Promise.all([
            prisma.revenueCalculation.findMany({
                where: whereClause,
                include: {
                    distributions: {
                        include: {
                            recipient: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true
                                }
                            }
                        }
                    }
                },
                orderBy: { calculationDate: 'desc' },
                skip: (page - 1) * limit,
                take: parseInt(limit)
            }),
            prisma.revenueCalculation.count({ where: whereClause })
        ]);

        res.json({
            success: true,
            data: {
                calculations,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount,
                    pages: Math.ceil(totalCount / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching revenue sharing history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch revenue sharing history'
        });
    }
});

// Get user's revenue distributions
router.get('/user/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20, status } = req.query;

        const whereClause = {
            recipientId: userId,
            ...(status && { status })
        };

        const [distributions, totalCount] = await Promise.all([
            prisma.revenueDistribution.findMany({
                where: whereClause,
                include: {
                    calculation: {
                        include: {
                            venture: {
                                select: {
                                    id: true,
                                    name: true,
                                    description: true
                                }
                            }
                        }
                    }
                },
                orderBy: { scheduledAt: 'desc' },
                skip: (page - 1) * limit,
                take: parseInt(limit)
            }),
            prisma.revenueDistribution.count({ where: whereClause })
        ]);

        res.json({
            success: true,
            data: {
                distributions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount,
                    pages: Math.ceil(totalCount / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching user distributions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user distributions'
        });
    }
});

// Update distribution status
router.put('/distribution/:distributionId/status', authenticateToken, async(req, res) => {
    try {
        const { distributionId } = req.params;
        const { status, paymentId, notes } = req.body;

        const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        const distribution = await prisma.revenueDistribution.update({
            where: { id: distributionId },
            data: {
                status,
                paymentId: paymentId || null,
                notes: notes || null,
                updatedAt: new Date(),
                ...(status === 'COMPLETED' && { completedAt: new Date() })
            }
        });

        res.json({
            success: true,
            data: { distribution }
        });

    } catch (error) {
        console.error('Error updating distribution status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update distribution status'
        });
    }
});

// Get revenue sharing analytics
router.get('/analytics', authenticateToken, async(req, res) => {
    try {
        const { ventureId, startDate, endDate } = req.query;

        const whereClause = {
            ...(ventureId && { ventureId }),
            ...(startDate && endDate && {
                calculationDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            })
        };

        const [
            totalCalculations,
            totalRevenue,
            totalDistributed,
            distributionsByStatus,
            topRecipients,
            revenueByPeriod
        ] = await Promise.all([
            prisma.revenueCalculation.count({ where: whereClause }),
            prisma.revenueCalculation.aggregate({
                where: whereClause,
                _sum: { totalRevenue: true }
            }),
            prisma.revenueDistribution.aggregate({
                where: {
                    calculation: whereClause
                },
                _sum: { amount: true }
            }),
            prisma.revenueDistribution.groupBy({
                by: ['status'],
                where: {
                    calculation: whereClause
                },
                _count: { id: true },
                _sum: { amount: true }
            }),
            prisma.revenueDistribution.groupBy({
                by: ['recipientId'],
                where: {
                    calculation: whereClause
                },
                _sum: { amount: true },
                _count: { id: true },
                orderBy: {
                    _sum: {
                        amount: 'desc'
                    }
                },
                take: 10
            }),
            prisma.revenueCalculation.groupBy({
                by: ['calculationPeriod'],
                where: whereClause,
                _sum: { totalRevenue: true },
                _count: { id: true }
            })
        ]);

        res.json({
            success: true,
            data: {
                totalCalculations,
                totalRevenue: totalRevenue._sum.totalRevenue || 0,
                totalDistributed: totalDistributed._sum.amount || 0,
                distributionsByStatus,
                topRecipients,
                revenueByPeriod
            }
        });

    } catch (error) {
        console.error('Error fetching revenue sharing analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch revenue sharing analytics'
        });
    }
});

// ===== HELPER FUNCTIONS =====

async function calculateRevenueShares(venture, totalRevenue, calculationPeriod, customShares) {
    const shares = [];

    // If custom shares are provided, use them
    if (customShares && customShares.length > 0) {
        for (const customShare of customShares) {
            shares.push({
                recipientId: customShare.recipientId,
                recipientType: customShare.recipientType,
                recipientName: customShare.recipientName,
                percentage: customShare.percentage,
                amount: (totalRevenue * customShare.percentage) / 100
            });
        }
        return shares;
    }

    // Get umbrella network revenue sharing rules
    const rules = venture.umbrellaNetwork?.revenueSharingRules || [];

    // Default sharing rules if none exist
    const defaultRules = [
        { role: 'FOUNDER', percentage: 40 },
        { role: 'CO_FOUNDER', percentage: 20 },
        { role: 'SENIOR_MEMBER', percentage: 15 },
        { role: 'MEMBER', percentage: 10 },
        { role: 'UMBRELLA_NETWORK', percentage: 15 }
    ];

    const sharingRules = rules.length > 0 ? rules : defaultRules;

    // Calculate shares based on team roles
    for (const member of venture.team) {
        const rule = sharingRules.find(r => r.role === member.role);
        if (rule) {
            shares.push({
                recipientId: member.userId,
                recipientType: 'TEAM_MEMBER',
                recipientName: `${member.user.firstName} ${member.user.lastName}`,
                percentage: rule.percentage,
                amount: (totalRevenue * rule.percentage) / 100
            });
        }
    }

    // Add umbrella network share if applicable
    const umbrellaRule = sharingRules.find(r => r.role === 'UMBRELLA_NETWORK');
    if (umbrellaRule && venture.umbrellaNetwork) {
        shares.push({
            recipientId: venture.umbrellaNetwork.id,
            recipientType: 'UMBRELLA_NETWORK',
            recipientName: venture.umbrellaNetwork.name,
            percentage: umbrellaRule.percentage,
            amount: (totalRevenue * umbrellaRule.percentage) / 100
        });
    }

    return shares;
}

module.exports = router;