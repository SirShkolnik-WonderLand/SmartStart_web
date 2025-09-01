import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'demo-user-1';
    
    // TODO: Replace with real database call when backend is ready
    // For now, return realistic mock data
    const stats = {
      totalValue: 2500000,
      activeProjects: 5,
      teamSize: 12,
      totalEquity: 35,
      monthlyGrowth: 15.2,
      totalContributions: 25,
      systemHealth: 'GOOD' as const,
      lastUpdated: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching portfolio stats:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch portfolio statistics' 
    }, { status: 500 });
  }
}
