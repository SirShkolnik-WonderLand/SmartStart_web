const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getAuthCtx(req) {
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

async function requirePerm(ctx, perm) {
  if (!ctx.permissions.includes(perm)) {
    const err = new Error('FORBIDDEN');
    err.code = 'FORBIDDEN';
    throw err;
  }
}

async function hasPerm(ctx, perm) {
  return ctx.permissions.includes(perm);
}

async function requireRole(ctx, role) {
  if (!ctx.roles.includes(role)) {
    const err = new Error('INSUFFICIENT_ROLE');
    err.code = 'INSUFFICIENT_ROLE';
    throw err;
  }
}

async function hasRole(ctx, role) {
  return ctx.roles.includes(role);
}

module.exports = {
  getAuthCtx,
  requirePerm,
  hasPerm,
  requireRole,
  hasRole
};
