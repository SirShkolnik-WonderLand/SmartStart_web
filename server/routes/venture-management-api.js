/**
 * Venture Management API Routes
 * Handles venture management, sprints, and Slack integration
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// ===== VENTURE MANAGEMENT =====

// Get venture details
router.get('/:ventureId', authenticateToken, async (req, res) => {
    try {
        const { ventureId } = req.params;
        const userId = req.user.id;

        const venture = await prisma.venture.findUnique({
            where: { id: ventureId },
            include: {
                owner: {
                    select: { id: true, name: true, email: true }
                },
                teamMembers: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                },
                sprints: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                risks: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });

        if (!venture) {
            return res.status(404).json({
                success: false,
                message: 'Venture not found'
            });
        }

        // Check if user has access to this venture
        const hasAccess = venture.ownerUserId === userId || 
                         venture.teamMembers.some(member => member.userId === userId);

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this venture'
            });
        }

        res.json({
            success: true,
            data: venture,
            message: 'Venture details retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching venture:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch venture details',
            error: error.message
        });
    }
});

// ===== SPRINT MANAGEMENT =====

// Get sprints for a venture
router.get('/:ventureId/sprints', authenticateToken, async (req, res) => {
    try {
        const { ventureId } = req.params;
        const { status, limit = 20, offset = 0 } = req.query;

        const whereClause = { ventureId };
        if (status) {
            whereClause.status = status;
        }

        const sprints = await prisma.ventureSprint.findMany({
            where: whereClause,
            include: {
                tasks: {
                    include: {
                        assignee: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset)
        });

        res.json({
            success: true,
            data: sprints,
            message: 'Sprints retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching sprints:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sprints',
            error: error.message
        });
    }
});

// Create sprint
router.post('/:ventureId/sprints', authenticateToken, async (req, res) => {
    try {
        const { ventureId } = req.params;
        const { name, description, startDate, endDate, goals } = req.body;
        const userId = req.user.id;

        const sprint = await prisma.ventureSprint.create({
            data: {
                ventureId,
                name,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                goals: goals || [],
                status: 'PLANNING',
                createdBy: userId
            }
        });

        res.status(201).json({
            success: true,
            data: sprint,
            message: 'Sprint created successfully'
        });
    } catch (error) {
        console.error('Error creating sprint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create sprint',
            error: error.message
        });
    }
});

// ===== RISK MANAGEMENT =====

// Get risks for a venture
router.get('/:ventureId/risks', authenticateToken, async (req, res) => {
    try {
        const { ventureId } = req.params;

        const risks = await prisma.ventureRisk.findMany({
            where: { ventureId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: risks,
            message: 'Risks retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching risks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch risks',
            error: error.message
        });
    }
});

// Create risk
router.post('/:ventureId/risks', authenticateToken, async (req, res) => {
    try {
        const { ventureId } = req.params;
        const { title, description, severity, probability, impact, mitigation } = req.body;
        const userId = req.user.id;

        const risk = await prisma.ventureRisk.create({
            data: {
                ventureId,
                title,
                description,
                severity,
                probability,
                impact,
                mitigation,
                status: 'ACTIVE',
                ownerId: userId
            }
        });

        res.status(201).json({
            success: true,
            data: risk,
            message: 'Risk created successfully'
        });
    } catch (error) {
        console.error('Error creating risk:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create risk',
            error: error.message
        });
    }
});

// ===== SLACK INTEGRATION =====

// Get Slack integration for venture
router.get('/:ventureId/slack', authenticateToken, async (req, res) => {
    try {
        const { ventureId } = req.params;

        const integration = await prisma.integration.findFirst({
            where: {
                ventureId,
                type: 'SLACK'
            }
        });

        res.json({
            success: true,
            data: integration,
            message: 'Slack integration retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching Slack integration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch Slack integration',
            error: error.message
        });
    }
});

// Setup Slack integration
router.post('/:ventureId/slack', authenticateToken, async (req, res) => {
    try {
        const { ventureId } = req.params;
        const { workspaceId, workspaceName, channelId, channelName, botToken, webhookUrl } = req.body;
        const userId = req.user.id;

        const integration = await prisma.integration.upsert({
            where: {
                ventureId_type: {
                    ventureId,
                    type: 'SLACK'
                }
            },
            update: {
                config: {
                    workspaceId,
                    workspaceName,
                    channelId,
                    channelName,
                    botToken,
                    webhookUrl
                },
                status: 'ACTIVE',
                updatedBy: userId
            },
            create: {
                ventureId,
                type: 'SLACK',
                config: {
                    workspaceId,
                    workspaceName,
                    channelId,
                    channelName,
                    botToken,
                    webhookUrl
                },
                status: 'ACTIVE',
                createdBy: userId
            }
        });

        res.status(201).json({
            success: true,
            data: integration,
            message: 'Slack integration setup successfully'
        });
    } catch (error) {
        console.error('Error setting up Slack integration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to setup Slack integration',
            error: error.message
        });
    }
});

// Get Slack messages
router.get('/:ventureId/slack/messages', authenticateToken, async (req, res) => {
    try {
        const { ventureId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const messages = await prisma.message.findMany({
            where: {
                ventureId,
                channel: 'SLACK'
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset)
        });

        res.json({
            success: true,
            data: messages,
            message: 'Slack messages retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching Slack messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch Slack messages',
            error: error.message
        });
    }
});

// ===== VENTURE ANALYTICS =====

// Get venture analytics
router.get('/:ventureId/analytics', authenticateToken, async (req, res) => {
    try {
        const { ventureId } = req.params;

        const [
            totalSprints,
            activeSprints,
            completedSprints,
            totalTasks,
            completedTasks,
            totalRisks,
            activeRisks,
            teamMembers
        ] = await Promise.all([
            prisma.ventureSprint.count({ where: { ventureId } }),
            prisma.ventureSprint.count({ where: { ventureId, status: 'ACTIVE' } }),
            prisma.ventureSprint.count({ where: { ventureId, status: 'COMPLETED' } }),
            prisma.ventureSprintTask.count({ where: { ventureId } }),
            prisma.ventureSprintTask.count({ where: { ventureId, status: 'COMPLETED' } }),
            prisma.ventureRisk.count({ where: { ventureId } }),
            prisma.ventureRisk.count({ where: { ventureId, status: 'ACTIVE' } }),
            prisma.ventureTeamMember.count({ where: { ventureId } })
        ]);

        res.json({
            success: true,
            data: {
                sprints: {
                    total: totalSprints,
                    active: activeSprints,
                    completed: completedSprints
                },
                tasks: {
                    total: totalTasks,
                    completed: completedTasks,
                    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
                },
                risks: {
                    total: totalRisks,
                    active: activeRisks
                },
                team: {
                    members: teamMembers
                }
            },
            message: 'Venture analytics retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching venture analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch venture analytics',
            error: error.message
        });
    }
});

module.exports = router;