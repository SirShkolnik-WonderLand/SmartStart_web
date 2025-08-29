import express from 'express';
import { prisma } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, account: { select: { role: true } } },
      orderBy: { id: 'desc' },
    });
    const formatted = users.map((u: any) => ({ id: u.id, name: u.name, email: u.email, role: u.account?.role || 'USER' }));
    res.json(formatted);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

export default router;


