import { db } from '@/lib/mock/db'
import { getProductClickCounts } from '@/lib/data/trending'
import { getActiveDealMap } from '@/lib/data/product-deals'
import type { SearchResult } from '@/types'
export interface RichSearchResult extends SearchResult {
  category_id: string
  brand_id: string
  brand_name: string
  creator_rating: number
  launch_price_inr: number | null
  is_featured: boolean
  is_deal_of_the_day: boolean
  deal_badge_text: string | null
  tags: string[]
  youtube_video_url: string | null
  created_at: string
  has_active_deal?: boolean
  deal_savings_percent?: number | null
}

export interface SearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating_desc' | 'newest' | 'popular'
}

/**
 * Full-page search — returns rich results supporting all filter params.
 * No limit — caller slices if needed.
 */
export async function searchProductsFull(
  query: string,
  filters: SearchFilters = {}
): Promise<RichSearchResult[]> {
  const q = query.toLowerCase().trim()

  let results = db.products.filter((p) => {
    if (!p.is_published) return false

    // Text match against name, tags, brand name, category name
    const textMatch =
      !q ||
      q.length < 2 ||
      p.name.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.brand_name.toLowerCase().includes(q) ||
      p.category.name.toLowerCase().includes(q)

    if (!textMatch) return false

    // Category filter
    if (filters.category && p.category_slug !== filters.category) return false

    // Price filters
    const price = p.current_price_inr
    if (filters.minPrice != null && (price == null || price < filters.minPrice)) return false
    if (filters.maxPrice != null && (price == null || price > filters.maxPrice)) return false

    // Rating filter
    if (filters.minRating != null && p.creator_rating < filters.minRating) return false

    return true
  })

  // Sort
  const sort = filters.sort ?? 'relevance'
  if (sort === 'price_asc') {
    results = results.sort((a, b) => (a.current_price_inr ?? Infinity) - (b.current_price_inr ?? Infinity))
  } else if (sort === 'price_desc') {
    results = results.sort((a, b) => (b.current_price_inr ?? 0) - (a.current_price_inr ?? 0))
  } else if (sort === 'rating_desc') {
    results = results.sort((a, b) => b.creator_rating - a.creator_rating)
  } else if (sort === 'newest') {
    results = results.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  } else if (sort === 'popular') {
    const clicks = getProductClickCounts()
    results = results.sort((a, b) => {
      const ca = clicks[a.id] ?? 0
      const cb = clicks[b.id] ?? 0
      if (cb !== ca) return cb - ca
      return b.creator_rating - a.creator_rating
    })
  }

  const dealMap = getActiveDealMap()

  return results.map((p) => {
    const deal = dealMap[p.id]
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category_id: p.category_id,
      category_slug: p.category_slug,
      brand_id: p.brand_id,
      brand_name: p.brand_name,
      thumbnail_url: p.thumbnail_url,
      current_price_inr: p.current_price_inr,
      launch_price_inr: p.launch_price_inr,
      is_featured: p.is_featured,
      is_deal_of_the_day: p.is_deal_of_the_day,
      deal_badge_text: p.deal_badge_text,
      tags: p.tags,
      youtube_video_url: p.youtube_video_url,
      created_at: p.created_at,
      type: 'product' as const,
      creator_rating: p.creator_rating,
      has_active_deal: !!deal,
      deal_savings_percent: deal?.savingsPercent ?? null,
    }
  })
}

/** Typeahead search — keeps the existing lightweight API */
export async function searchProducts(query: string, limit = 10): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return []
  const results = await searchProductsFull(query)
  return results.slice(0, limit).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category_slug: p.category_slug,
    thumbnail_url: p.thumbnail_url,
    current_price_inr: p.current_price_inr,
    type: 'product' as const,
    brand_name: p.brand_name,
    creator_rating: p.creator_rating,
  }))
}
