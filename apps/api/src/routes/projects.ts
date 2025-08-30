import express from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { ProjectSubmissionService } from '../services/projectSubmission.js';

const router = express.Router();

// Submit new project with comprehensive validation and 30-day pipeline
router.post('/submit', authenticateToken, requireRole(['ADMIN', 'OWNER']), async (req, res) => {
  try {
    const submissionData = req.body;
    
    if (!submissionData.title) {
      return res.status(400).json({ error: 'Project title is required' });
    }

    // Use ProjectSubmissionService to handle the complete submission process
    const result = await ProjectSubmissionService.submitProject(req.user!.id, submissionData);

    res.status(201).json({
      message: 'Project submitted successfully! It will be reviewed by the team.',
      project: result.project,
      submission: result.submission,
      sprintPlan: result.sprintPlan,
      timeline: result.timeline,
      equityValidation: result.equityValidation
    });
  } catch (error: any) {
    console.error('Project submission error:', error);
    res.status(500).json({ 
      error: 'Failed to submit project',
      details: error.message 
    });
  }
});

// Helper function for sprint phases
function getSprintPhase(sprintNumber: number): string {
  switch (sprintNumber) {
    case 1: return 'DISCOVERY';
    case 2: return 'VALIDATION';
    case 3: return 'BUILD';
    case 4: return 'LAUNCH';
    default: return 'SCALE';
  }
}

// Get all projects for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: req.user!.id } } },
      include: { 
        capEntries: true, 
        owner: true, 
        members: true,
        sprints: {
          orderBy: { start: 'asc' }
        }
      },
      orderBy: { id: 'desc' },
    });

    // Transform to include ownership percentage and sprint info
    const projectsWithDetails = projects.map((project: any) => {
      const userEntry = project.capEntries.find((e: any) => e.holderType === 'USER' && e.holderId === req.user!.id);
      const ownerEntry = project.capEntries.find((e: any) => e.holderType === 'OWNER' && e.holderId === req.user!.id);
      const userMember = project.members.find((m: any) => m.userId === req.user!.id);
      
      const ownership = userEntry?.pct || ownerEntry?.pct || 0;
      
      return {
        id: project.id,
        name: project.name,
        role: userMember?.role || 'MEMBER',
        ownership: ownership,
        project: {
          id: project.id,
          name: project.name,
          summary: project.summary,
          currentSprint: project.sprints?.length || 0,
          totalSprints: 4,
          sprintStatus: project.sprints?.length > 0 ? 'ACTIVE' : 'PLANNING',
          currentPhase: getSprintPhase(project.sprints?.length || 1),
          targetLaunchDate: project.sprints?.length > 0 ? 
            new Date(project.sprints[0].start.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString() : 
            null,
          actualLaunchDate: null
        }
      };
    });

    res.json(projectsWithDetails);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// Get user portfolio
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: req.user!.id } } },
      include: { capEntries: true, members: true },
    });
    const userProjects = projects.map((project: any) => {
      const userEntry = project.capEntries.find((e: any) => e.holderType === 'USER' && e.holderId === req.user!.id);
      const ownerEntry = project.capEntries.find((e: any) => e.holderType === 'OWNER' && e.holderId === req.user!.id);
      const userMember = project.members.find((m: any) => m.userId === req.user!.id);
      return {
        id: project.id,
        name: project.name,
        description: (project as any).description || 'No description available',
        userRole: userMember?.role || 'MEMBER',
        ownership: userEntry ? userEntry.pct : (ownerEntry ? ownerEntry.pct : 0),
        status: (project as any).status?.toLowerCase() || 'active',
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        totalContributions: (project as any).totalContributions || 0,
        estimatedValue: (project as any).estimatedValue || 0,
      };
    });
    res.json({ projects: userProjects });
  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({ error: 'Failed to get user projects' });
  }
});

// Get portfolio data
router.get('/portfolio', authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: req.user!.id } } },
      include: { 
        capEntries: true, 
        members: true,
        tasks: true,
        sprints: true
      },
    });
    
    const portfolio = projects.map((project: any) => {
      const userEntry = project.capEntries.find((e: any) => e.holderType === 'USER' && e.holderId === req.user!.id);
      const ownerEntry = project.capEntries.find((e: any) => e.holderType === 'OWNER' && e.holderId === req.user!.id);
      const userMember = project.members.find((m: any) => m.userId === req.user!.id);
      
      // Calculate completion rate from tasks
      const totalTasks = project.tasks?.length || 0;
      const completedTasks = project.tasks?.filter((t: any) => t.status === 'DONE')?.length || 0;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      // Calculate total value (enhanced with equity-based valuation)
      const userOwnership = userEntry?.pct || ownerEntry?.pct || 0;
      const totalValue = userOwnership * 1000; // Placeholder: 1% = $1000
      
      // Calculate active members
      const activeMembers = project.members?.filter((m: any) => m.isActive === true)?.length || 0;
      
      // Calculate sprint progress
      const currentSprint = project.sprints?.length || 0;
      const sprintProgress = (currentSprint / 4) * 100; // 4 sprints total
      
      return {
        id: project.id,
        name: project.name,
        summary: project.summary || 'No description available',
        ownerId: project.ownerId,
        totalValue: totalValue,
        activeMembers: activeMembers,
        completionRate: completionRate,
        sprintProgress: sprintProgress,
        currentSprint: currentSprint,
        currentPhase: getSprintPhase(currentSprint || 1),
        lastActivity: project.updatedAt,
        userRole: userMember?.role || 'MEMBER',
        userOwnership: userOwnership
      };
    });
    
    res.json({ projects: portfolio });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Failed to get portfolio' });
  }
});

// Get all project submissions (admin only)
router.get('/submissions', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const submissions = await prisma.projectSub.findMany({
      include: {
        project: {
          include: {
            owner: true,
            capEntries: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.json(submissions);
  } catch (error: any) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

// Review a project submission (admin only)
router.post('/submissions/:id/review', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    if (!['APPROVED', 'REJECTED', 'REVISION_REQUESTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be APPROVED, REJECTED, or REVISION_REQUESTED' });
    }

    const submission = await ProjectSubmissionService.reviewSubmission(
      id,
      req.user!.id,
      status,
      reviewNotes
    );

    res.json({
      message: `Project submission ${status.toLowerCase()} successfully`,
      submission
    });
  } catch (error: any) {
    console.error('Review submission error:', error);
    res.status(500).json({ error: 'Failed to review submission' });
  }
});

// Get submission analytics (admin only)
router.get('/analytics/submissions', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const analytics = await ProjectSubmissionService.getSubmissionAnalytics();
    res.json(analytics);
  } catch (error: any) {
    console.error('Get submission analytics error:', error);
    res.status(500).json({ error: 'Failed to get submission analytics' });
  }
});

// Get marketing recommendations for a project category
router.get('/marketing/:category', authenticateToken, async (req, res) => {
  try {
    const { category } = req.params;
    const recommendations = ProjectSubmissionService.getMarketingRecommendations(category);
    res.json(recommendations);
  } catch (error: any) {
    console.error('Get marketing recommendations error:', error);
    res.status(500).json({ error: 'Failed to get marketing recommendations' });
  }
});

// Calculate contribution equity
router.post('/calculate-equity', authenticateToken, async (req, res) => {
  try {
    const { effort, impact, complexity = 3, skillRarity = 3 } = req.body;
    
    if (!effort || !impact) {
      return res.status(400).json({ error: 'Effort and impact are required' });
    }

    const equity = ProjectSubmissionService.calculateContributionEquity(
      effort,
      impact,
      complexity,
      skillRarity
    );

    res.json({ equity, calculation: { effort, impact, complexity, skillRarity } });
  } catch (error: any) {
    console.error('Calculate equity error:', error);
    res.status(500).json({ error: 'Failed to calculate equity' });
  }
});

export default router;


