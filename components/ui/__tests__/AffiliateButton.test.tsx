// Feature: ui-redesign, Property 6: AffiliateButton content completeness

/**
 * Property-based tests for AffiliateButton
 * Validates: Requirements 7.4
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import * as fc from 'fast-check'
import { AffiliateButton } from '../AffiliateButton'
import type { AffiliateLink } from '@/types'

vi.mock('next/link', () => ({ default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a> }))

const affiliateLinkArb: fc.Arbitrary<AffiliateLink> = fc.record({
  id: fc.uuid(),
  product_id: fc.uuid(),
  store_name: fc.string({ minLength: 1, maxLength: 30 }),
  store_icon: fc.option(fc.string(), { nil: null }),
  affiliate_url: fc.constant('/go/test-id'),
  price_inr: fc.option(fc.integer({ min: 100, max: 500000 }), { nil: null }),
  is_best_price: fc.boolean(),
  last_updated: fc.constant('2024-01-01T00:00:00Z'),
})

describe('AffiliateButton', () => {
  /**
   * Property 6a: store_name always appears in rendered output
   * Validates: Requirements 7.4
   */
  it('Property 6a: rendered output contains store_name for any AffiliateLink', () => {
    fc.assert(
      fc.property(affiliateLinkArb, (link) => {
        const { container } = render(<AffiliateButton link={link} />)
        expect(container.textContent).toContain(link.store_name)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 6b: link href is /go/{link.id}
   * Validates: Requirements 7.4
   */
  it('Property 6b: link href equals /go/{link.id}', () => {
    fc.assert(
      fc.property(affiliateLinkArb, (link) => {
        const { container } = render(<AffiliateButton link={link} />)
        const anchor = container.querySelector('a')
        expect(anchor?.getAttribute('href')).toBe(`/go/${link.id}`)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 6c: ₹ symbol appears when price_inr is non-null
   * Validates: Requirements 7.4
   */
  it('Property 6c: ₹ symbol is present when price_inr is non-null', () => {
    const withPriceArb = affiliateLinkArb.filter((link) => link.price_inr != null)
    fc.assert(
      fc.property(withPriceArb, (link) => {
        const { container } = render(<AffiliateButton link={link} />)
        expect(container.textContent).toContain('₹')
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 6d: bg-accent class present iff isBestPrice=true
   * Validates: Requirements 7.4
   */
  it('Property 6d: bg-accent class present iff isBestPrice=true', () => {
    fc.assert(
      fc.property(affiliateLinkArb, (link) => {
        const { container: containerTrue } = render(<AffiliateButton link={link} isBestPrice={true} />)
        const { container: containerFalse } = render(<AffiliateButton link={link} isBestPrice={false} />)

        const anchorTrue = containerTrue.querySelector('a')
        const anchorFalse = containerFalse.querySelector('a')

        expect(anchorTrue?.className).toContain('bg-accent')
        expect(anchorFalse?.className).not.toContain('bg-accent')
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 6e: no emoji characters in rendered output
   * Validates: Requirements 7.4
   */
  it('Property 6e: no emoji characters in rendered output', () => {
    // Unicode ranges U+1F300–U+1FAFF cover most emoji blocks
    const emojiRegex = /[\u{1F300}-\u{1FAFF}]/u
    fc.assert(
      fc.property(affiliateLinkArb, (link) => {
        const { container } = render(<AffiliateButton link={link} />)
        expect(emojiRegex.test(container.textContent ?? '')).toBe(false)
      }),
      { numRuns: 100 }
    )
  })
})
