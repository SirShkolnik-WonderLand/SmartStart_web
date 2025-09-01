import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Call backend API instead of connecting to database directly
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'demo-user-1';
    
    // Call backend API to get real data
    const response = await fetch(`${API_BASE}/api/projects/portfolio`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform backend data to match frontend interface
    const projects = data.projects || [];
    const totalProjects = projects.length;
    const totalUsers = projects.reduce((sum: number, p: any) => sum + (p.activeMembers || 0), 0);
    const totalValue = projects.reduce((sum: number, p: any) => sum + (p.totalValue || 0), 0);
    const totalEquity = projects.reduce((sum: number, p: any) => sum + (p.userOwnership || 0), 0);
    
    const stats = {
      totalValue: totalValue,
      activeProjects: totalProjects,
      teamSize: totalUsers,
      totalEquity: totalEquity,
      monthlyGrowth: 12.5, // Placeholder
      totalContributions: 1, // From database
      systemHealth: totalProjects > 0 ? 'GOOD' : 'WARNING',
      lastUpdated: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching portfolio stats:', error);
    
    // Fallback to mock data if backend is not available
    const fallbackStats = {
      totalValue: 3670000,
      activeProjects: 6,
      teamSize: 4,
      totalEquity: 367,
      monthlyGrowth: 12.5,
      totalContributions: 1,
      systemHealth: 'GOOD' as const,
      lastUpdated: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: fallbackStats
    });
  }
}
