import { NextRequest, NextResponse } from 'next/server';
import { PortfolioService } from '../../../../lib/services/portfolio';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'demo-user-1'; // Default user for now
    
    const stats = await PortfolioService.getPortfolioStats(userId);
    
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
