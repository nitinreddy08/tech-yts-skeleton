'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { GitCompare, TrendingDown, Zap, Check, Eye } from 'lucide-react'
import { formatIndianPrice } from '@/lib/utils/format'
import { useCompareOptional } from '@/components/providers/CompareProvider'
import { SaveButton } from '@/components/ui/SaveButton'
import { ProductQuickView } from '@/components/ui/ProductQuickView'
import { Badge } from '@/components/ui/Badge'
import type { RichSearchResult } from '@/lib/data/search'
import type { ProductSummary } from '@/types'

interface SearchResultCardProps {
  result: RichSearchResult
  query: string
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-accent/15 text-accent rounded-sm px-0.5 not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

function RatingBar({ score }: { score: number }) {
  const pct = (score / 10) * 100
  const color =
    score >= 9 ? 'bg-green-500' : score >= 8 ? 'bg-lime-500' : score >= 7 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color: `var(--color-accent)` }}>
        {score.toFixed(1)}
      </span>
    </div>
  )
}

function toProductSummary(result: RichSearchResult): ProductSummary {
  return {
    id: result.id,
    name: result.name,
    slug: result.slug,
    category_id: result.category_id,
    category_slug: result.category_slug,
    brand_id: result.brand_id,
    brand_name: result.brand_name,
    thumbnail_url: result.thumbnail_url,
    creator_rating: result.creator_rating,
    current_price_inr: result.current_price_inr,
    launch_price_inr: result.launch_price_inr,
    is_featured: result.is_featured,
    is_deal_of_the_day: result.is_deal_of_the_day,
    deal_badge_text: result.deal_badge_text,
    tags: result.tags,
    youtube_video_url: result.youtube_video_url,
    created_at: result.created_at,
  }
}

export function SearchResultCard({ result, query }: SearchResultCardProps) {
  const compare = useCompareOptional()
  const product = toProductSummary(result)
  const inCompare = compare?.isInCompare(product.id) ?? false
  const [quickView, setQuickView] = useState(false)

  const discount =
    result.launch_price_inr &&
    result.current_price_inr &&
    result.launch_price_inr > result.current_price_inr
      ? Math.round(
          ((result.launch_price_inr - result.current_price_inr) / result.launch_price_inr) * 100
        )
      : null

  function handleCompare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!compare) return
    compare.toggleProduct(product)
  }

  return (
    <>
      <div className="group relative flex flex-col rounded-xl border border-border bg-surface shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-200">
        <div className="absolute top-2 right-2 z-10">
          <SaveButton product={product} className="p-1.5" size={16} />
        </div>

        {result.has_active_deal && result.deal_savings_percent != null ? (
          <Badge variant="deal" size="sm" className="absolute left-2.5 top-2.5 z-10">
            <Zap size={9} />
            {result.deal_savings_percent}% OFF
          </Badge>
        ) : discount != null ? (
          <Badge variant="success" size="sm" className="absolute left-2.5 top-2.5 z-10">
            <TrendingDown size={9} />
            {discount}% off
          </Badge>
        ) : null}

        <Link href={`/${result.category_slug}/${result.slug}`} className="block">
          <div className="relative aspect-square overflow-hidden rounded-t-xl bg-surface-alt">
            {result.thumbnail_url ? (
              <Image
                src={result.thumbnail_url}
                alt={result.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-contain p-4 transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl text-muted/30">📦</div>
            )}
          </div>
        </Link>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              {result.brand_name}
            </span>
            <Badge variant="category" category={result.category_slug} size="sm" className="capitalize">
              {result.category_slug}
            </Badge>
          </div>

          <Link href={`/${result.category_slug}/${result.slug}`}>
            <h3 className="line-clamp-2 text-sm font-semibold text-primary leading-snug hover:text-accent transition-colors">
              <Highlight text={result.name} query={query} />
            </h3>
          </Link>

          <RatingBar score={result.creator_rating} />

          <div className="mt-auto flex items-end justify-between gap-2 pt-1">
            <div>
              {result.current_price_inr != null ? (
                <p className="text-base font-extrabold text-accent">
                  {formatIndianPrice(result.current_price_inr)}
                </p>
              ) : (
                <p className="text-xs text-muted">Price N/A</p>
              )}
              {result.launch_price_inr != null &&
                result.current_price_inr != null &&
                result.launch_price_inr > result.current_price_inr && (
                  <p className="text-xs text-muted line-through">
                    {formatIndianPrice(result.launch_price_inr)}
                  </p>
                )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-border/60">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setQuickView(true)
              }}
              className="flex items-center gap-1 text-[10px] text-muted hover:text-primary transition-colors"
            >
              <Eye size={12} /> Quick view
            </button>
            <button
              type="button"
              onClick={handleCompare}
              disabled={!compare}
              aria-pressed={inCompare}
              className={`flex items-center gap-1 text-[10px] transition-colors ${
                inCompare ? 'text-accent font-semibold' : 'text-muted hover:text-primary'
              }`}
            >
              {inCompare ? <Check size={12} /> : <GitCompare size={12} />}
              {inCompare ? 'Added' : 'Compare'}
            </button>
          </div>
        </div>
      </div>

      {quickView && (
        <ProductQuickView product={product} onClose={() => setQuickView(false)} />
      )}
    </>
  )
}
