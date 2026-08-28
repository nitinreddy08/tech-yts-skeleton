'use client'

import { useMemo, useState } from 'react'
import { CategoryProductResults } from '@/components/ui/CategoryProductResults'
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
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted mr-1">
            Category
          </span>
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              category === 'all'
                ? 'bg-accent text-white'
                : 'border border-border bg-surface text-primary hover:border-accent/50'
            }`}
          >
            All {brandName}
          </button>
          {categories.map((slug) => (
            <button
              key={slug}
              type="button"
              onClick={() => setCategory(slug)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                category === slug
                  ? 'bg-primary text-white'
                  : 'border border-border bg-surface text-primary hover:border-accent/50'
              }`}
            >
              {categoryLabel(slug)}
            </button>
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
