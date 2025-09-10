/**
 * Venture Management System API Routes
 * 30-Day Launch Timeline, Project Management, and Slack Integration
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const prisma = new PrismaClient();

// ============================================================================
// VENTURE LAUNCH TIMELINE ROUTES
// ============================================================================

/**
 * @route   GET /api/venture-management/:ventureId/timeline
 * @desc    Get venture launch timeline
 * @access  Private (Venture Owner/Team Member)
 */
router.get('/:ventureId/timeline', authenticateToken, async (req, res) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.userId;

    // Check if user has access to venture
    const venture = await prisma.venture.findFirst({
      where: {
        id: ventureId,
        OR: [
          { ownerUserId: userId },
          { teamMembers: { some: { userId: userId } } }
        ]
      }
    });

    if (!venture) {
      return res.status(404).json({
        success: false,
        error: { code: 'VENTURE_NOT_FOUND', message: 'Venture not found or access denied' }
      });
    }

    const timeline = await prisma.ventureLaunchTimeline.findUnique({
      where: { ventureId },
      include: {
        milestones: {
          orderBy: { targetDate: 'asc' }
        },
        dailyCheckins: {
          orderBy: { checkinDate: 'desc' },
          take: 7, // Last 7 days
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: timeline,
      message: 'Timeline retrieved successfully'
    });
  } catch (error) {
    console.error('Timeline fetch error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch timeline' }
    });
  }
});

/**
 * @route   POST /api/venture-management/:ventureId/timeline
 * @desc    Create venture launch timeline
 * @access  Private (Venture Owner)
 */
router.post('/:ventureId/timeline', authenticateToken, requireRole(['VENTURE_OWNER', 'ADMIN']), async (req, res) => {
  try {
    const { ventureId } = req.params;
    const { totalDays = 30, startDate, targetLaunchDate } = req.body;
    const userId = req.user.userId;

    // Check if user owns the venture
    const venture = await prisma.venture.findFirst({
      where: { id: ventureId, ownerUserId: userId }
    });

    if (!venture) {
      return res.status(404).json({
        success: false,
        error: { code: 'VENTURE_NOT_FOUND', message: 'Venture not found or access denied' }
      });
    }

    // Check if timeline already exists
    const existingTimeline = await prisma.ventureLaunchTimeline.findUnique({
      where: { ventureId }
    });

    if (existingTimeline) {
      return res.status(400).json({
        success: false,
        error: { code: 'TIMELINE_EXISTS', message: 'Timeline already exists for this venture' }
      });
    }

    const timeline = await prisma.ventureLaunchTimeline.create({
      data: {
        ventureId,
        totalDays,
        startDate: new Date(startDate),
        targetLaunchDate: new Date(targetLaunchDate),
        currentPhase: 'FOUNDATION',
        progressPercentage: 0.0,
        status: 'ACTIVE'
      }
    });

    // Create default milestones
    const milestones = await createDefaultMilestones(timeline.id, timeline.startDate, timeline.targetLaunchDate);

    res.json({
      success: true,
      data: { ...timeline, milestones },
      message: 'Timeline created successfully'
    });
  } catch (error) {
    console.error('Timeline creation error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create timeline' }
    });
  }
});

/**
 * @route   POST /api/venture-management/:ventureId/timeline/milestones
 * @desc    Create milestone
 * @access  Private (Venture Owner/Team Member)
 */
router.post('/:ventureId/timeline/milestones', authenticateToken, async (req, res) => {
  try {
    const { ventureId } = req.params;
    const { phase, title, description, targetDate, priority = 3, dependencies = [] } = req.body;
    const userId = req.user.userId;

    // Check if user has access to venture
    const venture = await prisma.venture.findFirst({
      where: {
        id: ventureId,
        OR: [
          { ownerUserId: userId },
          { teamMembers: { some: { userId: userId } } }
        ]
      }
    });

    if (!venture) {
      return res.status(404).json({
        success: false,
        error: { code: 'VENTURE_NOT_FOUND', message: 'Venture not found or access denied' }
      });
    }

    const timeline = await prisma.ventureLaunchTimeline.findUnique({
      where: { ventureId }
    });

    if (!timeline) {
      return res.status(404).json({
        success: false,
        error: { code: 'TIMELINE_NOT_FOUND', message: 'Timeline not found for this venture' }
      });
    }

    const milestone = await prisma.ventureMilestone.create({
      data: {
        timelineId: timeline.id,
        phase,
        title,
        description,
        targetDate: new Date(targetDate),
        priority,
        dependencies: dependencies.length > 0 ? dependencies : null
      }
    });

    res.json({
      success: true,
      data: milestone,
      message: 'Milestone created successfully'
    });
  } catch (error) {
    console.error('Milestone creation error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create milestone' }
    });
  }
});

/**
 * @route   PUT /api/venture-management/:ventureId/timeline/milestones/:milestoneId
 * @desc    Update milestone
 * @access  Private (Venture Owner/Team Member)
 */
router.put('/:ventureId/timeline/milestones/:milestoneId', authenticateToken, async (req, res) => {
  try {
    const { ventureId, milestoneId } = req.params;
    const { status, completedDate, title, description, targetDate, priority } = req.body;
    const userId = req.user.userId;

    // Check if user has access to venture
    const venture = await prisma.venture.findFirst({
      where: {
        id: ventureId,
        OR: [
          { ownerUserId: userId },
          { teamMembers: { some: { userId: userId } } }
        ]
      }
    });

    if (!venture) {
      return res.status(404).json({
        success: false,
        error: { code: 'VENTURE_NOT_FOUND', message: 'Venture not found or access denied' }
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (completedDate) updateData.completedDate = new Date(completedDate);
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (targetDate) updateData.targetDate = new Date(targetDate);
    if (priority) updateData.priority = priority;

    const milestone = await prisma.ventureMilestone.update({
      where: { id: milestoneId },
      data: updateData
    });

    // Update timeline progress if milestone was completed
    if (status === 'COMPLETED') {
      await updateTimelineProgress(ventureId);
    }

    res.json({
      success: true,
      data: milestone,
      message: 'Milestone updated successfully'
    });
  } catch (error) {
    console.error('Milestone update error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update milestone' }
    });
  }
});

// ============================================================================
// DAILY CHECK-IN ROUTES
// ============================================================================

/**
 * @route   POST /api/venture-management/:ventureId/checkin
 * @desc    Create daily check-in
 * @access  Private (Venture Team Member)
 */
router.post('/:ventureId/checkin', authenticateToken, async (req, res) => {
  try {
    const { ventureId } = req.params;
    const { status, progressNotes, blockers = [], nextActions = [], moodScore } = req.body;
    const userId = req.user.userId;

    // Check if user has access to venture
    const venture = await prisma.venture.findFirst({
      where: {
        id: ventureId,
        OR: [
          { ownerUserId: userId },
          { teamMembers: { some: { userId: userId } } }
        ]
      }
    });

    if (!venture) {
      return res.status(404).json({
        success: false,
        error: { code: 'VENTURE_NOT_FOUND', message: 'Venture not found or access denied' }
      });
    }

    const checkin = await prisma.ventureDailyCheckin.create({
      data: {
        ventureId,
        userId,
        checkinDate: new Date(),
        status,
        progressNotes,
        blockers,
        nextActions,
        moodScore
      }
    });

    res.json({
      success: true,
      data: checkin,
      message: 'Check-in created successfully'
    });
  } catch (error) {
    console.error('Check-in creation error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create check-in' }
    });
  }
});

// ============================================================================
// SPRINT MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   GET /api/venture-management/:ventureId/sprints
 * @desc    Get venture sprints
 * @access  Private (Venture Team Member)
 */
router.get('/:ventureId/sprints', authenticateToken, async (req, res) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.userId;

    // Check if user has access to venture
    const venture = await prisma.venture.findFirst({
      where: {
        id: ventureId,
        OR: [
          { ownerUserId: userId },
          { teamMembers: { some: { userId: userId } } }
        ]
      }
    });

    if (!venture) {
      return res.status(404).json({
        success: false,
        error: { code: 'VENTURE_NOT_FOUND', message: 'Venture not found or access denied' }
      });
    }

    const sprints = await prisma.ventureSprint.findMany({
      where: { ventureId },
      include: {
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    res.json({
      success: true,
      data: sprints,
      message: 'Sprints retrieved successfully'
    });
  } catch (error) {
    console.error('Sprints fetch error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch sprints' }
    });
  }
});

/**
 * @route   POST /api/venture-management/:ventureId/sprints
 * @desc    Create sprint
 * @access  Private (Venture Owner/Team Member)
 */
router.post('/:ventureId/sprints', authenticateToken, async (req, res) => {
  try {
    const { ventureId } = req.params;
    const { name, description, startDate, endDate, capacityHours = 40 } = req.body;
    const userId = req.user.userId;

    // Check if user has access to venture
    const venture = await prisma.venture.findFirst({
      where: {
        id: ventureId,
        OR: [
          { ownerUserId: userId },
          { teamMembers: { some: { userId: userId } } }
        ]
      }
    });

    if (!venture) {
      return res.status(404).json({
        success: false,
        error: { code: 'VENTURE_NOT_FOUND', message: 'Venture not found or access denied' }
      });
    }

    const sprint = await prisma.ventureSprint.create({
      data: {
        ventureId,
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        capacityHours
      }
    });

    res.json({
      success: true,
      data: sprint,
      message: 'Sprint created successfully'
    });
  } catch (error) {
    console.error('Sprint creation error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create sprint' }
    });
  }
});

// ============================================================================
// TASK MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   POST /api/venture-management/:ventureId/sprints/:sprintId/tasks
 * @desc    Create sprint task
 * @access  Private (Venture Team Member)
 */
router.post('/:ventureId/sprints/:sprintId/tasks', authenticateToken, async (req, res) => {
  try {
    const { ventureId, sprintId } = req.params;
    const { title, description, taskType, priority = 3, storyPoints = 1, assigneeId, estimatedHours } = req.body;
    const userId = req.user.userId;

    // Check if user has access to venture
    const venture = await prisma.venture.findFirst({
      where: {
        id: ventureId,
        OR: [
          { ownerUserId: userId },
          { teamMembers: { some: { userId: userId } } }
        ]
      }
    });

    if (!venture) {
      return res.status(404).json({
        success: false,
        error: { code: 'VENTURE_NOT_FOUND', message: 'Venture not found or access denied' }
      });
    }

    const task = await prisma.ventureSprintTask.create({
      data: {
        sprintId,
        title,
        description,
        taskType,
        priority,
        storyPoints,
        assigneeId,
        estimatedHours
      }
    });

    res.json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create task' }
    });
  }
});

/**
 * @route   PUT /api/venture-management/:ventureId/sprints/:sprintId/tasks/:taskId
 * @desc    Update sprint task
 * @access  Private (Venture Team Member)
 */
router.put('/:ventureId/sprints/:sprintId/tasks/:taskId', authenticateToken, async (req, res) => {
  try {
    const { ventureId, sprintId, taskId } = req.params;
    const { status, assigneeId, actualHours, title, description, priority, storyPoints } = req.body;
    const userId = req.user.userId;

    // Check if user has access to venture
    const venture = await prisma.venture.findFirst({
      where: {
        id: ventureId,
        OR: [
          { ownerUserId: userId },
          { teamMembers: { some: { userId: userId } } }
        ]
      }
    });

    if (!venture) {
      return res.status(404).json({
        success: false,
        error: { code: 'VENTURE_NOT_FOUND', message: 'Venture not found or access denied' }
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (assigneeId) updateData.assigneeId = assigneeId;
    if (actualHours) updateData.actualHours = actualHours;
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (storyPoints) updateData.storyPoints = storyPoints;

    const task = await prisma.ventureSprintTask.update({
      where: { id: taskId },
      data: updateData
    });

    res.json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update task' }
    });
  }
});

// ============================================================================
// RISK MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   GET /api/venture-management/:ventureId/risks
 * @desc    Get venture risks
 * @access  Private (Venture Team Member)
 */
router.get('/:ventureId/risks', authenticateToken, async (req, res) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.userId;

    // Check if user has access to venture
    const venture = await prisma.venture.findFirst({
      where: {
        id: ventureId,
        OR: [
          { ownerUserId: userId },
          { teamMembers: { some: { userId: userId } } }
        ]
      }
    });

    if (!venture) {
      return res.status(404).json({
        success: false,
        error: { code: 'VENTURE_NOT_FOUND', message: 'Venture not found or access denied' }
      });
    }

    const risks = await prisma.ventureRisk.findMany({
      where: { ventureId },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { riskScore: 'desc' }
    });

    res.json({
      success: true,
      data: risks,
      message: 'Risks retrieved successfully'
    });
  } catch (error) {
    console.error('Risks fetch error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch risks' }
    });
  }
});

/**
 * @route   POST /api/venture-management/:ventureId/risks
 * @desc    Create venture risk
 * @access  Private (Venture Team Member)
 */
router.post('/:ventureId/risks', authenticateToken, async (req, res) => {
  try {
    const { ventureId } = req.params;
    const { riskType, title, description, impactLevel, probabilityLevel, mitigationPlan } = req.body;
    const userId = req.user.userId;

    // Check if user has access to venture
    const venture = await prisma.venture.findFirst({
      where: {
        id: ventureId,
        OR: [
          { ownerUserId: userId },
          { teamMembers: { some: { userId: userId } } }
        ]
      }
    });

    if (!venture) {
      return res.status(404).json({
        success: false,
        error: { code: 'VENTURE_NOT_FOUND', message: 'Venture not found or access denied' }
      });
    }

    const riskScore = impactLevel * probabilityLevel;

    const risk = await prisma.ventureRisk.create({
      data: {
        ventureId,
        riskType,
        title,
        description,
        impactLevel,
        probabilityLevel,
        riskScore,
        mitigationPlan,
        ownerId: userId
      }
    });

    res.json({
      success: true,
      data: risk,
      message: 'Risk created successfully'
    });
  } catch (error) {
    console.error('Risk creation error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create risk' }
    });
  }
});

// ============================================================================
// ANALYTICS ROUTES
// ============================================================================

/**
 * @route   GET /api/venture-management/:ventureId/analytics
 * @desc    Get venture analytics
 * @access  Private (Venture Team Member)
 */
router.get('/:ventureId/analytics', authenticateToken, async (req, res) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.userId;

    // Check if user has access to venture
    const venture = await prisma.venture.findFirst({
      where: {
        id: ventureId,
        OR: [
          { ownerUserId: userId },
          { teamMembers: { some: { userId: userId } } }
        ]
      }
    });

    if (!venture) {
      return res.status(404).json({
        success: false,
        error: { code: 'VENTURE_NOT_FOUND', message: 'Venture not found or access denied' }
      });
    }

    // Get analytics data
    const analytics = await prisma.ventureAnalytics.findMany({
      where: { ventureId },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Calculate current metrics
    const currentSprint = await prisma.ventureSprint.findFirst({
      where: { ventureId, status: 'ACTIVE' },
      include: { tasks: true }
    });

    const totalRisks = await prisma.ventureRisk.count({
      where: { ventureId, status: 'OPEN' }
    });

    const highRiskCount = await prisma.ventureRisk.count({
      where: { ventureId, status: 'OPEN', riskScore: { gte: 15 } }
    });

    res.json({
      success: true,
      data: {
        analytics,
        currentSprint,
        riskMetrics: {
          totalRisks,
          highRiskCount,
          riskScore: highRiskCount / Math.max(totalRisks, 1)
        }
      },
      message: 'Analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch analytics' }
    });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function createDefaultMilestones(timelineId, startDate, targetLaunchDate) {
  const milestones = [
    {
      timelineId,
      phase: 'FOUNDATION',
      title: 'Legal Setup & Team Formation',
      description: 'Complete legal documents and form core team',
      targetDate: new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000), // +2 days
      priority: 5
    },
    {
      timelineId,
      phase: 'FOUNDATION',
      title: 'Technical Architecture & Planning',
      description: 'Define technical architecture and create development plan',
      targetDate: new Date(startDate.getTime() + 4 * 24 * 60 * 60 * 1000), // +4 days
      priority: 5
    },
    {
      timelineId,
      phase: 'FOUNDATION',
      title: 'MVP Feature Definition',
      description: 'Define minimum viable product features and requirements',
      targetDate: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000), // +6 days
      priority: 4
    },
    {
      timelineId,
      phase: 'SPRINT_1',
      title: 'Sprint 1: Core Development',
      description: 'Complete core feature development',
      targetDate: new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000), // +14 days
      priority: 5
    },
    {
      timelineId,
      phase: 'SPRINT_2',
      title: 'Sprint 2: Feature Completion',
      description: 'Complete remaining features and integration',
      targetDate: new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000), // +21 days
      priority: 5
    },
    {
      timelineId,
      phase: 'LAUNCH_PREP',
      title: 'Final Testing & Launch Prep',
      description: 'Complete testing, bug fixes, and launch preparation',
      targetDate: new Date(targetLaunchDate),
      priority: 5
    }
  ];

  return await prisma.ventureMilestone.createMany({
    data: milestones
  });
}

async function updateTimelineProgress(ventureId) {
  const timeline = await prisma.ventureLaunchTimeline.findUnique({
    where: { ventureId },
    include: { milestones: true }
  });

  if (!timeline) return;

  const totalMilestones = timeline.milestones.length;
  const completedMilestones = timeline.milestones.filter(m => m.status === 'COMPLETED').length;
  const progressPercentage = (completedMilestones / totalMilestones) * 100;

  // Update current phase based on progress
  let currentPhase = 'FOUNDATION';
  if (progressPercentage >= 50) currentPhase = 'SPRINT_1';
  if (progressPercentage >= 75) currentPhase = 'SPRINT_2';
  if (progressPercentage >= 90) currentPhase = 'LAUNCH_PREP';
  if (progressPercentage >= 100) currentPhase = 'COMPLETED';

  await prisma.ventureLaunchTimeline.update({
    where: { ventureId },
    data: {
      progressPercentage,
      currentPhase,
      status: progressPercentage >= 100 ? 'COMPLETED' : 'ACTIVE'
    }
  });
}

module.exports = router;
