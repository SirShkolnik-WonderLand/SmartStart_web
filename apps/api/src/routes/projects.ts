import express from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, requireRole(['ADMIN', 'OWNER']), async (req, res) => {
  try {
    const { name, summary } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });
    const project = await prisma.project.create({
      data: {
        name,
        summary,
        ownerId: req.user!.id,
        capEntries: {
          createMany: {
            data: [
              { holderType: 'OWNER', holderId: req.user!.id, pct: 35, source: 'INIT' },
              { holderType: 'ALICE', pct: 20, source: 'INIT' },
              { holderType: 'RESERVE', pct: 45, source: 'INIT' },
            ],
          },
        },
        members: { create: { userId: req.user!.id, role: 'OWNER' } },
      },
      include: { capEntries: true, owner: true, members: true },
    });
    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: req.user!.id } } },
      include: { capEntries: true, owner: true, members: true },
      orderBy: { id: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

router.get('/user', authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: req.user!.id } } },
      include: { capEntries: true, members: true },
    });
    const userProjects = projects.map((project: any) => {
      const userEntry = project.capEntries.find((e: any) => e.holderType === 'USER' && e.holderId === req.user!.id);
      const userMember = project.members.find((m: any) => m.userId === req.user!.id);
      return {
        id: project.id,
        name: project.name,
        description: (project as any).description || 'No description available',
        userRole: userMember?.role || 'MEMBER',
        ownership: userEntry ? userEntry.pct : 0,
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

router.get('/portfolio', authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: req.user!.id } } },
      include: { capEntries: true, members: true },
    });
    const portfolio = projects.map((project: any) => {
      const userEntry = project.capEntries.find((e: any) => e.holderType === 'USER' && e.holderId === req.user!.id);
      return { id: project.id, name: project.name, ownership: userEntry ? userEntry.pct : 0, role: project.members.find((m: any) => m.userId === req.user!.id)?.role };
    });
    res.json({ projects: portfolio });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Failed to get portfolio' });
  }
});

export default router;


