/**
 * lib/data/products.ts
 *
 * Server-side product read API. Thin `unstable_cache` wrappers around
 * `productRepository` — all filtering/sorting/joining logic lives in the
 * repository now, so this file is just cache policy + the stable function
 * names pages already import.
 */
import { unstable_cache } from 'next/cache'
import { productRepository } from '@/lib/repositories'
import type { ProductDetail, ProductSummary } from '@/types'

export const fetchProductDetail = unstable_cache(
  async (categorySlug: string, productSlug: string): Promise<ProductDetail | null> => {
    return productRepository.findByCategoryAndSlug(categorySlug, productSlug)
  },
  ['product-detail'],
  { revalidate: 60, tags: ['products'] }
)

export const fetchProductBySlug = unstable_cache(
  async (slug: string): Promise<ProductDetail | null> => {
    return productRepository.findBySlug(slug)
  },
  ['product-by-slug'],
  { revalidate: 60, tags: ['products'] }
)

export const fetchProductsByCategory = unstable_cache(
  async (categorySlug: string): Promise<ProductSummary[]> => {
    return productRepository.list({ categorySlug, sort: 'newest' })
  },
  ['products-by-category'],
  { revalidate: 60, tags: ['products'] }
)

export const fetchFeaturedProducts = unstable_cache(
  async (): Promise<ProductSummary[]> => {
    return productRepository.list({ featured: true, sort: 'newest', limit: 12 })
  },
  ['featured-products'],
  { revalidate: 60, tags: ['products'] }
)

export const fetchLatestProducts = unstable_cache(
  async (limit = 8): Promise<ProductSummary[]> => {
    return productRepository.list({ sort: 'newest', limit })
  },
  ['latest-products'],
  { revalidate: 60, tags: ['products'] }
)
