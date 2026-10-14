'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { formatIndianPrice } from '@/lib/utils/format'
import { getBestOffer } from '@/lib/utils/best-offer'
import { AffiliateOutboundLink } from '@/components/ui/AffiliateOutboundLink'
import { buttonVariants } from '@/components/ui/Button'
import { useBottomLayer } from '@/lib/hooks/useBottomLayer'
import type { AffiliateLink } from '@/types'

interface StickyBuyBarProps {
  productName: string
  thumbnailUrl: string
  links: AffiliateLink[]
}

/**
 * Persistent one-tap buy action. It stays hidden while the main buy box
 * (`#buy-box`) is on screen, and slides up once the shopper has scrolled past
 * it — so it never competes with the real thing or shows before there's
 * anything to "go back" to. Hidden state is `inert`, so it can't be tabbed
 * into while off-screen.
 */
export function StickyBuyBar({ productName, thumbnailUrl, links }: StickyBuyBarProps) {
  const [visible, setVisible] = useState(false)
  const barRef = useBottomLayer<HTMLDivElement>('buy', visible)
  const best = getBestOffer(links)

  useEffect(() => {
    const target = document.getElementById('buy-box')
    if (!target) return
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    )
    obs.observe(target)
    return () => obs.disconnect()
  }, [])

  if (!best.link || best.price == null) return null

  return (
    <div
      ref={barRef}
      role="region"
      aria-label="Buy options"
      aria-hidden={!visible}
      inert={!visible}
      className={[
        'fixed left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-sm shadow-lg transition-transform duration-300',
        'bottom-[calc(var(--layer-tabbar)_+_var(--layer-compare))]',
        visible ? 'translate-y-0' : 'translate-y-[200%]',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-2.5">
        {thumbnailUrl && (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-alt">
            <Image src={thumbnailUrl} alt="" fill sizes="40px" className="object-contain p-1" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-primary">{productName}</p>
          <p className="text-xs font-bold text-accent">{formatIndianPrice(best.price)}</p>
        </div>
        <a
          href="#buy-box"
          className="hidden min-h-11 items-center px-2 text-sm font-medium text-accent hover:underline sm:inline-flex"
        >
          All stores
        </a>
        <AffiliateOutboundLink
          href={`/go/${best.link.id}`}
          linkId={best.link.id}
          storeName={best.link.store_name}
          productName={productName}
          priceInr={best.link.price_inr}
          className={buttonVariants({ variant: 'primary', size: 'auto', className: 'h-11 shrink-0 px-4 text-sm' })}
        >
          Buy at {best.link.store_name}
          <ExternalLink size={13} className="opacity-70" aria-hidden />
          <span className="sr-only"> (opens in a new tab)</span>
        </AffiliateOutboundLink>
      </div>
    </div>
  )
}
