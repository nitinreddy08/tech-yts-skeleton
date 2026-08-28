/**
 * Property-based tests for BuySection
 * Validates: Requirements 6.1, 6.3
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import * as fc from 'fast-check'
import { BuySection } from '../BuySection'
import type { AffiliateLink } from '@/types'

vi.mock('next/link', () => ({ default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a> }))

const affiliateLinkArb: fc.Arbitrary<AffiliateLink> = fc.record({
  id: fc.uuid(),
  product_id: fc.constant('prod-1'),
  store_name: fc.stringMatching(/^[A-Za-z0-9 ]{1,30}$/),
  store_icon: fc.constant(null),
  affiliate_url: fc.webUrl(),
  price_inr: fc.oneof(fc.constant(null), fc.integer({ min: 1, max: 200000 })),
  is_best_price: fc.boolean(),
  last_updated: fc.constant('2024-01-01T00:00:00Z'),
})

// Generate arrays of links with unique IDs to avoid React key collisions
const linksArb = fc.uniqueArray(affiliateLinkArb, { minLength: 1, maxLength: 5, selector: (l) => l.id })

describe('BuySection', () => {
  /**
   * Property 9: BuySection sort order
   * Validates: Requirements 6.1
   */
  it('Property 9: links are rendered in ascending price_inr order (nulls last)', () => {
    fc.assert(
      fc.property(linksArb, (links) => {
        const { container } = render(
          <BuySection links={links} productName="Test Product" />
        )

        const expectedOrder = [...links].sort(
          (a, b) => (a.price_inr ?? Infinity) - (b.price_inr ?? Infinity)
        )

        const goAnchors = Array.from(container.querySelectorAll('a[href^="/go/"]'))
        const renderedIds = goAnchors.map((a) => a.getAttribute('href')!.replace('/go/', ''))

        expect(renderedIds).toEqual(expectedOrder.map((l) => l.id))
      })
    )
  })

  /**
   * Property 5: BuySection sort and highlight invariant
   * Validates: Requirements 7.3
   */
  it('Property 5: lowest-price link has bg-accent class; others do not', () => {
    // Only meaningful when at least one link has a non-null price
    const linksWithPriceArb = fc.uniqueArray(
      affiliateLinkArb.map(l => ({ ...l, price_inr: fc.sample(fc.integer({ min: 1, max: 200000 }), 1)[0] })),
      { minLength: 2, maxLength: 5, selector: (l) => l.id }
    )
    fc.assert(
      fc.property(linksWithPriceArb, (links) => {
        const { container } = render(
          <BuySection links={links} productName="Test Product" />
        )
        const sorted = [...links].sort((a, b) => (a.price_inr ?? Infinity) - (b.price_inr ?? Infinity))
        const lowestId = sorted[0].id
        const anchors = Array.from(container.querySelectorAll('a[href^="/go/"]'))
        anchors.forEach(anchor => {
          const id = anchor.getAttribute('href')!.replace('/go/', '')
          if (id === lowestId) {
            expect(anchor.className).toContain('bg-accent')
          } else {
            expect(anchor.className).not.toContain('bg-accent')
          }
        })
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 10: Affiliate links use internal /go/ URLs
   * Validates: Requirements 6.3
   */
  it('Property 10: all rendered hrefs are /go/{id} and never the raw affiliate_url', () => {
    fc.assert(
      fc.property(linksArb, (links) => {
        const { container } = render(
          <BuySection links={links} productName="Test Product" />
        )

        const anchors = Array.from(container.querySelectorAll('a'))
        const hrefs = anchors.map((a) => a.getAttribute('href') ?? '')
        const rawUrls = new Set(links.map((l) => l.affiliate_url))

        hrefs.forEach((href) => {
          expect(href).toMatch(/^\/go\//)
          expect(rawUrls.has(href)).toBe(false)
        })
      })
    )
  })
})
