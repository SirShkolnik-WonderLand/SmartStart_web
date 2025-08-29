import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { account: true }
    });

    if (!user || !user.account) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.account.role
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

export const requireProjectMember = (minRole: string = 'MEMBER') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const projectId = req.params.projectId || req.body.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    try {
      const membership = await prisma.projectMember.findFirst({
        where: {
          projectId,
          userId: req.user.id
        }
      });

      if (!membership) {
        return res.status(403).json({ error: 'Project membership required' });
      }

      // Check role hierarchy
      const roleHierarchy = ['MEMBER', 'ADMIN', 'OWNER'];
      const userRoleIndex = roleHierarchy.indexOf(membership.role);
      const minRoleIndex = roleHierarchy.indexOf(minRole);

      if (userRoleIndex < minRoleIndex) {
        return res.status(403).json({ 
          error: 'Insufficient project role',
          required: minRole,
          current: membership.role
        });
      }

      next();
    } catch (error) {
      console.error('Project membership check error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};
