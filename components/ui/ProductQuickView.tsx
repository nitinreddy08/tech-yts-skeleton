'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, GitCompare, Star, ArrowRight } from 'lucide-react'
import { formatIndianPrice } from '@/lib/utils/format'
import { useCompareOptional } from '@/components/providers/CompareProvider'
import type { ProductSummary } from '@/types'
import type { ProductDealBadge } from '@/lib/data/product-deals'
import { DealRibbon } from '@/components/ui/ActiveDealBanner'

interface ProductQuickViewProps {
  product: ProductSummary
  activeDeal?: ProductDealBadge | null
  onClose: () => void
}

export function ProductQuickView({ product, activeDeal, onClose }: ProductQuickViewProps) {
  const compare = useCompareOptional()
  const inCompare = compare?.isInCompare(product.id) ?? false

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Quick view: ${product.name}`}
        className="relative w-full sm:max-w-lg bg-surface rounded-t-2xl sm:rounded-2xl border border-border shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-surface/90 border border-border p-2 hover:bg-surface-alt"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="relative aspect-square bg-surface-alt">
          {activeDeal && <DealRibbon deal={activeDeal} className="top-3 right-12" />}
          {product.thumbnail_url ? (
            <Image src={product.thumbnail_url} alt={product.name} fill sizes="400px" className="object-contain p-8" />
          ) : null}
        </div>

        <div className="p-5">
          <p className="text-xs text-muted uppercase tracking-wider">{product.brand_name}</p>
          <h2 className="font-heading text-xl font-bold text-primary mt-1">{product.name}</h2>

          <div className="flex items-center gap-3 mt-3">
            <span className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-white">
              <Star size={12} className="fill-white" />
              {product.creator_rating.toFixed(1)}/10
            </span>
            {product.current_price_inr != null && (
              <span className="text-lg font-bold text-accent">{formatIndianPrice(product.current_price_inr)}</span>
            )}
          </div>

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {product.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-full bg-surface-alt border border-border px-2 py-0.5 text-[10px] text-muted">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-5">
            <Link
              href={`/${product.category_slug}/${product.slug}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent/90"
            >
              Full Review <ArrowRight size={14} />
            </Link>
            {compare && (
              <button
                type="button"
                onClick={() => compare.toggleProduct(product)}
                className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                  inCompare ? 'border-accent bg-accent/10 text-accent' : 'border-border text-primary hover:border-accent'
                }`}
              >
                <GitCompare size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
