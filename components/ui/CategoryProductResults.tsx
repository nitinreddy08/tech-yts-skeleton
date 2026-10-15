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
  /** Quick filters etc. shown on the same row as the grid/list toggle. */
  toolbar?: React.ReactNode
  /** No sidebar next to the grid, so it can fit an extra column. */
  wide?: boolean
}

export function CategoryProductResults({ products, dealMap, toolbar, wide = false }: CategoryProductResultsProps) {
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
      <div className="mb-3 flex items-center gap-3 md:mb-4">
        <div className="min-w-0 flex-1">{toolbar}</div>
        <div role="group" aria-label="Layout" className="flex shrink-0 items-center gap-1">
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
      </div>

      {view === 'grid' ? (
        <div className={`grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 ${wide ? 'lg:grid-cols-4 xl:grid-cols-5' : 'xl:grid-cols-4'}`}>
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
