import express from 'express';
import { prisma } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create task
router.post('/projects/:projectId/tasks', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, type, sprintId, assigneeId } = req.body;
    if (!title || !type) return res.status(400).json({ error: 'title and type required' });
    const task = await prisma.task.create({ data: { projectId, title, type, sprintId, assigneeId } });
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// List tasks
router.get('/projects/:projectId/tasks', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, type, assigneeId } = req.query;
    const where: any = { projectId };
    if (status) where.status = status;
    if (type) where.type = type;
    if (assigneeId) where.assigneeId = assigneeId;
    const tasks = await prisma.task.findMany({ where, orderBy: { id: 'desc' } });
    res.json(tasks);
  } catch (error) {
    console.error('List tasks error:', error);
    res.status(500).json({ error: 'Failed to list tasks' });
  }
});

// Task detail
router.get('/tasks/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true, sprint: true, contributions: true } });
    if (!task) return res.status(404).json({ error: 'Not found' });
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to get task' });
  }
});

// Update task
router.put('/tasks/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, type, status, assigneeId } = req.body;
    const task = await prisma.task.update({ where: { id: taskId }, data: { title, type, status, assigneeId } });
    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/tasks/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    await prisma.task.delete({ where: { id: taskId } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;


