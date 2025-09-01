import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const contributionCount = await prisma.contribution.count();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test',
      data: {
        userCount,
        projectCount,
        contributionCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Database connection failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
