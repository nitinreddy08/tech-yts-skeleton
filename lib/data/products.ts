import { unstable_cache } from 'next/cache'
import { db, findProductBySlug } from '@/lib/mock/db'
import type { ProductDetail, ProductSummary } from '@/types'

function toSummary(p: ProductDetail): ProductSummary {
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

export const fetchProductDetail = unstable_cache(
  async (categorySlug: string, productSlug: string): Promise<ProductDetail | null> => {
    return findProductBySlug(productSlug, categorySlug) ?? null
  },
  ['product-detail'],
  { revalidate: 60, tags: ['products'] }
)

export const fetchProductBySlug = unstable_cache(
  async (slug: string): Promise<ProductDetail | null> => {
    return findProductBySlug(slug) ?? null
  },
  ['product-by-slug'],
  { revalidate: 60, tags: ['products'] }
)

export const fetchProductsByCategory = unstable_cache(
  async (categorySlug: string): Promise<ProductSummary[]> => {
    return db.products
      .filter(p => p.is_published && p.category_slug === categorySlug)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(toSummary)
  },
  ['products-by-category'],
  { revalidate: 60, tags: ['products'] }
)

export const fetchFeaturedProducts = unstable_cache(
  async (): Promise<ProductSummary[]> => {
    return db.products
      .filter(p => p.is_published && p.is_featured)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 12)
      .map(toSummary)
  },
  ['featured-products'],
  { revalidate: 60, tags: ['products'] }
)

export const fetchLatestProducts = unstable_cache(
  async (limit = 8): Promise<ProductSummary[]> => {
    return db.products
      .filter(p => p.is_published)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
      .map(toSummary)
  },
  ['latest-products'],
  { revalidate: 60, tags: ['products'] }
)
