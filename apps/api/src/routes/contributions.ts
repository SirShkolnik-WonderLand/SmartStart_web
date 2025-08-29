import express from 'express';
import { ContributionStatus } from '@prisma/client';
import { prisma } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAnyPermission, requirePermission } from '../middleware/rbac.js';
import { Permission } from '../services/rbac.js';
import { proposeContributionSchema, acceptContributionSchema, counterContributionSchema } from '../validation/schemas.js';

const router = express.Router();

// Propose contribution
router.post('/', authenticateToken, requirePermission(Permission.CONTRIBUTION_CREATE), async (req, res) => {
  try {
    const parsed = proposeContributionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { taskId, effort, impact, proposedPct } = parsed.data;
    const contribution = await prisma.contribution.create({
      data: {
        taskId,
        contributorId: req.user!.id,
        effort,
        impact,
        proposedPct,
        status: 'PENDING',
      },
    });
    res.status(201).json(contribution);
  } catch (error) {
    console.error('Create contribution error:', error);
    res.status(500).json({ error: 'Failed to create contribution' });
  }
});

// List contributions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { projectId, taskId, contributorId, status } = req.query;
    const where: any = {};
    if (taskId) where.taskId = taskId;
    if (contributorId) where.contributorId = contributorId;
    if (status) where.status = status;
    if (projectId) where.task = { projectId };
    const contributions = await prisma.contribution.findMany({
      where,
      include: { task: { include: { project: true } }, contributor: true },
      orderBy: { id: 'desc' },
    });
    res.json(contributions);
  } catch (error) {
    console.error('List contributions error:', error);
    res.status(500).json({ error: 'Failed to list contributions' });
  }
});

// Accept contribution (owner)
router.put('/:id/accept', authenticateToken, requirePermission(Permission.CONTRIBUTION_APPROVE), async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = acceptContributionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { finalPct } = parsed.data;
    const existing = await prisma.contribution.findUnique({ where: { id }, include: { task: true } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    // Note: project-level ownership checks should be enforced via RBAC middleware later
    const updated = await prisma.contribution.update({
      where: { id },
      data: { status: ContributionStatus.APPROVED, finalPct, acceptedAt: new Date(), acceptedById: req.user!.id },
    });
    res.json(updated);
  } catch (error) {
    console.error('Accept contribution error:', error);
    res.status(500).json({ error: 'Failed to accept contribution' });
  }
});

// Counter-offer
router.put('/:id/counter', authenticateToken, requireAnyPermission([Permission.CONTRIBUTION_APPROVE, Permission.CONTRIBUTION_UPDATE]), async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = counterContributionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { finalPct } = parsed.data;
    const updated = await prisma.contribution.update({
      where: { id },
      data: { finalPct },
    });
    res.json(updated);
  } catch (error) {
    console.error('Counter contribution error:', error);
    res.status(500).json({ error: 'Failed to counter contribution' });
  }
});

// Reject
router.put('/:id/reject', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.contribution.update({ where: { id }, data: { status: ContributionStatus.REJECTED } });
    res.json(updated);
  } catch (error) {
    console.error('Reject contribution error:', error);
    res.status(500).json({ error: 'Failed to reject contribution' });
  }
});

export default router;


