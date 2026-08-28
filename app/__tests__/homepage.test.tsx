// Feature: ui-redesign, Property 22: Homepage Best-Of preview cap
// Property 23: Deal of the Day banner conditional render
// Property 2: No dark background classes on public pages

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act } from '@testing-library/react'
import * as fc from 'fast-check'

// --- Mocks ---

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('framer-motion', () => ({
  motion: {
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

vi.mock('@/components/ui/SearchBar', () => ({
  SearchBar: () => <input data-testid="search-bar" />,
}))

vi.mock('@/components/ui/CategoryPills', () => ({
  CategoryPills: ({ categories }: any) => (
    <div data-testid="category-pills">
      {categories.map((c: any) => c.name).join(',')}
    </div>
  ),
}))

vi.mock('@/components/ui/ProductCard', () => ({
  ProductCard: ({ product }: any) => (
    <div data-testid="product-card">{product.name}</div>
  ),
}))

vi.mock('@/components/ui/EmptyState', () => ({
  EmptyState: ({ heading }: any) => (
    <div data-testid="empty-state">{heading}</div>
  ),
}))

vi.mock('@/components/ui/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}))

vi.mock('@/components/ui/Footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}))

// Data module mocks — set up with vi.fn() so each test can override
const mockFetchFeaturedProducts = vi.fn()
const mockFetchLatestProducts = vi.fn()
const mockFetchAllCategories = vi.fn()
const mockFetchActiveDeals = vi.fn()
const mockFetchBestOfLists = vi.fn()

vi.mock('@/lib/config', () => ({
  siteConfig: {
    site_name: 'TestSite',
    tagline: 'Best reviews',
    logo_url: '',
    favicon_url: '',
    primary_color: '#111111',
    secondary_color: '#0066FF',
    creator_name: 'Creator',
    creator_photo_url: '',
    creator_youtube_channel_url: '',
    social_links: {},
    footer_text: '',
    google_adsense_id: null,
    google_analytics_id: null,
    meta_default_title: 'TestSite',
    meta_default_description: 'desc',
  },
}))

vi.mock('@/lib/data/products', () => ({
  fetchFeaturedProducts: (...args: any[]) => mockFetchFeaturedProducts(...args),
  fetchLatestProducts: (...args: any[]) => mockFetchLatestProducts(...args),
}))

vi.mock('@/lib/data/categories', () => ({
  fetchAllCategories: (...args: any[]) => mockFetchAllCategories(...args),
}))

vi.mock('@/lib/data/deals', () => ({
  fetchActiveDeals: (...args: any[]) => mockFetchActiveDeals(...args),
}))

vi.mock('@/lib/data/best-of-lists', () => ({
  fetchBestOfLists: (...args: any[]) => mockFetchBestOfLists(...args),
}))

// Import the page AFTER mocks are set up
import HomePage from '../page'

// --- Shared fixtures ---

const defaultProduct = {
  id: 'prod-1',
  name: 'Test Product',
  slug: 'test-product',
  category_id: 'cat-1',
  category_slug: 'smartphones',
  brand_id: 'brand-1',
  brand_name: 'TestBrand',
  thumbnail_url: '',
  creator_rating: 8.5,
  current_price_inr: 50000,
  launch_price_inr: null,
  is_featured: true,
  is_deal_of_the_day: false,
  deal_badge_text: null,
  tags: [],
  youtube_video_url: null,
  created_at: '2024-01-01T00:00:00Z',
}

beforeEach(() => {
  mockFetchFeaturedProducts.mockResolvedValue([])
  mockFetchLatestProducts.mockResolvedValue([])
  mockFetchAllCategories.mockResolvedValue([])
  mockFetchActiveDeals.mockResolvedValue([])
  mockFetchBestOfLists.mockResolvedValue([])
})

// --- Arbitraries ---

const bestOfListArb = fc.record({
  id: fc.uuid(),
  slug: fc.stringMatching(/^[a-z0-9-]{1,20}$/),
  title: fc.string({ minLength: 1, maxLength: 40 }),
  description: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null }),
  items: fc.array(
    fc.record({ id: fc.uuid(), rank: fc.integer({ min: 1, max: 10 }) }),
    { minLength: 0, maxLength: 5 }
  ),
  cover_image_url: fc.constant(null),
  is_published: fc.constant(true),
  display_order: fc.constant(0),
  created_at: fc.constant('2024-01-01T00:00:00Z'),
  updated_at: fc.constant('2024-01-01T00:00:00Z'),
})

const dealProductArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  thumbnail_url: fc.constant(''),
  slug: fc.string({ minLength: 1, maxLength: 30 }),
  category_slug: fc.constant('smartphones'),
  category_id: fc.constant('cat-1'),
  brand_id: fc.constant('brand-1'),
  brand_name: fc.constant('Brand'),
  creator_rating: fc.constant(8),
  current_price_inr: fc.constant(50000),
  launch_price_inr: fc.constant(null),
  is_featured: fc.constant(false),
  is_deal_of_the_day: fc.constant(false),
  deal_badge_text: fc.constant(null),
  tags: fc.constant([]),
  youtube_video_url: fc.constant(null),
  created_at: fc.constant('2024-01-01T00:00:00Z'),
})

const dealArb = fc.record({
  id: fc.uuid(),
  deal_type: fc.constantFrom('deal_of_day', 'price_drop') as fc.Arbitrary<'deal_of_day' | 'price_drop'>,
  is_active: fc.constant(true),
  headline: fc.option(fc.string(), { nil: null }),
  store_name: fc.string({ minLength: 1, maxLength: 30 }),
  deal_price_inr: fc.option(fc.integer({ min: 1000, max: 200000 }), { nil: null }),
  original_price_inr: fc.option(fc.integer({ min: 1000, max: 200000 }), { nil: null }),
  affiliate_url: fc.constant('https://example.com'),
  expires_at: fc.constant(null),
  product_id: fc.uuid(),
  starts_at: fc.constant(null),
  created_at: fc.constant('2024-01-01T00:00:00Z'),
  product: fc.option(dealProductArb, { nil: null }),
})

// --- Tests ---

describe('Homepage', () => {
  /**
   * Property 22: Homepage Best-Of preview cap
   * Validates: Requirements 6.6
   *
   * For any array of BestOfList items with length > 3, the homepage renders at most 3 Best-Of cards.
   */
  it(
    'Property 22: renders at most 3 Best-Of cards regardless of how many lists are returned',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(bestOfListArb, { minLength: 4, maxLength: 20 }),
          async (lists) => {
            mockFetchBestOfLists.mockResolvedValue(lists)

            let container!: HTMLElement
            await act(async () => {
              const result = render(await HomePage())
              container = result.container
            })

            // Count links to /best-of/ paths (each card is a <Link href="/best-of/...">)
            const bestOfLinks = Array.from(
              container.querySelectorAll('a[href^="/best-of/"]')
            )
            expect(bestOfLinks.length).toBeLessThanOrEqual(3)
          }
        ),
        { numRuns: 50 }
      )
    },
    30000
  )

  /**
   * Property 23: Deal of the Day banner conditional render
   * Validates: Requirements 6.4
   *
   * Case A: deal_type='deal_of_day' with non-null product → banner renders
   * Case B: no deal_of_day type → banner does not render
   */
  it(
    'Property 23: Deal of the Day banner renders iff a deal_of_day deal with a product exists',
    async () => {
      // Case A: deal_of_day with product present
      await fc.assert(
        fc.asyncProperty(
          dealArb.map((d) => ({
            ...d,
            deal_type: 'deal_of_day' as const,
            product: {
              id: 'prod-deal',
              name: 'Deal Product',
              thumbnail_url: '',
              slug: 'deal-product',
              category_slug: 'smartphones',
              category_id: 'cat-1',
              brand_id: 'brand-1',
              brand_name: 'Brand',
              creator_rating: 8,
              current_price_inr: 50000,
              launch_price_inr: null,
              is_featured: false,
              is_deal_of_the_day: true,
              deal_badge_text: null,
              tags: [],
              youtube_video_url: null,
              created_at: '2024-01-01T00:00:00Z',
            },
          })),
          async (deal) => {
            mockFetchActiveDeals.mockResolvedValue([deal])

            let container!: HTMLElement
            await act(async () => {
              const result = render(await HomePage())
              container = result.container
            })

            const text = container.textContent ?? ''
            expect(text).toContain('Deal of the Day')
          }
        ),
        { numRuns: 50 }
      )

      // Case B: no deal_of_day deals
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            dealArb.map((d) => ({ ...d, deal_type: 'price_drop' as const })),
            { minLength: 0, maxLength: 5 }
          ),
          async (deals) => {
            mockFetchActiveDeals.mockResolvedValue(deals)

            let container!: HTMLElement
            await act(async () => {
              const result = render(await HomePage())
              container = result.container
            })

            const text = container.textContent ?? ''
            expect(text).not.toContain('Deal of the Day')
          }
        ),
        { numRuns: 50 }
      )
    },
    30000
  )

  /**
   * Property 2: No dark background classes on public pages
   * Validates: Requirements 1.8, 16.1
   *
   * For any valid data combination, the homepage renders no elements with dark background
   * Tailwind classes (bg-zinc-900, bg-black, bg-gray-900, bg-white/5, bg-gradient-to-br, etc.)
   */
  it(
    'Property 2: homepage renders no dark background Tailwind classes',
    async () => {
      const darkBgPattern =
        /\b(bg-zinc-[6-9]00|bg-black|bg-gray-[6-9]00|bg-white\/5|bg-gradient-to-br)\b/

      await fc.assert(
        fc.asyncProperty(
          fc.array(bestOfListArb, { minLength: 0, maxLength: 5 }),
          fc.array(dealArb, { minLength: 0, maxLength: 3 }),
          async (lists, deals) => {
            mockFetchBestOfLists.mockResolvedValue(lists)
            mockFetchActiveDeals.mockResolvedValue(deals)
            mockFetchFeaturedProducts.mockResolvedValue([defaultProduct])
            mockFetchLatestProducts.mockResolvedValue([defaultProduct])

            let container!: HTMLElement
            await act(async () => {
              const result = render(await HomePage())
              container = result.container
            })

            expect(darkBgPattern.test(container.innerHTML)).toBe(false)
          }
        ),
        { numRuns: 50 }
      )
    },
    30000
  )
})
