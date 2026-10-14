'use client'

import { useEffect, useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/ui/ProductCard'
import { ProductListRow } from '@/components/ui/ProductListRow'
import type { ProductSummary } from '@/types'
import type { ProductDealBadge } from '@/lib/data/product-deals'

const VIEW_KEY = 'techreviews-category-view'
const PAGE_SIZE = 12

type ViewMode = 'grid' | 'list'

interface CategoryProductResultsProps {
  products: ProductSummary[]
  dealMap: Record<string, ProductDealBadge>
}

export function CategoryProductResults({ products, dealMap }: CategoryProductResultsProps) {
  const [view, setView] = useState<ViewMode>('grid')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    const stored = localStorage.getItem(VIEW_KEY)
    if (stored === 'list' || stored === 'grid') setView(stored)
  }, [])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [products])

  function switchView(mode: ViewMode) {
    setView(mode)
    localStorage.setItem(VIEW_KEY, mode)
  }

  const visible = products.slice(0, visibleCount)
  const hasMore = visibleCount < products.length

  return (
    <>
      <div role="group" aria-label="Layout" className="flex items-center justify-end gap-1 mb-4">
        <span className="text-xs text-muted mr-2 hidden sm:inline">View</span>
        <button
          type="button"
          onClick={() => switchView('grid')}
          aria-pressed={view === 'grid'}
          className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
            view === 'grid' ? 'bg-accent text-white' : 'border border-border text-muted hover:text-primary'
          }`}
          aria-label="Grid view"
        >
          <LayoutGrid size={16} />
        </button>
        <button
          type="button"
          onClick={() => switchView('list')}
          aria-pressed={view === 'list'}
          className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
            view === 'list' ? 'bg-accent text-white' : 'border border-border text-muted hover:text-primary'
          }`}
          aria-label="List view"
        >
          <List size={16} />
        </button>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} activeDeal={dealMap[p.id]} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((p) => (
            <ProductListRow key={p.id} product={p} activeDeal={dealMap[p.id]} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 text-center">
          <p className="mb-3 text-xs text-muted" aria-live="polite">
            Showing {visible.length} of {products.length}
          </p>
          <Button variant="secondary" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>
            Load more ({products.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </>
  )
}
