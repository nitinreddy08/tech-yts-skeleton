// Feature: ui-redesign, Property 17: Deals page shows all active price_drop deals
// Property 18: Deal card discount display

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act } from '@testing-library/react'
import * as fc from 'fast-check'

// --- Mocks ---

vi.mock('next/navigation', () => ({ notFound: vi.fn() }))

vi.mock('next/link', () => ({
  default: ({ href, children, ...p }: any) => (
    <a href={href} {...p}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...p }: any) => <img src={src} alt={alt} {...p} />,
}))

vi.mock('@/components/ui/EmptyState', () => ({
  EmptyState: ({ heading }: any) => <div data-testid="empty-state">{heading}</div>,
}))

vi.mock('@/lib/utils/format', () => ({
  formatIndianPrice: (n: number) => `₹${n}`,
}))

const mockFetchActiveDeals = vi.fn()
vi.mock('@/lib/data/deals', () => ({
  fetchActiveDeals: (...a: any[]) => mockFetchActiveDeals(...a),
}))

// Import page AFTER mocks
import DealsPage from '../deals/page'

// --- Arbitraries ---

const productArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 40 }),
  slug: fc.constant('test-product'),
  thumbnail_url: fc.constant(''),
  current_price_inr: fc.constant(50000),
  launch_price_inr: fc.constant(null),
  category_id: fc.constant('cat-1'),
  category_slug: fc.constant('smartphones'),
  brand_id: fc.constant('brand-1'),
  brand_name: fc.constant('Brand'),
  creator_rating: fc.constant(8),
  is_featured: fc.constant(false),
  is_deal_of_the_day: fc.constant(false),
  deal_badge_text: fc.constant(null),
  tags: fc.constant([]),
  youtube_video_url: fc.constant(null),
  created_at: fc.constant('2024-01-01T00:00:00Z'),
})

const dealArb = fc.record({
  id: fc.uuid(),
  deal_type: fc.constant('price_drop' as const),
  is_active: fc.constant(true),
  headline: fc.string({ minLength: 1, maxLength: 60 }),
  store_name: fc.string({ minLength: 1, maxLength: 30 }),
  deal_price_inr: fc.integer({ min: 1000, max: 100000 }),
  original_price_inr: fc.integer({ min: 10000, max: 200000 }),
  affiliate_url: fc.constant('https://example.com'),
  expires_at: fc.constant(null),
  product_id: fc.uuid(),
  starts_at: fc.constant(null),
  created_at: fc.constant('2024-01-01T00:00:00Z'),
  product: productArb,
})

// Base deal for Property 18 (single deal, prices guaranteed non-overlapping)
const baseDeal = {
  id: 'deal-base',
  deal_type: 'price_drop' as const,
  is_active: true,
  headline: 'Great deal',
  store_name: 'TestStore',
  deal_price_inr: 10000,
  original_price_inr: 20000,
  affiliate_url: 'https://example.com',
  expires_at: null,
  product_id: 'prod-1',
  starts_at: null,
  created_at: '2024-01-01T00:00:00Z',
  product: {
    id: 'prod-1',
    name: 'Test Product',
    slug: 'test-product',
    thumbnail_url: '',
    current_price_inr: 50000,
    launch_price_inr: null,
    category_id: 'cat-1',
    category_slug: 'smartphones',
    brand_id: 'brand-1',
    brand_name: 'Brand',
    creator_rating: 8,
    is_featured: false,
    is_deal_of_the_day: false,
    deal_badge_text: null,
    tags: [],
    youtube_video_url: null,
    created_at: '2024-01-01T00:00:00Z',
  },
}

// --- Tests ---

describe('DealsPage', () => {
  beforeEach(() => {
    mockFetchActiveDeals.mockReset()
  })

  /**
   * Property 17: Deals page shows all active price_drop deals
   * Validates: Requirements 12.3
   */
  it('Property 17: renders all active price_drop deals', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(dealArb, { minLength: 1, maxLength: 6 }),
        async (deals) => {
          mockFetchActiveDeals.mockResolvedValue(deals)
          let container!: HTMLElement
          await act(async () => {
            const r = render(await DealsPage())
            container = r.container
          })
          // Each deal card has a link to /go/[id]
          const dealLinks = Array.from(container.querySelectorAll('a[href^="/go/"]'))
          expect(dealLinks.length).toBe(deals.length)
        }
      ),
      { numRuns: 50 }
    )
  }, 30000)

  /**
   * Property 18: Deal card discount display
   * Validates: Requirements 12.4
   */
  it('Property 18: deal cards show discount percentage when both prices present', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          deal_price_inr: fc.integer({ min: 1000, max: 50000 }),
          original_price_inr: fc.integer({ min: 50001, max: 200000 }),
        }),
        async ({ deal_price_inr, original_price_inr }) => {
          const deal = { ...baseDeal, deal_price_inr, original_price_inr }
          mockFetchActiveDeals.mockResolvedValue([deal])
          let container!: HTMLElement
          await act(async () => {
            const r = render(await DealsPage())
            container = r.container
          })
          const text = container.textContent ?? ''
          expect(text).toMatch(/\d+%/)
        }
      ),
      { numRuns: 50 }
    )
  }, 30000)
})
