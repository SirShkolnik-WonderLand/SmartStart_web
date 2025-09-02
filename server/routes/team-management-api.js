const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===== TEAM MANAGEMENT API =====

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        const stats = {
            teams: await prisma.team.count(),
            teamMembers: await prisma.teamMember.count(),
            teamGoals: await prisma.teamGoal.count(),
            teamMetrics: await prisma.teamMetric.count(),
            teamChannels: await prisma.teamChannel.count()
        };

        res.json({
            success: true,
            message: 'Team Management System is healthy',
            stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Team health check error:', error);
        res.status(500).json({
            success: false,
            message: 'Team health check failed',
            error: error.message
        });
    }
});

// Create a new team
router.post('/create', async (req, res) => {
    try {
        const {
            name,
            companyId,
            parentTeamId,
            purpose,
            description,
            size,
            leadId,
            status = 'ACTIVE',
            isPublic = true,
            settings = {}
        } = req.body;

        // Validate required fields
        if (!name || !companyId || !purpose || !size) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, companyId, purpose, size'
            });
        }

        // Create team using raw SQL to avoid enum type issues
        const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await prisma.$executeRaw`
            INSERT INTO "Team" (
                "id", "name", "companyId", "parentTeamId", "purpose", "description",
                "size", "leadId", "status", "isPublic", "settings",
                "createdAt", "updatedAt"
            ) VALUES (
                ${teamId}, ${name}, ${companyId}, ${parentTeamId}, ${purpose}, ${description},
                ${size}, ${leadId}, ${status}, ${isPublic}, ${JSON.stringify(settings)}::jsonb,
                NOW(), NOW()
            )
        `;

        // Fetch the created team
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                lead: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                parentTeam: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.json({
            success: true,
            message: 'Team created successfully',
            team,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Team creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Team creation failed',
            error: error.message
        });
    }
});

// Get all teams with pagination
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, companyId, status, isPublic } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = {};
        if (companyId) where.companyId = companyId;
        if (status) where.status = status;
        if (isPublic !== undefined) where.isPublic = isPublic === 'true';

        const teams = await prisma.team.findMany({
            where,
            include: {
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                lead: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                parentTeam: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        members: true,
                        childTeams: true,
                        goals: true
                    }
                }
            },
            skip,
            take: parseInt(limit),
            orderBy: {
                createdAt: 'desc'
            }
        });

        const total = await prisma.team.count({ where });

        res.json({
            success: true,
            teams,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Teams fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch teams',
            error: error.message
        });
    }
});

// Get team by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const team = await prisma.team.findUnique({
            where: { id },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                lead: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                parentTeam: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                childTeams: {
                    select: {
                        id: true,
                        name: true,
                        purpose: true,
                        status: true
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                goals: {
                    include: {
                        milestones: true
                    }
                },
                metrics: {
                    orderBy: {
                        effectiveDate: 'desc'
                    },
                    take: 10
                },
                channels: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        res.json({
            success: true,
            team,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Team fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch team',
            error: error.message
        });
    }
});

// Update team
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated
        delete updateData.id;
        delete updateData.createdAt;

        const team = await prisma.team.update({
            where: { id },
            data: updateData,
            include: {
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                lead: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.json({
            success: true,
            message: 'Team updated successfully',
            team,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Team update error:', error);
        res.status(500).json({
            success: false,
            message: 'Team update failed',
            error: error.message
        });
    }
});

// Delete team
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if team has active members or child teams
        const activeMembers = await prisma.teamMember.count({
            where: { teamId: id, isActive: true }
        });

        const childTeams = await prisma.team.count({
            where: { parentTeamId: id, status: 'ACTIVE' }
        });

        if (activeMembers > 0 || childTeams > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete team with active members or child teams'
            });
        }

        await prisma.team.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Team deleted successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Team deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Team deletion failed',
            error: error.message
        });
    }
});

// Get team members
router.get('/:id/members', async (req, res) => {
    try {
        const { id } = req.params;
        const { active = 'true' } = req.query;

        const members = await prisma.teamMember.findMany({
            where: {
                teamId: id,
                isActive: active === 'true'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                joinedAt: 'asc'
            }
        });

        res.json({
            success: true,
            members,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Team members fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch team members',
            error: error.message
        });
    }
});

// Add member to team
router.post('/:id/members', async (req, res) => {
    try {
        const { id: teamId } = req.params;
        const { userId, role = 'MEMBER', permissions = [] } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: userId'
            });
        }

        // Check if user is already a member
        const existingMember = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: {
                    teamId,
                    userId
                }
            }
        });

        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: 'User is already a member of this team'
            });
        }

        const member = await prisma.teamMember.create({
            data: {
                teamId,
                userId,
                role,
                permissions
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.json({
            success: true,
            message: 'Member added to team successfully',
            member,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add member to team',
            error: error.message
        });
    }
});

// Get team goals
router.get('/:id/goals', async (req, res) => {
    try {
        const { id: teamId } = req.params;
        const { status, priority } = req.query;

        const where = { teamId };
        if (status) where.status = status;
        if (priority) where.priority = priority;

        const goals = await prisma.teamGoal.findMany({
            where,
            include: {
                milestones: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            },
            orderBy: {
                targetDate: 'asc'
            }
        });

        res.json({
            success: true,
            goals,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Team goals fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch team goals',
            error: error.message
        });
    }
});

// Create team goal
router.post('/:id/goals', async (req, res) => {
    try {
        const { id: teamId } = req.params;
        const {
            title,
            description,
            status = 'DRAFT',
            priority = 'MEDIUM',
            targetValue,
            unit,
            startDate,
            targetDate
        } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: title'
            });
        }

        const goal = await prisma.teamGoal.create({
            data: {
                teamId,
                title,
                description,
                status,
                priority,
                targetValue,
                unit,
                startDate: startDate ? new Date(startDate) : null,
                targetDate: targetDate ? new Date(targetDate) : null
            }
        });

        res.json({
            success: true,
            message: 'Team goal created successfully',
            goal,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Team goal creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create team goal',
            error: error.message
        });
    }
});

// Get team metrics
router.get('/:id/metrics', async (req, res) => {
    try {
        const { id: teamId } = req.params;
        const { metricType, period, limit = 20 } = req.query;

        const where = { teamId };
        if (metricType) where.metricType = metricType;
        if (period) where.period = period;

        const metrics = await prisma.teamMetric.findMany({
            where,
            orderBy: {
                effectiveDate: 'desc'
            },
            take: parseInt(limit)
        });

        res.json({
            success: true,
            metrics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Team metrics fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch team metrics',
            error: error.message
        });
    }
});

// Add team metric
router.post('/:id/metrics', async (req, res) => {
    try {
        const { id: teamId } = req.params;
        const {
            name,
            value,
            unit,
            metricType,
            description,
            target,
            threshold,
            period,
            effectiveDate
        } = req.body;

        if (!name || !value || !metricType || !period || !effectiveDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, value, metricType, period, effectiveDate'
            });
        }

        const metric = await prisma.teamMetric.create({
            data: {
                teamId,
                name,
                value: parseFloat(value),
                unit,
                metricType,
                description,
                target: target ? parseFloat(target) : null,
                threshold: threshold ? parseFloat(threshold) : null,
                period,
                effectiveDate: new Date(effectiveDate)
            }
        });

        res.json({
            success: true,
            message: 'Team metric added successfully',
            metric,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Team metric creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add team metric',
            error: error.message
        });
    }
});

// Get team analytics
router.get('/:id/analytics', async (req, res) => {
    try {
        const { id: teamId } = req.params;

        // Get team performance metrics
        const performanceMetrics = await prisma.teamMetric.findMany({
            where: {
                teamId,
                metricType: 'PERFORMANCE'
            },
            orderBy: {
                effectiveDate: 'desc'
            },
            take: 10
        });

        // Get team goals progress
        const goals = await prisma.teamGoal.findMany({
            where: { teamId },
            select: {
                status: true,
                progress: true,
                priority: true
            }
        });

        // Calculate analytics
        const totalGoals = goals.length;
        const completedGoals = goals.filter(g => g.status === 'COMPLETED').length;
        const activeGoals = goals.filter(g => g.status === 'ACTIVE').length;
        const averageProgress = goals.length > 0 ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length : 0;

        const analytics = {
            performanceMetrics,
            goals: {
                total: totalGoals,
                completed: completedGoals,
                active: activeGoals,
                averageProgress: Math.round(averageProgress * 100) / 100
            },
            summary: {
                completionRate: totalGoals > 0 ? (completedGoals / totalGoals * 100).toFixed(1) : 0,
                activeRate: totalGoals > 0 ? (activeGoals / totalGoals * 100).toFixed(1) : 0
            }
        };

        res.json({
            success: true,
            analytics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Team analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch team analytics',
            error: error.message
        });
    }
});

// Search teams
router.get('/search/teams', async (req, res) => {
    try {
        const { q, companyId, status, size, limit = 20 } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const where = {
            OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { purpose: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } }
            ]
        };

        if (companyId) where.companyId = companyId;
        if (status) where.status = status;
        if (size) where.size = parseInt(size);

        const teams = await prisma.team.findMany({
            where,
            include: {
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                lead: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        members: true,
                        goals: true
                    }
                }
            },
            take: parseInt(limit),
            orderBy: {
                name: 'asc'
            }
        });

        res.json({
            success: true,
            teams,
            query: q,
            total: teams.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Team search error:', error);
        res.status(500).json({
            success: false,
            message: 'Team search failed',
            error: error.message
        });
    }
});

// ===== TABLE CREATION ENDPOINT =====
router.post('/create-tables', async (req, res) => {
    try {
        console.log('🔨 Creating team management system tables...');

        // Create Team table
        await prisma.$executeRaw `
            CREATE TABLE IF NOT EXISTS "Team" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "companyId" TEXT NOT NULL,
                "parentTeamId" TEXT,
                "purpose" TEXT NOT NULL,
                "description" TEXT,
                "size" INTEGER NOT NULL,
                "leadId" TEXT,
                "status" TEXT NOT NULL DEFAULT 'ACTIVE',
                "isPublic" BOOLEAN NOT NULL DEFAULT true,
                "settings" JSONB,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
            );
        `;

        // Create TeamMember table
        await prisma.$executeRaw `
            CREATE TABLE IF NOT EXISTS "TeamMember" (
                "id" TEXT NOT NULL,
                "teamId" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "role" TEXT NOT NULL DEFAULT 'MEMBER',
                "permissions" TEXT[] NOT NULL DEFAULT '{}',
                "isActive" BOOLEAN NOT NULL DEFAULT true,
                "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "leftAt" TIMESTAMP(3),
                "totalContributions" INTEGER NOT NULL DEFAULT 0,
                "lastContribution" TIMESTAMP(3),
                "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
                "autoAssignmentEnabled" BOOLEAN NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "TeamMember_teamId_userId_key" UNIQUE ("teamId", "userId")
            );
        `;

        // Create TeamGoal table
        await prisma.$executeRaw `
            CREATE TABLE IF NOT EXISTS "TeamGoal" (
                "id" TEXT NOT NULL,
                "teamId" TEXT NOT NULL,
                "title" TEXT NOT NULL,
                "description" TEXT,
                "status" TEXT NOT NULL DEFAULT 'DRAFT',
                "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
                "targetValue" DOUBLE PRECISION,
                "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
                "unit" TEXT,
                "startDate" TIMESTAMP(3),
                "targetDate" TIMESTAMP(3),
                "completedAt" TIMESTAMP(3),
                "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "TeamGoal_pkey" PRIMARY KEY ("id")
            );
        `;

        // Create TeamMilestone table
        await prisma.$executeRaw `
            CREATE TABLE IF NOT EXISTS "TeamMilestone" (
                "id" TEXT NOT NULL,
                "goalId" TEXT NOT NULL,
                "title" TEXT NOT NULL,
                "description" TEXT,
                "targetDate" TIMESTAMP(3) NOT NULL,
                "completedAt" TIMESTAMP(3),
                "isCompleted" BOOLEAN NOT NULL DEFAULT false,
                "order" INTEGER NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "TeamMilestone_pkey" PRIMARY KEY ("id")
            );
        `;

        // Create TeamMetric table
        await prisma.$executeRaw `
            CREATE TABLE IF NOT EXISTS "TeamMetric" (
                "id" TEXT NOT NULL,
                "teamId" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "value" DOUBLE PRECISION NOT NULL,
                "unit" TEXT,
                "metricType" TEXT NOT NULL,
                "description" TEXT,
                "target" DOUBLE PRECISION,
                "threshold" DOUBLE PRECISION,
                "period" TEXT NOT NULL,
                "effectiveDate" TIMESTAMP(3) NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "TeamMetric_pkey" PRIMARY KEY ("id")
            );
        `;

        // Create TeamChannel table
        await prisma.$executeRaw `
            CREATE TABLE IF NOT EXISTS "TeamChannel" (
                "id" TEXT NOT NULL,
                "teamId" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "description" TEXT,
                "channelType" TEXT NOT NULL,
                "isPublic" BOOLEAN NOT NULL DEFAULT true,
                "isArchived" BOOLEAN NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "TeamChannel_pkey" PRIMARY KEY ("id")
            );
        `;

        // Create TeamChannelMember table
        await prisma.$executeRaw `
            CREATE TABLE IF NOT EXISTS "TeamChannelMember" (
                "id" TEXT NOT NULL,
                "channelId" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "isAdmin" BOOLEAN NOT NULL DEFAULT false,
                "isMuted" BOOLEAN NOT NULL DEFAULT false,
                "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "TeamChannelMember_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "TeamChannelMember_channelId_userId_key" UNIQUE ("channelId", "userId")
            );
        `;

        // Create indexes
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "Team_companyId_idx" ON "Team"("companyId");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "Team_parentTeamId_idx" ON "Team"("parentTeamId");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "Team_status_idx" ON "Team"("status");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "Team_isPublic_idx" ON "Team"("isPublic");`;

        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamMember_teamId_idx" ON "TeamMember"("teamId");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamMember_userId_idx" ON "TeamMember"("userId");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamMember_role_idx" ON "TeamMember"("role");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamMember_isActive_idx" ON "TeamMember"("isActive");`;

        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamGoal_teamId_idx" ON "TeamGoal"("teamId");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamGoal_status_idx" ON "TeamGoal"("status");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamGoal_priority_idx" ON "TeamGoal"("priority");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamGoal_targetDate_idx" ON "TeamGoal"("targetDate");`;

        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamMilestone_goalId_idx" ON "TeamMilestone"("goalId");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamMilestone_targetDate_idx" ON "TeamMilestone"("targetDate");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamMilestone_isCompleted_idx" ON "TeamMilestone"("isCompleted");`;

        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamMetric_teamId_idx" ON "TeamMetric"("teamId");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamMetric_metricType_idx" ON "TeamMetric"("metricType");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamMetric_period_idx" ON "TeamMetric"("period");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamMetric_effectiveDate_idx" ON "TeamMetric"("effectiveDate");`;

        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamChannel_teamId_idx" ON "TeamChannel"("teamId");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamChannel_channelType_idx" ON "TeamChannel"("channelType");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamChannel_isPublic_idx" ON "TeamChannel"("isPublic");`;

        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamChannelMember_channelId_idx" ON "TeamChannelMember"("channelId");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamChannelMember_userId_idx" ON "TeamChannelMember"("userId");`;

        res.json({
            success: true,
            message: 'Team management system tables created successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Table creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Table creation failed',
            error: error.message
        });
    }
});

module.exports = router;
