import { unstable_cache } from 'next/cache'
import { brandRepository, type BrandWithCount } from '@/lib/repositories'
import type { Brand, ProductSummary } from '@/types'

export type { BrandWithCount }

export const fetchBrandsWithCounts = unstable_cache(
  async (): Promise<BrandWithCount[]> => brandRepository.listWithCounts(),
  ['brands-with-counts'],
  { revalidate: 60, tags: ['brands'] }
)

export const fetchAllBrands = unstable_cache(
  async (): Promise<Brand[]> => brandRepository.list(),
  ['all-brands'],
  { revalidate: 60, tags: ['brands'] }
)

export const fetchBrandBySlug = unstable_cache(
  async (slug: string): Promise<Brand | null> => brandRepository.findBySlug(slug),
  ['brand-by-slug'],
  { revalidate: 60, tags: ['brands'] }
)

export const fetchProductsByBrand = unstable_cache(
  async (brandSlug: string): Promise<ProductSummary[]> => brandRepository.productsForBrand(brandSlug),
  ['products-by-brand'],
  { revalidate: 60, tags: ['products'] }
)
