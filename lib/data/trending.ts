import { unstable_cache } from 'next/cache'
import { db } from '@/lib/mock/db'
import { clickCountsByProduct } from '@/lib/repositories/in-memory/mappers'
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

export function getProductClickCounts(): Record<string, number> {
  return clickCountsByProduct(db)
}

export const fetchTrendingProducts = unstable_cache(
  async (limit = 4): Promise<ProductSummary[]> => {
    const counts = getProductClickCounts()
    const ranked = db.products
      .filter((p) => p.is_published && (counts[p.id] ?? 0) > 0)
      .sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))
      .slice(0, limit)
      .map(toSummary)

    if (ranked.length >= limit) return ranked

    const fallback = db.products
      .filter((p) => p.is_published && !ranked.some((r) => r.id === p.id))
      .sort((a, b) => b.creator_rating - a.creator_rating)
      .slice(0, limit - ranked.length)
      .map(toSummary)

    return [...ranked, ...fallback]
  },
  ['trending-products'],
  { revalidate: 60, tags: ['products'] }
)
