'use client'

import { useMemo, useState } from 'react'
import { CategoryProductResults } from '@/components/ui/CategoryProductResults'
import { Chip } from '@/components/ui/Chip'
import type { ProductSummary } from '@/types'
import type { ProductDealBadge } from '@/lib/data/product-deals'

interface BrandProductResultsProps {
  products: ProductSummary[]
  dealMap: Record<string, ProductDealBadge>
  brandName: string
}

export function BrandProductResults({ products, dealMap, brandName }: BrandProductResultsProps) {
  const categories = useMemo(() => {
    const slugs = new Set(products.map((p) => p.category_slug))
    return [...slugs].sort()
  }, [products])

  const [category, setCategory] = useState<string>('all')

  const filtered =
    category === 'all' ? products : products.filter((p) => p.category_slug === category)

  function categoryLabel(slug: string): string {
    return slug.charAt(0).toUpperCase() + slug.slice(1)
  }

  return (
    <div>
      {categories.length > 1 && (
        <div role="group" aria-label="Category" className="mb-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted">Category</span>
          <Chip active={category === 'all'} aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
            All {brandName}
          </Chip>
          {categories.map((slug) => (
            <Chip
              key={slug}
              className="capitalize"
              active={category === slug}
              aria-pressed={category === slug}
              onClick={() => setCategory(slug)}
            >
              {categoryLabel(slug)}
            </Chip>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted text-center py-12">
          No {brandName} products in this category.
        </p>
      ) : (
        <CategoryProductResults products={filtered} dealMap={dealMap} />
      )}
    </div>
  )
}
