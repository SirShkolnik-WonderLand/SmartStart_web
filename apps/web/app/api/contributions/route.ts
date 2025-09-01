import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Call the backend API instead of connecting to database directly
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com';

export async function GET(request: NextRequest) {
  // Always return mock data for now - no API calls
  const mockContributions = [
    {
      id: 'contribution-1',
      taskId: 'task-1',
      contributorId: 'demo-user-1',
      effort: 8,
      impact: 9,
      proposedPct: 2.5,
      finalPct: 2.5,
      status: 'APPROVED',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      acceptedAt: new Date(Date.now() - 82800000).toISOString(),
      task: {
        id: 'task-1',
        title: 'Implement User Authentication',
        description: 'Build secure JWT-based authentication system',
        project: {
          id: 'project-1',
          name: 'SmartStart Platform'
        }
      },
      contributor: {
        id: 'demo-user-1',
        name: 'Demo User',
        email: 'demo@example.com'
      }
    },
    {
      id: 'contribution-2',
      taskId: 'task-2',
      contributorId: 'demo-user-1',
      effort: 6,
      impact: 7,
      proposedPct: 1.8,
      finalPct: 1.8,
      status: 'APPROVED',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      acceptedAt: new Date(Date.now() - 169200000).toISOString(),
      task: {
        id: 'task-2',
        title: 'Design Dashboard UI',
        description: 'Create responsive dashboard interface',
        project: {
          id: 'project-1',
          name: 'SmartStart Platform'
        }
      },
      contributor: {
        id: 'demo-user-1',
        name: 'Demo User',
        email: 'demo@example.com'
      }
    }
  ];
  
  return NextResponse.json(mockContributions);
}
