/**
 * lib/data/search.ts
 *
 * Full-page and typeahead search. Filtering, text matching, and sorting are no
 * longer reimplemented here — they're the same `productRepository.list()` used
 * by category pages and the MSW `/api/mock/products` endpoint, so search and
 * browse can never quietly disagree about what "matches" or "sorts first"
 * means. This file's only job is composing the query and layering deal badges
 * onto the result.
 */
import { productRepository, type ProductSort } from '@/lib/repositories'
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
  sort?: ProductSort
}

/**
 * Full-page search — returns rich results supporting all filter params.
 * No limit — caller slices if needed.
 */
export async function searchProductsFull(
  query: string,
  filters: SearchFilters = {}
): Promise<RichSearchResult[]> {
  const results = await productRepository.listDetailed({
    search: query,
    categorySlug: filters.category,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minRating: filters.minRating,
    sort: filters.sort ?? 'relevance',
  })

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
