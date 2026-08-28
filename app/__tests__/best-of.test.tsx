// Feature: ui-redesign, Property 16: Best-Of rank numbers in accent color

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

vi.mock('@/lib/utils/format', () => ({
  formatIndianPrice: (n: number) => `₹${n}`,
}))

const mockFetchBestOfListBySlug = vi.fn()
vi.mock('@/lib/data/best-of-lists', () => ({
  fetchBestOfListBySlug: (...a: any[]) => mockFetchBestOfListBySlug(...a),
}))

// Import page AFTER mocks
import BestOfListPage from '../best-of/[slug]/page'

// --- Arbitraries ---

const productSummaryArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 40 }),
  slug: fc.stringMatching(/^[a-z0-9-]{1,20}$/),
  category_slug: fc.constant('smartphones'),
  brand_name: fc.string({ minLength: 1, maxLength: 20 }),
  thumbnail_url: fc.constant(''),
  current_price_inr: fc.option(fc.integer({ min: 1000, max: 200000 }), { nil: null }),
  category_id: fc.constant('cat-1'),
  brand_id: fc.constant('brand-1'),
  creator_rating: fc.constant(8),
  launch_price_inr: fc.constant(null),
  is_featured: fc.constant(false),
  is_deal_of_the_day: fc.constant(false),
  deal_badge_text: fc.constant(null),
  tags: fc.constant([]),
  youtube_video_url: fc.constant(null),
  created_at: fc.constant('2024-01-01T00:00:00Z'),
})

const bestOfItemArb = (rank: number) =>
  fc.record({
    id: fc.uuid(),
    list_id: fc.constant('list-1'),
    product_id: fc.uuid(),
    rank: fc.constant(rank),
    pick_reason: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null }),
    product: productSummaryArb,
  })

const bestOfListArb = fc.integer({ min: 1, max: 6 }).chain((n) =>
  fc
    .tuple(...(Array.from({ length: n }, (_, i) => bestOfItemArb(i + 1)) as [fc.Arbitrary<any>, ...fc.Arbitrary<any>[]]))
    .map((items) => ({
      id: 'list-1',
      slug: 'best-smartphones',
      title: 'Best Smartphones',
      description: 'Top picks',
      cover_image_url: null,
      is_published: true,
      display_order: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      items,
    }))
)

// --- Tests ---

describe('BestOfListPage', () => {
  beforeEach(() => {
    mockFetchBestOfListBySlug.mockReset()
  })

  /**
   * Property 16: Best-Of rank numbers in accent color
   * Validates: Requirements 11.2, 11.3
   */
  it('Property 16: rank numbers are numeric, have text-accent class, no emoji', async () => {
    await fc.assert(
      fc.asyncProperty(bestOfListArb, async (list) => {
        mockFetchBestOfListBySlug.mockResolvedValue(list)

        let container!: HTMLElement
        await act(async () => {
          const jsx = await BestOfListPage({ params: Promise.resolve({ slug: list.slug }) })
          const r = render(jsx)
          container = r.container
        })

        // Find rank number elements (span with text-accent and font-heading)
        const rankEls = Array.from(container.querySelectorAll('span.text-accent'))
        expect(rankEls.length).toBe(list.items.length)

        rankEls.forEach((el, i) => {
          const text = el.textContent?.trim() ?? ''
          // Must be a pure number (no # prefix, no emoji)
          expect(/^\d+$/.test(text)).toBe(true)
          expect(Number(text)).toBe(list.items[i].rank)
        })

        // No emoji
        const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u
        expect(emojiRegex.test(container.textContent ?? '')).toBe(false)
      }),
      { numRuns: 50 }
    )
  }, 30000)
})
