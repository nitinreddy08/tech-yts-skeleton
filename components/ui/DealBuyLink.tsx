'use client'

import { useNow } from '@/lib/hooks/useNow'
import { AffiliateOutboundLink } from '@/components/ui/AffiliateOutboundLink'

interface DealBuyLinkProps {
  /** ISO timestamp; once it passes, the link turns into an inert "Deal ended" label. */
  expiresAt?: string | null
  href: string
  linkId: string
  storeName: string
  productName?: string
  priceInr?: number | null
  /** Classes for the live link (use buttonVariants()). */
  className?: string
  children: React.ReactNode
}

/**
 * Affiliate link for a time-limited deal. Pages are cached for up to a minute,
 * so a deal can expire while its page is still on screen — this keeps the CTA
 * from sending shoppers to a dead offer.
 */
export function DealBuyLink({ expiresAt, className, children, ...link }: DealBuyLinkProps) {
  const now = useNow(15000)
  const expired = !!expiresAt && now !== null && new Date(expiresAt).getTime() <= now

  if (expired) {
    return (
      <span className={`${className ?? ''} pointer-events-none opacity-60`} aria-disabled="true">
        Deal ended
      </span>
    )
  }

  return (
    <AffiliateOutboundLink {...link} className={className}>
      {children}
    </AffiliateOutboundLink>
  )
}
