import { unstable_cache } from 'next/cache'
import { categoryRepository } from '@/lib/repositories'
import type { Category } from '@/types'

export const fetchAllCategories = unstable_cache(
  async (): Promise<Category[]> => {
    return categoryRepository.list()
  },
  ['all-categories'],
  { revalidate: 60, tags: ['categories'] }
)

export const fetchCategoryBySlug = unstable_cache(
  async (slug: string): Promise<Category | null> => {
    return categoryRepository.findBySlug(slug)
  },
  ['category-by-slug'],
  { revalidate: 60, tags: ['categories'] }
)
