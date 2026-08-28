/**
 * lib/repositories/brand-repository.ts
 *
 * Read-only, same reasoning as CategoryRepository — brands are seeded
 * fixtures, not admin-authored content.
 */
import type { Brand, ProductSummary } from '@/lib/schemas'

export interface BrandWithCount extends Brand {
  productCount: number
}

export interface BrandRepository {
  /** Sorted alphabetically by name. */
  list(): Promise<Brand[]>
  /** Only brands with at least one published product, sorted by count desc. */
  listWithCounts(): Promise<BrandWithCount[]>
  findBySlug(slug: string): Promise<Brand | null>
  findById(id: string): Promise<Brand | null>
  /** Published products for a brand, sorted by creator_rating desc. */
  productsForBrand(brandSlug: string): Promise<ProductSummary[]>
}
