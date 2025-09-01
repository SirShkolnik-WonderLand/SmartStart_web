import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        profile: true,
        skills: {
          take: 5,
          orderBy: {
            xp: 'desc'
          }
        },
        badges: {
          take: 5,
          orderBy: {
            earnedAt: 'desc'
          }
        },
        projectMemberships: {
          include: {
            project: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        totalPortfolioValue: 'desc'
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
