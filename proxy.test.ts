import { describe, it, expect, vi, beforeEach } from 'vitest'
import fc from 'fast-check'
import type { NextRequest } from 'next/server'

// Mock next/server
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>()
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(({ request } = {}) => ({
        cookies: { set: vi.fn(), getAll: vi.fn(() => []) },
        headers: new Headers(),
        status: 200,
      })),
      redirect: vi.fn((url: URL) => ({
        headers: { get: (h: string) => h === 'location' ? url.toString() : null },
        status: 307,
      })),
    },
  }
})

// Mock @supabase/ssr to return a null user (unauthenticated)
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    cookies: {},
  })),
}))

function makeRequest(pathname: string): NextRequest {
  const url = `http://localhost${pathname}`
  return {
    nextUrl: new URL(url),
    url,
    cookies: { getAll: () => [], set: vi.fn() },
    headers: new Headers(),
  } as unknown as NextRequest
}

describe('proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Property 24: Admin route authentication enforcement
   * Any unauthenticated request to /admin/* (except /admin/login) returns a redirect to /admin/login
   * Validates: Requirements 8.1, 8.2
   */
  it('Property 24: unauthenticated requests to /admin/* redirect to /admin/login', async () => {
    const { proxy } = await import('./proxy')

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/[^a-z0-9-]/gi, 'x') || 'x'),
        async (segment) => {
          const path = `/admin/${segment}`

          // Exclude /admin/login itself
          fc.pre(path !== '/admin/login')

          const response = await proxy(makeRequest(path))
          const location = (response as any).headers?.get('location')

          expect(location).toBeTruthy()
          expect(location).toMatch(/^http:\/\/localhost\/admin\/login/)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('concrete: /admin/login should NOT redirect (returns next())', async () => {
    const { NextResponse } = await import('next/server')
    const { proxy } = await import('./proxy')

    const response = await proxy(makeRequest('/admin/login'))

    expect(NextResponse.next).toHaveBeenCalled()
    expect(NextResponse.redirect).not.toHaveBeenCalled()
    expect((response as any).status).toBe(200)
  })
})
