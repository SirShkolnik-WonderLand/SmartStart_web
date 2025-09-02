const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function audit(ctx, cmd, args, success, message) {
  try {
    // Hash arguments to avoid logging PII
    const argHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(args))
      .digest('hex');
    
    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: ctx.userId,
        command: cmd,
        argHash,
        success,
        message: message || (success ? 'SUCCESS' : 'FAILED'),
        createdAt: new Date()
      }
    });
  } catch (error) {
    // Don't fail the main operation if audit fails
    console.error('Audit logging failed:', error);
  }
}

async function getAuditLogs(userId, limit = 100, offset = 0) {
  const where = userId ? { userId } : {};
  
  return await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          username: true,
          email: true
        }
      }
    }
  });
}

async function getCommandStats() {
  const stats = await prisma.auditLog.groupBy({
    by: ['command', 'success'],
    _count: {
      id: true
    }
  });
  
  return stats.reduce((acc, stat) => {
    if (!acc[stat.command]) {
      acc[stat.command] = { success: 0, failed: 0, total: 0 };
    }
    
    if (stat.success) {
      acc[stat.command].success = stat._count.id;
    } else {
      acc[stat.command].failed = stat._count.id;
    }
    
    acc[stat.command].total = acc[stat.command].success + acc[stat.command].failed;
    return acc;
  }, {});
}

module.exports = {
  audit,
  getAuditLogs,
  getCommandStats
};
