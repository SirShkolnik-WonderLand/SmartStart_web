import express from 'express';
import { prisma } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { Permission } from '../services/rbac.js';
import { createIdeaSchema, updateIdeaSchema } from '../validation/schemas.js';

const router = express.Router();

router.post('/', authenticateToken, requirePermission(Permission.IDEA_CREATE), async (req, res) => {
  try {
    const parsed = createIdeaSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { title, body, projectId } = parsed.data;
    if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });
    const idea = await prisma.idea.create({
      data: { title, body, projectId, proposerId: req.user!.id, status: 'BACKLOG' },
      include: { proposer: true, project: true },
    });
    res.status(201).json(idea);
  } catch (error) {
    console.error('Create idea error:', error);
    res.status(500).json({ error: 'Failed to create idea' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const ideas = await prisma.idea.findMany({ include: { proposer: true, project: true }, orderBy: { id: 'desc' } });
    res.json(ideas);
  } catch (error) {
    console.error('Get ideas error:', error);
    res.status(500).json({ error: 'Failed to get ideas' });
  }
});

router.put('/:ideaId', authenticateToken, requirePermission(Permission.IDEA_UPDATE), async (req, res) => {
  try {
    const { ideaId } = req.params;
    const parsed = updateIdeaSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const updated = await prisma.idea.update({ where: { id: ideaId }, data: parsed.data });
    res.json(updated);
  } catch (error) {
    console.error('Update idea error:', error);
    res.status(500).json({ error: 'Failed to update idea' });
  }
});

export default router;


