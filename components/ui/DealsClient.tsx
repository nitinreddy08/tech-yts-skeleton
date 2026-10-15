'use client'

import { useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Zap, Tag, ShoppingCart } from 'lucide-react'
import { DealCountdown } from '@/components/ui/DealCountdown'
import { EmptyState } from '@/components/ui/EmptyState'
import { DealBuyLink } from '@/components/ui/DealBuyLink'
import { Badge } from '@/components/ui/Badge'
import { Chip } from '@/components/ui/Chip'
import { buttonVariants } from '@/components/ui/Button'
import { Price } from '@/components/ui/Price'
import { formatIndianPrice } from '@/lib/utils/format'
import type { Deal } from '@/types'

type DealFilter = 'all' | Deal['deal_type']
type DealSort = 'discount' | 'price_asc' | 'price_desc' | 'expiring'
type CategoryFilter = 'all' | string
type StoreFilter = 'all' | string

const DEAL_TYPE_LABELS: Record<Deal['deal_type'], string> = {
  deal_of_day: 'Deal of the Day',
  price_drop: 'Price Drops',
  bank_offer: 'Bank Offers',
  upcoming_sale: 'Upcoming',
  sale_event: 'Sale Events',
  coupon: 'Coupons',
}

function discountPercent(original: number, deal: number): number {
  return Math.round(((original - deal) / original) * 100)
}

function savingsAmount(original: number, deal: number): number {
  return original - deal
}

function categoryLabel(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1)
}

interface DealsClientProps {
  deals: Deal[]
  dealOfDay: Deal | null
}

const CTA_LABEL: Record<Deal['deal_type'], (store: string) => string> = {
  deal_of_day: (store) => `Buy at ${store}`,
  price_drop: (store) => `Buy at ${store}`,
  bank_offer: () => 'Get offer',
  coupon: () => 'Get coupon',
  upcoming_sale: () => 'View sale',
  sale_event: () => 'View sale',
}

const FILTER_THRESHOLD = 6

const SORTS: DealSort[] = ['discount', 'price_asc', 'price_desc', 'expiring']

export function DealsClient({ deals, dealOfDay }: DealsClientProps) {
  // Filter + sort state lives in the URL so a filtered view can be shared,
  // survives a reload, and works with the back button.
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const dealTypes = useMemo(() => {
    const types = new Set(deals.map((d) => d.deal_type))
    return ['all', ...Array.from(types)] as DealFilter[]
  }, [deals])

  const categories = useMemo(() => {
    const slugs = new Set(
      deals.map((d) => d.product?.category_slug).filter(Boolean) as string[]
    )
    return ['all', ...Array.from(slugs).sort()] as CategoryFilter[]
  }, [deals])

  const stores = useMemo(() => {
    const names = new Set(deals.map((d) => d.store_name))
    return ['all', ...Array.from(names).sort()] as StoreFilter[]
  }, [deals])

  const rawType = sp.get('type') ?? 'all'
  const rawCat = sp.get('category') ?? 'all'
  const rawStore = sp.get('store') ?? 'all'
  const rawSort = sp.get('sort') ?? 'discount'
  // Ignore stale/garbage params: only accept values that exist in the data.
  const filter = (dealTypes.includes(rawType as DealFilter) ? rawType : 'all') as DealFilter
  const categoryFilter = (categories.includes(rawCat) ? rawCat : 'all') as CategoryFilter
  const storeFilter = (stores.includes(rawStore) ? rawStore : 'all') as StoreFilter
  const sort = (SORTS.includes(rawSort as DealSort) ? rawSort : 'discount') as DealSort

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(sp.toString())
    if (!value || value === 'all' || (key === 'sort' && value === 'discount')) params.delete(key)
    else params.set(key, value)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  function clearFilters() {
    router.replace(pathname, { scroll: false })
  }

  const filtersActive = filter !== 'all' || categoryFilter !== 'all' || storeFilter !== 'all'

  const filtered = useMemo(() => {
    let list = filter === 'all' ? [...deals] : deals.filter((d) => d.deal_type === filter)
    if (categoryFilter !== 'all') {
      list = list.filter((d) => d.product?.category_slug === categoryFilter)
    }
    if (storeFilter !== 'all') {
      list = list.filter((d) => d.store_name === storeFilter)
    }

    list.sort((a, b) => {
      switch (sort) {
        case 'price_asc':
          return (a.deal_price_inr ?? Infinity) - (b.deal_price_inr ?? Infinity)
        case 'price_desc':
          return (b.deal_price_inr ?? -Infinity) - (a.deal_price_inr ?? -Infinity)
        case 'expiring': {
          const aExp = a.expires_at ? new Date(a.expires_at).getTime() : Infinity
          const bExp = b.expires_at ? new Date(b.expires_at).getTime() : Infinity
          return aExp - bExp
        }
        case 'discount':
        default: {
          const aPct =
            a.original_price_inr && a.deal_price_inr
              ? discountPercent(a.original_price_inr, a.deal_price_inr)
              : 0
          const bPct =
            b.original_price_inr && b.deal_price_inr
              ? discountPercent(b.original_price_inr, b.deal_price_inr)
              : 0
          return bPct - aPct
        }
      }
    })

    return list
  }, [deals, filter, categoryFilter, storeFilter, sort])

  const showDealOfDay =
    dealOfDay &&
    dealOfDay.product &&
    (filter === 'all' || dealOfDay.deal_type === filter) &&
    (categoryFilter === 'all' || dealOfDay.product.category_slug === categoryFilter) &&
    (storeFilter === 'all' || dealOfDay.store_name === storeFilter)

  // Only the featured deal is lifted into the hero; any other deal_of_day deal stays in the grid.
  const priceDrops = filtered.filter((d) => !(showDealOfDay && d.id === dealOfDay?.id))
  const hasContent = !!(showDealOfDay && dealOfDay?.product) || priceDrops.length > 0

  // Filtering is only worth a row of controls once there is something to filter.
  const showControls = deals.length >= FILTER_THRESHOLD

  const selectClass = 'h-11 min-w-0 rounded-md border border-neutral-500 bg-surface px-3 text-sm text-primary'

  return (
    <>
      {/* Deal of the Day: one slim banner, not a hero. */}
      {showDealOfDay && dealOfDay && dealOfDay.product && (
        <section
          aria-label="Deal of the Day"
          className="mb-5 flex flex-col gap-3 rounded-xl border border-secondary-200 bg-secondary-50 p-3 sm:flex-row sm:items-center sm:gap-5 sm:p-4"
        >
          <div className="flex min-w-0 items-center gap-3 sm:flex-1">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
              {dealOfDay.product.thumbnail_url && (
                <Image src={dealOfDay.product.thumbnail_url} alt="" fill sizes="80px" className="object-contain p-1.5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Badge variant="deal" size="sm">
                  <Zap size={10} aria-hidden /> Deal of the Day
                </Badge>
                {dealOfDay.expires_at && <DealCountdown expiresAt={dealOfDay.expires_at} compact />}
              </div>
              <h2 className="mt-1 truncate text-h3 text-primary">{dealOfDay.product.name}</h2>
              <Price value={dealOfDay.deal_price_inr} original={dealOfDay.original_price_inr} showDiscount size="md" />
            </div>
          </div>
          <div className="flex gap-2 sm:shrink-0">
            <DealBuyLink
              expiresAt={dealOfDay.expires_at}
              href={`/go/${dealOfDay.id}`}
              linkId={dealOfDay.id}
              storeName={dealOfDay.store_name}
              productName={dealOfDay.product.name}
              priceInr={dealOfDay.deal_price_inr}
              className={buttonVariants({ variant: 'deal', size: 'md', className: 'flex-1 whitespace-nowrap sm:flex-none' })}
            >
              <ShoppingCart size={16} className="hidden sm:block" aria-hidden />
              Buy at {dealOfDay.store_name}
            </DealBuyLink>
            <Link
              href={`/${dealOfDay.product.category_slug}/${dealOfDay.product.slug}`}
              className={buttonVariants({ variant: 'secondary', size: 'md', className: 'flex-1 sm:flex-none' })}
            >
              Review
            </Link>
          </div>
        </section>
      )}

      {/* One compact controls row: deal type chips, then the sort (and category / store when they matter). */}
      {showControls && (
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
          <div role="group" aria-label="Deal type" className="flex min-w-0 items-center gap-2 overflow-x-auto py-1 no-scrollbar">
            {dealTypes.map((t) => (
              <Chip
                key={t}
                active={filter === t}
                aria-pressed={filter === t}
                onClick={() => setParam('type', t)}
                className="shrink-0"
              >
                {t === 'all' ? 'All deals' : DEAL_TYPE_LABELS[t as Deal['deal_type']]}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.length > 2 && (
              <select aria-label="Category" value={categoryFilter} onChange={(e) => setParam('category', e.target.value)} className={`${selectClass} capitalize`}>
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'all' ? 'All categories' : categoryLabel(c)}</option>
                ))}
              </select>
            )}
            {stores.length > 2 && (
              <select aria-label="Store" value={storeFilter} onChange={(e) => setParam('store', e.target.value)} className={selectClass}>
                {stores.map((st) => (
                  <option key={st} value={st}>{st === 'all' ? 'All stores' : st}</option>
                ))}
              </select>
            )}
            <select aria-label="Sort deals" value={sort} onChange={(e) => setParam('sort', e.target.value)} className={selectClass}>
              <option value="discount">Biggest discount</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="expiring">Expiring soon</option>
            </select>
            {filtersActive && (
              <button type="button" onClick={clearFilters} className="inline-flex min-h-11 items-center px-2 text-sm text-accent underline">
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Deal grid */}
      {priceDrops.length > 0 && (
        <section aria-label="Deals" className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {priceDrops.map((deal) => {
            if (!deal.product) return null
            const pct =
              deal.original_price_inr && deal.deal_price_inr
                ? discountPercent(deal.original_price_inr, deal.deal_price_inr)
                : null
            const savings =
              deal.original_price_inr && deal.deal_price_inr
                ? savingsAmount(deal.original_price_inr, deal.deal_price_inr)
                : null

            return (
              <article
                key={deal.id}
                className="flex flex-col rounded-xl border border-border bg-surface transition-shadow hover:shadow-md"
              >
                <Link href={`/${deal.product.category_slug}/${deal.product.slug}`} className="flex gap-3 p-3 sm:p-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-alt sm:h-20 sm:w-20">
                    {deal.product.thumbnail_url && (
                      <Image src={deal.product.thumbnail_url} alt="" fill sizes="80px" className="object-contain p-1" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted">
                      {DEAL_TYPE_LABELS[deal.deal_type]} · {deal.store_name}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-primary">{deal.product.name}</p>
                    {deal.headline && <p className="mt-0.5 line-clamp-1 text-xs text-muted">{deal.headline}</p>}
                  </div>
                </Link>
                <div className="mt-auto flex flex-col gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Price value={deal.deal_price_inr} original={deal.original_price_inr} size="md" />
                    {savings != null && savings > 0 && pct != null && (
                      <Badge variant="success" size="sm" className="ml-auto">
                        Save {formatIndianPrice(savings)} · {pct}%
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    {deal.expires_at ? (
                      <DealCountdown expiresAt={deal.expires_at} compact />
                    ) : (
                      <span className="text-xs text-muted">No expiry listed</span>
                    )}
                    <DealBuyLink
                      expiresAt={deal.expires_at}
                      href={`/go/${deal.id}`}
                      linkId={deal.id}
                      storeName={deal.store_name}
                      productName={deal.product.name}
                      priceInr={deal.deal_price_inr}
                      className={buttonVariants({ variant: 'deal', size: 'sm' })}
                    >
                      {CTA_LABEL[deal.deal_type](deal.store_name)}
                    </DealBuyLink>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      )}

      {/* Exactly one empty state: nothing exists at all, or filters hide everything. */}
      {deals.length === 0 && (
        <EmptyState
          icon={Tag}
          heading="No active deals"
          description="Check back soon — we compare prices across Amazon, Flipkart & more."
          action={{ label: 'Browse products', href: '/search' }}
        />
      )}
      {deals.length > 0 && !hasContent && (
        <EmptyState
          icon={Tag}
          heading="No deals match your filters"
          description="Try a different type, category or store."
          action={{ label: 'Clear filters', onClick: clearFilters }}
        />
      )}
    </>
  )
}
