import { unstable_cache } from 'next/cache'
import { db } from '@/lib/mock/db'
import type { Brand } from '@/types'
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

export interface BrandWithCount extends Brand {
  productCount: number
}

export const fetchBrandsWithCounts = unstable_cache(
  async (): Promise<BrandWithCount[]> =>
    db.brands
      .map((brand) => ({
        ...brand,
        productCount: db.products.filter((p) => p.is_published && p.brand_id === brand.id).length,
      }))
      .filter((b) => b.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name)),
  ['brands-with-counts'],
  { revalidate: 60, tags: ['brands'] }
)

export const fetchAllBrands = unstable_cache(
  async (): Promise<Brand[]> => [...db.brands].sort((a, b) => a.name.localeCompare(b.name)),
  ['brands'],
  { revalidate: 60, tags: ['brands'] }
)

export const fetchBrandBySlug = unstable_cache(
  async (slug: string): Promise<Brand | null> => db.brands.find((b) => b.slug === slug) ?? null,
  ['brand-by-slug'],
  { revalidate: 60, tags: ['brands'] }
)

export const fetchProductsByBrand = unstable_cache(
  async (brandSlug: string): Promise<ProductSummary[]> => {
    const brand = db.brands.find((b) => b.slug === brandSlug)
    if (!brand) return []
    return db.products
      .filter((p) => p.is_published && p.brand_id === brand.id)
      .map(toSummary)
      .sort((a, b) => b.creator_rating - a.creator_rating)
  },
  ['products-by-brand'],
  { revalidate: 60, tags: ['products'] }
)
