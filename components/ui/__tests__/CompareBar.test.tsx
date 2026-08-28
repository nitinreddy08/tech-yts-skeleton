// Feature: ui-redesign, Property 12: CompareBar visibility threshold

/**
 * Property-based tests for CompareBar
 * Validates: Requirements 9.6
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import * as fc from 'fast-check'
import { CompareBar } from '../CompareBar'
import type { ProductSummary } from '@/types'

vi.mock('next/link', () => ({ default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a> }))
vi.mock('next/image', () => ({ default: (props: any) => <img {...props} /> }))
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className}>{children}</div>,
  },
}))

const productArb: fc.Arbitrary<ProductSummary> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 40 }),
  slug: fc.stringMatching(/^[a-z0-9-]{1,20}$/),
  category_id: fc.constant('cat-id'),
  category_slug: fc.constant('laptops'),
  brand_id: fc.constant('brand-id'),
  brand_name: fc.constant('Brand'),
  thumbnail_url: fc.constant(''),
  creator_rating: fc.constant(8.0),
  current_price_inr: fc.constant(null),
  launch_price_inr: fc.constant(null),
  is_featured: fc.constant(false),
  is_deal_of_the_day: fc.constant(false),
  deal_badge_text: fc.constant(null),
  tags: fc.constant([]),
  youtube_video_url: fc.constant(null),
  created_at: fc.constant('2024-01-01T00:00:00Z'),
})

const noop = () => {}

describe('CompareBar', () => {
  /**
   * Property 12a: CompareBar is NOT rendered when products.length < 2
   * Validates: Requirements 9.6
   */
  it('Property 12a: bar is not rendered when fewer than 2 products are selected', () => {
    fc.assert(
      fc.property(fc.array(productArb, { minLength: 0, maxLength: 1 }), (products) => {
        const { container } = render(
          <CompareBar products={products} onRemove={noop} onClear={noop} />
        )
        expect(container.querySelector('.fixed')).toBeNull()
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 12b: CompareBar IS rendered when products.length >= 2
   * Validates: Requirements 9.6
   */
  it('Property 12b: bar is rendered when 2 or more products are selected', () => {
    fc.assert(
      fc.property(fc.array(productArb, { minLength: 2, maxLength: 4 }), (products) => {
        const { container } = render(
          <CompareBar products={products} onRemove={noop} onClear={noop} />
        )
        expect(container.querySelector('.fixed')).not.toBeNull()
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 12c: "Compare Now" link href contains all product slugs
   * Validates: Requirements 9.6
   */
  it('Property 12c: Compare Now link href contains all product slugs', () => {
    fc.assert(
      fc.property(fc.array(productArb, { minLength: 2, maxLength: 4 }), (products) => {
        const { container } = render(
          <CompareBar products={products} onRemove={noop} onClear={noop} />
        )
        const anchor = container.querySelector('a[href^="/compare/"]')
        expect(anchor).not.toBeNull()
        const href = anchor!.getAttribute('href') ?? ''
        for (const product of products) {
          expect(href).toContain(product.slug)
        }
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 12d: Each product name appears in the rendered bar
   * Validates: Requirements 9.6
   */
  it('Property 12d: each product name is visible in the compare bar', () => {
    fc.assert(
      fc.property(fc.array(productArb, { minLength: 2, maxLength: 4 }), (products) => {
        const { container } = render(
          <CompareBar products={products} onRemove={noop} onClear={noop} />
        )
        const text = container.textContent ?? ''
        for (const product of products) {
          expect(text).toContain(product.name)
        }
      }),
      { numRuns: 100 }
    )
  })
})
