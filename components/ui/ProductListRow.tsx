'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Package, Square, CheckSquare } from 'lucide-react'
import { useCompareOptional } from '@/components/providers/CompareProvider'
import { SaveButton } from '@/components/ui/SaveButton'
import { RatingBadge } from '@/components/ui/RatingBadge'
import { Price } from '@/components/ui/Price'
import { DealRibbon } from '@/components/ui/ActiveDealBanner'
import type { ProductSummary } from '@/types'
import type { ProductDealBadge } from '@/lib/data/product-deals'

interface ProductListRowProps {
  product: ProductSummary
  activeDeal?: ProductDealBadge | null
}

/** List-view sibling of ProductCard: same facts, one row. The title link covers the row. */
export function ProductListRow({ product, activeDeal }: ProductListRowProps) {
  const compare = useCompareOptional()
  const inCompare = compare?.isInCompare(product.id) ?? false
  const href = `/${product.category_slug}/${product.slug}`

  return (
    <article className="group relative flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-shadow hover:shadow-md sm:gap-4 sm:p-4">
      {activeDeal && <DealRibbon deal={activeDeal} className="right-3 top-3" />}

      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-alt sm:h-24 sm:w-24">
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt=""
            fill
            sizes="96px"
            className="object-contain p-2 transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package size={28} className="text-muted/30" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-xs text-muted">{product.brand_name}</p>
        <Link href={href} className="after:absolute after:inset-0 after:content-['']">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-primary transition-colors group-hover:text-accent">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
          <RatingBadge score={product.creator_rating} showVerdict />
          <Price value={product.current_price_inr} size="sm" />
        </div>
      </div>

      <div className="relative z-10 flex shrink-0 flex-col items-end gap-1 self-stretch justify-between">
        <SaveButton product={product} size={16} />
        <button
          type="button"
          onClick={() => compare?.toggleProduct(product)}
          disabled={!compare}
          aria-pressed={inCompare}
          aria-label={`${inCompare ? 'Remove from' : 'Add to'} compare: ${product.name}`}
          className={`inline-flex h-11 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            inCompare ? 'text-accent' : 'text-muted hover:text-accent'
          }`}
        >
          {inCompare ? <CheckSquare size={16} aria-hidden /> : <Square size={16} aria-hidden />}
          <span className="hidden sm:inline">Compare</span>
        </button>
      </div>
    </article>
  )
}
