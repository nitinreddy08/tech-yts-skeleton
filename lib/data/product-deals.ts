import { db } from '@/lib/mock/db'
import type { Deal } from '@/types'

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

function isActive(d: Deal): boolean {
  const now = new Date()
  return d.is_active && (d.expires_at == null || new Date(d.expires_at) > now)
}

function toBadge(d: Deal): ProductDealBadge {
  const savings =
    d.original_price_inr != null && d.deal_price_inr != null && d.original_price_inr > d.deal_price_inr
      ? Math.round(((d.original_price_inr - d.deal_price_inr) / d.original_price_inr) * 100)
      : null
  return {
    dealId: d.id,
    headline: d.headline,
    dealType: d.deal_type,
    dealPrice: d.deal_price_inr,
    originalPrice: d.original_price_inr,
    savingsPercent: savings,
    storeName: d.store_name,
    expiresAt: d.expires_at,
  }
}

export function getActiveDealMap(): Record<string, ProductDealBadge> {
  const map: Record<string, ProductDealBadge> = {}
  for (const deal of db.deals) {
    if (!isActive(deal)) continue
    if (!map[deal.product_id]) map[deal.product_id] = toBadge(deal)
  }
  return map
}

export function getAllActiveDealsForProduct(productId: string): Deal[] {
  return db.deals.filter((d) => d.product_id === productId && isActive(d))
}

export function getActiveDealForProduct(productId: string): ProductDealBadge | null {
  const deal = db.deals.find((d) => d.product_id === productId && isActive(d))
  return deal ? toBadge(deal) : null
}

export function getFullActiveDeal(productId: string): Deal | null {
  return db.deals.find((d) => d.product_id === productId && isActive(d)) ?? null
}

const DEAL_TYPE_LABELS: Record<Deal['deal_type'], string> = {
  deal_of_day: 'Deal of Day',
  price_drop: 'Price Drop',
  upcoming_sale: 'Sale',
  bank_offer: 'Bank Offer',
  sale_event: 'Sale',
  coupon: 'Coupon',
}

export function dealTypeLabel(type: Deal['deal_type']): string {
  return DEAL_TYPE_LABELS[type] ?? 'Deal'
}
