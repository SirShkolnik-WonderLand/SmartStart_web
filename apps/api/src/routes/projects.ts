import express from 'express';
import { prisma } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { Permission } from '../services/rbac.js';

const router = express.Router();

// Get all projects for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Get user's project memberships
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            owner: true,
            submission: true,
            capEntries: {
              where: { holderId: userId }
            }
          }
        }
      }
    });

    // Transform to include ownership percentage
    const projects = memberships.map(membership => ({
      id: membership.project.id,
      name: membership.project.name,
      role: membership.role,
      ownership: membership.equityPercentage || 0,
      project: membership.project
    }));

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// Create new project submission
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const {
      title,
      description,
      category,
      marketSize,
      targetAudience,
      competitiveAdvantage,
      revenueModel,
      estimatedFunding,
      timeline,
      ownerEquityProposal,
      aliceEquityProposal,
      contributorEquityPool,
      reserveEquity,
      marketValidation,
      technicalFeasibility,
      financialProjections,
      sprintGoals,
      keyMilestones,
      successMetrics,
      requiredSkills,
      teamSize,
      timeCommitment,
      marketingStrategy,
      launchChannels,
      pricingStrategy
    } = req.body;

    // Validate equity proposal (business rules from hub_rules.txt)
    if (ownerEquityProposal < 35) {
      return res.status(400).json({ 
        error: 'Owner must retain minimum 35% equity' 
      });
    }

    if (aliceEquityProposal > 25) {
      return res.status(400).json({ 
        error: 'AliceSolutions cannot exceed 25% equity' 
      });
    }

    if (ownerEquityProposal + aliceEquityProposal + contributorEquityPool + reserveEquity !== 100) {
      return res.status(400).json({ 
        error: 'Equity percentages must total 100%' 
      });
    }

    // Create project submission
    const submission = await prisma.projectSubmission.create({
      data: {
        title,
        description,
        category,
        marketSize,
        targetAudience,
        competitiveAdvantage,
        revenueModel,
        estimatedFunding,
        timeline,
        ownerEquityProposal,
        aliceEquityProposal,
        contributorEquityPool,
        reserveEquity,
        marketValidation,
        technicalFeasibility,
        financialProjections,
        sprintGoals,
        keyMilestones,
        successMetrics,
        requiredSkills,
        teamSize,
        timeCommitment,
        marketingStrategy,
        launchChannels,
        pricingStrategy,
        submittedBy: userId,
        status: 'SUBMITTED'
      }
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error('Create project submission error:', error);
    res.status(500).json({ error: 'Failed to create project submission' });
  }
});

// Get project submissions (for review)
router.get('/submissions', authenticateToken, requirePermission(Permission.PROJECT_REVIEW), async (req, res) => {
  try {
    const submissions = await prisma.projectSubmission.findMany({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      include: {
        proposer: true,
        reviewer: true
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

// Review project submission
router.post('/submissions/:id/review', authenticateToken, requirePermission(Permission.PROJECT_REVIEW), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, approvedEquity } = req.body;
    const reviewerId = req.user!.id;

    const submission = await prisma.projectSubmission.findUnique({
      where: { id }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Update submission status
    const updatedSubmission = await prisma.projectSubmission.update({
      where: { id },
      data: {
        status,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        ...(status === 'APPROVED' && { approvedAt: new Date() }),
        ...(status === 'REJECTED' && { rejectedAt: new Date() }),
        ...(status === 'REJECTED' && { rejectionReason: feedback })
      }
    });

    // If approved, create the project and set up initial cap table
    if (status === 'APPROVED') {
      const project = await prisma.project.create({
        data: {
          name: submission.title,
          summary: submission.description,
          ownerId: submission.submittedBy,
          submissionId: submission.id,
          currentSprint: 1,
          totalSprints: 4,
          sprintStartDate: new Date(),
          targetLaunchDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          sprintStatus: 'PLANNING',
          currentPhase: 'DISCOVERY'
        }
      });

      // Create initial cap table entries
      await prisma.capTableEntry.createMany({
        data: [
          {
            projectId: project.id,
            holderType: 'OWNER',
            holderId: submission.submittedBy,
            pct: submission.ownerEquityProposal,
            source: 'Project Owner'
          },
          {
            projectId: project.id,
            holderType: 'ALICE',
            holderId: null, // AliceSolutions
            pct: submission.aliceEquityProposal,
            source: 'AliceSolutions Ventures'
          },
          {
            projectId: project.id,
            holderType: 'RESERVE',
            holderId: null,
            pct: submission.reserveEquity,
            source: 'Future Investors'
          }
        ]
      });

      // Create initial sprint
      await prisma.sprint.create({
        data: {
          projectId: project.id,
          sprintNumber: 1,
          start: new Date(),
          end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          goals: submission.sprintGoals[0] || 'Initial project setup and validation',
          exitCriteria: 'Project structure established, team assembled, first tasks defined'
        }
      });
    }

    res.json(updatedSubmission);
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ error: 'Failed to review submission' });
  }
});

// Get project details with sprint information
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: true,
        submission: true,
        sprints: {
          orderBy: { sprintNumber: 'asc' }
        },
        tasks: {
          include: {
            assignee: true,
            contributions: true
          }
        },
        capEntries: {
          include: {
            project: true
          }
        },
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has access to this project
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: id,
        userId
      }
    });

    if (!membership && project.ownerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// Update project sprint status
router.put('/:id/sprint', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentSprint, sprintStatus, currentPhase } = req.body;
    const userId = req.user!.id;

    // Check if user is project owner or admin
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: true
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const membership = project.members.find(m => m.userId === userId);
    if (project.ownerId !== userId && (!membership || !['ADMIN', 'OWNER'].includes(membership.role))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update project sprint status
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        currentSprint,
        sprintStatus,
        currentPhase,
        ...(sprintStatus === 'ACTIVE' && currentSprint === 1 && { sprintStartDate: new Date() }),
        ...(currentPhase === 'LAUNCH' && { actualLaunchDate: new Date() })
      }
    });

    res.json(updatedProject);
  } catch (error) {
    console.error('Update project sprint error:', error);
    res.status(500).json({ error: 'Failed to update project sprint' });
  }
});

export default router;


