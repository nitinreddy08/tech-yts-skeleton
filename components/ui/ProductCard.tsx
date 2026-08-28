'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Package, GitCompare, Check, Eye } from 'lucide-react'
import { formatIndianPrice } from '@/lib/utils/format'
import { useCompareOptional } from '@/components/providers/CompareProvider'
import { ProductQuickView } from '@/components/ui/ProductQuickView'
import { DealRibbon } from '@/components/ui/ActiveDealBanner'
import { SaveButton } from '@/components/ui/SaveButton'
import type { ProductDealBadge } from '@/lib/data/product-deals'
import type { ProductSummary } from '@/types'

interface ProductCardProps {
  product: ProductSummary
  showDealBadge?: boolean
  activeDeal?: ProductDealBadge | null
  rank?: number
  pickReason?: string
}

export function ProductCard({ product, showDealBadge = true, activeDeal, rank, pickReason }: ProductCardProps) {
  const compare = useCompareOptional()
  const inCompare = compare?.isInCompare(product.id) ?? false
  const [quickView, setQuickView] = useState(false)

  const showBadge = showDealBadge && (product.is_deal_of_the_day || !!product.deal_badge_text)
  const badgeText = product.deal_badge_text ?? 'Deal'
  const showLiveDeal = !!activeDeal

  function handleCompare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!compare) return
    if (!inCompare && compare.products.length >= 4) {
      return
    }
    compare.toggleProduct(product)
  }

  return (
    <>
    <div className="group relative flex flex-col rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-sm)] hover:scale-[1.01] transition-transform duration-200 ease-out overflow-hidden">
      {rank !== undefined && (
        <div className="absolute top-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {rank}
        </div>
      )}

      {showLiveDeal && activeDeal && <DealRibbon deal={activeDeal} />}

      <div className={`absolute top-2 z-10 ${rank !== undefined ? 'right-2' : 'left-2'}`}>
        <SaveButton product={product} />
      </div>

      {showBadge && !showLiveDeal && (
        <div className="absolute top-2 right-2 z-10 rounded-full bg-secondary text-primary text-xs font-semibold px-2 py-0.5">
          {badgeText}
        </div>
      )}

      <Link href={`/${product.category_slug}/${product.slug}`} className="block aspect-square relative overflow-hidden bg-surface-alt">
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package size={40} className="text-muted/30" />
          </div>
        )}
      </Link>

      <div className="flex flex-col gap-2 p-6">
        <p className="text-xs text-muted">{product.brand_name}</p>
        <Link href={`/${product.category_slug}/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-primary leading-snug hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>

        {pickReason && (
          <p className="text-xs text-muted">{pickReason}</p>
        )}

        <div className="flex items-center gap-1.5">
          <div className="inline-flex items-center justify-center rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white">
            {product.creator_rating.toFixed(1)}
          </div>
          <span className="text-xs text-muted">/10</span>
        </div>

        {product.current_price_inr !== null && (
          <p className="text-base font-bold text-accent">
            {formatIndianPrice(product.current_price_inr)}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-auto pt-2">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setQuickView(true) }}
            className="flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors"
          >
            <Eye size={14} /> Quick view
          </button>
          <button
            type="button"
            onClick={handleCompare}
            disabled={!compare}
            aria-pressed={inCompare}
            className={`flex items-center gap-1 text-xs transition-colors ${
              inCompare
                ? 'text-accent font-semibold'
                : 'text-muted hover:text-primary'
            }`}
          >
            {inCompare ? <Check size={14} /> : <GitCompare size={14} />}
            {inCompare ? 'Added' : 'Compare'}
          </button>
          <Link
            href={`/${product.category_slug}/${product.slug}`}
            className="ml-auto text-xs font-medium text-accent hover:underline"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
    {quickView && (
      <ProductQuickView product={product} activeDeal={activeDeal} onClose={() => setQuickView(false)} />
    )}
    </>
  )
}
