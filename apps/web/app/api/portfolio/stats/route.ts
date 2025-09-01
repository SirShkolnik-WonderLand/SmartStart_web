import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('ss_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    // Fetch portfolio projects to compute stats client-side for now
    const resp = await fetch(`${API_BASE}/projects/portfolio`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    });
    const portfolio = await resp.json();
    if (!resp.ok) {
      return NextResponse.json({ error: portfolio?.error || 'Failed to fetch portfolio' }, { status: resp.status });
    }
    const projects = portfolio?.projects || [];
    const totalValue = projects.reduce((sum: number, p: any) => sum + (p.totalValue || 0), 0);
    const activeProjects = projects.length;
    const teamSize = projects.reduce((sum: number, p: any) => sum + (p.activeMembers || 0), 0);
    const totalEquity = projects.reduce((sum: number, p: any) => sum + (p.userOwnership || 0), 0);
    const averageEquityPerProject = activeProjects > 0 ? totalEquity / activeProjects : 0;
    const stats = {
      totalValue,
      activeProjects,
      teamSize,
      totalEquity,
      monthlyGrowth: 0,
      totalContributions: 0,
      systemHealth: 'GOOD' as const,
      lastUpdated: new Date().toISOString(),
      totalXP: 0,
      reputation: 0,
      level: 'OWLET',
      portfolioDiversity: activeProjects,
      averageEquityPerProject
    };
    return NextResponse.json({ success: true, data: stats });
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
