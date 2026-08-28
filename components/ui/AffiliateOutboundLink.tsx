'use client'

import Link from 'next/link'
import { trackAffiliateClick } from '@/lib/analytics/affiliate-click'

interface AffiliateOutboundLinkProps {
  href: string
  linkId: string
  storeName: string
  productName?: string
  priceInr?: number | null
  className?: string
  children: React.ReactNode
  rel?: string
}

export function AffiliateOutboundLink({
  href,
  linkId,
  storeName,
  productName,
  priceInr,
  className,
  children,
  rel = 'noopener noreferrer sponsored',
}: AffiliateOutboundLinkProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel={rel}
      className={className}
      onClick={() => trackAffiliateClick({ linkId, storeName, productName, priceInr })}
    >
      {children}
    </Link>
  )
}
