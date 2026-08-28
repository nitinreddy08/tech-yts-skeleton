import Link from 'next/link'
import { Clock } from 'lucide-react'
import { DealCountdown } from '@/components/ui/DealCountdown'
import { AffiliateOutboundLink } from '@/components/ui/AffiliateOutboundLink'
import { formatIndianPrice } from '@/lib/utils/format'
import type { Deal } from '@/types'

interface ExpiringSoonStripProps {
  deals: Deal[]
}

/** Slickdeals urgency — deals ending within 48 hours */
export function ExpiringSoonStrip({ deals }: ExpiringSoonStripProps) {
  if (deals.length === 0) return null

  return (
    <section className="mb-8 rounded-xl border border-secondary/40 bg-gradient-to-r from-secondary/10 to-surface p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={18} className="text-secondary-700" />
        <h2 className="font-heading text-sm font-bold text-primary">Ending Soon</h2>
        <span className="text-xs text-muted">Don&apos;t miss these — expiring in 48 hours</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {deals.map((deal) => {
          if (!deal.product) return null
          return (
            <div
              key={deal.id}
              className="shrink-0 w-64 rounded-lg border border-border bg-surface p-3 flex flex-col gap-2"
            >
              <Link
                href={`/${deal.product.category_slug}/${deal.product.slug}`}
                className="text-sm font-semibold text-primary line-clamp-2 hover:text-accent"
              >
                {deal.product.name}
              </Link>
              <div className="flex items-baseline gap-2">
                {deal.deal_price_inr != null && (
                  <span className="text-base font-bold text-accent">
                    {formatIndianPrice(deal.deal_price_inr)}
                  </span>
                )}
              </div>
              {deal.expires_at && <DealCountdown expiresAt={deal.expires_at} compact />}
              <AffiliateOutboundLink
                href={`/go/${deal.id}`}
                linkId={deal.id}
                storeName={deal.store_name}
                productName={deal.product.name}
                priceInr={deal.deal_price_inr}
                className="mt-auto text-center rounded-md bg-secondary py-1.5 text-xs font-semibold text-primary hover:bg-secondary-600 transition-colors"
              >
                Grab deal
              </AffiliateOutboundLink>
            </div>
          )
        })}
      </div>
    </section>
  )
}
