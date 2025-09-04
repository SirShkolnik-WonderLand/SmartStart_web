const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const prisma = new PrismaClient();

// ===== ROLE-BASED DASHBOARD SYSTEM =====

// Get user's role-based dashboard
router.get('/dashboard', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;

        // Get user with roles and permissions
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: true
                            }
                        }
                    }
                },
                profile: true,
                companies: {
                    include: {
                        company: true,
                        role: true
                    }
                },
                teams: {
                    include: {
                        team: {
                            include: {
                                company: true
                            }
                        },
                        role: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Determine user type and primary role
        const userType = determineUserType(user);
        const primaryRole = getPrimaryRole(user.roles);

        // Get role-specific dashboard data
        const dashboardData = await getRoleBasedDashboard(userId, userType, primaryRole, user);

        res.json({
            success: true,
            dashboard: {
                userType,
                primaryRole,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    level: user.level,
                    xp: user.xp,
                    reputation: user.reputation
                },
                data: dashboardData
            }
        });

    } catch (error) {
        console.error('Dashboard retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard',
            error: error.message
        });
    }
});

// Get startup founder dashboard
router.get('/dashboard/founder', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;

        // Verify user is a founder
        const founderRole = await verifyFounderRole(userId);
        if (!founderRole) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Founder role required'
            });
        }

        const dashboardData = await getFounderDashboard(userId);

        res.json({
            success: true,
            dashboard: {
                type: 'FOUNDER',
                data: dashboardData
            }
        });

    } catch (error) {
        console.error('Founder dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve founder dashboard',
            error: error.message
        });
    }
});

// Get team member dashboard
router.get('/dashboard/team-member', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;

        const dashboardData = await getTeamMemberDashboard(userId);

        res.json({
            success: true,
            dashboard: {
                type: 'TEAM_MEMBER',
                data: dashboardData
            }
        });

    } catch (error) {
        console.error('Team member dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve team member dashboard',
            error: error.message
        });
    }
});

// Get company manager dashboard
router.get('/dashboard/manager', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;

        // Verify user is a manager
        const managerRole = await verifyManagerRole(userId);
        if (!managerRole) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Manager role required'
            });
        }

        const dashboardData = await getManagerDashboard(userId);

        res.json({
            success: true,
            dashboard: {
                type: 'MANAGER',
                data: dashboardData
            }
        });

    } catch (error) {
        console.error('Manager dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve manager dashboard',
            error: error.message
        });
    }
});

// Get freelancer dashboard
router.get('/dashboard/freelancer', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;

        const dashboardData = await getFreelancerDashboard(userId);

        res.json({
            success: true,
            dashboard: {
                type: 'FREELANCER',
                data: dashboardData
            }
        });

    } catch (error) {
        console.error('Freelancer dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve freelancer dashboard',
            error: error.message
        });
    }
});

// Helper Functions

function determineUserType(user) {
    const roles = user.roles.map(r => r.role.name);

    if (roles.includes('FOUNDER') || roles.includes('CEO')) {
        return 'FOUNDER';
    } else if (roles.includes('MANAGER') || roles.includes('DIRECTOR')) {
        return 'MANAGER';
    } else if (roles.includes('TEAM_MEMBER') || roles.includes('EMPLOYEE')) {
        return 'TEAM_MEMBER';
    } else if (roles.includes('FREELANCER') || roles.includes('CONSULTANT')) {
        return 'FREELANCER';
    } else {
        return 'GENERAL';
    }
}

function getPrimaryRole(userRoles) {
    const priorityRoles = ['FOUNDER', 'CEO', 'DIRECTOR', 'MANAGER', 'TEAM_MEMBER', 'FREELANCER'];

    for (const priorityRole of priorityRoles) {
        const role = userRoles.find(r => r.role.name === priorityRole);
        if (role) {
            return role.role.name;
        }
    }

    return userRoles[0] ? .role.name || 'USER';
}

async function getRoleBasedDashboard(userId, userType, primaryRole, user) {
    switch (userType) {
        case 'FOUNDER':
            return await getFounderDashboard(userId);
        case 'MANAGER':
            return await getManagerDashboard(userId);
        case 'TEAM_MEMBER':
            return await getTeamMemberDashboard(userId);
        case 'FREELANCER':
            return await getFreelancerDashboard(userId);
        default:
            return await getGeneralDashboard(userId);
    }
}

async function getFounderDashboard(userId) {
    // Get ventures owned by user
    const ventures = await prisma.venture.findMany({
        where: { founderId: userId },
        include: {
            legalEntity: true,
            contracts: {
                where: { status: { in: ['PENDING', 'ACTIVE'] } }
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

    // Get funding pipeline
    const fundingPipeline = await prisma.fundingRound.findMany({
        where: { ventureId: { in: ventures.map(v => v.id) } },
        orderBy: { targetDate: 'asc' }
    });

    // Get market validation metrics
    const marketMetrics = await prisma.ventureMetric.findMany({
        where: { ventureId: { in: ventures.map(v => v.id) } },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    return {
        ventures: {
            total: ventures.length,
            active: ventures.filter(v => v.status === 'ACTIVE').length,
            pending: ventures.filter(v => v.status === 'PENDING').length,
            details: ventures
        },
        funding: {
            pipeline: fundingPipeline,
            totalRaised: fundingPipeline.reduce((sum, round) => sum + (round.amountRaised || 0), 0),
            nextMilestone: fundingPipeline.find(r => r.status === 'PLANNED')
        },
        market: {
            metrics: marketMetrics,
            recentFeedback: await getRecentCustomerFeedback(ventures.map(v => v.id))
        },
        legal: {
            pendingContracts: ventures.reduce((sum, v) => sum + v.contracts.length, 0),
            complianceStatus: await getComplianceStatus(ventures.map(v => v.id))
        }
    };
}

async function getManagerDashboard(userId) {
    // Get companies managed by user
    const managedCompanies = await prisma.companyMember.findMany({
        where: {
            userId,
            role: { in: ['MANAGER', 'DIRECTOR', 'CEO'] }
        },
        include: {
            company: {
                include: {
                    teams: {
                        include: {
                            members: {
                                include: {
                                    user: {
                                        select: { name: true, level: true, xp: true, status: true }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // Get project status
    const projects = await prisma.project.findMany({
        where: {
            companyId: { in: managedCompanies.map(m => m.companyId) }
        },
        include: {
            tasks: true,
            team: true
        }
    });

    // Get team performance metrics
    const teamPerformance = await getTeamPerformanceMetrics(managedCompanies.map(m => m.companyId));

    return {
        companies: {
            total: managedCompanies.length,
            details: managedCompanies
        },
        projects: {
            total: projects.length,
            onTrack: projects.filter(p => p.status === 'ON_TRACK').length,
            behind: projects.filter(p => p.status === 'BEHIND').length,
            completed: projects.filter(p => p.status === 'COMPLETED').length,
            details: projects
        },
        teams: {
            performance: teamPerformance,
            totalMembers: managedCompanies.reduce((sum, m) =>
                sum + m.company.teams.reduce((tSum, t) => tSum + t.members.length, 0), 0
            )
        },
        resources: {
            budget: await getBudgetAllocation(managedCompanies.map(m => m.companyId)),
            allocation: await getResourceAllocation(managedCompanies.map(m => m.companyId))
        }
    };
}

async function getTeamMemberDashboard(userId) {
    // Get user's team memberships
    const teamMemberships = await prisma.teamMember.findMany({
        where: { userId },
        include: {
            team: {
                include: {
                    company: true,
                    projects: {
                        include: {
                            tasks: {
                                where: { assignedTo: userId }
                            }
                        }
                    }
                }
            }
        }
    });

    // Get today's tasks
    const today = new Date();
    const todayTasks = await prisma.task.findMany({
        where: {
            assignedTo: userId,
            dueDate: {
                gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
            }
        },
        include: {
            project: true,
            priority: true
        }
    });

    // Get skill development progress
    const skillProgress = await prisma.userSkill.findMany({
        where: { userId },
        include: { skill: true }
    });

    // Get performance metrics
    const performance = await getUserPerformanceMetrics(userId);

    return {
        teams: {
            total: teamMemberships.length,
            details: teamMemberships
        },
        tasks: {
            today: todayTasks,
            overdue: await getOverdueTasks(userId),
            upcoming: await getUpcomingTasks(userId)
        },
        skills: {
            current: skillProgress,
            development: await getSkillDevelopmentPlan(userId),
            recommendations: await getSkillRecommendations(userId)
        },
        performance: {
            metrics: performance,
            feedback: await getRecentFeedback(userId),
            goals: await getUserGoals(userId)
        }
    };
}

async function getFreelancerDashboard(userId) {
    // Get portfolio projects
    const projects = await prisma.portfolioProject.findMany({
        where: { userId },
        include: {
            client: true,
            feedback: true,
            deliverables: true
        },
        orderBy: { startDate: 'desc' }
    });

    // Get client relationships
    const clients = await prisma.client.findMany({
        where: {
            projects: { some: { userId } }
        },
        include: {
            projects: {
                where: { userId },
                select: { id: true, title: true, status: true, budget: true }
            }
        }
    });

    // Get income tracking
    const income = await getIncomeTracking(userId);

    // Get networking opportunities
    const networking = await getNetworkingOpportunities(userId);

    return {
        portfolio: {
            projects: projects,
            totalProjects: projects.length,
            activeProjects: projects.filter(p => p.isCurrent).length,
            completedProjects: projects.filter(p => !p.isCurrent).length
        },
        clients: {
            total: clients.length,
            active: clients.filter(c => c.projects.some(p => p.isCurrent)).length,
            details: clients
        },
        income: {
            tracking: income,
            totalEarned: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
            monthlyTrend: await getMonthlyIncomeTrend(userId)
        },
        networking: {
            opportunities: networking,
            connections: await getProfessionalConnections(userId),
            events: await getNetworkingEvents(userId)
        }
    };
}

async function getGeneralDashboard(userId) {
    // Basic dashboard for users without specific roles
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            profile: true,
            skills: { include: { skill: true } },
            badges: { include: { badge: true } }
        }
    });

    return {
        profile: user.profile,
        skills: user.skills,
        achievements: user.badges,
        recommendations: await getGeneralRecommendations(userId)
    };
}

// Additional helper functions (implement as needed)
async function verifyFounderRole(userId) {
    const founderRole = await prisma.userRole.findFirst({
        where: {
            userId,
            role: { name: { in: ['FOUNDER', 'CEO'] } }
        }
    });
    return !!founderRole;
}

async function verifyManagerRole(userId) {
    const managerRole = await prisma.userRole.findFirst({
        where: {
            userId,
            role: { name: { in: ['MANAGER', 'DIRECTOR'] } }
        }
    });
    return !!managerRole;
}

// Placeholder functions for additional data (implement based on your schema)
async function getRecentCustomerFeedback(ventureIds) { return []; }
async function getComplianceStatus(ventureIds) { return []; }
async function getTeamPerformanceMetrics(companyIds) { return []; }
async function getBudgetAllocation(companyIds) { return []; }
async function getResourceAllocation(companyIds) { return []; }
async function getOverdueTasks(userId) { return []; }
async function getUpcomingTasks(userId) { return []; }
async function getSkillDevelopmentPlan(userId) { return []; }
async function getSkillRecommendations(userId) { return []; }
async function getUserPerformanceMetrics(userId) { return []; }
async function getRecentFeedback(userId) { return []; }
async function getUserGoals(userId) { return []; }
async function getIncomeTracking(userId) { return []; }
async function getNetworkingOpportunities(userId) { return []; }
async function getProfessionalConnections(userId) { return []; }
async function getNetworkingEvents(userId) { return []; }
async function getMonthlyIncomeTrend(userId) { return []; }
async function getGeneralRecommendations(userId) { return []; }

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Role-Based Dashboard System is healthy',
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /dashboard - Get user role-based dashboard',
            'GET /dashboard/founder - Get startup founder dashboard',
            'GET /dashboard/team-member - Get team member dashboard',
            'GET /dashboard/manager - Get company manager dashboard',
            'GET /dashboard/freelancer - Get freelancer dashboard'
        ]
    });
});

module.exports = router;