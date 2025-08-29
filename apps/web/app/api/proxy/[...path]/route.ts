import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params)
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params)
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params)
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params)
}

async function forward(req: NextRequest, { path }: { path: string[] }) {
  const urlPath = `/${path.join('/')}`
  const targetUrl = `${API_BASE}${urlPath}`
  const authToken = req.cookies.get('authToken')?.value
  const init: RequestInit = {
    method: req.method,
    headers: {
      'Content-Type': req.headers.get('content-type') || 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.text(),
    cache: 'no-store' as any,
  }

  const res = await fetch(targetUrl, init)
  const body = await res.text()
  return new NextResponse(body, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' } })
}
