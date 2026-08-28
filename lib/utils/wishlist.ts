import type { ProductSummary } from '@/types'

export const WISHLIST_KEY = 'techreviews-wishlist'
export const MAX_WISHLIST = 20

export function loadWishlist(): ProductSummary[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]') as ProductSummary[]
  } catch {
    return []
  }
}

export function toggleWishlist(product: ProductSummary): { saved: boolean; items: ProductSummary[] } {
  const current = loadWishlist()
  const exists = current.some((p) => p.id === product.id)
  let next: ProductSummary[]
  if (exists) {
    next = current.filter((p) => p.id !== product.id)
  } else {
    next = [product, ...current.filter((p) => p.id !== product.id)].slice(0, MAX_WISHLIST)
  }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('wishlist-updated'))
  return { saved: !exists, items: next }
}

export function isInWishlist(productId: string): boolean {
  return loadWishlist().some((p) => p.id === productId)
}

export function removeFromWishlist(productId: string): ProductSummary[] {
  const next = loadWishlist().filter((p) => p.id !== productId)
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('wishlist-updated'))
  return next
}

export function clearWishlist(): void {
  localStorage.removeItem(WISHLIST_KEY)
  window.dispatchEvent(new CustomEvent('wishlist-updated'))
}
