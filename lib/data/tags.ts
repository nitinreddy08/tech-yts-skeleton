import { unstable_cache } from 'next/cache'
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

export interface TagWithCount {
  slug: string
  label: string
  count: number
}

export function tagSlug(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, '-')
}

export function tagLabel(slug: string): string {
  return slug.replace(/-/g, ' ')
}

export const fetchAllTags = unstable_cache(
  async (): Promise<TagWithCount[]> => {
    const counts = new Map<string, number>()
    for (const p of db.products) {
      if (!p.is_published) continue
      for (const tag of p.tags) {
        const slug = tagSlug(tag)
        counts.set(slug, (counts.get(slug) ?? 0) + 1)
      }
    }
    return [...counts.entries()]
      .map(([slug, count]) => ({ slug, label: tagLabel(slug), count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  },
  ['all-tags'],
  { revalidate: 60, tags: ['products'] }
)

export const fetchProductsByTag = unstable_cache(
  async (slug: string): Promise<{ tag: string; products: ProductSummary[] } | null> => {
    const normalized = slug.toLowerCase()
    const products = db.products
      .filter(
        (p) =>
          p.is_published && p.tags.some((t) => tagSlug(t) === normalized)
      )
      .map(toSummary)
      .sort((a, b) => b.creator_rating - a.creator_rating)

    if (products.length === 0) return null

    const tag =
      db.products
        .flatMap((p) => p.tags)
        .find((t) => tagSlug(t) === normalized) ?? tagLabel(slug)

    return { tag, products }
  },
  ['products-by-tag'],
  { revalidate: 60, tags: ['products'] }
)
