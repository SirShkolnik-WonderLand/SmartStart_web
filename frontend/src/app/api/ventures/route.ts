import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // For now, return mock data that matches our database structure
    // In production, this would connect to the actual API
    const ventures = [
      {
        id: 'admin-venture-1',
        name: 'TechInnovate Solutions',
        purpose: 'Developing cutting-edge technology solutions for modern businesses',
        region: 'North America',
        status: 'ACTIVE',
        createdAt: '2025-09-09T17:59:05.844Z',
        teamCount: 12,
        projectCount: 3,
        revenue: 125000,
        growth: 15
      },
      {
        id: 'admin-venture-2',
        name: 'GreenFuture Energy',
        purpose: 'Sustainable energy solutions and environmental technology',
        region: 'Global',
        status: 'ACTIVE',
        createdAt: '2025-09-09T17:59:05.844Z',
        teamCount: 8,
        projectCount: 2,
        revenue: 89000,
        growth: 22
      },
      {
        id: 'admin-venture-3',
        name: 'DataFlow Analytics',
        purpose: 'Advanced data analytics and business intelligence platforms',
        region: 'Europe',
        status: 'PLANNING',
        createdAt: '2025-09-09T17:59:05.844Z',
        teamCount: 5,
        projectCount: 1,
        revenue: 0,
        growth: 0
      }
    ]

    return NextResponse.json({
      success: true,
      data: ventures
    })
  } catch (error) {
    console.error('Error fetching ventures:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ventures' },
      { status: 500 }
    )
  }
}