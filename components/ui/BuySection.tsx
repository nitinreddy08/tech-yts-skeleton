import { ShoppingCart, Clock, TrendingDown, ExternalLink, AlertTriangle, PackageCheck, PackageX } from 'lucide-react'
import { formatIndianPrice } from '@/lib/utils/format'
import { relativePriceTime, hasStalePrices, getNewestPriceUpdate } from '@/lib/utils/price-trust'
import { getBestOffer, isPurchasable } from '@/lib/utils/best-offer'
import { AffiliateOutboundLink } from '@/components/ui/AffiliateOutboundLink'
import { EmiHint } from '@/components/ui/EmiHint'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
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
      <Icon size={10} aria-hidden />
      {label}
    </Badge>
  )
}

/**
 * The single buy module on the product page: the best in-stock price, one
 * primary "Buy at {store}" action, and the other stores underneath. The price
 * used to be repeated in a separate card above this; it now lives only here.
 * `id="buy-box"` is the anchor the sticky buy bar and "See best prices" use.
 */
export function BuySection({ links, productName, launchPrice }: BuySectionProps) {
  if (links.length === 0) return null

  const best = getBestOffer(links)
  const bestLink = best.link
  const bestPrice = best.price
  const others = [...links]
    .filter((l) => l.id !== bestLink?.id)
    .sort((a, b) => {
      // Purchasable stores first, then by price.
      const stock = Number(isPurchasable(b)) - Number(isPurchasable(a))
      return stock || (a.price_inr ?? Infinity) - (b.price_inr ?? Infinity)
    })

  const availablePrices = best.available.map((l) => l.price_inr).filter((p): p is number => p != null)
  const highestPrice = availablePrices.length ? Math.max(...availablePrices) : null
  const maxSavings =
    highestPrice != null && bestPrice != null && highestPrice > bestPrice ? highestPrice - bestPrice : null
  const belowLaunchPct =
    launchPrice != null && bestPrice != null && launchPrice > bestPrice
      ? Math.round(((launchPrice - bestPrice) / launchPrice) * 100)
      : null
  const stale = hasStalePrices(links)
  const newestUpdate = getNewestPriceUpdate(links)
  const lastSeenPrice = bestPrice ?? (links.map((l) => l.price_inr).filter((p): p is number => p != null).sort((a, b) => a - b)[0] ?? null)

  return (
    <section id="buy-box" aria-labelledby="buy-box-title" className="scroll-mt-28 rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
      <div className="p-5 bg-surface-alt/50">
        <h2 id="buy-box-title" className="sr-only">Price and where to buy {productName}</h2>

        {bestLink && bestPrice != null ? (
          <>
            <Eyebrow>Best price · {bestLink.store_name}</Eyebrow>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-3xl font-extrabold leading-none text-accent">{formatIndianPrice(bestPrice)}</p>
              {belowLaunchPct != null && launchPrice != null && (
                <>
                  <p className="text-sm text-muted line-through">{formatIndianPrice(launchPrice)}</p>
                  <Badge variant="success" size="sm">
                    <TrendingDown size={10} aria-hidden />
                    {belowLaunchPct}% below launch
                  </Badge>
                </>
              )}
            </div>
            <EmiHint priceInr={bestPrice} className="mt-1" />

            <AffiliateOutboundLink
              href={`/go/${bestLink.id}`}
              linkId={bestLink.id}
              storeName={bestLink.store_name}
              productName={productName}
              priceInr={bestLink.price_inr}
              className={buttonVariants({ variant: 'primary', size: 'md', className: 'mt-4 w-full' })}
            >
              <ShoppingCart size={16} aria-hidden />
              Buy at {bestLink.store_name}
              <ExternalLink size={13} className="opacity-70" aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </AffiliateOutboundLink>
            <p className="mt-2 text-center text-xs text-muted">
              Affiliate link — we may earn a commission at no extra cost to you.
            </p>
          </>
        ) : (
          <div role="status">
            <Badge variant="neutral" size="sm">
              <PackageX size={10} aria-hidden />
              Out of stock everywhere
            </Badge>
            <p className="mt-3 text-sm text-muted">
              {lastSeenPrice != null ? (
                <>
                  Last seen at <span className="font-semibold text-primary">{formatIndianPrice(lastSeenPrice)}</span>.{' '}
                </>
              ) : null}
              None of the stores we track have it right now — set a price alert below and check back soon.
            </p>
          </div>
        )}

        {maxSavings != null && maxSavings > 0 && bestLink && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-success-700">
            <TrendingDown size={14} aria-hidden />
            Save up to {formatIndianPrice(maxSavings)} by choosing {bestLink.store_name}
          </p>
        )}

        <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted">
          {links.length} store{links.length !== 1 ? 's' : ''} compared
          {newestUpdate && (
            <>
              <span aria-hidden>·</span>
              <Clock size={11} aria-hidden />
              {relativePriceTime(newestUpdate)}
            </>
          )}
        </p>

        {stale && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-warning-50 px-3 py-2 text-xs text-warning-700">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden />
            Some prices may be outdated — open the store to confirm before you buy.
          </div>
        )}
      </div>

      {others.length > 0 && (
        <div className="border-t border-border">
          <h3 className="px-5 pt-4 text-xs font-semibold uppercase tracking-wider text-muted">
            {bestLink ? 'Also available at' : 'Stores'}
          </h3>
          <ul className="divide-y divide-border">
            {others.map((link) => {
              const stockStatus: StockStatus = link.stock_status ?? 'in_stock'
              const unavailable = !isPurchasable(link)
              const premium =
                link.price_inr != null && bestPrice != null && link.price_inr > bestPrice
                  ? link.price_inr - bestPrice
                  : null

              return (
                <li key={link.id} className="flex flex-col gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-primary">{link.store_name}</span>
                      <StockBadge status={stockStatus} />
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                      <Clock size={11} aria-hidden />
                      {relativePriceTime(link.last_updated)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="text-left">
                      {link.price_inr != null ? (
                        <p className="text-lg font-bold text-primary">{formatIndianPrice(link.price_inr)}</p>
                      ) : (
                        <p className="text-sm text-muted">Price varies</p>
                      )}
                      {premium != null && <p className="text-xs text-muted">+{formatIndianPrice(premium)} vs best</p>}
                    </div>

                    {unavailable ? (
                      <span
                        className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'pointer-events-none opacity-60' })}
                        aria-disabled="true"
                      >
                        Unavailable
                      </span>
                    ) : (
                      <AffiliateOutboundLink
                        href={`/go/${link.id}`}
                        linkId={link.id}
                        storeName={link.store_name}
                        productName={productName}
                        priceInr={link.price_inr}
                        className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                      >
                        View at {link.store_name}
                        <ExternalLink size={12} className="opacity-60" aria-hidden />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </AffiliateOutboundLink>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
