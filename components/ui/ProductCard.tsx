'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Package, Square, CheckSquare } from 'lucide-react'
import { useCompareOptional } from '@/components/providers/CompareProvider'
import { DealRibbon } from '@/components/ui/ActiveDealBanner'
import { SaveButton } from '@/components/ui/SaveButton'
import { RatingBadge } from '@/components/ui/RatingBadge'
import { Badge } from '@/components/ui/Badge'
import { Price } from '@/components/ui/Price'
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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow duration-200 hover:shadow-md">
      {rank !== undefined && (
        <div className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {rank}
        </div>
      )}

      {showLiveDeal && activeDeal && <DealRibbon deal={activeDeal} />}

      <div className={`absolute top-2 z-10 ${rank !== undefined ? 'right-2' : 'left-2'}`}>
        <SaveButton product={product} variant="overlay" size={16} />
      </div>

      {showBadge && !showLiveDeal && (
        <div className="absolute right-2 top-2 z-10 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-primary">
          {badgeText}
        </div>
      )}

      {/* 4:3 image well — shorter than the old square, so a row of cards doesn't become a wall. */}
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-surface-alt" tabIndex={-1} aria-hidden>
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package size={36} className="text-muted/30" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted">{product.brand_name}</p>
          {showCategory && (
            <Badge variant="category" category={product.category_slug} size="sm" className="hidden shrink-0 capitalize sm:inline-flex">
              {product.category_slug}
            </Badge>
          )}
        </div>

        {/* The one link into the product: the stretched title covers the whole card. */}
        <Link href={href} className="after:absolute after:inset-0 after:content-['']">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-primary transition-colors group-hover:text-accent">
            <Highlight text={product.name} query={highlight} />
          </h3>
        </Link>

        {pickReason && <p className="text-xs text-muted">{pickReason}</p>}

        <RatingBadge score={product.creator_rating} />

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <Price value={product.current_price_inr} size="sm" />

          {/* Compare: a small checkbox-style toggle, above the stretched link. */}
          <button
            type="button"
            onClick={handleCompare}
            disabled={!compare}
            aria-pressed={inCompare}
            aria-label={`${inCompare ? 'Remove from' : 'Add to'} compare: ${product.name}`}
            title={inCompare ? 'In your comparison' : 'Add to compare'}
            className={`relative z-10 -mb-1 -mr-1 inline-flex h-9 shrink-0 items-center gap-1 rounded-md px-1.5 text-xs font-medium transition-colors after:absolute after:-inset-1 after:content-[''] disabled:cursor-not-allowed disabled:opacity-50 ${
              inCompare ? 'text-accent' : 'text-muted hover:text-accent'
            }`}
          >
            {inCompare ? <CheckSquare size={16} aria-hidden /> : <Square size={16} aria-hidden />}
            <span className="hidden min-[420px]:inline">Compare</span>
          </button>
        </div>
      </div>
    </article>
  )
}
