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

  const chips =
    categories.length > 1 ? (
      <div role="group" aria-label="Category" className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1 no-scrollbar">
        <Chip active={category === 'all'} aria-pressed={category === 'all'} onClick={() => setCategory('all')} className="shrink-0">
          All {brandName}
        </Chip>
        {categories.map((slug) => (
          <Chip
            key={slug}
            className="shrink-0 capitalize"
            active={category === slug}
            aria-pressed={category === slug}
            onClick={() => setCategory(slug)}
          >
            {categoryLabel(slug)}
          </Chip>
        ))}
      </div>
    ) : undefined

  return filtered.length === 0 ? (
    <p className="py-12 text-center text-sm text-muted">No {brandName} products in this category.</p>
  ) : (
    <CategoryProductResults products={filtered} dealMap={dealMap} toolbar={chips} wide />
  )
}
