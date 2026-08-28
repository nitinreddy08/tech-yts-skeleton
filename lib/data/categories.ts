import { unstable_cache } from 'next/cache'
import { db } from '@/lib/mock/db'
import type { Category, Brand } from '@/types'

export const fetchAllCategories = unstable_cache(
  async (): Promise<Category[]> => {
    return [...db.categories].sort((a, b) => a.display_order - b.display_order)
  },
  ['all-categories'],
  { revalidate: 60, tags: ['categories'] }
)

export const fetchCategoryBySlug = unstable_cache(
  async (slug: string): Promise<Category | null> => {
    return db.categories.find(c => c.slug === slug) ?? null
  },
  ['category-by-slug'],
  { revalidate: 60, tags: ['categories'] }
)

export const fetchAllBrands = unstable_cache(
  async (): Promise<Brand[]> => {
    return [...db.brands].sort((a, b) => a.name.localeCompare(b.name))
  },
  ['all-brands'],
  { revalidate: 60, tags: ['brands'] }
)
