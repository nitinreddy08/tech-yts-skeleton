import { db } from '@/lib/mock/db'
import type { ProductSummary } from '@/types'

function toSummary(p: (typeof db.products)[0]): ProductSummary {
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

/** Amazon-style lower-priced options in the same category */
export function getCheaperAlternatives(
  productId: string,
  categorySlug: string,
  currentPrice: number | null,
  limit = 4
): ProductSummary[] {
  if (currentPrice == null) return []

  return db.products
    .filter(
      (p) =>
        p.is_published &&
        p.id !== productId &&
        p.category_slug === categorySlug &&
        p.current_price_inr != null &&
        p.current_price_inr < currentPrice
    )
    .map(toSummary)
    .sort((a, b) => (b.creator_rating - a.creator_rating) || ((a.current_price_inr ?? 0) - (b.current_price_inr ?? 0)))
    .slice(0, limit)
}
