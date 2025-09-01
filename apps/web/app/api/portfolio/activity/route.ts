import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'demo-user-1';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get real activity data from database
    const contributions = await prisma.contribution.findMany({
      include: {
        task: {
          include: {
            project: true
          }
        },
        contributor: true
      },
      orderBy: { acceptedAt: 'desc' },
      take: limit
    });
    
    const tasks = await prisma.task.findMany({
      include: {
        project: true,
        assignee: true
      },
      orderBy: { dueDate: 'desc' },
      take: limit
    });
    
    const messages = await prisma.message.findMany({
      include: {
        author: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    // Transform real data into activities
    const activities: any[] = [];
    
    // Add contributions as activities
    contributions.forEach((contribution) => {
      activities.push({
        id: `contribution-${contribution.id}`,
        type: 'MILESTONE' as const,
        message: `Contribution submitted for task: ${contribution.task.title}`,
        timestamp: contribution.acceptedAt?.toISOString() || new Date().toISOString(),
        projectId: contribution.task.projectId,
        projectName: contribution.task.project?.name,
        severity: 'SUCCESS' as const,
        userId: contribution.contributorId,
        userName: contribution.contributor?.name || 'Unknown User'
      });
    });
    
    // Add task updates as activities
    tasks.forEach((task) => {
      if (task.status === 'DONE') {
        activities.push({
          id: `task-${task.id}`,
          type: 'MILESTONE' as const,
          message: `Task completed: ${task.title}`,
          timestamp: task.dueDate?.toISOString() || new Date().toISOString(),
          projectId: task.projectId,
          projectName: task.project?.name,
          severity: 'SUCCESS' as const,
          userId: task.assigneeId,
          userName: task.assignee?.name || 'Unknown User'
        });
      }
    });
    
    // Add messages as activities
    messages.forEach((message) => {
      activities.push({
        id: `message-${message.id}`,
        type: 'TEAM' as const,
        message: `New message: ${message.body.substring(0, 50)}${message.body.length > 50 ? '...' : ''}`,
        timestamp: message.createdAt.toISOString(),
        severity: 'INFO' as const,
        userId: message.authorId,
        userName: message.author?.name || 'Unknown User'
      });
    });
    
    // Sort by timestamp and take limit
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    
    // If no real activities, add some system activities
    if (sortedActivities.length === 0) {
      sortedActivities.push({
        id: 'system-1',
        type: 'SYSTEM' as const,
        message: 'Database connected successfully',
        timestamp: new Date().toISOString(),
        severity: 'INFO' as const,
        userId: 'system',
        userName: 'System'
      });
    }
    
    return NextResponse.json({
      success: true,
      data: sortedActivities
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch recent activity' 
    }, { status: 500 });
  }
}
