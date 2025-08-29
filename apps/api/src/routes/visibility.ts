import express from 'express';
import { prisma } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get project visibility
router.get('/projects/:projectId/visibility', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const visibility = await prisma.projectVisibility.findUnique({ where: { projectId } });
    res.json(visibility || {});
  } catch (error) {
    console.error('Get visibility error:', error);
    res.status(500).json({ error: 'Failed to get visibility' });
  }
});

// Update project visibility
router.put('/projects/:projectId/visibility', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { capTableHubMasked, tasksHubVisible, ideasHubVisible, pollsHubVisible } = req.body;
    const visibility = await prisma.projectVisibility.upsert({
      where: { projectId },
      update: { capTableHubMasked, tasksHubVisible, ideasHubVisible, pollsHubVisible },
      create: { projectId, capTableHubMasked: !!capTableHubMasked, tasksHubVisible: !!tasksHubVisible, ideasHubVisible: !!ideasHubVisible, pollsHubVisible: !!pollsHubVisible },
    });
    res.json(visibility);
  } catch (error) {
    console.error('Update visibility error:', error);
    res.status(500).json({ error: 'Failed to update visibility' });
  }
});

export default router;


