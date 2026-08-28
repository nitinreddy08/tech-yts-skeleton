import { unstable_cache } from 'next/cache'
import { db } from '@/lib/mock/db'
import type { BestOfList } from '@/types'

export const fetchBestOfLists = unstable_cache(
  async (): Promise<BestOfList[]> => {
    return [...db.bestOfLists]
      .filter(l => l.is_published)
      .sort((a, b) => a.display_order - b.display_order)
  },
  ['best-of-lists'],
  { revalidate: 60, tags: ['best-of-lists'] }
)

export const fetchBestOfListBySlug = unstable_cache(
  async (slug: string): Promise<BestOfList | null> => {
    return db.bestOfLists.find(l => l.slug === slug && l.is_published) ?? null
  },
  ['best-of-list-by-slug'],
  { revalidate: 60, tags: ['best-of-lists'] }
)
