import { productRepository } from '@/lib/repositories'
import { hasStalePrices } from '@/lib/utils/price-trust'

const STALE_MS = 14 * 86400000

export interface PriceHealthRow {
  productId: string
  productName: string
  slug: string
  categorySlug: string
  issue: 'stale' | 'missing_price' | 'no_links' | 'out_of_stock'
  store?: string
  lastUpdated?: string
}

export async function getPriceHealthQueue(): Promise<PriceHealthRow[]> {
  const rows: PriceHealthRow[] = []
  const products = await productRepository.listDetailed()

  for (const p of products) {
    if (p.affiliate_links.length === 0) {
      rows.push({
        productId: p.id,
        productName: p.name,
        slug: p.slug,
        categorySlug: p.category_slug,
        issue: 'no_links',
      })
      continue
    }

    for (const link of p.affiliate_links) {
      if (link.price_inr == null) {
        rows.push({
          productId: p.id,
          productName: p.name,
          slug: p.slug,
          categorySlug: p.category_slug,
          issue: 'missing_price',
          store: link.store_name,
        })
      }
      if (link.stock_status === 'out_of_stock') {
        rows.push({
          productId: p.id,
          productName: p.name,
          slug: p.slug,
          categorySlug: p.category_slug,
          issue: 'out_of_stock',
          store: link.store_name,
        })
      }
    }

    if (hasStalePrices(p.affiliate_links)) {
      const oldest = p.affiliate_links.reduce((a, b) =>
        new Date(a.last_updated) < new Date(b.last_updated) ? a : b
      )
      if (Date.now() - new Date(oldest.last_updated).getTime() > STALE_MS) {
        rows.push({
          productId: p.id,
          productName: p.name,
          slug: p.slug,
          categorySlug: p.category_slug,
          issue: 'stale',
          lastUpdated: oldest.last_updated,
        })
      }
    }
  }

  return rows
}
