import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]

    // Proxy to backend API
    const backendUrl = process.env.BACKEND_URL || 'https://smartstart-api.onrender.com'
    const response = await fetch(`${backendUrl}/api/v1/buz/supply`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching BUZ supply:', error)
    return NextResponse.json(
      { error: 'Failed to fetch BUZ supply' },
      { status: 500 }
    )
  }
}
