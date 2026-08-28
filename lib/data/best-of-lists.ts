import { unstable_cache } from 'next/cache'
import { bestOfListRepository } from '@/lib/repositories'
import type { BestOfList } from '@/types'

export const fetchBestOfLists = unstable_cache(
  async (): Promise<BestOfList[]> => {
    return bestOfListRepository.list()
  },
  ['best-of-lists'],
  { revalidate: 60, tags: ['best-of-lists'] }
)

export const fetchBestOfListBySlug = unstable_cache(
  async (slug: string): Promise<BestOfList | null> => {
    return bestOfListRepository.findBySlug(slug)
  },
  ['best-of-list-by-slug'],
  { revalidate: 60, tags: ['best-of-lists'] }
)
