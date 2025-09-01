import { NextRequest, NextResponse } from 'next/server';
import { PortfolioService } from '../../../../lib/services/portfolio';

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the user ID from the session
    // For now, we'll use a demo user ID
    const userId = 'demo-user-1';
    
    const stats = await PortfolioService.getPortfolioStats(userId);
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching portfolio stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch portfolio statistics' 
      },
      { status: 500 }
    );
  }
}
