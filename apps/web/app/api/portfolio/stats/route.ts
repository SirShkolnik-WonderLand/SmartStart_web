import { NextRequest, NextResponse } from 'next/server';
import { PortfolioService } from '../../../../lib/services/portfolio';

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the user ID from the session
    // For now, we'll use the demo owner user ID
    const userId = 'cmewdcma80002ulb6wl0lzhoo'; // owner@demo.local
    
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
