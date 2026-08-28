/**
 * Property-based tests for ProductCard
 * Validates: Requirements 2.1, 2.3, 15.2
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import * as fc from 'fast-check'
import { ProductCard } from '../ProductCard'
import type { ProductSummary } from '@/types'

vi.mock('next/image', () => ({ default: (props: any) => <img {...props} /> }))
vi.mock('next/link', () => ({ default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a> }))

// Arbitrary for ProductSummary with non-null price so price always renders
const productArb: fc.Arbitrary<ProductSummary> = fc.record({
  id: fc.constant('test-id'),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  slug: fc.string({ minLength: 1, maxLength: 50 }),
  category_id: fc.constant('cat-id'),
  category_slug: fc.string({ minLength: 1, maxLength: 50 }),
  brand_id: fc.constant('brand-id'),
  brand_name: fc.string({ minLength: 1, maxLength: 50 }),
  thumbnail_url: fc.constant(''),
  creator_rating: fc.float({ min: 0, max: 10, noNaN: true }),
  current_price_inr: fc.integer({ min: 1, max: 200000 }),
  launch_price_inr: fc.constant(null),
  is_featured: fc.constant(false),
  is_deal_of_the_day: fc.boolean(),
  deal_badge_text: fc.oneof(fc.constant(null), fc.string({ minLength: 1 })),
  tags: fc.constant([] as string[]),
  youtube_video_url: fc.constant(null),
  created_at: fc.constant('2024-01-01T00:00:00Z'),
})

describe('ProductCard', () => {
  /**
   * Property 2: ProductCard renders all required fields
   * Validates: Requirements 2.1, 2.3
   */
  it('Property 2: renders name, brand, rating, and ₹-prefixed price for any valid product', () => {
    fc.assert(
      fc.property(productArb, (product) => {
        const { container } = render(
          <ProductCard product={product} showDealBadge={false} />
        )
        const text = container.textContent ?? ''

        expect(text).toContain(product.name)
        expect(text).toContain(product.brand_name)
        expect(text).toContain(product.creator_rating.toFixed(1))
        expect(text).toContain('₹')
      })
    )
  })

  /**
   * Property 3: Deal badge visibility
   * Validates: Requirements 15.2
   */
  it('Property 3: deal badge is shown iff is_deal_of_the_day=true or deal_badge_text is non-null', () => {
    fc.assert(
      fc.property(productArb, (product) => {
        const { container } = render(
          <ProductCard product={product} showDealBadge={true} />
        )

        const shouldShowBadge = product.is_deal_of_the_day || !!product.deal_badge_text
        const badgeEl = container.querySelector('.bg-accent')

        if (shouldShowBadge) {
          expect(badgeEl).not.toBeNull()
        } else {
          expect(badgeEl).toBeNull()
        }
      })
    )
  })

  /**
   * Property 3b: ProductCard content structure
   * Validates: Requirements 5.2, 5.3, 5.4, 5.9
   */
  it('Property 3b: ProductCard content structure', () => {
    const productWithNoThumb = fc.record({
      id: fc.constant('test-id'),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      slug: fc.string({ minLength: 1, maxLength: 50 }),
      category_id: fc.constant('cat-id'),
      category_slug: fc.string({ minLength: 1, maxLength: 50 }),
      brand_id: fc.constant('brand-id'),
      brand_name: fc.string({ minLength: 1, maxLength: 50 }),
      thumbnail_url: fc.constant(''),
      creator_rating: fc.float({ min: 0, max: 10, noNaN: true }),
      current_price_inr: fc.integer({ min: 1, max: 200000 }),
      launch_price_inr: fc.constant(null),
      is_featured: fc.constant(false),
      is_deal_of_the_day: fc.constant(false),
      deal_badge_text: fc.constant(null),
      tags: fc.constant([] as string[]),
      youtube_video_url: fc.constant(null),
      created_at: fc.constant('2024-01-01T00:00:00Z'),
    })

    // a. brand_name in .text-muted
    fc.assert(
      fc.property(productArb, (product) => {
        const { container } = render(
          <ProductCard product={product} showDealBadge={false} />
        )
        const mutedEl = container.querySelector('.text-muted')
        expect(mutedEl).not.toBeNull()
        expect(mutedEl!.textContent).toContain(product.brand_name)
      })
    )

    // b. product name in .line-clamp-2.text-primary
    fc.assert(
      fc.property(productArb, (product) => {
        const { container } = render(
          <ProductCard product={product} showDealBadge={false} />
        )
        const nameEl = container.querySelector('.line-clamp-2.text-primary')
        expect(nameEl).not.toBeNull()
        expect(nameEl!.textContent).toContain(product.name)
      })
    )

    // c. price in .text-accent when current_price_inr is non-null
    fc.assert(
      fc.property(productArb, (product) => {
        const { container } = render(
          <ProductCard product={product} showDealBadge={false} />
        )
        if (product.current_price_inr !== null) {
          const priceEl = container.querySelector('.text-accent')
          expect(priceEl).not.toBeNull()
          expect(priceEl!.textContent).toContain('₹')
        }
      })
    )

    // d. SVG placeholder rendered when thumbnail_url is empty
    fc.assert(
      fc.property(productWithNoThumb, (product) => {
        const { container } = render(
          <ProductCard product={product} showDealBadge={false} />
        )
        const svgEl = container.querySelector('svg')
        expect(svgEl).not.toBeNull()
      })
    )
  }, 30000)

  /**
   * Property 4b: DealBadge accent color
   * Validates: Requirements 5.7
   */
  it('Property 4b: DealBadge accent color', () => {
    // Products that should show badge
    const dealProductArb = fc.record({
      id: fc.constant('test-id'),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      slug: fc.string({ minLength: 1, maxLength: 50 }),
      category_id: fc.constant('cat-id'),
      category_slug: fc.string({ minLength: 1, maxLength: 50 }),
      brand_id: fc.constant('brand-id'),
      brand_name: fc.string({ minLength: 1, maxLength: 50 }),
      thumbnail_url: fc.constant(''),
      creator_rating: fc.float({ min: 0, max: 10, noNaN: true }),
      current_price_inr: fc.constant(null),
      launch_price_inr: fc.constant(null),
      is_featured: fc.constant(false),
      is_deal_of_the_day: fc.constant(false),
      deal_badge_text: fc.constant(null),
      tags: fc.constant([] as string[]),
      youtube_video_url: fc.constant(null),
      created_at: fc.constant('2024-01-01T00:00:00Z'),
    })

    // flagged = is_deal_of_the_day=true OR deal_badge_text non-null
    const flaggedArb = fc.oneof(
      dealProductArb.map((p) => ({ ...p, is_deal_of_the_day: true })),
      dealProductArb.map((p) => ({ ...p, deal_badge_text: 'Hot Deal' }))
    )

    // unflagged = both false/null
    const unflaggedArb = dealProductArb.map((p) => ({
      ...p,
      is_deal_of_the_day: false,
      deal_badge_text: null,
    }))

    // flagged products must have .bg-accent
    fc.assert(
      fc.property(flaggedArb, (product) => {
        const { container } = render(
          <ProductCard product={product} showDealBadge={true} />
        )
        expect(container.querySelector('.bg-accent')).not.toBeNull()
      })
    )

    // unflagged products must NOT have .bg-accent
    fc.assert(
      fc.property(unflaggedArb, (product) => {
        const { container } = render(
          <ProductCard product={product} showDealBadge={true} />
        )
        expect(container.querySelector('.bg-accent')).toBeNull()
      })
    )
  })

  /**
   * Property 1: No emoji characters in rendered UI
   * Validates: Requirements 1.7, 2.5, 13.3, 16.2
   */
  it('Property 1: no emoji characters in ProductCard rendered output', () => {
    // Covers Unicode emoji ranges: Misc Symbols & Pictographs, Emoticons, Transport,
    // Supplemental Symbols, Dingbats, Misc Symbols
    const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u
    fc.assert(
      fc.property(productArb, (product) => {
        const { container } = render(
          <ProductCard product={product} showDealBadge={true} />
        )
        expect(emojiRegex.test(container.textContent ?? '')).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 4: ProductCard link construction
   * Validates: Requirements 2.3
   */
  it('Property 4: all internal links have href equal to /{category_slug}/{slug}', () => {
    fc.assert(
      fc.property(productArb, (product) => {
        const { container } = render(
          <ProductCard product={product} showDealBadge={false} />
        )

        const expectedHref = `/${product.category_slug}/${product.slug}`
        const anchors = Array.from(container.querySelectorAll('a[href^="/"]'))

        expect(anchors.length).toBeGreaterThan(0)
        anchors.forEach((anchor) => {
          expect(anchor.getAttribute('href')).toBe(expectedHref)
        })
      })
    )
  })
})
