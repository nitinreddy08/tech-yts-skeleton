'use client'

import Link from 'next/link'
import { GitCompare, Check, Plus } from 'lucide-react'
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
    <div className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-3">
      <button
        type="button"
        onClick={() => toggleProduct(product)}
        disabled={atLimit}
        aria-pressed={added}
        className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors w-full ${
          added
            ? 'bg-accent/10 text-accent border border-accent/30'
            : atLimit
              ? 'bg-surface-alt text-muted cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/90'
        }`}
      >
        {added ? <Check size={16} /> : <GitCompare size={16} />}
        {added ? 'Added to Compare' : atLimit ? 'Compare list full (4 max)' : 'Add to Compare'}
      </button>

      {products.length >= 2 && (
        <Link
          href={buildCompareUrl(products.map((p) => p.slug))}
          className="text-center text-xs font-semibold text-accent hover:underline"
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
  const allSlugs = [current.slug, ...topSimilar.map((s) => s.slug)].join(',')

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
          <button
            type="button"
            onClick={addAll}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white hover:bg-accent/90"
          >
            <Plus size={14} />
            Add all to compare
          </button>
          <Link
            href={`/compare?products=${allSlugs}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-primary hover:border-accent transition-colors"
          >
            View comparison
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {topSimilar.map((s) => {
          const added = isInCompare(s.id)
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleProduct(s)}
              aria-pressed={added}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                added
                  ? 'bg-accent text-white'
                  : 'border border-border bg-surface text-primary hover:border-accent'
              }`}
            >
              {added ? <Check size={12} /> : <Plus size={12} />}
              vs {s.name.split(' ').slice(0, 3).join(' ')}
            </button>
          )
        })}
      </div>
    </div>
  )
}
