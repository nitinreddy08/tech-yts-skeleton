import { type NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/login
 * Mock authentication endpoint.
 * Accepts: any email containing "admin" OR password === "admin"
 * Sets a simple httpOnly cookie "mock-admin-session=1" on success.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { email = '', password = '' } = body as { email: string; password: string }

  const valid = email.toLowerCase().includes('admin') || password === 'admin'

  if (!valid) {
    return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true, user: { email } })
  response.cookies.set('mock-admin-session', '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // No maxAge = session cookie (expires when browser closes)
  })
  return response
}
