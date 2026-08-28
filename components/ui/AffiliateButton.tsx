'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { AffiliateLink } from '@/types'
import { formatIndianPrice } from '@/lib/utils/format'
import { trackAffiliateClick } from '@/lib/analytics/affiliate-click'

interface AffiliateButtonProps {
  link: AffiliateLink
  isBestPrice?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export function AffiliateButton({ link, isBestPrice = false, size = 'md' }: AffiliateButtonProps) {
  return (
    <Link
      href={`/go/${link.id}`}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => trackAffiliateClick({ linkId: link.id, storeName: link.store_name, priceInr: link.price_inr })}
      className={[
        'inline-flex items-center gap-2 rounded-lg font-medium transition-colors active:scale-[0.98] transition-transform duration-100',
        sizeClasses[size],
        isBestPrice
          ? 'bg-accent text-white hover:bg-accent/90'
          : 'bg-surface border border-border text-primary hover:bg-surface-alt',
      ].join(' ')}
    >
      <ShoppingCart size={16} />
      <span>{link.store_name}</span>
      {link.price_inr != null && (
        <span className="font-bold">{formatIndianPrice(link.price_inr)}</span>
      )}
    </Link>
  )
}
