import Link from 'next/link'
import { Tag, Percent, CreditCard, Ticket } from 'lucide-react'
import { AffiliateOutboundLink } from '@/components/ui/AffiliateOutboundLink'
import { formatIndianPrice } from '@/lib/utils/format'
import { dealTypeLabel } from '@/lib/data/product-deals'
import { Eyebrow } from '@/components/ui/Eyebrow'
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
    <section className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-surface-alt/50">
        <h2 className="text-sm font-semibold text-primary">
          Offers & bank deals ({deals.length})
        </h2>
      </div>
      <ul className="divide-y divide-border">
        {deals.map((deal) => {
          const Icon = TYPE_ICONS[deal.deal_type] ?? Tag
          return (
            <li key={deal.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <Eyebrow>
                    {dealTypeLabel(deal.deal_type)} · {deal.store_name}
                  </Eyebrow>
                  <p className="text-sm font-medium text-primary">{deal.headline}</p>
                  {deal.deal_price_inr != null && (
                    <p className="text-xs text-accent font-semibold mt-0.5">
                      {formatIndianPrice(deal.deal_price_inr)}
                      {deal.original_price_inr != null && (
                        <span className="text-muted line-through ml-2 font-normal">
                          {formatIndianPrice(deal.original_price_inr)}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              <AffiliateOutboundLink
                href={`/go/${deal.id}`}
                linkId={deal.id}
                storeName={deal.store_name}
                productName={productName}
                priceInr={deal.deal_price_inr}
                className="shrink-0 inline-flex items-center rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent/90"
              >
                Get offer
              </AffiliateOutboundLink>
            </li>
          )
        })}
      </ul>
      <p className="px-5 py-2 text-[10px] text-muted border-t border-border">
        <Link href="/deals" className="text-accent hover:underline">Browse all deals →</Link>
      </p>
    </section>
  )
}
