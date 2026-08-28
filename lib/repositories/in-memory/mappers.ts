/**
 * lib/repositories/in-memory/mappers.ts
 *
 * The one and only place a stored product row is turned into a `ProductSummary`
 * or re-assembled into a fully-joined `ProductDetail`. Before this existed the
 * summary projection was copy-pasted in five files; now there is a single
 * definition, mirroring how a backend would expose a `product_summary` view.
 */
import type { db as Db } from '@/lib/mock/db'
import type { ProductDetail, ProductSummary, BestOfList, BestOfListItem } from '@/lib/schemas'

type Store = typeof Db

/**
 * Click count per product_id, computed from the raw click log. Shared by the
 * click-log repository, the product repository's "popular" sort, and
 * lib/data/trending.ts — previously three separate copies of the same
 * `reduce` over `db.clickLogs`.
 */
export function clickCountsByProduct(store: Store): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const log of store.clickLogs) {
    counts[log.product_id] = (counts[log.product_id] ?? 0) + 1
  }
  return counts
}

export function toProductSummary(p: ProductDetail): ProductSummary {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category_id: p.category_id,
    category_slug: p.category_slug,
    brand_id: p.brand_id,
    brand_name: p.brand_name,
    thumbnail_url: p.thumbnail_url,
    creator_rating: p.creator_rating,
    current_price_inr: p.current_price_inr,
    launch_price_inr: p.launch_price_inr,
    is_featured: p.is_featured,
    is_deal_of_the_day: p.is_deal_of_the_day,
    deal_badge_text: p.deal_badge_text,
    tags: p.tags,
    youtube_video_url: p.youtube_video_url,
    created_at: p.created_at,
  }
}

/**
 * Re-join a stored product row with its category, brand, affiliate links, and
 * FAQs so reads are always internally consistent — even if the row's embedded
 * arrays drifted. This is the repository acting as the query planner: the "joins"
 * a SQL `SELECT … JOIN` would perform happen here instead.
 *
 * Affiliate links are returned sorted by price ascending (Requirement 2.8 / 6),
 * FAQs by `display_order`.
 */
export function assembleProductDetail(store: Store, row: ProductDetail): ProductDetail {
  const category = store.categories.find((c) => c.id === row.category_id) ?? row.category
  const brand = store.brands.find((b) => b.id === row.brand_id) ?? row.brand

  const affiliate_links = store.affiliateLinks
    .filter((l) => l.product_id === row.id)
    .sort((a, b) => (a.price_inr ?? Infinity) - (b.price_inr ?? Infinity))

  const faqs = store.faqs
    .filter((f) => f.product_id === row.id)
    .sort((a, b) => a.display_order - b.display_order)

  return {
    ...row,
    category,
    brand,
    category_id: category.id,
    category_slug: category.slug,
    brand_id: brand.id,
    brand_name: brand.name,
    affiliate_links,
    faqs,
  }
}

/**
 * Re-join a best-of list's items with each product's *current* summary.
 *
 * An item whose product has since been deleted is dropped rather than kept
 * with a null `product` — `BestOfListItem.product` is non-optional in the
 * schema (every UI consumer assumes it's there), and a best-of entry pointing
 * at nothing is exactly the kind of dangling foreign key a real database's
 * `ON DELETE CASCADE` would already have cleaned up.
 */
export function assembleBestOfList(store: Store, row: BestOfList): BestOfList {
  const items: BestOfListItem[] = row.items
    .map((item) => {
      const product = store.products.find((p) => p.id === item.product_id)
      return product ? { ...item, product: toProductSummary(product) } : null
    })
    .filter((item): item is BestOfListItem => item !== null)
    .sort((a, b) => a.rank - b.rank)

  return { ...row, items }
}
