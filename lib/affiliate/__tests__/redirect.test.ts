/**
 * Property-based tests for affiliate redirect
 * Validates: Requirements 4.2, 4.3, 14.1
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import type { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Inline hash helper — mirrors the internal hashIp in redirect.ts
// ---------------------------------------------------------------------------
async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ---------------------------------------------------------------------------
// Supabase mock — set up before importing the module under test
// ---------------------------------------------------------------------------
let mockLinkData: { id: string; product_id: string; store_name: string; affiliate_url: string } | null = null
let mockLinkError: { message: string } | null = null

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() =>
        Promise.resolve({ data: mockLinkData, error: mockLinkError })
      ),
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}))

// Import after mock is registered
import { handleAffiliateRedirect } from '../redirect'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeRequest(url = 'http://localhost/go/test'): NextRequest {
  return new Request(url, { headers: {} }) as unknown as NextRequest
}

// ---------------------------------------------------------------------------
// Property 15: IP hash format
// **Validates: Requirements 14.1**
// ---------------------------------------------------------------------------
describe('Property 15 — ip_hash format', () => {
  it('IPv4: hash is 64-char lowercase hex and never equals raw IP', async () => {
    await fc.assert(
      fc.asyncProperty(fc.ipV4(), async (ip) => {
        const hash = await hashIp(ip)
        expect(hash).toHaveLength(64)
        expect(hash).toMatch(/^[0-9a-f]+$/)
        expect(hash).not.toBe(ip)
      })
    )
  })

  it('IPv6: hash is 64-char lowercase hex and never equals raw IP', async () => {
    await fc.assert(
      fc.asyncProperty(fc.ipV6(), async (ip) => {
        const hash = await hashIp(ip)
        expect(hash).toHaveLength(64)
        expect(hash).toMatch(/^[0-9a-f]+$/)
        expect(hash).not.toBe(ip)
      })
    )
  })
})

// ---------------------------------------------------------------------------
// Property 16: 302 response
// **Validates: Requirements 4.2, 4.3**
// ---------------------------------------------------------------------------
describe('Property 16 — 302 redirect response', () => {
  beforeEach(() => {
    mockLinkError = null
  })

  it('valid affiliate_link_id returns 302 with correct Location header', async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), fc.webUrl(), async (linkId, affiliateUrl) => {
        mockLinkData = {
          id: linkId,
          product_id: 'prod-1',
          store_name: 'Amazon.in',
          affiliate_url: affiliateUrl,
        }

        const request = makeRequest(`http://localhost/go/${linkId}`)
        const response = await handleAffiliateRedirect(linkId, request)

        expect(response.status).toBe(302)
        // Response.redirect normalises URLs (e.g. adds trailing slash), so compare
        // against the normalised form
        expect(response.headers.get('location')).toBe(new URL(affiliateUrl).href)
      })
    )
  })
})
