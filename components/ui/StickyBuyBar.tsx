'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react'
import { formatIndianPrice } from '@/lib/utils/format'
import { AffiliateOutboundLink } from '@/components/ui/AffiliateOutboundLink'
import { useBottomLayer } from '@/lib/hooks/useBottomLayer'
import type { AffiliateLink } from '@/types'

interface StickyBuyBarProps {
  productName: string
  thumbnailUrl: string
  bestPrice: number | null
  links: AffiliateLink[]
}

/**
 * Appears at the bottom of the viewport once the user scrolls past
 * the main buy section. Shows product name, best price, and a
 * "Buy Now" button that expands into the full store list.
 */
export function StickyBuyBar({ productName, thumbnailUrl, bestPrice, links }: StickyBuyBarProps) {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const barRef = useBottomLayer<HTMLDivElement>('buy', visible)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const sorted = [...links].sort((a, b) => (a.price_inr ?? Infinity) - (b.price_inr ?? Infinity))

  return (
    <>
      {/* Sentinel placed after the buy section on the page */}
      <div ref={sentinelRef} aria-hidden="true" />

      {/* Sticky bar */}
      <div
        ref={barRef}
        className={[
          'fixed left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-sm shadow-lg transition-transform duration-300',
          'bottom-[calc(var(--layer-tabbar)_+_var(--layer-compare))]',
          visible ? 'translate-y-0' : 'translate-y-[200%]',
        ].join(' ')}
        aria-label="Buy options"
      >
        {/* Expanded store list */}
        {expanded && (
          <div className="border-b border-border bg-surface px-4 py-3 flex flex-col gap-2 max-w-2xl mx-auto w-full">
            {sorted.map((link, i) => (
              <AffiliateOutboundLink
                key={link.id}
                href={`/go/${link.id}`}
                linkId={link.id}
                storeName={link.store_name}
                productName={productName}
                priceInr={link.price_inr}
                className={[
                  'flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                  i === 0
                    ? 'bg-accent text-white hover:bg-accent/90'
                    : 'border border-border bg-surface-alt text-primary hover:bg-border',
                ].join(' ')}
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart size={14} />
                  {link.store_name}
                  {i === 0 && (
                    <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">
                      BEST
                    </span>
                  )}
                </span>
                {link.price_inr != null && (
                  <span className="font-bold">{formatIndianPrice(link.price_inr)}</span>
                )}
              </AffiliateOutboundLink>
            ))}
          </div>
        )}

        {/* Main bar */}
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          {thumbnailUrl && (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-alt">
              <Image src={thumbnailUrl} alt={productName} fill sizes="40px" className="object-contain p-1" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-primary">{productName}</p>
            {bestPrice != null && (
              <p className="text-xs text-accent font-bold">{formatIndianPrice(bestPrice)}</p>
            )}
          </div>

          {links.length > 0 && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 transition-colors shrink-0"
              aria-expanded={expanded}
            >
              Buy Now
              {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
