'use client'

import { useEffect, useState } from 'react'
import { Bookmark } from 'lucide-react'
import { isInWishlist, toggleWishlist } from '@/lib/utils/wishlist'
import type { ProductSummary } from '@/types'

interface SaveButtonProps {
  product: ProductSummary
  className?: string
  size?: number
}

export function SaveButton({ product, className = '', size = 18 }: SaveButtonProps) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(isInWishlist(product.id))
    const refresh = () => setSaved(isInWishlist(product.id))
    window.addEventListener('wishlist-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('wishlist-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [product.id])

  return (
    <button
      type="button"
      onClick={() => {
        const result = toggleWishlist(product)
        setSaved(result.saved)
      }}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save product'}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border transition-colors hover:border-accent ${
        saved ? 'bg-accent/10 text-accent' : 'bg-surface text-muted hover:text-primary'
      } ${className}`}
    >
      <Bookmark size={size} className={saved ? 'fill-current' : ''} />
    </button>
  )
}
