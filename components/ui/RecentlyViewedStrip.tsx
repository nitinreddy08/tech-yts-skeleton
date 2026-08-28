'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, ChevronRight, Package } from 'lucide-react'
import { loadRecentlyViewed } from '@/lib/utils/recently-viewed'
import { formatIndianPrice } from '@/lib/utils/format'
import type { ProductSummary } from '@/types'

interface RecentlyViewedStripProps {
  /** Exclude current product on PDP */
  excludeId?: string
  /** compact = sidebar card; full = homepage section */
  variant?: 'compact' | 'full'
  className?: string
}

export function RecentlyViewedStrip({
  excludeId,
  variant = 'full',
  className = '',
}: RecentlyViewedStripProps) {
  const [items, setItems] = useState<ProductSummary[]>([])

  useEffect(() => {
    function refresh() {
      const recent = loadRecentlyViewed().filter((p) => p.id !== excludeId)
      setItems(recent)
    }
    refresh()
    window.addEventListener('recently-viewed-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('recently-viewed-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [excludeId])

  if (items.length === 0) return null

  if (variant === 'compact') {
    return (
      <div className={`rounded-xl border border-border bg-surface p-4 ${className}`}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
          <Clock size={13} /> Recently Viewed
        </p>
        <ul className="flex flex-col gap-2">
          {items.slice(0, 4).map((p) => (
            <li key={p.id}>
              <Link
                href={`/${p.category_slug}/${p.slug}`}
                className="flex items-center gap-2.5 rounded-lg p-1.5 -mx-1.5 hover:bg-surface-alt transition-colors group"
              >
                <div className="relative h-10 w-10 shrink-0 rounded-lg border border-border bg-surface-alt overflow-hidden">
                  {p.thumbnail_url ? (
                    <Image src={p.thumbnail_url} alt="" fill sizes="40px" className="object-contain p-1" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package size={16} className="text-muted/40" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-primary truncate group-hover:text-accent transition-colors">
                    {p.name}
                  </p>
                  {p.current_price_inr != null && (
                    <p className="text-[10px] text-muted">{formatIndianPrice(p.current_price_inr)}</p>
                  )}
                </div>
                <ChevronRight size={14} className="text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <section className={`py-12 px-4 bg-surface ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-heading text-xl font-bold text-primary flex items-center gap-2">
              <Clock size={20} className="text-accent" /> Continue Browsing
            </h2>
            <p className="text-sm text-muted mt-0.5">Pick up where you left off</p>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/${p.category_slug}/${p.slug}`}
              className="snap-start shrink-0 w-36 sm:w-40 rounded-xl border border-border bg-surface-alt p-3 hover:border-accent hover:shadow-sm transition-all group"
            >
              <div className="relative aspect-square rounded-lg bg-surface border border-border overflow-hidden mb-2">
                {p.thumbnail_url ? (
                  <Image
                    src={p.thumbnail_url}
                    alt={p.name}
                    fill
                    sizes="160px"
                    className="object-contain p-2 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package size={28} className="text-muted/30" />
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-primary line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                {p.name}
              </p>
              {p.current_price_inr != null && (
                <p className="text-xs font-bold text-accent mt-1">{formatIndianPrice(p.current_price_inr)}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
