import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware auth guard for /admin routes.
 * Uses the mock session cookie set by POST /api/auth/login.
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/admin')) {
    // Let the login page through to avoid redirect loops
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    const session = request.cookies.get('mock-admin-session')
    if (!session?.value) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|mockServiceWorker\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
