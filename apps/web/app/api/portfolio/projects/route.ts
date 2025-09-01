import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'demo-user-1';
    
    // TODO: Replace with real database call when backend is ready
    // For now, return realistic mock data
    const projects = [
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
      },
      {
        id: '2',
        name: 'AI Marketing Tool',
        summary: 'AI-powered marketing automation platform for small businesses.',
        progress: 45,
        equity: 20,
        nextMilestone: 'Beta Testing',
        daysToMilestone: 7,
        status: 'ACTIVE' as const,
        teamSize: 3,
        totalValue: 500000,
        contractVersion: 'v1.0',
        equityModel: 'DYNAMIC',
        vestingSchedule: 'IMMEDIATE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: {
          id: 'owner-1',
          name: 'Udi Shkolnik',
          email: 'owner@demo.local'
        }
      },
      {
        id: '3',
        name: 'E-commerce Platform',
        summary: 'Modern e-commerce platform with advanced features.',
        progress: 30,
        equity: 15,
        nextMilestone: 'MVP Development',
        daysToMilestone: 14,
        status: 'PLANNING' as const,
        teamSize: 2,
        totalValue: 300000,
        contractVersion: 'v1.0',
        equityModel: 'DYNAMIC',
        vestingSchedule: 'IMMEDIATE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: {
          id: 'owner-1',
          name: 'Udi Shkolnik',
          email: 'owner@demo.local'
        }
      },
      {
        id: '4',
        name: 'Mobile App Framework',
        summary: 'Cross-platform mobile development framework for rapid app creation.',
        progress: 60,
        equity: 10,
        nextMilestone: 'Framework Release',
        daysToMilestone: 5,
        status: 'ACTIVE' as const,
        teamSize: 3,
        totalValue: 200000,
        contractVersion: 'v1.5',
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
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch projects' 
    }, { status: 500 });
  }
}
