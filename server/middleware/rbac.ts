import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CmdCtx {
  req: any;
  userId: string;
  roles: string[];
  permissions: string[];
}

export async function getAuthCtx(req: any): Promise<CmdCtx> {
  // Extract user ID from JWT token (you'll implement this)
  const userId = req.user?.id || 'anonymous';
  
  // Get user roles and permissions
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: true
        }
      }
    }
  });
  
  const roles = userRoles.map(ur => ur.role.name);
  const permissions = userRoles.flatMap(ur => 
    ur.role.permissions.map(p => p.code)
  );
  
  return {
    req,
    userId,
    roles,
    permissions
  };
}

export async function requirePerm(ctx: CmdCtx, perm: string): Promise<void> {
  if (!ctx.permissions.includes(perm)) {
    const err = new Error('FORBIDDEN');
    (err as any).code = 'FORBIDDEN';
    throw err;
  }
}

export async function hasPerm(ctx: CmdCtx, perm: string): Promise<boolean> {
  return ctx.permissions.includes(perm);
}

export async function requireRole(ctx: CmdCtx, role: string): Promise<void> {
  if (!ctx.roles.includes(role)) {
    const err = new Error('INSUFFICIENT_ROLE');
    (err as any).code = 'INSUFFICIENT_ROLE';
    throw err;
  }
}

export async function hasRole(ctx: CmdCtx, role: string): Promise<boolean> {
  return ctx.roles.includes(role);
}
