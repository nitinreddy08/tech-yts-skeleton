'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bookmark, Trash2 } from 'lucide-react'
import { ProductCard } from '@/components/ui/ProductCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { clearWishlist, loadWishlist } from '@/lib/utils/wishlist'
import type { ProductSummary } from '@/types'

export function SavedProductsClient({ embedded = false }: { embedded?: boolean }) {
  const [items, setItems] = useState<ProductSummary[]>([])

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

  function handleClearAll() {
    if (items.length === 0) return
    clearWishlist()
    setItems([])
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        heading="Nothing saved yet"
        description="Tap the bookmark on any product to save it here — compare prices and buy when you're ready."
        action={{ label: 'Browse Smartphones', href: '/smartphones' }}
      />
    )
  }

  return (
    <>
      {!embedded && (
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary flex items-center gap-2">
            <Bookmark size={28} className="text-accent fill-accent/20" />
            Saved Products
          </h1>
          <p className="text-muted mt-2">
            {items.length} item{items.length !== 1 ? 's' : ''} saved on this device
          </p>
        </div>
        <button
          type="button"
          onClick={handleClearAll}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-red-600 hover:border-red-200 transition-colors self-start"
        >
          <Trash2 size={16} />
          Clear all
        </button>
      </div>
      )}
      {embedded && items.length > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} /> Clear all
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-muted">
        Saved locally on this browser.{' '}
        <Link href="/compare" className="text-accent hover:underline font-medium">
          Compare saved picks →
        </Link>
      </p>
    </>
  )
}
