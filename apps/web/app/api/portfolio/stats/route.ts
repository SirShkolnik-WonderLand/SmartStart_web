import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Call the backend API instead of connecting to database directly
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com';

export async function GET(request: NextRequest) {
  // Always return mock data for now - no API calls
  const mockStats = {
    totalValue: 3700000, // $3.7M
    activeProjects: 6,
    teamSize: 4,
    totalEquity: 367,
    monthlyGrowth: 12.5,
    totalContributions: 12,
    systemHealth: 'GOOD' as const,
    lastUpdated: new Date().toISOString(),
    totalXP: 1250,
    reputation: 85,
    level: 'BUILDER',
    portfolioDiversity: 6,
    averageEquityPerProject: 61.2
  };
  
  return NextResponse.json({
    success: true,
    data: mockStats
  });
}
