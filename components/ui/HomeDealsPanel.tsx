import Link from 'next/link'
import Image from 'next/image'
import { Zap, ArrowRight, Package } from 'lucide-react'
import { DealCountdown } from '@/components/ui/DealCountdown'
import { DealBuyLink } from '@/components/ui/DealBuyLink'
import { Price } from '@/components/ui/Price'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import type { Deal } from '@/types'

function pctOff(deal: Deal): number | null {
  return deal.original_price_inr != null && deal.deal_price_inr != null && deal.original_price_inr > deal.deal_price_inr
    ? Math.round(((deal.original_price_inr - deal.deal_price_inr) / deal.original_price_inr) * 100)
    : null
}

function Thumb({ deal, size }: { deal: Deal; size: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-lg border border-border bg-surface"
      style={{ width: size, height: size }}
    >
      {deal.product?.thumbnail_url ? (
        <Image src={deal.product.thumbnail_url} alt="" fill sizes={`${size}px`} className="object-contain p-1.5" />
      ) : (
        <div className="flex h-full items-center justify-center">
          <Package size={20} className="text-muted/40" />
        </div>
      )}
    </div>
  )
}

/**
 * Today's deals as one compact list. The Deal of the Day is simply the first,
 * highlighted row (with its countdown) — it no longer has its own page section.
 * Ordinary rows are a single link into the product, no per-row button.
 */
export function HomeDealsPanel({ dealOfDay, deals }: { dealOfDay: Deal | null; deals: Deal[] }) {
  const featured = dealOfDay?.product ? dealOfDay : null
  const rows = deals.filter((d) => d.product && d.id !== featured?.id).slice(0, featured ? 3 : 4)
  const empty = !featured && rows.length === 0

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-4 shadow-sm md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-h3 flex items-center gap-2 font-heading text-primary">
          <Zap size={18} className="text-secondary-600" aria-hidden /> Today&apos;s deals
        </h2>
        <Link href="/deals" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-accent hover:underline">
          View all <ArrowRight size={14} aria-hidden />
        </Link>
      </div>

      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface-alt px-4 py-8 text-center">
          <p className="text-sm font-medium text-primary">No hot deals right now</p>
          <p className="text-sm text-muted">New price drops and bank offers land here as they go live.</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2">
          {featured && featured.product && (
            <div className="rounded-lg border border-secondary-200 bg-secondary-50 p-3">
              <div className="flex items-center gap-3">
                <Thumb deal={featured} size={72} />
                <div className="min-w-0 flex-1">
                  <Badge variant="deal" size="sm">
                    <Zap size={10} aria-hidden /> Deal of the Day
                  </Badge>
                  <Link
                    href={`/${featured.product.category_slug}/${featured.product.slug}`}
                    className="mt-1 block truncate text-sm font-semibold text-primary hover:text-accent"
                  >
                    {featured.product.name}
                  </Link>
                  <Price value={featured.deal_price_inr} original={featured.original_price_inr} showDiscount size="md" />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                {featured.expires_at ? <DealCountdown expiresAt={featured.expires_at} compact /> : <span />}
                <DealBuyLink
                  expiresAt={featured.expires_at}
                  href={`/go/${featured.id}`}
                  linkId={featured.id}
                  storeName={featured.store_name}
                  productName={featured.product.name}
                  priceInr={featured.deal_price_inr}
                  className={buttonVariants({ variant: 'deal', size: 'auto', className: 'h-11 px-4 text-sm' })}
                >
                  Buy on {featured.store_name}
                </DealBuyLink>
              </div>
            </div>
          )}

          <ul className="flex flex-1 flex-col divide-y divide-border">
            {rows.map((deal) => {
              const pct = pctOff(deal)
              const product = deal.product!
              return (
                <li key={deal.id} className="flex-1">
                  <Link
                    href={`/${product.category_slug}/${product.slug}`}
                    className="group flex h-full min-h-[64px] items-center gap-3 py-2"
                  >
                    <Thumb deal={deal} size={52} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-primary group-hover:text-accent">{product.name}</p>
                      <p className="text-xs text-muted">at {deal.store_name}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold tabular-nums text-primary">
                        {deal.deal_price_inr != null ? <Price value={deal.deal_price_inr} size="sm" /> : null}
                      </p>
                      {pct != null && <p className="text-xs font-semibold text-success-700">{pct}% off</p>}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
