import { NextRequest, NextResponse } from 'next/server';
import { PortfolioService } from '../../../../lib/services/portfolio';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'demo-user-1'; // Default user for now
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const activity = await PortfolioService.getRecentActivity(userId, limit);
    
    return NextResponse.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch recent activity' 
    }, { status: 500 });
  }
}
