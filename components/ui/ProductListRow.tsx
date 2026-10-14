'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Package, GitCompare, Check } from 'lucide-react'
import { formatIndianPrice } from '@/lib/utils/format'
import { useCompareOptional } from '@/components/providers/CompareProvider'
import { SaveButton } from '@/components/ui/SaveButton'
import { RatingBadge } from '@/components/ui/RatingBadge'
import { Button } from '@/components/ui/Button'
import { DealRibbon } from '@/components/ui/ActiveDealBanner'
import { Eyebrow } from '@/components/ui/Eyebrow'
import type { ProductSummary } from '@/types'
import type { ProductDealBadge } from '@/lib/data/product-deals'

interface ProductListRowProps {
  product: ProductSummary
  activeDeal?: ProductDealBadge | null
}

export function ProductListRow({ product, activeDeal }: ProductListRowProps) {
  const compare = useCompareOptional()
  const inCompare = compare?.isInCompare(product.id) ?? false

  function handleCompare(e: React.MouseEvent) {
    e.preventDefault()
    compare?.toggleProduct(product)
  }

  return (
    <article className="group relative flex gap-4 rounded-xl border border-border bg-surface p-4 hover:border-accent/30 hover:shadow-sm transition-all">
      {activeDeal && <DealRibbon deal={activeDeal} className="top-3 right-3" />}

      <Link
        href={`/${product.category_slug}/${product.slug}`}
        className="relative h-24 w-24 shrink-0 rounded-lg bg-surface-alt border border-border overflow-hidden"
      >
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.name}
            fill
            sizes="96px"
            className="object-contain p-2 group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package size={28} className="text-muted/30" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col min-w-0 gap-1">
        <Eyebrow>{product.brand_name}</Eyebrow>
        <Link href={`/${product.category_slug}/${product.slug}`}>
          <h3 className="text-sm font-semibold text-primary line-clamp-2 hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex flex-wrap items-center gap-3 mt-auto pt-2">
          <RatingBadge score={product.creator_rating} showVerdict />
          {product.current_price_inr != null ? (
            <p className="text-base font-bold text-accent">{formatIndianPrice(product.current_price_inr)}</p>
          ) : (
            <p className="text-xs text-muted">Price N/A</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-2">
        <SaveButton product={product} size={16} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCompare}
            disabled={!compare}
            aria-pressed={inCompare}
            className={`inline-flex h-11 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              inCompare ? 'border-accent bg-accent/5 text-accent' : 'border-border text-muted hover:border-accent hover:text-accent'
            }`}
          >
            {inCompare ? <Check size={14} aria-hidden /> : <GitCompare size={14} aria-hidden />}
            <span className="hidden sm:inline">{inCompare ? 'Added' : 'Compare'}</span>
            <span className="sr-only sm:hidden">{inCompare ? 'Added to compare' : 'Add to compare'}</span>
          </button>
          <Button href={`/${product.category_slug}/${product.slug}`} size="auto" className="h-11 px-4 text-sm">
            View<span className="sr-only"> {product.name}</span>
          </Button>
        </div>
      </div>
    </article>
  )
}
