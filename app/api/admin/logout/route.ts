import { NextResponse } from 'next/server'

/**
 * POST /api/admin/logout
 * Clears the mock admin session cookie and redirects to /admin/login.
 */
export async function POST() {
  const response = NextResponse.redirect(
    new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
  )
  response.cookies.set('mock-admin-session', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // delete the cookie
  })
  return response
}
