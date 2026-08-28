import { db } from '@/lib/mock/db'
import { tagSlug } from '@/lib/data/tags'

export interface CategoryTagCount {
  slug: string
  label: string
  count: number
}

export function getPopularTagsForCategory(categorySlug: string, limit = 12): CategoryTagCount[] {
  const counts = new Map<string, number>()

  for (const p of db.products) {
    if (!p.is_published || p.category_slug !== categorySlug) continue
    for (const tag of p.tags) {
      const slug = tagSlug(tag)
      counts.set(slug, (counts.get(slug) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .map(([slug, count]) => ({
      slug,
      label: slug.replace(/-/g, ' '),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit)
}
