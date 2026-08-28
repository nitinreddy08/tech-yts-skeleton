import Link from 'next/link'
import Image from 'next/image'
import { formatIndianPrice } from '@/lib/utils/format'
import { AffiliateOutboundLink } from '@/components/ui/AffiliateOutboundLink'
import type { Deal } from '@/types'

function discountPercent(original: number, deal: number): number {
  return Math.round(((original - deal) / original) * 100)
}

interface HomeDealCardProps {
  deal: Deal
}

export function HomeDealCard({ deal }: HomeDealCardProps) {
  if (!deal.product) return null

  const savings =
    deal.original_price_inr != null && deal.deal_price_inr != null
      ? deal.original_price_inr - deal.deal_price_inr
      : null

  const pct =
    deal.original_price_inr != null && deal.deal_price_inr != null
      ? discountPercent(deal.original_price_inr, deal.deal_price_inr)
      : null

  return (
    <div className="rounded-xl border border-border bg-surface-alt p-3 hover:shadow-md transition-shadow flex flex-col gap-2 h-full">
      <Link
        href={`/${deal.product.category_slug}/${deal.product.slug}`}
        className="relative block h-24 w-full rounded-lg bg-surface overflow-hidden"
      >
        {deal.product.thumbnail_url && (
          <Image
            src={deal.product.thumbnail_url}
            alt={deal.product.name}
            fill
            sizes="200px"
            className="object-contain p-2"
          />
        )}
        {pct != null && (
          <span className="absolute top-1.5 left-1.5 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
            {pct}% OFF
          </span>
        )}
      </Link>
      <Link
        href={`/${deal.product.category_slug}/${deal.product.slug}`}
        className="text-xs font-medium text-primary line-clamp-2 leading-snug hover:text-accent"
      >
        {deal.product.name}
      </Link>
      <div className="flex items-baseline gap-1.5 mt-auto">
        {deal.deal_price_inr != null && (
          <span className="text-sm font-bold text-accent">{formatIndianPrice(deal.deal_price_inr)}</span>
        )}
        {deal.original_price_inr != null && (
          <span className="text-[11px] text-muted line-through">
            {formatIndianPrice(deal.original_price_inr)}
          </span>
        )}
      </div>
      {savings != null && savings > 0 && (
        <p className="text-[10px] font-medium text-green-700">Save {formatIndianPrice(savings)}</p>
      )}
      <AffiliateOutboundLink
        href={`/go/${deal.id}`}
        linkId={deal.id}
        storeName={deal.store_name}
        productName={deal.product.name}
        priceInr={deal.deal_price_inr}
        className="w-full rounded-lg bg-accent py-1.5 text-center text-xs font-semibold text-white hover:bg-accent/90 transition-colors"
      >
        Buy on {deal.store_name}
      </AffiliateOutboundLink>
    </div>
  )
}
