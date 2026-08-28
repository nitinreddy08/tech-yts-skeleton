import { ShoppingCart, Trophy, Clock, TrendingDown, ExternalLink, AlertTriangle, PackageCheck, PackageX } from 'lucide-react'
import { formatIndianPrice } from '@/lib/utils/format'
import { relativePriceTime, hasStalePrices, getNewestPriceUpdate } from '@/lib/utils/price-trust'
import { AffiliateOutboundLink } from '@/components/ui/AffiliateOutboundLink'
import { EmiHint } from '@/components/ui/EmiHint'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import type { AffiliateLink, StockStatus } from '@/types'

interface BuySectionProps {
  links: AffiliateLink[]
  productName: string
  launchPrice?: number | null
}

const STOCK_BADGE: Record<StockStatus, { label: string; variant: 'success' | 'warning' | 'neutral'; icon: typeof PackageCheck }> = {
  in_stock: { label: 'In stock', variant: 'success', icon: PackageCheck },
  low_stock: { label: 'Low stock', variant: 'warning', icon: PackageCheck },
  out_of_stock: { label: 'Out of stock', variant: 'neutral', icon: PackageX },
}

function StockBadge({ status }: { status: StockStatus }) {
  const { label, variant, icon: Icon } = STOCK_BADGE[status]
  return (
    <Badge variant={variant} size="sm">
      <Icon size={10} />
      {label}
    </Badge>
  )
}

export function BuySection({ links, productName, launchPrice }: BuySectionProps) {
  const sorted = [...links].sort(
    (a, b) => (a.price_inr ?? Infinity) - (b.price_inr ?? Infinity)
  )

  if (sorted.length === 0) return null

  const prices = sorted.map((l) => l.price_inr).filter((p): p is number => p != null)
  const bestPrice = prices.length ? Math.min(...prices) : null
  const highestPrice = prices.length ? Math.max(...prices) : null
  const bestLink = sorted.find((l) => l.price_inr === bestPrice)
  const maxSavings =
    highestPrice != null && bestPrice != null && highestPrice > bestPrice
      ? highestPrice - bestPrice
      : null
  const stale = hasStalePrices(sorted)
  const newestUpdate = getNewestPriceUpdate(sorted)

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
      <div className="px-5 pt-5 pb-3 border-b border-border bg-surface-alt/50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-primary">Where to Buy</h2>
            <p className="text-xs text-muted mt-0.5 flex items-center gap-1 flex-wrap">
              {sorted.length} store{sorted.length !== 1 ? 's' : ''} compared
              {newestUpdate && (
                <>
                  <span aria-hidden>·</span>
                  <Clock size={10} className="inline" />
                  {relativePriceTime(newestUpdate)}
                </>
              )}
            </p>
          </div>
          {bestPrice != null && (
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-muted">Best price</p>
              <p className="text-xl font-bold text-accent">{formatIndianPrice(bestPrice)}</p>
              <EmiHint priceInr={bestPrice} className="mt-0.5 text-right" />
            </div>
          )}
        </div>

        {stale && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-warning-50 px-3 py-2 text-xs text-warning-700">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            Some prices may be outdated — tap &quot;Check price&quot; to confirm on the store.
          </div>
        )}

        {maxSavings != null && maxSavings > 0 && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-success-50 px-3 py-2 text-xs font-semibold text-success-700">
            <TrendingDown size={14} />
            Save up to {formatIndianPrice(maxSavings)} by choosing {bestLink?.store_name}
          </div>
        )}

        {launchPrice != null && bestPrice != null && launchPrice > bestPrice && (
          <p className="text-xs text-muted mt-2">
            {Math.round(((launchPrice - bestPrice) / launchPrice) * 100)}% below launch price (
            {formatIndianPrice(launchPrice)})
          </p>
        )}
      </div>

      <div className="divide-y divide-border">
        {sorted.map((link) => {
          const isBest = link.id === bestLink?.id
          const savingsVsHighest =
            link.price_inr != null && highestPrice != null && highestPrice > link.price_inr
              ? highestPrice - link.price_inr
              : null
          const stockStatus: StockStatus = link.stock_status ?? 'in_stock'
          const isOutOfStock = stockStatus === 'out_of_stock'

          return (
            <div
              key={link.id}
              className={cn(
                'px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors',
                isBest ? 'bg-accent/5' : 'hover:bg-surface-alt/50'
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-primary">{link.store_name}</span>
                  {isBest && (
                    <Badge variant="success" size="sm">
                      <Trophy size={10} /> Best Price
                    </Badge>
                  )}
                  <StockBadge status={stockStatus} />
                </div>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                  <Clock size={10} />
                  Updated {relativePriceTime(link.last_updated)}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="text-left sm:text-right">
                  {link.price_inr != null ? (
                    <p className={cn('text-lg font-bold', isBest ? 'text-accent' : 'text-primary')}>
                      {formatIndianPrice(link.price_inr)}
                    </p>
                  ) : (
                    <p className="text-sm text-muted">Price varies</p>
                  )}
                  {savingsVsHighest != null && savingsVsHighest > 0 && !isBest && (
                    <p className="text-[10px] text-muted">
                      +{formatIndianPrice(savingsVsHighest)} vs best
                    </p>
                  )}
                </div>

                {isOutOfStock ? (
                  <span
                    className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'opacity-60 pointer-events-none' })}
                    aria-disabled="true"
                  >
                    <ShoppingCart size={14} />
                    Unavailable
                  </span>
                ) : (
                  <AffiliateOutboundLink
                    href={`/go/${link.id}`}
                    linkId={link.id}
                    storeName={link.store_name}
                    productName={productName}
                    priceInr={link.price_inr}
                    className={buttonVariants({ variant: isBest ? 'primary' : 'secondary', size: 'sm' })}
                  >
                    <ShoppingCart size={14} />
                    Check price
                    <ExternalLink size={12} className="opacity-60" />
                  </AffiliateOutboundLink>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="px-5 py-3 text-[10px] text-muted border-t border-border bg-surface-alt/30">
        Affiliate links for {productName}. We may earn a commission at no extra cost to you.
      </p>
    </div>
  )
}
