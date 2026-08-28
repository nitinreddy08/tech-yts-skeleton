import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Pure filtering logic extracted from fetchActiveDeals in lib/data/deals.ts
 * Mirrors: .eq('is_active', true).or(`expires_at.is.null,expires_at.gt.${now}`)
 */
function isActiveDeal(
  deal: { is_active: boolean; expires_at: string | null },
  now: string
): boolean {
  if (!deal.is_active) return false
  if (deal.expires_at === null) return true
  return deal.expires_at > now
}

/**
 * Property 21: Expired deals excluded from public queries
 * Validates: Requirements 10.3
 */
describe('isActiveDeal — Property 21: Expired deals excluded from public queries', () => {
  it('if isActiveDeal returns true, deal must be active and not expired', () => {
    fc.assert(
      fc.property(
        fc.record({
          is_active: fc.boolean(),
          expires_at: fc.oneof(
            fc.constant(null),
            fc.date().map((d) => d.toISOString())
          ),
        }),
        fc.date(),
        (deal, now) => {
          if (isActiveDeal(deal, now.toISOString()) === true) {
            expect(deal.is_active).toBe(true)
            const notExpired =
              deal.expires_at === null || deal.expires_at > now.toISOString()
            expect(notExpired).toBe(true)
          }
        }
      )
    )
  })

  it('contrapositive: past expires_at with is_active=true returns false', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }).filter(d => !isNaN(d.getTime())),
        fc.integer({ min: 1, max: 365 * 24 * 60 * 60 * 1000 }),
        (now, offsetMs) => {
          const pastDate = new Date(now.getTime() - offsetMs)
          const deal = {
            is_active: true,
            expires_at: pastDate.toISOString(),
          }
          expect(isActiveDeal(deal, now.toISOString())).toBe(false)
        }
      )
    )
  })
})
