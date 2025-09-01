import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'demo-user-1';
    
    // Get real projects from database
    const projects = await prisma.project.findMany({
      include: {
        owner: true,
        members: true,
        capEntries: true,
        tasks: true,
        sprints: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transform real projects to match frontend interface
    const transformedProjects = projects.map((project) => {
      // Calculate progress based on tasks
      const totalTasks = project.tasks?.length || 0;
      const completedTasks = project.tasks?.filter(task => task.status === 'DONE')?.length || 0;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Calculate equity from cap table entries
      const userEquity = project.capEntries?.reduce((sum, entry) => {
        if (entry.holderType === 'USER' && entry.holderId === userId) {
          return sum + (entry.pct || 0);
        }
        return sum;
      }, 0) || 0;
      
      // Get team size
      const teamSize = project.members?.length || 0;
      
      // Calculate project value
      const totalValue = project.capEntries?.reduce((sum, entry) => sum + (entry.pct || 0), 0) * 10000 || 0;
      
      // Determine status based on sprints
      const currentSprint = project.sprints?.length || 0;
      let status: 'ACTIVE' | 'LAUNCHING' | 'PLANNING' | 'COMPLETED' | 'PAUSED';
      if (currentSprint === 0) status = 'PLANNING';
      else if (currentSprint >= 4) status = 'COMPLETED';
      else if (currentSprint >= 3) status = 'LAUNCHING';
      else status = 'ACTIVE';
      
      // Calculate next milestone
      const nextMilestone = currentSprint === 0 ? 'Project Setup' :
                           currentSprint === 1 ? 'Discovery Phase' :
                           currentSprint === 2 ? 'Validation Phase' :
                           currentSprint === 3 ? 'Build Phase' : 'Launch';
      
      const daysToMilestone = Math.max(1, 30 - (currentSprint * 7)); // Simplified calculation
      
      return {
        id: project.id,
        name: project.name,
        summary: project.summary || 'No description available',
        progress: progress,
        equity: Math.round(userEquity),
        nextMilestone: nextMilestone,
        daysToMilestone: daysToMilestone,
        status: status,
        teamSize: teamSize,
        totalValue: totalValue,
        contractVersion: 'v1.0',
        equityModel: 'DYNAMIC',
        vestingSchedule: 'IMMEDIATE',
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        owner: {
          id: project.owner?.id || 'unknown',
          name: project.owner?.name || 'Unknown Owner',
          email: project.owner?.email || 'unknown@example.com'
        }
      };
    });
    
    return NextResponse.json({
      success: true,
      data: transformedProjects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch projects' 
    }, { status: 500 });
  }
}
