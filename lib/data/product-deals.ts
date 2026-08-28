/**
 * lib/data/product-deals.ts
 *
 * Synchronous, render-time "does this product have a live deal" lookups used
 * inline by many server components (ProductCard badges, offer panels, etc.).
 * These stay synchronous by design — they're cheap in-memory lookups called
 * from deep inside render trees, not data-fetch boundaries, so wrapping them
 * in the async repository would mean threading a prefetched deal map through
 * every consuming page for no real benefit.
 *
 * What *was* duplicated is now shared: "is this deal live" and "% saved" are
 * the same `dealStatus`/`dealSavingsPercent` predicates `dealRepository` uses,
 * imported from `lib/schemas/deal.ts` rather than reimplemented here.
 */
import { db } from '@/lib/mock/db'
import { isDealLive, dealSavingsPercent } from '@/lib/schemas'
import type { Deal, DealType } from '@/types'

export interface ProductDealBadge {
  dealId: string
  headline: string
  dealType: Deal['deal_type']
  dealPrice: number | null
  originalPrice: number | null
  savingsPercent: number | null
  storeName: string
  expiresAt: string | null
}

function toBadge(d: Deal): ProductDealBadge {
  return {
    dealId: d.id,
    headline: d.headline,
    dealType: d.deal_type,
    dealPrice: d.deal_price_inr,
    originalPrice: d.original_price_inr,
    savingsPercent: dealSavingsPercent(d),
    storeName: d.store_name,
    expiresAt: d.expires_at,
  }
}

export function getActiveDealMap(): Record<string, ProductDealBadge> {
  const map: Record<string, ProductDealBadge> = {}
  for (const deal of db.deals) {
    if (!isDealLive(deal)) continue
    if (!map[deal.product_id]) map[deal.product_id] = toBadge(deal)
  }
  return map
}

export function getAllActiveDealsForProduct(productId: string): Deal[] {
  return db.deals.filter((d) => d.product_id === productId && isDealLive(d))
}

export function getActiveDealForProduct(productId: string): ProductDealBadge | null {
  const deal = db.deals.find((d) => d.product_id === productId && isDealLive(d))
  return deal ? toBadge(deal) : null
}

export function getFullActiveDeal(productId: string): Deal | null {
  return db.deals.find((d) => d.product_id === productId && isDealLive(d)) ?? null
}

const DEAL_TYPE_LABELS: Record<DealType, string> = {
  deal_of_day: 'Deal of Day',
  price_drop: 'Price Drop',
  upcoming_sale: 'Sale',
  bank_offer: 'Bank Offer',
  sale_event: 'Sale',
  coupon: 'Coupon',
}

export function dealTypeLabel(type: DealType): string {
  return DEAL_TYPE_LABELS[type] ?? 'Deal'
}
