import express from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Create new project with equity validation
router.post('/', authenticateToken, requireRole(['ADMIN', 'OWNER']), async (req, res) => {
  try {
    const { 
      name, 
      summary,
      category = 'SAAS',
      ownerEquityProposal = 40,
      aliceEquityProposal = 20,
      contributorEquityPool = 25,
      reserveEquity = 15,
      sprintGoals = [],
      marketingStrategy = '',
      launchChannels = []
    } = req.body;
    
    if (!name) return res.status(400).json({ error: 'Project name is required' });

    // Validate equity proposal (business rules from hub_rules.txt)
    if (ownerEquityProposal < 35) {
      return res.status(400).json({ 
        error: 'Owner must retain minimum 35% equity according to AliceSolutions Ventures framework' 
      });
    }

    if (aliceEquityProposal > 25) {
      return res.status(400).json({ 
        error: 'AliceSolutions Ventures cannot exceed 25% equity stake' 
      });
    }

    if (ownerEquityProposal + aliceEquityProposal + contributorEquityPool + reserveEquity !== 100) {
      return res.status(400).json({ 
        error: 'Equity percentages must total 100%' 
      });
    }

    // Create project with enhanced business logic
    const project = await prisma.project.create({
      data: {
        name,
        summary: `${summary} | Category: ${category} | Marketing: ${marketingStrategy} | Channels: ${launchChannels.join(', ')}`,
        ownerId: req.user!.id,
        capEntries: {
          createMany: {
            data: [
              { holderType: 'OWNER', holderId: req.user!.id, pct: ownerEquityProposal, source: 'Project Owner Proposal' },
              { holderType: 'ALICE', pct: aliceEquityProposal, source: 'AliceSolutions Ventures' },
              { holderType: 'RESERVE', pct: reserveEquity, source: 'Future Investors Reserve' },
            ],
          },
        },
        members: { create: { userId: req.user!.id, role: 'OWNER' } },
      },
      include: { capEntries: true, owner: true, members: true },
    });

    // Create 30-day sprint plan
    const sprintDuration = 7; // 7 days per sprint
    const totalSprints = Math.min(sprintGoals.length || 4, 4); // Max 4 sprints

    for (let i = 0; i < totalSprints; i++) {
      const sprintStart = new Date(Date.now() + (i * sprintDuration * 24 * 60 * 60 * 1000));
      const sprintEnd = new Date(sprintStart.getTime() + (sprintDuration * 24 * 60 * 60 * 1000));
      
      await prisma.sprint.create({
        data: {
          projectId: project.id,
          start: sprintStart,
          end: sprintEnd,
          goals: sprintGoals[i] || `Sprint ${i + 1}: ${getSprintPhase(i + 1)} phase`,
          exitCriteria: `Complete ${getSprintPhase(i + 1)} phase objectives`
        }
      });
    }

    res.status(201).json({
      project,
      message: 'Project created with 30-day launch timeline!',
      timeline: {
        totalSprints,
        sprintDuration,
        targetLaunchDate: new Date(Date.now() + (totalSprints * sprintDuration * 24 * 60 * 60 * 1000))
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
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

export default router;


