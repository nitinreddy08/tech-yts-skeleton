/**
 * lib/repositories/in-memory/mappers.ts
 *
 * The one and only place a stored product row is turned into a `ProductSummary`
 * or re-assembled into a fully-joined `ProductDetail`. Before this existed the
 * summary projection was copy-pasted in five files; now there is a single
 * definition, mirroring how a backend would expose a `product_summary` view.
 */
import type { db as Db } from '@/lib/mock/db'
import type { ProductDetail, ProductSummary } from '@/lib/schemas'

type Store = typeof Db

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
