import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'demo-user-1';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // TODO: Replace with real database call when backend is ready
    // For now, return realistic mock data
    const activities = [
      {
        id: '1',
        type: 'MILESTONE' as const,
        message: 'Contribution submitted for Build authentication system',
        timestamp: new Date().toISOString(),
        projectId: '1',
        projectName: 'SmartStart Platform',
        severity: 'SUCCESS' as const,
        userId: 'contrib-1',
        userName: 'Demo Contributor'
      },
      {
        id: '2',
        type: 'EQUITY' as const,
        message: 'Equity distribution completed for AI Marketing Tool',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        projectId: '2',
        projectName: 'AI Marketing Tool',
        severity: 'SUCCESS' as const,
        userId: 'owner-1',
        userName: 'Udi Shkolnik'
      },
      {
        id: '3',
        type: 'CONTRACT' as const,
        message: 'Smart contract deployed for E-commerce Platform',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        projectId: '3',
        projectName: 'E-commerce Platform',
        severity: 'INFO' as const,
        userId: 'owner-1',
        userName: 'Udi Shkolnik'
      },
      {
        id: '4',
        type: 'TEAM' as const,
        message: 'New team member joined Mobile App Framework project',
        timestamp: new Date(Date.now() - 432000000).toISOString(),
        projectId: '4',
        projectName: 'Mobile App Framework',
        severity: 'SUCCESS' as const,
        userId: 'team-1',
        userName: 'Sarah Johnson'
      },
      {
        id: '5',
        type: 'SYSTEM' as const,
        message: 'System backup completed successfully',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        severity: 'INFO' as const,
        userId: 'system',
        userName: 'System'
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: activities.slice(0, limit)
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch recent activity' 
    }, { status: 500 });
  }
}
