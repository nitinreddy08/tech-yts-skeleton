'use client'

import { useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Zap, TrendingDown, Tag, Percent, ShoppingCart } from 'lucide-react'
import { DealCountdown } from '@/components/ui/DealCountdown'
import { EmptyState } from '@/components/ui/EmptyState'
import { DealBuyLink } from '@/components/ui/DealBuyLink'
import { Badge } from '@/components/ui/Badge'
import { Chip } from '@/components/ui/Chip'
import { buttonVariants } from '@/components/ui/Button'
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

  const filterGroup = (
    label: string,
    options: { value: string; label: string }[],
    current: string,
    param: string,
    capitalize = false
  ) => (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="w-full text-xs font-semibold uppercase tracking-wider text-muted sm:w-16">{label}</span>
      {options.map((o) => (
        <Chip
          key={o.value}
          active={current === o.value}
          aria-pressed={current === o.value}
          onClick={() => setParam(param, o.value)}
          className={capitalize ? 'capitalize' : undefined}
        >
          {o.label}
        </Chip>
      ))}
    </div>
  )

  return (
    <>
      {/* Deal of the Day hero */}
      {showDealOfDay && dealOfDay && dealOfDay.product && (
        <div className="relative overflow-hidden rounded-2xl border border-secondary-200 bg-secondary-50 p-6 md:p-10 mb-10">
          <div className="absolute top-4 right-4 hidden md:block">
            {dealOfDay.expires_at && <DealCountdown expiresAt={dealOfDay.expires_at} />}
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="relative h-48 w-48 shrink-0 rounded-2xl bg-surface border border-border overflow-hidden">
              {dealOfDay.product.thumbnail_url && (
                <Image
                  src={dealOfDay.product.thumbnail_url}
                  alt=""
                  fill
                  sizes="192px"
                  className="object-contain p-4"
                />
              )}
              <Badge variant="deal" className="absolute top-3 left-3">
                <Zap size={12} aria-hidden /> Deal of the Day
              </Badge>
            </div>
            <div className="flex-1 text-center md:text-left">
              {dealOfDay.headline && (
                <p className="text-sm text-muted mb-2">{dealOfDay.headline}</p>
              )}
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary mb-3">
                {dealOfDay.product.name}
              </h2>
              <div className="flex flex-wrap items-baseline justify-center md:justify-start gap-3 mb-2">
                {dealOfDay.deal_price_inr != null && (
                  <span className="text-4xl font-bold text-accent">
                    {formatIndianPrice(dealOfDay.deal_price_inr)}
                  </span>
                )}
                {dealOfDay.original_price_inr != null && (
                  <span className="text-lg text-muted line-through">
                    {formatIndianPrice(dealOfDay.original_price_inr)}
                  </span>
                )}
              </div>
              {dealOfDay.original_price_inr != null && dealOfDay.deal_price_inr != null && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  <Badge variant="success">
                    <Percent size={14} aria-hidden />
                    {discountPercent(dealOfDay.original_price_inr, dealOfDay.deal_price_inr)}% off
                  </Badge>
                  <span className="text-sm font-medium text-success-700">
                    You save {formatIndianPrice(savingsAmount(dealOfDay.original_price_inr, dealOfDay.deal_price_inr))}
                  </span>
                </div>
              )}
              {dealOfDay.expires_at && (
                <div className="md:hidden mb-4 flex justify-center">
                  <DealCountdown expiresAt={dealOfDay.expires_at} />
                </div>
              )}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <DealBuyLink
                  expiresAt={dealOfDay.expires_at}
                  href={`/go/${dealOfDay.id}`}
                  linkId={dealOfDay.id}
                  storeName={dealOfDay.store_name}
                  productName={dealOfDay.product.name}
                  priceInr={dealOfDay.deal_price_inr}
                  className={buttonVariants({ variant: 'deal', size: 'md' })}
                >
                  <ShoppingCart size={16} aria-hidden />
                  Buy on {dealOfDay.store_name}
                </DealBuyLink>
                <Link
                  href={`/${dealOfDay.product.category_slug}/${dealOfDay.product.slug}`}
                  className={buttonVariants({ variant: 'secondary', size: 'md' })}
                >
                  Read the review
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters + sort toolbar */}
      {deals.length > 0 && (
        <div className="flex flex-col gap-3 mb-8">
          {filterGroup(
            'Type',
            dealTypes.map((t) => ({ value: t, label: t === 'all' ? 'All deals' : DEAL_TYPE_LABELS[t as Deal['deal_type']] })),
            filter,
            'type'
          )}
          {categories.length > 2 &&
            filterGroup(
              'Category',
              categories.map((c) => ({ value: c, label: c === 'all' ? 'All categories' : categoryLabel(c) })),
              categoryFilter,
              'category',
              true
            )}
          {stores.length > 2 &&
            filterGroup(
              'Store',
              stores.map((st) => ({ value: st, label: st === 'all' ? 'All stores' : st })),
              storeFilter,
              'store'
            )}
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted" aria-live="polite">
              <span className="font-semibold text-primary">{filtered.length}</span> active deal
              {filtered.length !== 1 ? 's' : ''}
              {filtersActive && (
                <>
                  {' · '}
                  <button type="button" onClick={clearFilters} className="inline-flex min-h-11 items-center text-accent underline">
                    Clear filters
                  </button>
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="deals-sort" className="text-xs font-semibold uppercase tracking-wider text-muted">Sort</label>
              <select
                id="deals-sort"
                value={sort}
                onChange={(e) => setParam('sort', e.target.value)}
                className="h-11 rounded-md border border-neutral-500 bg-surface px-3 text-sm font-medium text-primary"
              >
                <option value="discount">Biggest discount</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="expiring">Expiring soon</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Deal grid */}
      {priceDrops.length > 0 && (
        <section>
          <h2 className="font-heading text-xl font-semibold text-primary mb-4 flex items-center gap-2">
            <TrendingDown size={20} className="text-accent" aria-hidden />
            {filter === 'all' ? 'All offers' : DEAL_TYPE_LABELS[filter as Deal['deal_type']]}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  className="flex flex-col rounded-xl border border-border bg-surface overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link
                    href={`/${deal.product.category_slug}/${deal.product.slug}`}
                    className="relative flex gap-4 p-4"
                  >
                    <div className="relative h-20 w-20 shrink-0 rounded-lg bg-surface-alt overflow-hidden">
                      {deal.product.thumbnail_url && (
                        <Image
                          src={deal.product.thumbnail_url}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-contain p-1"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
                        {DEAL_TYPE_LABELS[deal.deal_type]} · {deal.store_name}
                      </p>
                      <p className="text-sm font-semibold text-primary line-clamp-2">
                        {deal.product.name}
                      </p>
                      {deal.headline && (
                        <p className="text-xs text-muted line-clamp-1 mt-0.5">{deal.headline}</p>
                      )}
                    </div>
                  </Link>
                  <div className="px-4 pb-4 flex flex-col gap-2 mt-auto">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      {deal.deal_price_inr != null && (
                        <span className="text-lg font-bold text-accent">
                          {formatIndianPrice(deal.deal_price_inr)}
                        </span>
                      )}
                      {deal.original_price_inr != null && (
                        <span className="text-sm text-muted line-through">
                          {formatIndianPrice(deal.original_price_inr)}
                        </span>
                      )}
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
          </div>
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
