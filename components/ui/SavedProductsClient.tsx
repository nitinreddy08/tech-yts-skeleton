'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bookmark, Trash2 } from 'lucide-react'
import { ProductCard } from '@/components/ui/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { clearWishlist, loadWishlist } from '@/lib/utils/wishlist'
import type { ProductSummary } from '@/types'

/** Saved products (this device). Rendered inside the My Stuff hub, which owns the page heading. */
export function SavedProductsClient() {
  // null = not read from localStorage yet; shows a skeleton instead of
  // flashing "Nothing saved yet" at someone who has saved items.
  const [items, setItems] = useState<ProductSummary[] | null>(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    const refresh = () => setItems(loadWishlist())
    refresh()
    window.addEventListener('wishlist-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('wishlist-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  if (items === null) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3" aria-busy="true" aria-label="Loading saved products">
        {Array.from({ length: 3 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        heading="Nothing saved yet"
        description="Tap the bookmark on any product to save it here — compare prices and buy when you're ready."
        action={{ label: 'Find something to save', href: '/search' }}
      />
    )
  }

  function handleClearAll() {
    clearWishlist()
    setItems([])
    setConfirming(false)
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted" aria-live="polite">
          {items.length} item{items.length !== 1 ? 's' : ''} saved on this device
        </p>
        {confirming ? (
          <div className="flex items-center gap-2" role="group" aria-label="Confirm clear all saved products">
            <span className="text-sm text-primary">Remove all {items.length}?</span>
            <Button variant="secondary" size="auto" className="h-11 px-3 text-sm" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button size="auto" className="h-11 bg-error-700 px-3 text-sm hover:bg-error-700/90" onClick={handleClearAll}>
              Remove all
            </Button>
          </div>
        ) : (
          <Button variant="secondary" size="auto" className="h-11 px-3 text-sm" onClick={() => setConfirming(true)}>
            <Trash2 size={14} aria-hidden />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-muted">
        Saved on this browser only.{' '}
        <Link href="/compare" className="inline-flex min-h-11 items-center font-medium text-accent hover:underline">
          Compare saved picks →
        </Link>
      </p>
    </>
  )
}
