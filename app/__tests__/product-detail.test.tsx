// Feature: ui-redesign, Property 8: Pros use CheckCircle, cons use XCircle

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act } from '@testing-library/react'
import * as fc from 'fast-check'

// --- Mocks ---

vi.mock('next/navigation', () => ({ notFound: vi.fn(), redirect: vi.fn() }))
vi.mock('next/link', () => ({ default: ({ href, children, ...p }: any) => <a href={href} {...p}>{children}</a> }))
vi.mock('next/image', () => ({ default: ({ src, alt, ...p }: any) => <img src={src} alt={alt} {...p} /> }))
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div> },
}))
vi.mock('@radix-ui/react-accordion', () => ({
  Root: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  Item: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  Trigger: ({ children, ...p }: any) => <button {...p}>{children}</button>,
  Content: ({ children, ...p }: any) => <div {...p}>{children}</div>,
}))
vi.mock('@/components/ui/ProductGallery', () => ({ ProductGallery: () => <div data-testid="gallery" /> }))
vi.mock('@/components/ui/ProductCard', () => ({ ProductCard: ({ product }: any) => <div data-testid="product-card">{product.name}</div> }))
vi.mock('@/lib/utils/seo', () => ({ generateProductMetadata: () => ({}), generateProductJsonLd: () => ({}) }))
vi.mock('@/lib/utils/format', () => ({ extractYouTubeId: () => null, formatIndianPrice: (n: number) => `₹${n}` }))

const mockFetchProductDetail = vi.fn()
const mockFetchProductsByCategory = vi.fn()
vi.mock('@/lib/data/products', () => ({
  fetchProductDetail: (...a: any[]) => mockFetchProductDetail(...a),
  fetchProductsByCategory: (...a: any[]) => mockFetchProductsByCategory(...a),
  fetchFeaturedProducts: () => Promise.resolve([]),
}))

// Import the page AFTER mocks are set up
import ProductPage from '../[category]/[product]/page'

// --- Arbitraries ---

const proConArb = fc.string({ minLength: 1, maxLength: 60 })

const productDetailArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  slug: fc.stringMatching(/^[a-z0-9-]{1,20}$/),
  category_id: fc.uuid(),
  category_slug: fc.constant('smartphones'),
  brand_id: fc.uuid(),
  brand_name: fc.string({ minLength: 1, maxLength: 30 }),
  thumbnail_url: fc.constant(''),
  creator_rating: fc.float({ min: 0, max: 10, noNaN: true }),
  current_price_inr: fc.integer({ min: 1000, max: 200000 }),
  launch_price_inr: fc.constant(null),
  is_featured: fc.constant(false),
  is_deal_of_the_day: fc.constant(false),
  deal_badge_text: fc.constant(null),
  tags: fc.constant([]),
  youtube_video_url: fc.constant(null),
  created_at: fc.constant('2024-01-01T00:00:00Z'),
  tagline: fc.option(fc.string({ minLength: 1, maxLength: 60 }), { nil: null }),
  description: fc.constant(null),
  specifications: fc.constant({}),
  pros: fc.array(proConArb, { minLength: 1, maxLength: 5 }),
  cons: fc.array(proConArb, { minLength: 1, maxLength: 5 }),
  youtube_short_url: fc.constant(null),
  gallery_images: fc.constant([]),
  is_published: fc.constant(true),
  updated_at: fc.constant('2024-01-01T00:00:00Z'),
  affiliate_links: fc.constant([]),
  faqs: fc.constant([]),
  category: fc.constant({
    id: 'cat-1',
    name: 'Smartphones',
    slug: 'smartphones',
    icon: 'smartphone',
    description: null,
    spec_template: { fields: [] },
    display_order: 0,
    created_at: '2024-01-01T00:00:00Z',
  }),
  brand: fc.constant({ id: 'brand-1', name: 'TestBrand', slug: 'testbrand', logo_url: null }),
})

// --- Tests ---

beforeEach(() => {
  mockFetchProductsByCategory.mockResolvedValue([])
})

describe('ProductDetail', () => {
  /**
   * Property 8: Pros use CheckCircle (text-green-600), cons use XCircle (text-red-500), no text symbols
   * Validates: Requirements 7.10
   */
  it('Property 8: pros use CheckCircle (text-green-600), cons use XCircle (text-red-500), no text symbols', async () => {
    await fc.assert(
      fc.asyncProperty(productDetailArb, async (product) => {
        mockFetchProductDetail.mockResolvedValue(product)
        mockFetchProductsByCategory.mockResolvedValue([])

        let container!: HTMLElement
        await act(async () => {
          const result = render(await ProductPage({ params: Promise.resolve({ category: 'smartphones', product: product.slug }) }))
          container = result.container
        })

        // Check pros: each pro text should be in a <li> that contains a green SVG
        const prosSection = container.querySelector('.bg-green-50')
        expect(prosSection).not.toBeNull()
        const proItems = Array.from(prosSection!.querySelectorAll('li'))
        expect(proItems.length).toBe(product.pros.length)
        proItems.forEach((li) => {
          const svg = li.querySelector('svg')
          expect(svg).not.toBeNull()
          expect(svg!.getAttribute('class')).toContain('text-green-600')
        })

        // Check cons: each con text should be in a <li> that contains a red SVG
        const consSection = container.querySelector('.bg-red-50')
        expect(consSection).not.toBeNull()
        const conItems = Array.from(consSection!.querySelectorAll('li'))
        expect(conItems.length).toBe(product.cons.length)
        conItems.forEach((li) => {
          const svg = li.querySelector('svg')
          expect(svg).not.toBeNull()
          expect(svg!.getAttribute('class')).toContain('text-red-500')
        })

        // No text symbols or emoji
        const text = container.textContent ?? ''
        expect(text).not.toContain('✓')
        expect(text).not.toContain('✗')
        const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u
        expect(emojiRegex.test(text)).toBe(false)
      }),
      { numRuns: 50 }
    )
  }, 30000)
})
