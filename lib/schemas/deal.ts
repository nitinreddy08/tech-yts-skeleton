/**
 * lib/schemas/deal.ts
 *
 * Schemas for the deal aggregate. A deal is a time-bounded promotion attached
 * to a product. The important engineering idea here is that a deal's *status*
 * (scheduled / active / expired / inactive) is never stored — it is derived
 * from `is_active`, `starts_at`, and `expires_at` against "now". That keeps the
 * store honest (no cron job flipping booleans) and ports cleanly to SQL, where
 * the same predicate becomes a `WHERE` clause.
 */
import { z } from 'zod'
import { idSchema, isoDateSchema, priceInrSchema } from './common'
import { productSummarySchema } from './product'

export const dealTypeSchema = z.enum([
  'deal_of_day',
  'price_drop',
  'upcoming_sale',
  'bank_offer',
  'sale_event',
  'coupon',
])

export const dealSchema = z.object({
  id: idSchema,
  product_id: idSchema,
  deal_type: dealTypeSchema,
  headline: z.string().min(1),
  original_price_inr: priceInrSchema,
  deal_price_inr: priceInrSchema,
  store_name: z.string().min(1),
  affiliate_url: z.string().url(),
  starts_at: isoDateSchema.nullable(),
  expires_at: isoDateSchema.nullable(),
  is_active: z.boolean(),
  created_at: isoDateSchema,
  product: productSummarySchema.optional(),
})

/**
 * Deal price must be strictly below the original when both are present.
 * Shared by the JSON DTO and the admin form schema so the rule lives once.
 */
export function dealPricesConsistent(d: {
  original_price_inr?: number | null
  deal_price_inr?: number | null
}): boolean {
  return !(
    d.deal_price_inr != null &&
    d.original_price_inr != null &&
    d.deal_price_inr >= d.original_price_inr
  )
}

const PRICE_RULE = {
  message: 'Deal price must be less than original price',
  path: ['deal_price_inr'] as string[],
}

/** Clean JSON DTO — what the repository accepts for create. */
export const dealInputSchema = z
  .object({
    product_id: idSchema,
    deal_type: dealTypeSchema,
    headline: z.string().min(1, 'Headline is required'),
    original_price_inr: priceInrSchema.default(null),
    deal_price_inr: priceInrSchema.default(null),
    store_name: z.string().min(1, 'Store name is required'),
    affiliate_url: z.string().url('Must be a valid URL'),
    starts_at: isoDateSchema.nullable().default(null),
    expires_at: isoDateSchema.nullable().default(null),
    is_active: z.boolean().default(true),
  })
  .refine(dealPricesConsistent, PRICE_RULE)

export const dealUpdateSchema = z
  .object({
    product_id: idSchema.optional(),
    deal_type: dealTypeSchema.optional(),
    headline: z.string().min(1).optional(),
    original_price_inr: priceInrSchema.optional(),
    deal_price_inr: priceInrSchema.optional(),
    store_name: z.string().min(1).optional(),
    affiliate_url: z.string().url().optional(),
    starts_at: isoDateSchema.nullable().optional(),
    expires_at: isoDateSchema.nullable().optional(),
    is_active: z.boolean().optional(),
  })
  .refine(dealPricesConsistent, PRICE_RULE)

export type DealType = z.infer<typeof dealTypeSchema>
export type Deal = z.infer<typeof dealSchema>
export type DealInput = z.infer<typeof dealInputSchema>
export type DealUpdate = z.infer<typeof dealUpdateSchema>

// ─── Derived lifecycle status ────────────────────────────────────────────────

export type DealStatus = 'active' | 'scheduled' | 'expired' | 'inactive'

/** Derive a deal's lifecycle status at a given instant (defaults to now). */
export function dealStatus(
  deal: Pick<Deal, 'is_active' | 'starts_at' | 'expires_at'>,
  now: Date = new Date()
): DealStatus {
  if (!deal.is_active) return 'inactive'
  const t = now.getTime()
  if (deal.starts_at && new Date(deal.starts_at).getTime() > t) return 'scheduled'
  if (deal.expires_at && new Date(deal.expires_at).getTime() <= t) return 'expired'
  return 'active'
}

/** A deal is "live" (publicly visible) only when its derived status is active. */
export function isDealLive(
  deal: Pick<Deal, 'is_active' | 'starts_at' | 'expires_at'>,
  now: Date = new Date()
): boolean {
  return dealStatus(deal, now) === 'active'
}

/** Percentage saved, rounded, or null when it can't be computed. */
export function dealSavingsPercent(
  deal: Pick<Deal, 'original_price_inr' | 'deal_price_inr'>
): number | null {
  const { original_price_inr: o, deal_price_inr: d } = deal
  if (o == null || d == null || o <= 0 || d >= o) return null
  return Math.round(((o - d) / o) * 100)
}
