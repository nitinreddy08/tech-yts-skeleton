'use client'

import { useMemo, useState } from 'react'
import { CategoryProductResults } from '@/components/ui/CategoryProductResults'
import type { ProductSummary } from '@/types'
import type { ProductDealBadge } from '@/lib/data/product-deals'

type TagSort = 'rating' | 'price_asc' | 'price_desc' | 'newest'

interface TagProductResultsProps {
  products: ProductSummary[]
  dealMap: Record<string, ProductDealBadge>
}

const SORT_OPTIONS: { value: TagSort; label: string }[] = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'newest', label: 'Newest' },
]

function sortProducts(products: ProductSummary[], sort: TagSort): ProductSummary[] {
  const list = [...products]
  switch (sort) {
    case 'price_asc':
      return list.sort((a, b) => (a.current_price_inr ?? Infinity) - (b.current_price_inr ?? Infinity))
    case 'price_desc':
      return list.sort((a, b) => (b.current_price_inr ?? 0) - (a.current_price_inr ?? 0))
    case 'newest':
      return list.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    case 'rating':
    default:
      return list.sort((a, b) => b.creator_rating - a.creator_rating)
  }
}

export function TagProductResults({ products, dealMap }: TagProductResultsProps) {
  const [sort, setSort] = useState<TagSort>('rating')
  const sorted = useMemo(() => sortProducts(products, sort), [products, sort])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          <span className="font-semibold text-primary">{sorted.length}</span> product
          {sorted.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="tag-sort" className="text-xs font-semibold uppercase tracking-wider text-muted">Sort</label>
          <select
            id="tag-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as TagSort)}
            className="h-11 rounded-md border border-neutral-500 bg-surface px-3 text-sm font-medium text-primary"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <CategoryProductResults products={sorted} dealMap={dealMap} />
    </div>
  )
}
