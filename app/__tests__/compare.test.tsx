// Feature: ui-redesign, Property 13: Comparison page enforces max 4 products
// Property 14: CompareTable winning value highlight

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
vi.mock('@/lib/utils/seo', () => ({
  generateComparisonMetadata: () => ({}),
}))
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div> },
}))

const mockFetchProductBySlug = vi.fn()
vi.mock('@/lib/data/products', () => ({
  fetchProductBySlug: (...a: any[]) => mockFetchProductBySlug(...a),
  fetchFeaturedProducts: () => Promise.resolve([]),
}))

// Import the page AFTER mocks are set up
import ComparePage from '../compare/page'

// --- Helpers ---

function makeProduct(slug: string, specValue: string) {
  return {
    id: slug,
    name: `Product ${slug}`,
    slug,
    category_id: 'cat-1',
    category_slug: 'smartphones',
    brand_id: 'brand-1',
    brand_name: 'TestBrand',
    thumbnail_url: '',
    creator_rating: 8.0,
    current_price_inr: 50000,
    launch_price_inr: null,
    is_featured: false,
    is_deal_of_the_day: false,
    deal_badge_text: null,
    tags: [],
    youtube_video_url: null,
    created_at: '2024-01-01T00:00:00Z',
    tagline: null,
    description: null,
    specifications: { display_size: specValue },
    pros: [],
    cons: [],
    youtube_short_url: null,
    gallery_images: [],
    is_published: true,
    updated_at: '2024-01-01T00:00:00Z',
    affiliate_links: [],
    faqs: [],
    category: {
      id: 'cat-1',
      name: 'Smartphones',
      slug: 'smartphones',
      icon: 'smartphone',
      description: null,
      spec_template: {
        fields: [{ key: 'display_size', label: 'Display Size', type: 'text' }],
      },
      display_order: 0,
      created_at: '2024-01-01T00:00:00Z',
    },
    brand: { id: 'brand-1', name: 'TestBrand', slug: 'testbrand', logo_url: null },
  }
}

// --- Arbitraries ---

// Arbitrary for a slug string (simple alphanumeric)
const slugArb = fc.stringMatching(/^[a-z]{3,8}$/)

// Arbitrary for an array of > 4 unique slugs
const manySlugArb = fc
  .uniqueArray(slugArb, { minLength: 5, maxLength: 10 })

// --- Tests ---

beforeEach(() => {
  mockFetchProductBySlug.mockReset()
})

describe('ComparePage', () => {
  /**
   * Property 13: Comparison page enforces max 4 products
   * Validates: Requirements 9.1
   *
   * For any array of product slugs with length > 4, the page renders at most 4 product columns.
   */
  it(
    'Property 13: renders at most 4 product header columns regardless of how many slugs are passed',
    async () => {
      await fc.assert(
        fc.asyncProperty(manySlugArb, async (slugs) => {
          // Mock fetchProductBySlug to return a distinct product for each slug
          mockFetchProductBySlug.mockImplementation((slug: string) =>
            Promise.resolve(makeProduct(slug, '6.1 inch'))
          )

          let container!: HTMLElement
          await act(async () => {
            const result = render(
              await ComparePage({
                searchParams: Promise.resolve({ products: slugs.join(',') }),
              })
            )
            container = result.container
          })

          // Count h2 elements inside the product header row (one per product column)
          const productHeaders = Array.from(container.querySelectorAll('h2'))
          expect(productHeaders.length).toBeLessThanOrEqual(4)
        }),
        { numRuns: 50 }
      )
    },
    30000
  )

  /**
   * Property 14: CompareTable winning value highlight
   * Validates: Requirements 9.4
   *
   * For any spec row where hasDiff=true (products have different values),
   * the winning value cells should contain a <svg> (Trophy icon) with text-accent class.
   * Rows where all values are identical should have no Trophy icon.
   */
  it(
    'Property 14: diff rows contain Trophy SVG with text-accent; identical rows do not',
    async () => {
      // Arbitrary for two distinct spec values
      const diffValueArb = fc
        .tuple(
          fc.string({ minLength: 1, maxLength: 10 }),
          fc.string({ minLength: 1, maxLength: 10 })
        )
        .filter(([a, b]) => a !== b)

      await fc.assert(
        fc.asyncProperty(diffValueArb, async ([val1, val2]) => {
          const slug1 = 'prod-a'
          const slug2 = 'prod-b'

          mockFetchProductBySlug.mockImplementation((slug: string) => {
            if (slug === slug1) return Promise.resolve(makeProduct(slug1, val1))
            if (slug === slug2) return Promise.resolve(makeProduct(slug2, val2))
            return Promise.resolve(null)
          })

          let container!: HTMLElement
          await act(async () => {
            const result = render(
              await ComparePage({
                searchParams: Promise.resolve({ products: `${slug1},${slug2}` }),
              })
            )
            container = result.container
          })

          // There should be a table rendered
          const table = container.querySelector('table')
          expect(table).not.toBeNull()

          // Find all <td> cells that contain a <svg> (Trophy icon)
          const tds = Array.from(container.querySelectorAll('td'))
          const tdsWithSvg = tds.filter((td) => td.querySelector('svg') !== null)

          // Since val1 !== val2, hasDiff=true → Trophy icons should appear
          expect(tdsWithSvg.length).toBeGreaterThan(0)

          // Each td with a Trophy svg should have a span with text-accent class
          tdsWithSvg.forEach((td) => {
            const span = td.querySelector('span')
            expect(span).not.toBeNull()
            expect(span!.className).toContain('text-accent')
          })
        }),
        { numRuns: 50 }
      )
    },
    30000
  )

  it(
    'Property 14 (identical values): rows with identical spec values have no Trophy icon',
    async () => {
      const sameValue = '6.1 inch'
      const slug1 = 'prod-a'
      const slug2 = 'prod-b'

      mockFetchProductBySlug.mockImplementation((slug: string) => {
        if (slug === slug1) return Promise.resolve(makeProduct(slug1, sameValue))
        if (slug === slug2) return Promise.resolve(makeProduct(slug2, sameValue))
        return Promise.resolve(null)
      })

      let container!: HTMLElement
      await act(async () => {
        const result = render(
          await ComparePage({
            searchParams: Promise.resolve({ products: `${slug1},${slug2}` }),
          })
        )
        container = result.container
      })

      const table = container.querySelector('table')
      expect(table).not.toBeNull()

      // No Trophy SVGs should appear when all values are identical
      const tds = Array.from(container.querySelectorAll('td'))
      const tdsWithSvg = tds.filter((td) => td.querySelector('svg') !== null)
      expect(tdsWithSvg.length).toBe(0)
    },
    15000
  )
})
