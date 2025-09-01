import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get portfolio statistics for a user
router.get('/stats', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Get user's portfolio data
    const user = await prisma.user.findUnique({
      where: { id: userId as string },
      include: {
        projectMemberships: {
          include: {
            project: {
              include: {
                capEntries: true,
                members: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Calculate portfolio statistics
    const activeProjects = user.projectMemberships.filter(m => m.isActive).length;
    const totalValue = user.totalPortfolioValue || 0;
    const totalEquity = user.totalEquityOwned || 0;
    const teamSize = user.projectMemberships.reduce((acc, m) => {
      return acc + (m.project?.members?.length || 0);
    }, 0);

    // Calculate monthly growth (mock for now, would need historical data)
    const monthlyGrowth = 15.2; // This would be calculated from historical data

    const stats = {
      totalValue,
      activeProjects,
      teamSize,
      totalEquity,
      monthlyGrowth,
      totalContributions: user.totalContributions || 0,
      systemHealth: 'GOOD' as const,
      lastUpdated: new Date().toISOString()
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching portfolio stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch portfolio statistics' });
  }
});

// Get user's projects
router.get('/projects', async (req, res) => {
  try {
    const { userId } = req.query;
    
    const user = await prisma.user.findUnique({
      where: { id: userId as string },
      include: {
        projectMemberships: {
          include: {
            project: {
              include: {
                owner: true,
                capEntries: true,
                members: true,
                tasks: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const projects = user.projectMemberships
      .filter(m => m.isActive)
      .map(membership => {
        const project = membership.project;
        if (!project) return null;

        // Calculate progress based on completed tasks
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter(t => t.status === 'DONE').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Get user's equity in this project
        const userEquity = project.capEntries
          .filter(entry => entry.holderId === userId)
          .reduce((sum, entry) => sum + entry.pct, 0);

        // Calculate next milestone (mock for now)
        const nextMilestone = 'Launch v2.0';
        const daysToMilestone = Math.floor(Math.random() * 30) + 1; // Random 1-30 days

        return {
          id: project.id,
          name: project.name,
          summary: project.summary || 'No description available',
          progress,
          equity: userEquity,
          nextMilestone,
          daysToMilestone,
          status: 'ACTIVE' as const, // Would be calculated based on project state
          teamSize: project.members.length,
          totalValue: project.totalValue || 0,
          contractVersion: project.contractVersion,
          equityModel: project.equityModel,
          vestingSchedule: project.vestingSchedule,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
          owner: {
            id: project.owner.id,
            name: project.owner.name || 'Unknown',
            email: project.owner.email
          }
        };
      })
      .filter(Boolean);

    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
});

// Get recent activity
router.get('/activity', async (req, res) => {
  try {
    const { userId, limit = 10 } = req.query;
    
    // Get user's recent activity from multiple sources
    const [contributions, ideas, messages, meshItems] = await Promise.all([
      prisma.contribution.findMany({
        where: { contributorId: userId as string },
        include: { 
          task: { 
            include: { 
              project: true 
            } 
          } 
        },
        orderBy: { id: 'desc' },
        take: Number(limit)
      }),
      prisma.idea.findMany({
        where: { proposerId: userId as string },
        include: { project: true },
        orderBy: { id: 'desc' },
        take: Number(limit)
      }),
      prisma.message.findMany({
        where: { authorId: userId as string },
        include: { project: true },
        orderBy: { id: 'desc' },
        take: Number(limit)
      }),
      prisma.meshItem.findMany({
        where: { authorId: userId as string },
        include: { project: true },
        orderBy: { id: 'desc' },
        take: Number(limit)
      })
    ]);

    // Combine and sort all activities
    const activities = [
      ...contributions.map(c => ({
        id: c.id,
        type: 'EQUITY' as const,
        message: `Contribution submitted for ${c.task?.title || 'Unknown Task'}`,
        timestamp: new Date().toISOString(), // Use current time since createdAt doesn't exist
        projectId: c.task?.projectId,
        projectName: c.task?.project?.name,
        severity: 'SUCCESS' as const,
        userId: c.contributorId,
        userName: 'Contributor'
      })),
      ...ideas.map(i => ({
        id: i.id,
        type: 'MILESTONE' as const,
        message: `New idea proposed: ${i.title}`,
        timestamp: i.createdAt.toISOString(),
        projectId: i.projectId,
        projectName: i.project?.name,
        severity: 'INFO' as const,
        userId: i.proposerId,
        userName: 'Idea Proposer'
      })),
      ...messages.map(m => ({
        id: m.id,
        type: 'TEAM' as const,
        message: `Message posted: ${m.body.substring(0, 50)}...`,
        timestamp: m.createdAt.toISOString(),
        projectId: m.projectId,
        projectName: m.project?.name,
        severity: 'INFO' as const,
        userId: m.authorId,
        userName: 'Team Member'
      })),
      ...meshItems.map(m => ({
        id: m.id,
        type: 'MILESTONE' as const,
        message: `${m.type}: ${m.title}`,
        timestamp: m.createdAt.toISOString(),
        projectId: m.projectId,
        projectName: m.project?.name,
        severity: 'SUCCESS' as const,
        userId: m.authorId,
        userName: 'Team Member'
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, Number(limit));

    res.json({ success: true, data: activities });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recent activity' });
  }
});

export default router;
