import { Tag, Percent, CreditCard, Ticket } from 'lucide-react'
import { AffiliateOutboundLink } from '@/components/ui/AffiliateOutboundLink'
import { Price } from '@/components/ui/Price'
import { dealTypeLabel } from '@/lib/data/product-deals'
import { buttonVariants } from '@/components/ui/Button'
import type { Deal } from '@/types'

const TYPE_ICONS: Record<Deal['deal_type'], typeof Tag> = {
  deal_of_day: Tag,
  price_drop: Percent,
  bank_offer: CreditCard,
  upcoming_sale: Ticket,
  sale_event: Ticket,
  coupon: Ticket,
}

interface ProductOffersPanelProps {
  deals: Deal[]
  productName: string
}

export function ProductOffersPanel({ deals, productName }: ProductOffersPanelProps) {
  if (deals.length === 0) return null

  return (
    <section aria-labelledby="offers-title" className="rounded-xl border border-border bg-surface">
      <h2 id="offers-title" className="border-b border-border px-4 py-2.5 text-sm font-semibold text-primary">
        Offers &amp; bank deals ({deals.length})
      </h2>
      <ul className="divide-y divide-border">
        {deals.map((deal) => {
          const Icon = TYPE_ICONS[deal.deal_type] ?? Tag
          return (
            <li key={deal.id} className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary-50 text-secondary-700">
                <Icon size={16} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium text-primary">{deal.headline}</p>
                <p className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted">
                  {dealTypeLabel(deal.deal_type)} · {deal.store_name}
                  {deal.deal_price_inr != null && (
                    <Price value={deal.deal_price_inr} original={deal.original_price_inr} size="sm" className="!text-sm" />
                  )}
                </p>
              </div>
              <AffiliateOutboundLink
                href={`/go/${deal.id}`}
                linkId={deal.id}
                storeName={deal.store_name}
                productName={productName}
                priceInr={deal.deal_price_inr}
                className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'shrink-0' })}
              >
                Get offer<span className="sr-only"> at {deal.store_name}</span>
              </AffiliateOutboundLink>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
