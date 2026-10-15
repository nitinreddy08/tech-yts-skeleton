import { getBestOffer } from '@/lib/utils/best-offer'
import type { PriceSnapshot } from './types'

interface LinkLike {
  id: string
  price_inr: number | null
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock'
  last_updated: string
  is_best_price: boolean
}

interface ProductLike {
  current_price_inr: number | null
  affiliate_links: LinkLike[]
}

/** Overlays the scraped snapshot onto the seed links (mutates in place). Unknown ids are ignored. */
export function applyPriceSnapshot(links: LinkLike[], snapshot: PriceSnapshot): number {
  let applied = 0
  for (const link of links) {
    const entry = snapshot.entries[link.id]
    if (!entry || typeof entry.price_inr !== 'number') continue
    link.price_inr = entry.price_inr
    link.last_updated = entry.last_updated
    if (entry.stock_status) link.stock_status = entry.stock_status
    applied++
  }
  return applied
}

/**
 * Keeps each product's headline price and each link's "best price" flag
 * consistent with the (possibly refreshed) store prices. Products without a
 * purchasable priced link keep whatever price they had.
 */
export function syncCurrentPrices(products: ProductLike[]): void {
  for (const product of products) {
    if (product.affiliate_links.length === 0) continue
    const best = getBestOffer(product.affiliate_links)
    for (const link of product.affiliate_links) link.is_best_price = best.link?.id === link.id
    if (best.price != null) product.current_price_inr = best.price
  }
}
