import { Zap, ArrowRight } from 'lucide-react'
import { formatIndianPrice } from '@/lib/utils/format'
import { dealTypeLabel } from '@/lib/data/product-deals'
import type { ProductDealBadge } from '@/lib/data/product-deals'
import { DealCountdown } from '@/components/ui/DealCountdown'
import { AffiliateOutboundLink } from '@/components/ui/AffiliateOutboundLink'

interface ActiveDealBannerProps {
  deal: ProductDealBadge
  productName: string
}

/** Slickdeals / Amazon urgency strip on PDP */
export function ActiveDealBanner({ deal, productName }: ActiveDealBannerProps) {
  return (
    <div className="rounded-xl border border-secondary/40 bg-gradient-to-r from-secondary/15 to-secondary/5 p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">
              <Zap size={10} /> {dealTypeLabel(deal.dealType)}
            </span>
            {deal.savingsPercent != null && (
              <span className="text-xs font-bold text-green-700">{deal.savingsPercent}% OFF</span>
            )}
          </div>
          <p className="text-sm font-semibold text-primary line-clamp-2">{deal.headline}</p>
          <p className="text-xs text-muted mt-0.5">{productName}</p>
        </div>
        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          {deal.dealPrice != null && (
            <p className="text-xl font-bold text-accent">{formatIndianPrice(deal.dealPrice)}</p>
          )}
          {deal.expiresAt && <DealCountdown expiresAt={deal.expiresAt} />}
          <AffiliateOutboundLink
            href={`/go/${deal.dealId}`}
            linkId={deal.dealId}
            storeName={deal.storeName}
            productName={productName}
            priceInr={deal.dealPrice}
            className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-primary hover:bg-secondary-600 transition-colors"
          >
            Grab deal on {deal.storeName} <ArrowRight size={14} />
          </AffiliateOutboundLink>
        </div>
      </div>
    </div>
  )
}

interface DealRibbonProps {
  deal: ProductDealBadge
  className?: string
}

export function DealRibbon({ deal, className = '' }: DealRibbonProps) {
  const label =
    deal.savingsPercent != null
      ? `${deal.savingsPercent}% OFF`
      : dealTypeLabel(deal.dealType)

  return (
    <div
      className={`absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-secondary text-primary text-[10px] font-bold px-2 py-0.5 shadow-sm ${className}`}
    >
      <Zap size={9} />
      {label}
    </div>
  )
}
