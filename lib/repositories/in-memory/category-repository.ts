/**
 * lib/repositories/in-memory/category-repository.ts
 */
import { db, type db as DbType } from '@/lib/mock/db'
import type { CategoryRepository } from '../category-repository'

type Store = typeof DbType

export function createInMemoryCategoryRepository(store: Store = db): CategoryRepository {
  return {
    async list() {
      return [...store.categories].sort((a, b) => a.display_order - b.display_order)
    },

    async findBySlug(slug) {
      return store.categories.find((c) => c.slug === slug) ?? null
    },

    async findById(id) {
      return store.categories.find((c) => c.id === id) ?? null
    },
  }
}
