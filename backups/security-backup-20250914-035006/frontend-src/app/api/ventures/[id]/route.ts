import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    const venture = ventures.find(v => v.id === params.id)
    if (!venture) {
      return NextResponse.json({ success: false, error: 'Not Found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: venture })
  } catch (error) {
    console.error('Error fetching venture:', error)
    return NextResponse.json(
      { error: 'Failed to fetch venture' },
      { status: 500 }
    )
  }
}


