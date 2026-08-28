/**
 * lib/data/tags.ts
 *
 * Tag aggregation over the product catalog. Sources products via
 * productRepository.list() (published only) instead of a hand-rolled
 * db.products filter + its own copy of the summary mapper.
 */
import { unstable_cache } from 'next/cache'
import { productRepository } from '@/lib/repositories'
import type { ProductSummary } from '@/types'

export interface TagWithCount {
  slug: string
  label: string
  count: number
}

export function tagSlug(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, '-')
}

export function tagLabel(slug: string): string {
  return slug.replace(/-/g, ' ')
}

export const fetchAllTags = unstable_cache(
  async (): Promise<TagWithCount[]> => {
    const products = await productRepository.list()
    const counts = new Map<string, number>()
    for (const p of products) {
      for (const tag of p.tags) {
        const slug = tagSlug(tag)
        counts.set(slug, (counts.get(slug) ?? 0) + 1)
      }
    }
    return [...counts.entries()]
      .map(([slug, count]) => ({ slug, label: tagLabel(slug), count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  },
  ['all-tags'],
  { revalidate: 60, tags: ['products'] }
)

export const fetchProductsByTag = unstable_cache(
  async (slug: string): Promise<{ tag: string; products: ProductSummary[] } | null> => {
    const normalized = slug.toLowerCase()
    const allProducts = await productRepository.list()
    const products = allProducts
      .filter((p) => p.tags.some((t) => tagSlug(t) === normalized))
      .sort((a, b) => b.creator_rating - a.creator_rating)

    if (products.length === 0) return null

    const tag =
      allProducts.flatMap((p) => p.tags).find((t) => tagSlug(t) === normalized) ?? tagLabel(slug)

    return { tag, products }
  },
  ['products-by-tag'],
  { revalidate: 60, tags: ['products'] }
)
