'use client'

import Link from 'next/link'
import { GitCompare, Check, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { useCompare } from '@/components/providers/CompareProvider'
import { buildCompareUrl } from '@/lib/utils/compare-url'
import type { ProductSummary } from '@/types'

interface ProductComparePanelProps {
  product: ProductSummary
}

export function ProductComparePanel({ product }: ProductComparePanelProps) {
  const { isInCompare, toggleProduct, products } = useCompare()
  const added = isInCompare(product.id)
  const atLimit = products.length >= 4 && !added

  return (
    <div className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-1">
      {/* Secondary on purpose: comparing is a side quest, buying is the primary action. */}
      <Button
        variant="secondary"
        size="auto"
        onClick={() => toggleProduct(product)}
        disabled={atLimit}
        aria-pressed={added}
        className={`h-11 w-full px-4 text-sm font-semibold ${added ? 'border-accent bg-accent/5 text-accent hover:bg-accent/10' : ''}`}
      >
        {added ? <Check size={16} aria-hidden /> : <GitCompare size={16} aria-hidden />}
        {added ? 'Added to Compare' : atLimit ? 'Compare list full (4 max)' : 'Add to Compare'}
      </Button>

      {products.length >= 2 && (
        <Link
          href={buildCompareUrl(products.map((p) => p.slug))}
          className="flex min-h-11 items-center justify-center text-sm font-semibold text-accent hover:underline"
        >
          Compare {products.length} products now →
        </Link>
      )}
    </div>
  )
}

interface SimilarCompareStripProps {
  current: ProductSummary
  similar: ProductSummary[]
}

export function SimilarCompareStrip({ current, similar }: SimilarCompareStripProps) {
  const { toggleProduct, isInCompare, products } = useCompare()

  if (similar.length === 0) return null

  const topSimilar = similar.slice(0, 3)

  function addAll() {
    if (!isInCompare(current.id)) toggleProduct(current)
    for (const s of topSimilar) {
      if (!isInCompare(s.id) && products.length < 4) toggleProduct(s)
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-accent/30 bg-accent/5 p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-semibold text-primary flex items-center gap-1.5">
            <GitCompare size={16} className="text-accent" />
            Quick compare with similar
          </p>
          <p className="text-xs text-muted mt-0.5">
            One tap to compare specs side-by-side
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="auto" onClick={addAll} className="h-11 px-4 text-sm">
            <Plus size={14} aria-hidden />
            Add all to compare
          </Button>
          <Button variant="secondary" size="auto" href={buildCompareUrl([current.slug, ...topSimilar.map((s) => s.slug)])} className="h-11 px-4 text-sm">
            View comparison
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {topSimilar.map((s) => {
          const added = isInCompare(s.id)
          return (
            <Chip key={s.id} size="md" active={added} onClick={() => toggleProduct(s)} aria-pressed={added}>
              {added ? <Check size={12} aria-hidden /> : <Plus size={12} aria-hidden />}
              vs {s.name.split(' ').slice(0, 3).join(' ')}
            </Chip>
          )
        })}
      </div>
    </div>
  )
}
