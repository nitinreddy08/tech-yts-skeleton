import { productRepository } from '@/lib/repositories'
import { tagSlug, tagLabel } from '@/lib/data/tags'

export interface CategoryTagCount {
  slug: string
  label: string
  count: number
}

export async function getPopularTagsForCategory(
  categorySlug: string,
  limit = 12
): Promise<CategoryTagCount[]> {
  const products = await productRepository.list({ categorySlug })
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
    .slice(0, limit)
}
