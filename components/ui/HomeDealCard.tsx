import Link from 'next/link'
import Image from 'next/image'
import { formatIndianPrice } from '@/lib/utils/format'
import { DealBuyLink } from '@/components/ui/DealBuyLink'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
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
        tabIndex={-1}
        aria-hidden
      >
        {deal.product.thumbnail_url && (
          <Image
            src={deal.product.thumbnail_url}
            alt=""
            fill
            sizes="200px"
            className="object-contain p-2"
          />
        )}
        {pct != null && (
          <Badge variant="deal" size="sm" className="absolute top-1.5 left-1.5">
            {pct}% OFF
          </Badge>
        )}
      </Link>
      <Link
        href={`/${deal.product.category_slug}/${deal.product.slug}`}
        className="text-sm font-medium text-primary line-clamp-2 leading-snug hover:text-accent"
      >
        {deal.product.name}
      </Link>
      <div className="flex items-baseline gap-1.5 mt-auto">
        {deal.deal_price_inr != null && (
          <span className="text-sm font-bold text-accent">{formatIndianPrice(deal.deal_price_inr)}</span>
        )}
        {deal.original_price_inr != null && (
          <span className="text-xs text-muted line-through">
            {formatIndianPrice(deal.original_price_inr)}
          </span>
        )}
      </div>
      {savings != null && savings > 0 && (
        <p className="text-xs font-medium text-success-700">Save {formatIndianPrice(savings)}</p>
      )}
      {/* Secondary on purpose: the hero's one primary action is "Show phones". */}
      <DealBuyLink
        expiresAt={deal.expires_at}
        href={`/go/${deal.id}`}
        linkId={deal.id}
        storeName={deal.store_name}
        productName={deal.product.name}
        priceInr={deal.deal_price_inr}
        className={buttonVariants({ variant: 'secondary', size: 'auto', className: 'h-11 w-full px-2 text-sm' })}
      >
        Buy on {deal.store_name}
      </DealBuyLink>
    </div>
  )
}
