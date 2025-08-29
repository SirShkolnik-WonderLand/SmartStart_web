import express from 'express';
import { prisma } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create sprint
router.post('/projects/:projectId/sprints', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { start, end, goals, exitCriteria } = req.body;
    const sprint = await prisma.sprint.create({ data: { projectId, start: new Date(start), end: new Date(end), goals, exitCriteria } });
    res.status(201).json(sprint);
  } catch (error) {
    console.error('Create sprint error:', error);
    res.status(500).json({ error: 'Failed to create sprint' });
  }
});

// List sprints
router.get('/projects/:projectId/sprints', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const sprints = await prisma.sprint.findMany({ where: { projectId }, orderBy: { start: 'desc' } });
    res.json(sprints);
  } catch (error) {
    console.error('List sprints error:', error);
    res.status(500).json({ error: 'Failed to list sprints' });
  }
});

// Sprint detail
router.get('/sprints/:sprintId', authenticateToken, async (req, res) => {
  try {
    const { sprintId } = req.params;
    const sprint = await prisma.sprint.findUnique({ where: { id: sprintId }, include: { tasks: true } });
    if (!sprint) return res.status(404).json({ error: 'Not found' });
    res.json(sprint);
  } catch (error) {
    console.error('Get sprint error:', error);
    res.status(500).json({ error: 'Failed to get sprint' });
  }
});

// Update sprint
router.put('/sprints/:sprintId', authenticateToken, async (req, res) => {
  try {
    const { sprintId } = req.params;
    const { start, end, goals, exitCriteria } = req.body;
    const sprint = await prisma.sprint.update({ where: { id: sprintId }, data: { start: start ? new Date(start) : undefined, end: end ? new Date(end) : undefined, goals, exitCriteria } });
    res.json(sprint);
  } catch (error) {
    console.error('Update sprint error:', error);
    res.status(500).json({ error: 'Failed to update sprint' });
  }
});

// Delete sprint
router.delete('/sprints/:sprintId', authenticateToken, async (req, res) => {
  try {
    const { sprintId } = req.params;
    await prisma.sprint.delete({ where: { id: sprintId } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete sprint error:', error);
    res.status(500).json({ error: 'Failed to delete sprint' });
  }
});

export default router;


