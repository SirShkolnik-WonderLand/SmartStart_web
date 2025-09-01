import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Call backend API instead of connecting to database directly
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'demo-user-1';
    
    // Call backend API to get real projects
    const response = await fetch(`${API_BASE}/api/projects/portfolio`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform backend projects to match frontend interface
    const transformedProjects = (data.projects || []).map((project: any) => ({
      id: project.id,
      name: project.name,
      summary: project.summary || 'No description available',
      progress: project.completionRate || 0,
      equity: Math.round(project.userOwnership || 0),
      nextMilestone: project.currentPhase || 'Project Setup',
      daysToMilestone: Math.max(1, 30 - ((project.currentSprint || 0) * 7)),
      status: project.currentSprint === 0 ? 'PLANNING' : 
              project.currentSprint >= 4 ? 'COMPLETED' : 
              project.currentSprint >= 3 ? 'LAUNCHING' : 'ACTIVE',
      teamSize: project.activeMembers || 0,
      totalValue: project.totalValue || 0,
      contractVersion: 'v1.0',
      equityModel: 'DYNAMIC',
      vestingSchedule: 'IMMEDIATE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: {
        id: project.ownerId || 'unknown',
        name: 'Project Owner',
        email: 'owner@example.com'
      }
    }));
    
    return NextResponse.json({
      success: true,
      data: transformedProjects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    
    // Fallback to mock data if backend is not available
    const fallbackProjects = [
      {
        id: '1',
        name: 'SmartStart Platform',
        summary: 'Community-driven development platform for building ventures together with transparent equity tracking, smart contracts, and collaborative project management.',
        progress: 75,
        equity: 35,
        nextMilestone: 'Launch v2.0',
        daysToMilestone: 3,
        status: 'LAUNCHING' as const,
        teamSize: 4,
        totalValue: 1500000,
        contractVersion: 'v2.0',
        equityModel: 'DYNAMIC',
        vestingSchedule: 'IMMEDIATE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: {
          id: 'owner-1',
          name: 'Udi Shkolnik',
          email: 'owner@demo.local'
        }
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: fallbackProjects
    });
  }
}
