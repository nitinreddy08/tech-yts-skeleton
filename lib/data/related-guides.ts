import { db } from '@/lib/mock/db'

export interface RelatedGuide {
  slug: string
  title: string
  rank: number
  pickReason: string | null
  totalPicks: number
}

export function getRelatedGuidesForProduct(productId: string): RelatedGuide[] {
  return db.bestOfLists
    .filter((l) => l.is_published)
    .flatMap((list) => {
      const item = list.items.find((i) => i.product_id === productId)
      if (!item) return []
      return [
        {
          slug: list.slug,
          title: list.title,
          rank: item.rank,
          pickReason: item.pick_reason,
          totalPicks: list.items.length,
        },
      ]
    })
    .sort((a, b) => a.rank - b.rank)
}
