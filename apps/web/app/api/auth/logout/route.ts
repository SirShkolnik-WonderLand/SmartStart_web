import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Clear the HTTP-only cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('ss_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/'
    });
    
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
