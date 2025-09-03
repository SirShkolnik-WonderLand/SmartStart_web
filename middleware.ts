import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allowlist: login, register, static assets, API routes, favicon, health
  const isAllowed =
    pathname === '/' ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/health')

  if (isAllowed) return NextResponse.next()

  // Require a simple web session cookie set after login
  const hasWebSession = req.cookies.get('web_session')?.value === '1'
  if (!hasWebSession) {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\.(png|jpg|ico|svg|css|js)$).*)'],
}
