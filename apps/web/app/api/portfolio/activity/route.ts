import { NextRequest, NextResponse } from 'next/server';
import { PortfolioService } from '../../../../lib/services/portfolio';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // In a real app, you'd get the user ID from the session
    const userId = 'cmewdcma80002ulb6wl0lzhoo'; // owner@demo.local
    
    const activity = await PortfolioService.getRecentActivity(userId, limit);
    
    return NextResponse.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch activity' 
      },
      { status: 500 }
    );
  }
}
