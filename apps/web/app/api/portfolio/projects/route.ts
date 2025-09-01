import { NextRequest, NextResponse } from 'next/server';
import { PortfolioService } from '../../../../lib/services/portfolio';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'cmewdcma80002ulb6wl0lzhoo'; // owner@demo.local
    
    // Try to get real data from backend API
    try {
      const projects = await PortfolioService.getProjects(userId);
      return NextResponse.json({
        success: true,
        data: projects
      });
    } catch (apiError) {
      console.warn('Backend API failed, using mock data:', apiError);
      // Fallback to mock data if backend is not available
      const projects = await PortfolioService.getProjectsMock();
      return NextResponse.json({
        success: true,
        data: projects
      });
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch projects' 
    }, { status: 500 });
  }
}
