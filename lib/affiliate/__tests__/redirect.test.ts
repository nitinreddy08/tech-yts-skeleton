/**
 * Property-based tests for affiliate redirect
 * Validates: Requirements 4.2, 4.3, 4.5, 4.6, 4.7, 14.1
 *
 * handleAffiliateRedirect reads from the real in-memory mock db (there is no
 * Supabase involved anywhere in this app's data path) — so these tests seed
 * db.affiliateLinks/db.deals directly rather than mocking a database client.
 * Vitest isolates modules per test file, so mutating the singleton store here
 * doesn't leak into other test files.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import type { NextRequest } from 'next/server'
import { db, newId } from '@/lib/mock/db'
import { handleAffiliateRedirect } from '../redirect'

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

function makeRequest(url = 'http://localhost/go/test', headers: Record<string, string> = {}): NextRequest {
  return new Request(url, { headers }) as unknown as NextRequest
}

/**
 * Poll for a specific click log entry rather than diffing db.clickLogs.length:
 * the write is fire-and-forget (Requirement 4.6), and other tests/fast-check
 * iterations in this file leave their own writes still landing asynchronously
 * in the shared store, so a raw length comparison is inherently racy.
 */
async function waitForClickLog(
  predicate: (log: (typeof db.clickLogs)[number]) => boolean,
  { timeoutMs = 200 }: { timeoutMs?: number } = {}
): Promise<(typeof db.clickLogs)[number] | undefined> {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const found = db.clickLogs.find(predicate)
    if (found) return found
    if (Date.now() >= deadline) return undefined
    await new Promise((r) => setTimeout(r, 5))
  }
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
  it('valid affiliate_link_id returns 302 with correct Location header', async () => {
    await fc.assert(
      fc.asyncProperty(fc.webUrl(), async (affiliateUrl) => {
        const linkId = newId()
        db.affiliateLinks.push({
          id: linkId,
          product_id: 'prod-samsung-s25',
          store_name: 'Amazon.in',
          store_icon: null,
          affiliate_url: affiliateUrl,
          price_inr: 1000,
          is_best_price: false,
          last_updated: new Date().toISOString(),
        })

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

// ---------------------------------------------------------------------------
// Requirement 4.5 / 4.7: invalid id → 404, no open redirect
// ---------------------------------------------------------------------------
describe('unknown affiliate_link_id', () => {
  it('returns 404 and never redirects to an arbitrary URL', async () => {
    const response = await handleAffiliateRedirect('does-not-exist', makeRequest())
    expect(response.status).toBe(404)
    expect(response.headers.get('location')).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Requirement 4.2 / 4.3 / 4.6: ClickLog recorded, fire-and-forget, hashed IP
// ---------------------------------------------------------------------------
describe('click logging', () => {
  let linkId: string

  beforeEach(() => {
    linkId = newId()
    db.affiliateLinks.push({
      id: linkId,
      product_id: 'prod-samsung-s25',
      store_name: 'Amazon.in',
      store_icon: null,
      affiliate_url: 'https://amazon.in/dp/click-test',
      price_inr: 1000,
      is_best_price: false,
      last_updated: new Date().toISOString(),
    })
  })

  it('does not await the click log write before responding', async () => {
    await handleAffiliateRedirect(linkId, makeRequest())
    // The redirect itself resolves before the fire-and-forget write lands —
    // right after the await above, this specific entry shouldn't exist yet.
    expect(db.clickLogs.some((l) => l.affiliate_link_id === linkId)).toBe(false)
    const log = await waitForClickLog((l) => l.affiliate_link_id === linkId)
    expect(log).toBeDefined()
  })

  it('records product_id, store_name, user_agent, referrer, and a hashed (not raw) IP', async () => {
    const request = makeRequest('http://localhost/go/x', {
      'user-agent': 'test-agent/1.0',
      referer: 'https://example.com/page',
      'x-forwarded-for': '203.0.113.7',
    })

    await handleAffiliateRedirect(linkId, request)
    const log = await waitForClickLog((l) => l.affiliate_link_id === linkId)

    expect(log).toBeDefined()
    expect(log!.product_id).toBe('prod-samsung-s25')
    expect(log!.store_name).toBe('Amazon.in')
    expect(log!.user_agent).toBe('test-agent/1.0')
    expect(log!.referrer).toBe('https://example.com/page')
    expect(log!.ip_hash).not.toBeNull()
    expect(log!.ip_hash).not.toBe('203.0.113.7')
    expect(log!.ip_hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('does not record a click for an unknown id', async () => {
    await handleAffiliateRedirect('does-not-exist', makeRequest())
    const log = await waitForClickLog((l) => l.affiliate_link_id === 'does-not-exist', {
      timeoutMs: 50,
    })
    expect(log).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Deals redirect through the same handler, but only while genuinely live
// ---------------------------------------------------------------------------
describe('deal redirect', () => {
  it('redirects and logs a click for a live deal', async () => {
    const dealId = newId()
    db.deals.push({
      id: dealId,
      product_id: 'prod-oneplus-13',
      deal_type: 'price_drop',
      headline: 'Test deal',
      original_price_inr: 1000,
      deal_price_inr: 800,
      store_name: 'Flipkart',
      affiliate_url: 'https://flipkart.com/mock-deal',
      starts_at: null,
      expires_at: null,
      is_active: true,
      created_at: new Date().toISOString(),
    })

    const response = await handleAffiliateRedirect(dealId, makeRequest())
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('https://flipkart.com/mock-deal')

    const log = await waitForClickLog((l) => l.affiliate_link_id === `deal:${dealId}`)
    expect(log).toBeDefined()
    expect(log!.product_id).toBe('prod-oneplus-13')
  })

  it('returns 404 for a deal that is_active but already expired', async () => {
    const dealId = newId()
    db.deals.push({
      id: dealId,
      product_id: 'prod-oneplus-13',
      deal_type: 'price_drop',
      headline: 'Expired deal',
      original_price_inr: 1000,
      deal_price_inr: 800,
      store_name: 'Flipkart',
      affiliate_url: 'https://flipkart.com/mock-expired',
      starts_at: null,
      expires_at: new Date(Date.now() - 60_000).toISOString(),
      is_active: true,
      created_at: new Date().toISOString(),
    })

    const response = await handleAffiliateRedirect(dealId, makeRequest())
    expect(response.status).toBe(404)
  })
})
