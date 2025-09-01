import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const resp = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json({ error: data?.error || 'Login failed' }, { status: resp.status });
    }

    const token: string | undefined = data?.token;
    if (!token) {
      return NextResponse.json({ error: 'Invalid auth response' }, { status: 500 });
    }

    const response = NextResponse.json({ user: data.user }, { status: 200 });
    // HttpOnly cookie for JWT
    response.cookies.set('ss_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}


