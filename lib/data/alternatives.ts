/**
 * lib/data/alternatives.ts
 *
 * Sources candidates via productRepository.list() (published only, already
 * mapped to ProductSummary) instead of a hand-rolled db.products filter with
 * its own copy of the summary mapper.
 */
import { productRepository } from '@/lib/repositories'
import type { ProductSummary } from '@/types'

/** Amazon-style lower-priced options in the same category */
export async function getCheaperAlternatives(
  productId: string,
  categorySlug: string,
  currentPrice: number | null,
  limit = 4
): Promise<ProductSummary[]> {
  if (currentPrice == null) return []

  const candidates = await productRepository.list({ categorySlug })

  return candidates
    .filter((p) => p.id !== productId && p.current_price_inr != null && p.current_price_inr < currentPrice)
    .sort(
      (a, b) =>
        b.creator_rating - a.creator_rating || (a.current_price_inr ?? 0) - (b.current_price_inr ?? 0)
    )
    .slice(0, limit)
}
