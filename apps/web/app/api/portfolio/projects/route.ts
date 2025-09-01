import { NextRequest, NextResponse } from 'next/server';
import { PortfolioService } from '../../../../lib/services/portfolio';

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the user ID from the session
    const userId = 'cmewdcma80002ulb6wl0lzhoo'; // owner@demo.local
    
    const projects = await PortfolioService.getProjects(userId);
    
    return NextResponse.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch projects' 
      },
      { status: 500 }
    );
  }
}
