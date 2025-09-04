const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requirePermission } = require('../middleware/unified-auth');

const prisma = new PrismaClient();

// ===== FUNDING PIPELINE SYSTEM =====

// Get funding pipeline overview
router.get('/pipeline', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get ventures owned by user
        const ventures = await prisma.venture.findMany({
            where: { founderId: userId },
            include: {
                fundingRounds: {
                    orderBy: { targetDate: 'asc' }
                },
                legalEntity: true,
                team: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: { name: true, level: true, xp: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Calculate funding metrics
        const fundingMetrics = calculateFundingMetrics(ventures);
        
        // Get runway analysis
        const runwayAnalysis = await calculateRunwayAnalysis(ventures);

        res.json({
            success: true,
            pipeline: {
                ventures: {
                    total: ventures.length,
                    active: ventures.filter(v => v.status === 'ACTIVE').length,
                    details: ventures
                },
                funding: fundingMetrics,
                runway: runwayAnalysis,
                nextMilestones: getNextMilestones(ventures)
            }
        });

    } catch (error) {
        console.error('Funding pipeline error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve funding pipeline',
            error: error.message
        });
    }
});

// Get specific venture funding details
router.get('/pipeline/venture/:ventureId', authenticateToken, async (req, res) => {
    try {
        const { ventureId } = req.params;
        const userId = req.user.id;

        // Verify ownership
        const venture = await prisma.venture.findFirst({
            where: {
                id: ventureId,
                founderId: userId
            },
            include: {
                fundingRounds: {
                    include: {
                        investors: true,
                        documents: true
                    },
                    orderBy: { targetDate: 'asc' }
                },
                legalEntity: true,
                contracts: {
                    where: { type: 'INVESTMENT' }
                },
                team: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: { name: true, level: true, xp: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!venture) {
            return res.status(404).json({
                success: false,
                message: 'Venture not found or access denied'
            });
        }

        // Get funding timeline
        const fundingTimeline = await getFundingTimeline(ventureId);
        
        // Get investor relationships
        const investorRelationships = await getInvestorRelationships(ventureId);
        
        // Get market validation data
        const marketValidation = await getMarketValidationData(ventureId);

        res.json({
            success: true,
            venture: {
                ...venture,
                funding: {
                    timeline: fundingTimeline,
                    investors: investorRelationships,
                    market: marketValidation
                }
            }
        });

    } catch (error) {
        console.error('Venture funding error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve venture funding details',
            error: error.message
        });
    }
});

// Create new funding round
router.post('/pipeline/venture/:ventureId/rounds', authenticateToken, async (req, res) => {
    try {
        const { ventureId } = req.params;
        const userId = req.user.id;
        const {
            roundType,
            targetAmount,
            minimumAmount,
            targetDate,
            description,
            milestones,
            investorRequirements,
            useOfFunds
        } = req.body;

        // Verify ownership
        const venture = await prisma.venture.findFirst({
            where: {
                id: ventureId,
                founderId: userId
            }
        });

        if (!venture) {
            return res.status(404).json({
                success: false,
                message: 'Venture not found or access denied'
            });
        }

        // Create funding round
        const fundingRound = await prisma.fundingRound.create({
            data: {
                ventureId,
                roundType,
                targetAmount: parseFloat(targetAmount),
                minimumAmount: parseFloat(minimumAmount),
                targetDate: new Date(targetDate),
                description,
                milestones: milestones || [],
                investorRequirements: investorRequirements || [],
                useOfFunds: useOfFunds || [],
                status: 'PLANNED',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Funding round created successfully',
            fundingRound
        });

    } catch (error) {
        console.error('Funding round creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create funding round',
            error: error.message
        });
    }
});

// Update funding round
router.put('/pipeline/venture/:ventureId/rounds/:roundId', authenticateToken, async (req, res) => {
    try {
        const { ventureId, roundId } = req.params;
        const userId = req.user.id;
        const updateData = req.body;

        // Verify ownership
        const venture = await prisma.venture.findFirst({
            where: {
                id: ventureId,
                founderId: userId
            }
        });

        if (!venture) {
            return res.status(404).json({
                success: false,
                message: 'Venture not found or access denied'
            });
        }

        // Update funding round
        const updatedRound = await prisma.fundingRound.update({
            where: { id: roundId },
            data: {
                ...updateData,
                updatedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Funding round updated successfully',
            fundingRound: updatedRound
        });

    } catch (error) {
        console.error('Funding round update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update funding round',
            error: error.message
        });
    }
});

// Track investor interest
router.post('/pipeline/venture/:ventureId/rounds/:roundId/investors', authenticateToken, async (req, res) => {
    try {
        const { ventureId, roundId } = req.params;
        const userId = req.user.id;
        const {
            investorName,
            investorType,
            contactPerson,
            contactEmail,
            interestLevel,
            potentialAmount,
            notes,
            nextFollowUp
        } = req.body;

        // Verify ownership
        const venture = await prisma.venture.findFirst({
            where: {
                id: ventureId,
                founderId: userId
            }
        });

        if (!venture) {
            return res.status(404).json({
                success: false,
                message: 'Venture not found or access denied'
            });
        }

        // Create or update investor interest
        const investorInterest = await prisma.investorInterest.upsert({
            where: {
                ventureId_roundId_investorEmail: {
                    ventureId,
                    roundId,
                    investorEmail: contactEmail
                }
            },
            update: {
                interestLevel,
                potentialAmount: parseFloat(potentialAmount),
                notes,
                nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
                updatedAt: new Date()
            },
            create: {
                ventureId,
                roundId,
                investorName,
                investorType,
                contactPerson,
                contactEmail,
                interestLevel,
                potentialAmount: parseFloat(potentialAmount),
                notes,
                nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Investor interest tracked successfully',
            investorInterest
        });

    } catch (error) {
        console.error('Investor tracking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track investor interest',
            error: error.message
        });
    }
});

// Get runway analysis
router.get('/pipeline/runway', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { ventureId } = req.query;

        let ventures;
        if (ventureId) {
            ventures = await prisma.venture.findMany({
                where: { id: ventureId, founderId: userId }
            });
        } else {
            ventures = await prisma.venture.findMany({
                where: { founderId: userId }
            });
        }

        const runwayAnalysis = await calculateRunwayAnalysis(ventures);

        res.json({
            success: true,
            runway: runwayAnalysis
        });

    } catch (error) {
        console.error('Runway analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate runway analysis',
            error: error.message
        });
    }
});

// Get funding recommendations
router.get('/pipeline/recommendations', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user's ventures
        const ventures = await prisma.venture.findMany({
            where: { founderId: userId },
            include: {
                fundingRounds: true,
                team: true,
                legalEntity: true
            }
        });

        // Generate recommendations
        const recommendations = await generateFundingRecommendations(ventures);

        res.json({
            success: true,
            recommendations
        });

    } catch (error) {
        console.error('Funding recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate funding recommendations',
            error: error.message
        });
    }
});

// Helper Functions

function calculateFundingMetrics(ventures) {
    let totalRaised = 0;
    let totalTarget = 0;
    let activeRounds = 0;
    let completedRounds = 0;

    ventures.forEach(venture => {
        venture.fundingRounds.forEach(round => {
            if (round.status === 'COMPLETED') {
                totalRaised += round.amountRaised || 0;
                completedRounds++;
            } else if (round.status === 'ACTIVE') {
                totalTarget += round.targetAmount || 0;
                activeRounds++;
            }
        });
    });

    return {
        totalRaised,
        totalTarget,
        activeRounds,
        completedRounds,
        averageRoundSize: completedRounds > 0 ? totalRaised / completedRounds : 0
    };
}

async function calculateRunwayAnalysis(ventures) {
    const runwayData = [];

    for (const venture of ventures) {
        // Get monthly burn rate
        const monthlyBurn = await calculateMonthlyBurn(venture.id);
        
        // Get current cash position
        const currentCash = await getCurrentCashPosition(venture.id);
        
        // Calculate runway in months
        const runwayMonths = monthlyBurn > 0 ? currentCash / monthlyBurn : 0;
        
        // Get next funding milestone
        const nextFunding = venture.fundingRounds.find(r => r.status === 'PLANNED');
        
        runwayData.push({
            ventureId: venture.id,
            ventureName: venture.name,
            monthlyBurn,
            currentCash,
            runwayMonths: Math.round(runwayMonths * 100) / 100,
            nextFunding: nextFunding ? {
                amount: nextFunding.targetAmount,
                date: nextFunding.targetDate
            } : null,
            riskLevel: getRunwayRiskLevel(runwayMonths)
        });
    }

    return runwayData;
}

function getNextMilestones(ventures) {
    const milestones = [];

    ventures.forEach(venture => {
        venture.fundingRounds.forEach(round => {
            if (round.status === 'PLANNED') {
                milestones.push({
                    ventureId: venture.id,
                    ventureName: venture.name,
                    roundType: round.roundType,
                    targetAmount: round.targetAmount,
                    targetDate: round.targetDate,
                    daysUntil: Math.ceil((new Date(round.targetDate) - new Date()) / (1000 * 60 * 60 * 24))
                });
            }
        });
    });

    return milestones.sort((a, b) => a.daysUntil - b.daysUntil);
}

async function getFundingTimeline(ventureId) {
    const rounds = await prisma.fundingRound.findMany({
        where: { ventureId },
        orderBy: { targetDate: 'asc' }
    });

    return rounds.map(round => ({
        ...round,
        status: round.status,
        progress: calculateRoundProgress(round)
    }));
}

async function getInvestorRelationships(ventureId) {
    const investors = await prisma.investorInterest.findMany({
        where: { ventureId },
        orderBy: { interestLevel: 'desc' }
    });

    return investors;
}

async function getMarketValidationData(ventureId) {
    // Placeholder for market validation data
    return {
        customerFeedback: [],
        marketMetrics: [],
        competitiveAnalysis: []
    };
}

function calculateRoundProgress(round) {
    if (round.status === 'COMPLETED') return 100;
    if (round.status === 'ACTIVE') {
        return round.amountRaised ? (round.amountRaised / round.targetAmount) * 100 : 0;
    }
    return 0;
}

async function calculateMonthlyBurn(ventureId) {
    // Placeholder for monthly burn calculation
    return 50000; // Example: $50k/month
}

async function getCurrentCashPosition(ventureId) {
    // Placeholder for current cash calculation
    return 200000; // Example: $200k
}

function getRunwayRiskLevel(runwayMonths) {
    if (runwayMonths < 3) return 'CRITICAL';
    if (runwayMonths < 6) return 'HIGH';
    if (runwayMonths < 12) return 'MEDIUM';
    return 'LOW';
}

async function generateFundingRecommendations(ventures) {
    const recommendations = [];

    for (const venture of ventures) {
        // Check if venture needs funding
        const runway = await calculateRunwayAnalysis([venture]);
        const runwayData = runway[0];

        if (runwayData.runwayMonths < 6) {
            recommendations.push({
                type: 'URGENT_FUNDING',
                ventureId: venture.id,
                ventureName: venture.name,
                priority: 'HIGH',
                message: `Urgent funding needed - only ${runwayData.runwayMonths} months of runway remaining`,
                actions: [
                    'Accelerate fundraising efforts',
                    'Consider bridge financing',
                    'Reduce burn rate'
                ]
            });
        }

        // Check team readiness
        if (venture.team && venture.team.members.length < 3) {
            recommendations.push({
                type: 'TEAM_BUILDING',
                ventureId: venture.id,
                ventureName: venture.name,
                priority: 'MEDIUM',
                message: 'Consider building core team before next funding round',
                actions: [
                    'Hire key positions',
                    'Strengthen advisory board',
                    'Develop team capabilities'
                ]
            });
        }

        // Check legal readiness
        if (!venture.legalEntity) {
            recommendations.push({
                type: 'LEGAL_STRUCTURE',
                ventureId: venture.id,
                ventureName: venture.name,
                priority: 'HIGH',
                message: 'Legal structure needed for fundraising',
                actions: [
                    'Incorporate company',
                    'Set up cap table',
                    'Prepare legal documents'
                ]
            });
        }
    }

    return recommendations;
}

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Funding Pipeline System is healthy',
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /pipeline - Get funding pipeline overview',
            'GET /pipeline/venture/:ventureId - Get venture funding details',
            'POST /pipeline/venture/:ventureId/rounds - Create funding round',
            'PUT /pipeline/venture/:ventureId/rounds/:roundId - Update funding round',
            'POST /pipeline/venture/:ventureId/rounds/:roundId/investors - Track investor interest',
            'GET /pipeline/runway - Get runway analysis',
            'GET /pipeline/recommendations - Get funding recommendations'
        ]
    });
});

module.exports = router;
