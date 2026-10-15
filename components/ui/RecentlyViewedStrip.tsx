'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, ChevronRight, Package } from 'lucide-react'
import { loadRecentlyViewed } from '@/lib/utils/recently-viewed'
import { formatIndianPrice } from '@/lib/utils/format'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Price } from '@/components/ui/Price'
import { Section, SectionHeader, Rail } from '@/components/ui/Section'
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
        <Eyebrow className="mb-3 flex items-center gap-1.5">
          <Clock size={13} /> Recently Viewed
        </Eyebrow>
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
                    <p className="text-[11px] text-muted">{formatIndianPrice(p.current_price_inr)}</p>
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
    <Section compact className={className}>
      <SectionHeader title="Continue browsing" className="mb-3 md:mb-4" />
      <Rail className="md:grid-cols-6 [&>*]:w-36 sm:[&>*]:w-40 md:[&>*]:w-auto">
        {items.slice(0, 6).map((p) => (
          <Link
            key={p.id}
            href={`/${p.category_slug}/${p.slug}`}
            className="group rounded-xl border border-border bg-surface p-3 transition-shadow hover:shadow-md"
          >
            <div className="relative mb-2 aspect-[4/3] overflow-hidden rounded-lg bg-surface-alt">
              {p.thumbnail_url ? (
                <Image
                  src={p.thumbnail_url}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-contain p-2 transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package size={28} className="text-muted/30" />
                </div>
              )}
            </div>
            <p className="line-clamp-2 text-xs font-semibold leading-snug text-primary group-hover:text-accent">{p.name}</p>
            <Price value={p.current_price_inr} size="sm" className="mt-1 !text-sm" />
          </Link>
        ))}
      </Rail>
    </Section>
  )
}
