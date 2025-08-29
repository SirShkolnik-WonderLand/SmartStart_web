import express from 'express';
import { prisma } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// List cap table entries
router.get('/projects/:projectId/cap', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const entries = await prisma.capTableEntry.findMany({ where: { projectId }, orderBy: { holderType: 'asc' } });
    res.json(entries);
  } catch (error) {
    console.error('List cap entries error:', error);
    res.status(500).json({ error: 'Failed to list cap entries' });
  }
});

// Add cap entry
router.post('/projects/:projectId/cap', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { holderType, holderId, pct, source } = req.body;
    const entry = await prisma.capTableEntry.create({ data: { projectId, holderType, holderId, pct, source } });
    res.status(201).json(entry);
  } catch (error) {
    console.error('Create cap entry error:', error);
    res.status(500).json({ error: 'Failed to create cap entry' });
  }
});

// Update cap entry
router.put('/projects/:projectId/cap/:entryId', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.params as any;
    const { holderType, holderId, pct, source } = req.body;
    const entry = await prisma.capTableEntry.update({ where: { id: entryId }, data: { holderType, holderId, pct, source } });
    res.json(entry);
  } catch (error) {
    console.error('Update cap entry error:', error);
    res.status(500).json({ error: 'Failed to update cap entry' });
  }
});

// Delete cap entry
router.delete('/projects/:projectId/cap/:entryId', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.params as any;
    await prisma.capTableEntry.delete({ where: { id: entryId } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete cap entry error:', error);
    res.status(500).json({ error: 'Failed to delete cap entry' });
  }
});

export default router;


