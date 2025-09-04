const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const prisma = new PrismaClient();

// ===== TASK MANAGEMENT SYSTEM =====

// Get user's tasks
router.get('/tasks', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;
        const { status, priority, projectId, dueDate } = req.query;

        // Build where clause
        const whereClause = { assignedTo: userId };
        if (status) whereClause.status = status;
        if (priority) whereClause.priority = priority;
        if (projectId) whereClause.projectId = projectId;
        if (dueDate) {
            const date = new Date(dueDate);
            whereClause.dueDate = {
                gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
            };
        }

        const tasks = await prisma.task.findMany({
            where: whereClause,
            include: {
                project: {
                    include: {
                        company: true,
                        team: true
                    }
                },
                priority: true,
                status: true,
                assignedBy: {
                    select: { name: true, email: true }
                },
                dependencies: {
                    include: {
                        task: {
                            select: { id: true, title: true, status: true }
                        }
                    }
                },
                subtasks: {
                    include: {
                        assignedTo: {
                            select: { name: true, email: true }
                        }
                    }
                }
            },
            orderBy: [
                { priority: 'desc' },
                { dueDate: 'asc' },
                { createdAt: 'desc' }
            ]
        });

        res.json({
            success: true,
            tasks: {
                total: tasks.length,
                byStatus: groupTasksByStatus(tasks),
                byPriority: groupTasksByPriority(tasks),
                byProject: groupTasksByProject(tasks),
                details: tasks
            }
        });

    } catch (error) {
        console.error('Task retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve tasks',
            error: error.message
        });
    }
});

// Get today's tasks
router.get('/tasks/today', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;
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
                project: {
                    include: {
                        company: true,
                        team: true
                    }
                },
                priority: true,
                status: true
            },
            orderBy: [
                { priority: 'desc' },
                { dueDate: 'asc' }
            ]
        });

        const overdueTasks = await prisma.task.findMany({
            where: {
                assignedTo: userId,
                dueDate: { lt: new Date(today.getFullYear(), today.getMonth(), today.getDate()) },
                status: { notIn: ['COMPLETED', 'CANCELLED'] }
            },
            include: {
                project: {
                    include: {
                        company: true,
                        team: true
                    }
                },
                priority: true,
                status: true
            },
            orderBy: { dueDate: 'asc' }
        });

        res.json({
            success: true,
            today: {
                tasks: todayTasks,
                total: todayTasks.length,
                completed: todayTasks.filter(t => t.status === 'COMPLETED').length,
                pending: todayTasks.filter(t => t.status !== 'COMPLETED').length
            },
            overdue: {
                tasks: overdueTasks,
                total: overdueTasks.length,
                critical: overdueTasks.filter(t => t.priority === 'CRITICAL').length
            }
        });

    } catch (error) {
        console.error('Today tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve today\'s tasks',
            error: error.message
        });
    }
});

// Get upcoming tasks
router.get('/tasks/upcoming', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;
        const { days = 7 } = req.query;

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + parseInt(days));

        const upcomingTasks = await prisma.task.findMany({
            where: {
                assignedTo: userId,
                dueDate: {
                    gte: new Date(),
                    lte: endDate
                },
                status: { notIn: ['COMPLETED', 'CANCELLED'] }
            },
            include: {
                project: {
                    include: {
                        company: true,
                        team: true
                    }
                },
                priority: true,
                status: true
            },
            orderBy: { dueDate: 'asc' }
        });

        res.json({
            success: true,
            upcoming: {
                tasks: upcomingTasks,
                total: upcomingTasks.length,
                byDay: groupTasksByDay(upcomingTasks),
                critical: upcomingTasks.filter(t => t.priority === 'CRITICAL').length
            }
        });

    } catch (error) {
        console.error('Upcoming tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve upcoming tasks',
            error: error.message
        });
    }
});

// Update task status
router.put('/tasks/:taskId/status', authenticateToken, async(req, res) => {
    try {
        const { taskId } = req.params;
        const { status, notes, completionTime } = req.body;
        const userId = req.user.id;

        // Verify task assignment
        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                assignedTo: userId
            }
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or not assigned to you'
            });
        }

        // Update task status
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                status,
                notes: notes || task.notes,
                completedAt: status === 'COMPLETED' ? new Date() : null,
                completionTime: status === 'COMPLETED' ? completionTime || null : null,
                updatedAt: new Date()
            },
            include: {
                project: true,
                priority: true,
                status: true
            }
        });

        // Log task completion for XP
        if (status === 'COMPLETED' && task.status !== 'COMPLETED') {
            await logTaskCompletion(userId, taskId, task.priority);
        }

        res.json({
            success: true,
            message: 'Task status updated successfully',
            task: updatedTask
        });

    } catch (error) {
        console.error('Task status update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task status',
            error: error.message
        });
    }
});

// Add task notes
router.post('/tasks/:taskId/notes', authenticateToken, async(req, res) => {
    try {
        const { taskId } = req.params;
        const { note, isPrivate } = req.body;
        const userId = req.user.id;

        // Verify task assignment
        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                assignedTo: userId
            }
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or not assigned to you'
            });
        }

        // Add task note
        const taskNote = await prisma.taskNote.create({
            data: {
                taskId,
                userId,
                note,
                isPrivate: isPrivate || false,
                createdAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Note added successfully',
            note: taskNote
        });

    } catch (error) {
        console.error('Task note error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add task note',
            error: error.message
        });
    }
});

// Get task performance metrics
router.get('/tasks/performance', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;
        const { period = 'month' } = req.query;

        const startDate = getStartDate(period);
        const endDate = new Date();

        // Get completed tasks in period
        const completedTasks = await prisma.task.findMany({
            where: {
                assignedTo: userId,
                status: 'COMPLETED',
                completedAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                priority: true,
                project: true
            }
        });

        // Get overdue tasks
        const overdueTasks = await prisma.task.findMany({
            where: {
                assignedTo: userId,
                dueDate: { lt: new Date() },
                status: { notIn: ['COMPLETED', 'CANCELLED'] }
            }
        });

        // Calculate metrics
        const totalTasks = completedTasks.length;
        const onTimeTasks = completedTasks.filter(t =>
            t.completedAt <= t.dueDate
        ).length;
        const lateTasks = totalTasks - onTimeTasks;
        const onTimeRate = totalTasks > 0 ? (onTimeTasks / totalTasks) * 100 : 0;

        // Calculate average completion time
        const avgCompletionTime = completedTasks.length > 0 ?
            completedTasks.reduce((sum, t) => sum + (t.completionTime || 0), 0) / completedTasks.length : 0;

        // Get performance by priority
        const performanceByPriority = calculatePerformanceByPriority(completedTasks);

        // Get performance by project
        const performanceByProject = calculatePerformanceByProject(completedTasks);

        res.json({
            success: true,
            performance: {
                period,
                overview: {
                    totalCompleted: totalTasks,
                    onTime: onTimeTasks,
                    late: lateTasks,
                    onTimeRate: Math.round(onTimeRate * 100) / 100,
                    averageCompletionTime: Math.round(avgCompletionTime * 100) / 100
                },
                overdue: {
                    total: overdueTasks.length,
                    critical: overdueTasks.filter(t => t.priority === 'CRITICAL').length
                },
                byPriority: performanceByPriority,
                byProject: performanceByProject,
                trends: await getPerformanceTrends(userId, period)
            }
        });

    } catch (error) {
        console.error('Performance metrics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve performance metrics',
            error: error.message
        });
    }
});

// Get task recommendations
router.get('/tasks/recommendations', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;

        // Get user's skills and preferences
        const userSkills = await prisma.userSkill.findMany({
            where: { userId },
            include: { skill: true }
        });

        // Get available tasks that match user skills
        const recommendedTasks = await prisma.task.findMany({
            where: {
                status: 'OPEN',
                assignedTo: null,
                project: {
                    requiredSkills: {
                        some: {
                            skillId: { in: userSkills.map(s => s.skillId) }
                        }
                    }
                }
            },
            include: {
                project: {
                    include: {
                        company: true,
                        team: true,
                        requiredSkills: {
                            include: { skill: true }
                        }
                    }
                },
                priority: true
            },
            orderBy: [
                { priority: 'desc' },
                { dueDate: 'asc' }
            ],
            take: 10
        });

        // Get skill development opportunities
        const skillOpportunities = await getSkillDevelopmentOpportunities(userId);

        res.json({
            success: true,
            recommendations: {
                tasks: recommendedTasks,
                skillOpportunities,
                totalRecommendations: recommendedTasks.length + skillOpportunities.length
            }
        });

    } catch (error) {
        console.error('Task recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve task recommendations',
            error: error.message
        });
    }
});

// Helper Functions

function groupTasksByStatus(tasks) {
    return tasks.reduce((acc, task) => {
        const status = task.status || 'UNKNOWN';
        if (!acc[status]) acc[status] = [];
        acc[status].push(task);
        return acc;
    }, {});
}

function groupTasksByPriority(tasks) {
    return tasks.reduce((acc, task) => {
        const priority = task.priority || 'MEDIUM';
        if (!acc[priority]) acc[priority] = [];
        acc[priority].push(task);
        return acc;
    }, {});
}

function groupTasksByProject(tasks) {
    return tasks.reduce((acc, task) => {
        const projectId = task.projectId || 'NO_PROJECT';
        if (!acc[projectId]) acc[projectId] = [];
        acc[projectId].push(task);
        return acc;
    }, {});
}

function groupTasksByDay(tasks) {
    return tasks.reduce((acc, task) => {
        const day = task.dueDate.toISOString().split('T')[0];
        if (!acc[day]) acc[day] = [];
        acc[day].push(task);
        return acc;
    }, {});
}

function getStartDate(period) {
    const date = new Date();
    switch (period) {
        case 'week':
            date.setDate(date.getDate() - 7);
            break;
        case 'month':
            date.setMonth(date.getMonth() - 1);
            break;
        case 'quarter':
            date.setMonth(date.getMonth() - 3);
            break;
        case 'year':
            date.setFullYear(date.getFullYear() - 1);
            break;
        default:
            date.setMonth(date.getMonth() - 1);
    }
    return date;
}

function calculatePerformanceByPriority(tasks) {
    const priorityGroups = {};

    tasks.forEach(task => {
        const priority = task.priority || 'MEDIUM';
        if (!priorityGroups[priority]) {
            priorityGroups[priority] = { total: 0, onTime: 0, late: 0 };
        }

        priorityGroups[priority].total++;
        if (task.completedAt <= task.dueDate) {
            priorityGroups[priority].onTime++;
        } else {
            priorityGroups[priority].late++;
        }
    });

    // Calculate percentages
    Object.keys(priorityGroups).forEach(priority => {
        const group = priorityGroups[priority];
        group.onTimeRate = group.total > 0 ? (group.onTime / group.total) * 100 : 0;
    });

    return priorityGroups;
}

function calculatePerformanceByProject(tasks) {
    const projectGroups = {};

    tasks.forEach(task => {
        const projectId = task.projectId || 'NO_PROJECT';
        if (!projectGroups[projectId]) {
            projectGroups[projectId] = {
                total: 0,
                onTime: 0,
                late: 0,
                projectName: task.project ? .name || 'Unknown Project'
            };
        }

        projectGroups[projectId].total++;
        if (task.completedAt <= task.dueDate) {
            projectGroups[projectId].onTime++;
        } else {
            projectGroups[projectId].late++;
        }
    });

    // Calculate percentages
    Object.keys(projectGroups).forEach(projectId => {
        const group = projectGroups[projectId];
        group.onTimeRate = group.total > 0 ? (group.onTime / group.total) * 100 : 0;
    });

    return projectGroups;
}

async function logTaskCompletion(userId, taskId, priority) {
    try {
        // Calculate XP based on priority
        const xpRewards = {
            'LOW': 10,
            'MEDIUM': 25,
            'HIGH': 50,
            'CRITICAL': 100
        };

        const xpEarned = xpRewards[priority] || 25;

        // Log XP
        await prisma.userXPLog.create({
            data: {
                userId,
                xpEarned,
                source: 'TASK_COMPLETION',
                category: 'PRODUCTIVITY',
                description: `Completed task ${taskId}`,
                earnedAt: new Date()
            }
        });

        // Update user XP
        await prisma.user.update({
            where: { id: userId },
            data: {
                xp: { increment: xpEarned }
            }
        });

    } catch (error) {
        console.error('Error logging task completion:', error);
    }
}

async function getPerformanceTrends(userId, period) {
    // Placeholder for performance trends
    return [];
}

async function getSkillDevelopmentOpportunities(userId) {
    // Placeholder for skill development opportunities
    return [];
}

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Task Management System is healthy',
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /tasks - Get user tasks',
            'GET /tasks/today - Get today\'s tasks',
            'GET /tasks/upcoming - Get upcoming tasks',
            'PUT /tasks/:taskId/status - Update task status',
            'POST /tasks/:taskId/notes - Add task notes',
            'GET /tasks/performance - Get performance metrics',
            'GET /tasks/recommendations - Get task recommendations'
        ]
    });
});

module.exports = router;