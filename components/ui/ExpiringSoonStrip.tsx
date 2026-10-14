import Link from 'next/link'
import { Clock } from 'lucide-react'
import { DealCountdown } from '@/components/ui/DealCountdown'
import { DealBuyLink } from '@/components/ui/DealBuyLink'
import { buttonVariants } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatIndianPrice } from '@/lib/utils/format'
import type { Deal } from '@/types'

interface ExpiringSoonStripProps {
  deals: Deal[]
}

/** Slickdeals urgency — deals ending within 48 hours */
export function ExpiringSoonStrip({ deals }: ExpiringSoonStripProps) {
  if (deals.length === 0) return null

  return (
    <section aria-labelledby="ending-soon" className="mb-8 rounded-xl border border-secondary-200 bg-secondary-50 p-5">
      <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1">
        <Clock size={18} className="text-secondary-700" aria-hidden />
        <h2 id="ending-soon" className="font-heading text-sm font-bold text-primary">Ending soon</h2>
        <span className="text-xs text-muted">Expiring within 48 hours</span>
      </div>
      <ul className="flex gap-3 overflow-x-auto pb-1 snap-x">
        {deals.map((deal) => {
          if (!deal.product) return null
          const pct =
            deal.original_price_inr && deal.deal_price_inr
              ? Math.round(((deal.original_price_inr - deal.deal_price_inr) / deal.original_price_inr) * 100)
              : null
          return (
            <li
              key={deal.id}
              className="flex w-64 shrink-0 snap-start flex-col gap-2 rounded-lg border border-border bg-surface p-3"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{deal.store_name}</p>
              <Link
                href={`/${deal.product.category_slug}/${deal.product.slug}`}
                className="text-sm font-semibold text-primary line-clamp-2 hover:text-accent"
              >
                {deal.product.name}
              </Link>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                {deal.deal_price_inr != null && (
                  <span className="text-base font-bold text-accent">{formatIndianPrice(deal.deal_price_inr)}</span>
                )}
                {deal.original_price_inr != null && (
                  <span className="text-xs text-muted line-through">{formatIndianPrice(deal.original_price_inr)}</span>
                )}
                {pct != null && pct > 0 && <Badge variant="success" size="sm">{pct}% off</Badge>}
              </div>
              {deal.expires_at && <DealCountdown expiresAt={deal.expires_at} compact />}
              <DealBuyLink
                expiresAt={deal.expires_at}
                href={`/go/${deal.id}`}
                linkId={deal.id}
                storeName={deal.store_name}
                productName={deal.product.name}
                priceInr={deal.deal_price_inr}
                className={buttonVariants({ variant: 'deal', size: 'sm', className: 'mt-auto' })}
              >
                Buy at {deal.store_name}
              </DealBuyLink>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
