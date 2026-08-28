import type { ProductSummary } from '@/types'

export const RECENTLY_VIEWED_KEY = 'techreviews-recently-viewed'
export const MAX_RECENTLY_VIEWED = 8

export function loadRecentlyViewed(): ProductSummary[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) ?? '[]') as ProductSummary[]
  } catch {
    return []
  }
}

export function trackRecentlyViewed(product: ProductSummary): ProductSummary[] {
  const recent = loadRecentlyViewed().filter((p) => p.id !== product.id)
  recent.unshift(product)
  const trimmed = recent.slice(0, MAX_RECENTLY_VIEWED)
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(trimmed))
  return trimmed
}
