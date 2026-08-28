/**
 * Property-based tests for deal validation logic.
 * **Validates: Requirements 10.1**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { z } from 'zod'

// ── Schema (replicated from actions.ts) ──────────────────────────────────────

const DealPriceSchema = z
  .object({
    original_price_inr: z.number().positive().nullable().optional(),
    deal_price_inr: z.number().positive().nullable().optional(),
  })
  .refine(
    (data) =>
      !(
        data.deal_price_inr != null &&
        data.original_price_inr != null &&
        data.deal_price_inr >= data.original_price_inr
      ),
    { message: 'Deal price must be less than original price', path: ['deal_price_inr'] }
  )

// ── Property 20: Deal price invariant ────────────────────────────────────────
// **Validates: Requirements 10.1**

describe('Property 20: Deal price invariant', () => {
  it('accepts when deal_price_inr < original_price_inr, rejects when deal_price_inr >= original_price_inr', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.float({ min: 1, max: 100000, noNaN: true }),
          fc.float({ min: 1, max: 100000, noNaN: true })
        ),
        ([original, deal]) => {
          const result = DealPriceSchema.safeParse({
            original_price_inr: original,
            deal_price_inr: deal,
          })

          if (deal < original) {
            expect(result.success).toBe(true)
          } else {
            expect(result.success).toBe(false)
          }
        }
      )
    )
  })

  it('passes when original_price_inr is null (no constraint)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1, max: 100000, noNaN: true }),
        (deal) => {
          const result = DealPriceSchema.safeParse({
            original_price_inr: null,
            deal_price_inr: deal,
          })
          expect(result.success).toBe(true)
        }
      )
    )
  })

  it('passes when deal_price_inr is null (no constraint)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1, max: 100000, noNaN: true }),
        (original) => {
          const result = DealPriceSchema.safeParse({
            original_price_inr: original,
            deal_price_inr: null,
          })
          expect(result.success).toBe(true)
        }
      )
    )
  })

  it('passes when both prices are null (no constraint)', () => {
    const result = DealPriceSchema.safeParse({
      original_price_inr: null,
      deal_price_inr: null,
    })
    expect(result.success).toBe(true)
  })
})
