import express from 'express';
import { prisma } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { body, projectId } = req.body;
    if (!body || typeof body !== 'string') return res.status(400).json({ error: 'Message body is required' });
    const message = await prisma.message.create({
      data: { body, projectId, authorId: req.user!.id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(400).json({ error: 'Failed to create message' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const messages = await prisma.message.findMany({
      include: {
        author: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { id: 'desc' },
    });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;


