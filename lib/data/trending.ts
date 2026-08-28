import { unstable_cache } from 'next/cache'
import { db } from '@/lib/mock/db'
import { productRepository } from '@/lib/repositories'
import { clickCountsByProduct } from '@/lib/repositories/in-memory/mappers'
import type { ProductSummary } from '@/types'

export function getProductClickCounts(): Record<string, number> {
  return clickCountsByProduct(db)
}

export const fetchTrendingProducts = unstable_cache(
  async (limit = 4): Promise<ProductSummary[]> => {
    const counts = getProductClickCounts()
    const products = await productRepository.list()

    const ranked = products
      .filter((p) => (counts[p.id] ?? 0) > 0)
      .sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))
      .slice(0, limit)

    if (ranked.length >= limit) return ranked

    const fallback = products
      .filter((p) => !ranked.some((r) => r.id === p.id))
      .sort((a, b) => b.creator_rating - a.creator_rating)
      .slice(0, limit - ranked.length)

    return [...ranked, ...fallback]
  },
  ['trending-products'],
  { revalidate: 60, tags: ['products'] }
)
