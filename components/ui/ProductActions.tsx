'use client'

import { GitCompare, Check } from 'lucide-react'
import { useCompare } from '@/components/providers/CompareProvider'
import { SaveButton } from '@/components/ui/SaveButton'
import { ShareBar } from '@/components/ui/ShareBar'
import type { ProductSummary } from '@/types'

interface ProductActionsProps {
  product: ProductSummary
  shareUrl: string
  shareText: string
}

/** Save · Compare · Share — the three side actions, one slim row (replaces the old sidebar). */
export function ProductActions({ product, shareUrl, shareText }: ProductActionsProps) {
  const { isInCompare, toggleProduct, products } = useCompare()
  const added = isInCompare(product.id)
  const atLimit = products.length >= 4 && !added

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SaveButton product={product} />
      <button
        type="button"
        onClick={() => toggleProduct(product)}
        disabled={atLimit}
        aria-pressed={added}
        className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors disabled:opacity-50 ${
          added
            ? 'border-accent bg-accent/5 text-accent'
            : 'border-border bg-surface text-primary hover:border-accent hover:text-accent'
        }`}
      >
        {added ? <Check size={16} aria-hidden /> : <GitCompare size={16} aria-hidden />}
        {added ? 'In compare' : atLimit ? 'Compare full' : 'Compare'}
      </button>
      <ShareBar url={shareUrl} title={product.name} text={shareText} />
    </div>
  )
}
