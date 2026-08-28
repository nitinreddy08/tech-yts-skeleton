/**
 * lib/repositories/in-memory/brand-repository.ts
 */
import { db, type db as DbType } from '@/lib/mock/db'
import type { BrandRepository, BrandWithCount } from '../brand-repository'
import { toProductSummary } from './mappers'

type Store = typeof DbType

export function createInMemoryBrandRepository(store: Store = db): BrandRepository {
  return {
    async list() {
      return [...store.brands].sort((a, b) => a.name.localeCompare(b.name))
    },

    async listWithCounts(): Promise<BrandWithCount[]> {
      return store.brands
        .map((brand) => ({
          ...brand,
          productCount: store.products.filter((p) => p.is_published && p.brand_id === brand.id).length,
        }))
        .filter((b) => b.productCount > 0)
        .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name))
    },

    async findBySlug(slug) {
      return store.brands.find((b) => b.slug === slug) ?? null
    },

    async findById(id) {
      return store.brands.find((b) => b.id === id) ?? null
    },

    async productsForBrand(brandSlug) {
      const brand = store.brands.find((b) => b.slug === brandSlug)
      if (!brand) return []
      return store.products
        .filter((p) => p.is_published && p.brand_id === brand.id)
        .map(toProductSummary)
        .sort((a, b) => b.creator_rating - a.creator_rating)
    },
  }
}
