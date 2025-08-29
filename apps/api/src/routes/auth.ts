import express from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../db.js';
import { AuthService } from '../services/auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later'
});

router.post('/signup', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const user = await AuthService.createUser(email, password, name);
    if (!user.account) {
      return res.status(500).json({ error: 'Failed to create user account' });
    }
    const token = AuthService.generateToken(user.id, user.email, user.account.role);
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.account.role },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = await AuthService.login(email, password);
    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const rbacInsights = await getRBACInsights(result.user.id, result.user.role);
    res.json({
      ...result,
      rbacInsights,
      loginTime: new Date().toISOString(),
      sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { account: true } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.account) return res.status(500).json({ error: 'User account not found' });
    res.json({ id: user.id, email: user.email, name: user.name, role: user.account.role });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.get('/rbac-insights/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = req.user as any;
    if (user.id !== userId && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const insights = await getRBACInsights(userId, user.role);
    if (!insights) return res.status(404).json({ error: 'User not found' });
    res.json(insights);
  } catch (error) {
    console.error('RBAC insights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function getRBACInsights(userId: string, role: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projectMemberships: { include: { project: { select: { id: true, name: true, capEntries: { select: { holderType: true, pct: true } } } } } },
        contributions: { include: { task: { select: { project: { select: { id: true, name: true } } } } } },
      },
    });
    if (!user) return null;
    const insights: any = {
      role,
      projectCount: user.projectMemberships.length,
      totalContributions: user.contributions.length,
      portfolioValue: 0,
      recentActivity: [],
      permissions: await getRolePermissions(role),
      projectAccess: user.projectMemberships.map((m: any) => ({
        projectId: m.project.id,
        projectName: m.project.name,
        role: m.role,
        ownership: m.project.capEntries
          .filter((e: any) => e.holderType === 'USER' && (e as any).holderId === userId)
          .reduce((sum: number, e: any) => sum + e.pct, 0),
      })),
    };
    insights.portfolioValue = insights.projectAccess.reduce((sum: number, p: any) => sum + p.ownership, 0);
    return insights;
  } catch (error) {
    console.error('RBAC insights error:', error);
    return null;
  }
}

async function getRolePermissions(role: string) {
  const permissionMap: Record<string, string[]> = {
    SUPER_ADMIN: ['ALL_PERMISSIONS'],
    ADMIN: ['USER_MANAGEMENT', 'PROJECT_OVERSIGHT', 'SYSTEM_CONFIG', 'AUDIT_ACCESS'],
    OWNER: ['PROJECT_MANAGEMENT', 'CAP_TABLE_CONTROL', 'TEAM_LEADERSHIP', 'FINANCIAL_ACCESS'],
    MEMBER: ['TASK_EXECUTION', 'CONTRIBUTION_TRACKING', 'COLLABORATION', 'PORTFOLIO_VIEW'],
    VIEWER: ['READ_ACCESS', 'PROGRESS_MONITORING', 'FINANCIAL_OVERVIEW'],
    GUEST: ['PUBLIC_ACCESS', 'COMMUNITY_ENGAGEMENT'],
  };
  return permissionMap[role] || [];
}

export default router;


