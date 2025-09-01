import { NextRequest, NextResponse } from 'next/server';
import { PortfolioService } from '../../../../lib/services/portfolio';

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the user ID from the session
    const userId = 'demo-user-1';
    
    const activity = await PortfolioService.getRecentActivity(userId, 10);
    
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
