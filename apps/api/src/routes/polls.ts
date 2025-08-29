import express from 'express';
import { prisma } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { Permission } from '../services/rbac.js';
import { createPollSchema, voteSchema } from '../validation/schemas.js';

const router = express.Router();

router.post('/', authenticateToken, requirePermission(Permission.POLL_CREATE), async (req, res) => {
  try {
    const parsed = createPollSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { question, type, closesAt, projectId } = parsed.data;
    const poll = await prisma.poll.create({ data: { question, type, closesAt: new Date(closesAt), projectId } });
    res.status(201).json(poll);
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const polls = await prisma.poll.findMany({ include: { votes: true, project: true }, orderBy: { id: 'desc' } });
    res.json(polls);
  } catch (error) {
    console.error('Get polls error:', error);
    res.status(500).json({ error: 'Failed to get polls' });
  }
});

router.post('/:pollId/vote', authenticateToken, requirePermission(Permission.POLL_VOTE), async (req, res) => {
  try {
    const { pollId } = req.params;
    const parsed = voteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { value } = parsed.data;
    const vote = await prisma.pollVote.upsert({
      where: { pollId_voterId: { pollId, voterId: req.user!.id } },
      update: { value },
      create: { pollId, voterId: req.user!.id, value },
    });
    res.json(vote);
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

export default router;


