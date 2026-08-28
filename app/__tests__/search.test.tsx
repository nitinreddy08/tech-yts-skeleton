// Feature: ui-redesign, Property 15: Search results query term highlighting

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act } from '@testing-library/react'
import * as fc from 'fast-check'

// --- Mocks ---

vi.mock('next/navigation', () => ({ notFound: vi.fn() }))
vi.mock('next/link', () => ({
  default: ({ href, children, ...p }: any) => <a href={href} {...p}>{children}</a>,
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

const mockSearchProducts = vi.fn()
vi.mock('@/lib/data/search', () => ({
  searchProducts: (...a: any[]) => mockSearchProducts(...a),
}))

// Import the page AFTER mocks are set up
import SearchPage from '../search/page'

// --- Arbitraries ---

// A query of 2-10 lowercase letters
const queryArb = fc.stringMatching(/^[a-z]{2,10}$/)

// A SearchResult whose name contains the query
const resultWithMatchArb = (query: string) =>
  fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 20 }).map((prefix) => prefix + query + 'suffix'),
    slug: fc.constant('test-product'),
    category_slug: fc.constant('smartphones'),
    thumbnail_url: fc.constant(''),
    current_price_inr: fc.constant(50000),
    type: fc.constant('product' as const),
  })

// --- Tests ---

beforeEach(() => {
  mockSearchProducts.mockReset()
})

describe('SearchPage', () => {
  /**
   * Property 15: Search results query term highlighting
   * Validates: Requirements 10.5
   *
   * For any non-empty query string and any SearchResult whose name contains the query,
   * the rendered output should contain a <mark> element with the matched text.
   */
  it('Property 15: matched query term is wrapped in <mark> element', async () => {
    await fc.assert(
      fc.asyncProperty(queryArb, async (query) => {
        const result = {
          id: 'r1',
          name: `prefix${query}suffix`,
          slug: 'test',
          category_slug: 'smartphones',
          thumbnail_url: '',
          current_price_inr: 50000,
          type: 'product' as const,
        }
        mockSearchProducts.mockResolvedValue([result])

        let container!: HTMLElement
        await act(async () => {
          const jsx = await SearchPage({ searchParams: Promise.resolve({ q: query }) })
          const r = render(jsx)
          container = r.container
        })

        const marks = container.querySelectorAll('mark')
        expect(marks.length).toBeGreaterThan(0)
        // The mark content should match the query (case-insensitive)
        const markTexts = Array.from(marks).map((m) => m.textContent?.toLowerCase() ?? '')
        expect(markTexts.some((t) => t.includes(query.toLowerCase()))).toBe(true)
      }),
      { numRuns: 50 }
    )
  }, 30000)
})
