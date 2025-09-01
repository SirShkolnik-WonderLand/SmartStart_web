import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Call the backend API instead of connecting to database directly
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com';

export async function GET(request: NextRequest) {
  // Always return mock data for now - no API calls
  const mockProjects = [
    {
      id: 'project-1',
      name: 'SmartStart Platform',
      summary: 'Community-driven development platform for building ventures together with transparent equity tracking, smart contracts, and collaborative project management.',
      progress: 75,
      equity: 35,
      nextMilestone: 'Launch v2.0',
      daysToMilestone: 3,
      status: 'LAUNCHING' as const,
      teamSize: 4,
      totalValue: 3700000,
      contractVersion: 'v2.0',
      equityModel: 'DYNAMIC',
      vestingSchedule: 'IMMEDIATE',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      updatedAt: new Date().toISOString(),
      owner: {
        id: 'owner-1',
        name: 'Udi Shkolnik',
        email: 'udi@alicesolutions.com'
      },
      currentSprint: 3,
      currentPhase: 'BUILD',
      completionRate: 75,
      activeMembers: 4,
      userRole: 'OWNER',
      userOwnership: 35
    },
    {
      id: 'project-2',
      name: 'AI Contract Review',
      summary: 'Machine learning-powered contract review system for automated legal compliance and risk assessment.',
      progress: 45,
      equity: 25,
      nextMilestone: 'MVP Testing',
      daysToMilestone: 7,
      status: 'ACTIVE' as const,
      teamSize: 3,
      totalValue: 1200000,
      contractVersion: 'v1.0',
      equityModel: 'DYNAMIC',
      vestingSchedule: 'IMMEDIATE',
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      updatedAt: new Date().toISOString(),
      owner: {
        id: 'owner-2',
        name: 'Alice Chen',
        email: 'alice@example.com'
      },
      currentSprint: 2,
      currentPhase: 'VALIDATION',
      completionRate: 45,
      activeMembers: 3,
      userRole: 'CONTRIBUTOR',
      userOwnership: 25
    },
    {
      id: 'project-3',
      name: 'Equity Management Dashboard',
      summary: 'Real-time equity tracking and management dashboard for startups and investors.',
      progress: 90,
      equity: 15,
      nextMilestone: 'Production Launch',
      daysToMilestone: 1,
      status: 'LAUNCHING' as const,
      teamSize: 5,
      totalValue: 2500000,
      contractVersion: 'v1.5',
      equityModel: 'DYNAMIC',
      vestingSchedule: 'IMMEDIATE',
      createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
      updatedAt: new Date().toISOString(),
      owner: {
        id: 'owner-3',
        name: 'Bob Smith',
        email: 'bob@example.com'
      },
      currentSprint: 4,
      currentPhase: 'LAUNCH',
      completionRate: 90,
      activeMembers: 5,
      userRole: 'MEMBER',
      userOwnership: 15
    }
  ];
  
  return NextResponse.json({
    success: true,
    data: mockProjects
  });
}
