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
import { RatingBadge } from '@/components/ui/RatingBadge'
import { Badge } from '@/components/ui/Badge'
import type { ProductDealBadge } from '@/lib/data/product-deals'
import type { ProductSummary } from '@/types'

interface ProductCardProps {
  product: ProductSummary
  showDealBadge?: boolean
  activeDeal?: ProductDealBadge | null
  rank?: number
  pickReason?: string
  /** Wraps the first match of this text in the title with <mark> (search results). */
  highlight?: string
  /** Shows the category next to the brand (useful when results span categories). */
  showCategory?: boolean
}

function Highlight({ text, query }: { text: string; query?: string }) {
  const q = query?.trim()
  if (!q) return <>{text}</>
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-accent/15 px-0.5 text-accent not-italic">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  )
}

export function ProductCard({ product, showDealBadge = true, activeDeal, rank, pickReason, highlight, showCategory = false }: ProductCardProps) {
  const compare = useCompareOptional()
  const inCompare = compare?.isInCompare(product.id) ?? false
  const [quickView, setQuickView] = useState(false)

  const showBadge = showDealBadge && (product.is_deal_of_the_day || !!product.deal_badge_text)
  const badgeText = product.deal_badge_text ?? 'Deal'
  const showLiveDeal = !!activeDeal
  const href = `/${product.category_slug}/${product.slug}`

  function handleCompare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    // The provider owns the 4-product / same-category rules and shows a toast
    // explaining a refusal, so always hand the click to it.
    compare?.toggleProduct(product)
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

      <div className={`absolute top-1 z-10 ${rank !== undefined ? 'right-1' : 'left-1'}`}>
        <SaveButton product={product} />
      </div>

      {showBadge && !showLiveDeal && (
        <div className="absolute top-2 right-2 z-10 rounded-full bg-secondary text-primary text-xs font-semibold px-2 py-0.5">
          {badgeText}
        </div>
      )}

      <Link href={href} className="block aspect-square relative overflow-hidden bg-surface-alt" tabIndex={-1} aria-hidden>
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt=""
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

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted">{product.brand_name}</p>
          {showCategory && (
            <Badge variant="category" category={product.category_slug} size="sm" className="hidden shrink-0 capitalize sm:inline-flex">
              {product.category_slug}
            </Badge>
          )}
        </div>
        {/* The one real link into the product: image and title share it. */}
        <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-primary leading-snug group-hover:text-accent transition-colors">
            <Highlight text={product.name} query={highlight} />
          </h3>
        </Link>

        {pickReason && (
          <p className="text-xs text-muted">{pickReason}</p>
        )}

        <RatingBadge score={product.creator_rating} showVerdict />

        {product.current_price_inr !== null && (
          <p className="text-base font-bold text-accent">
            {formatIndianPrice(product.current_price_inr)}
          </p>
        )}

        {/* Sits above the stretched title link so the two actions stay tappable. */}
        <div className="relative z-10 mt-auto flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setQuickView(true) }}
            aria-label={`Quick view ${product.name}`}
            title="Quick view"
            className="flex h-11 min-w-0 flex-1 items-center justify-center rounded-lg border border-border text-muted hover:border-accent hover:text-accent transition-colors sm:w-11 sm:flex-none"
          >
            <Eye size={18} aria-hidden />
          </button>
          <button
            type="button"
            onClick={handleCompare}
            disabled={!compare}
            aria-pressed={inCompare}
            aria-label={`${inCompare ? 'Remove from' : 'Add to'} compare: ${product.name}`}
            title={inCompare ? 'Added to compare' : 'Compare'}
            className={`flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              inCompare
                ? 'border-accent bg-accent/5 text-accent'
                : 'border-border text-muted hover:border-accent hover:text-accent'
            }`}
          >
            {inCompare ? <Check size={16} aria-hidden /> : <GitCompare size={16} aria-hidden />}
            {/* Label from sm up; below that the 2-column cards only have room for the icon. */}
            <span className="hidden truncate sm:inline">{inCompare ? 'Added' : 'Compare'}</span>
          </button>
        </div>
      </div>
    </div>
    {quickView && (
      <ProductQuickView product={product} activeDeal={activeDeal} onClose={() => setQuickView(false)} />
    )}
    </>
  )
}
