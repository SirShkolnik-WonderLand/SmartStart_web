import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import type { CmdCtx } from './rbac';

const prisma = new PrismaClient();

export async function audit(
  ctx: CmdCtx, 
  cmd: string, 
  args: unknown, 
  success: boolean, 
  message?: string
) {
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

export async function getAuditLogs(
  userId?: string,
  limit: number = 100,
  offset: number = 0
) {
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

export async function getCommandStats() {
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
  }, {} as Record<string, { success: number; failed: number; total: number }>);
}
