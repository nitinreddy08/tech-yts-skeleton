import type { AffiliateLink } from '@/types'

type OfferLink = Pick<AffiliateLink, 'id' | 'price_inr' | 'stock_status'>

export interface BestOffer<T extends OfferLink> {
  /** Cheapest link that can actually be bought right now, or null. */
  link: T | null
  /** Price of `link`, or null when nothing purchasable has a price. */
  price: number | null
  /** True when every store is out of stock (so there is no honest "best price"). */
  allUnavailable: boolean
  /** Links that are not out of stock, cheapest first (unpriced last). */
  available: T[]
}

export function isPurchasable(link: Pick<AffiliateLink, 'stock_status'>): boolean {
  return (link.stock_status ?? 'in_stock') !== 'out_of_stock'
}

/**
 * Picks the "best price" the way a shopper means it: the cheapest store that
 * has the product in stock. An out-of-stock listing can be cheaper on paper,
 * but offering it as "Best Price" sends people to a dead end.
 */
export function getBestOffer<T extends OfferLink>(links: T[]): BestOffer<T> {
  const available = links
    .filter(isPurchasable)
    .sort((a, b) => (a.price_inr ?? Infinity) - (b.price_inr ?? Infinity))
  const link = available.find((l) => l.price_inr != null) ?? null
  return {
    link,
    price: link?.price_inr ?? null,
    allUnavailable: links.length > 0 && available.length === 0,
    available,
  }
}
