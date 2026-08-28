'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Zap,
  TrendingDown,
  Tag,
  Percent,
  ShoppingCart,
  SlidersHorizontal,
  ArrowUpDown,
  Store,
} from 'lucide-react'
import { DealCountdown } from '@/components/ui/DealCountdown'
import { EmptyState } from '@/components/ui/EmptyState'
import { AffiliateOutboundLink } from '@/components/ui/AffiliateOutboundLink'
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

export function DealsClient({ deals, dealOfDay }: DealsClientProps) {
  const [filter, setFilter] = useState<DealFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [storeFilter, setStoreFilter] = useState<StoreFilter>('all')
  const [sort, setSort] = useState<DealSort>('discount')

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

  const priceDrops = filtered.filter((d) => d.deal_type !== 'deal_of_day')
  const hasContent = (showDealOfDay && dealOfDay?.product) || priceDrops.length > 0

  return (
    <>
      {/* Deal of the Day hero */}
      {showDealOfDay && dealOfDay && dealOfDay.product && (
        <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/8 via-surface to-surface-alt p-6 md:p-10 mb-10">
          <div className="absolute top-4 right-4 hidden md:block">
            {dealOfDay.expires_at && <DealCountdown expiresAt={dealOfDay.expires_at} />}
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="relative h-48 w-48 shrink-0 rounded-2xl bg-surface border border-border overflow-hidden">
              {dealOfDay.product.thumbnail_url && (
                <Image
                  src={dealOfDay.product.thumbnail_url}
                  alt={dealOfDay.product.name}
                  fill
                  sizes="192px"
                  className="object-contain p-4"
                />
              )}
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
                <Zap size={12} /> Deal of the Day
              </span>
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
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 px-3 py-1 text-sm font-semibold">
                    <Percent size={14} />
                    {discountPercent(dealOfDay.original_price_inr, dealOfDay.deal_price_inr)}% off
                  </span>
                  <span className="text-sm font-medium text-green-700">
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
                <AffiliateOutboundLink
                  href={`/go/${dealOfDay.id}`}
                  linkId={dealOfDay.id}
                  storeName={dealOfDay.store_name}
                  productName={dealOfDay.product.name}
                  priceInr={dealOfDay.deal_price_inr}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
                >
                  <ShoppingCart size={16} />
                  Buy on {dealOfDay.store_name}
                </AffiliateOutboundLink>
                <Link
                  href={`/${dealOfDay.product.category_slug}/${dealOfDay.product.slug}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-primary hover:border-accent transition-colors"
                >
                  Read Review
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters + sort toolbar */}
      {deals.length > 0 && (
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal size={16} className="text-muted shrink-0" />
            {dealTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilter(type)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === type
                    ? 'bg-accent text-white'
                    : 'border border-border bg-surface text-primary hover:border-accent/50'
                }`}
              >
                {type === 'all' ? 'All Deals' : DEAL_TYPE_LABELS[type as Deal['deal_type']]}
              </button>
            ))}
          </div>
          {categories.length > 2 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag size={16} className="text-muted shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                    categoryFilter === cat
                      ? 'bg-primary text-white'
                      : 'border border-border bg-surface text-primary hover:border-accent/50'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : categoryLabel(cat)}
                </button>
              ))}
            </div>
          )}
          {stores.length > 2 && (
            <div className="flex flex-wrap items-center gap-2">
              <Store size={16} className="text-muted shrink-0" />
              {stores.map((store) => (
                <button
                  key={store}
                  type="button"
                  onClick={() => setStoreFilter(store)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    storeFilter === store
                      ? 'bg-orange-600 text-white'
                      : 'border border-border bg-surface text-primary hover:border-accent/50'
                  }`}
                >
                  {store === 'all' ? 'All Stores' : store}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted">
              <span className="font-semibold text-primary">{filtered.length}</span> active deal
              {filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-muted" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as DealSort)}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-primary"
                aria-label="Sort deals"
              >
                <option value="discount">Biggest Discount</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="expiring">Expiring Soon</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Deal grid */}
      {priceDrops.length > 0 ? (
        <section>
          <h2 className="font-heading text-xl font-semibold text-primary mb-4 flex items-center gap-2">
            <TrendingDown size={20} className="text-accent" />
            {filter === 'all' ? 'All Offers' : DEAL_TYPE_LABELS[filter as Deal['deal_type']]}
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
                          alt={deal.product.name}
                          fill
                          sizes="80px"
                          className="object-contain p-1"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-block rounded-md bg-surface-alt px-2 py-0.5 text-[10px] font-semibold uppercase text-muted mb-1">
                        {DEAL_TYPE_LABELS[deal.deal_type]}
                      </span>
                      <p className="text-sm font-semibold text-primary line-clamp-2">
                        {deal.product.name}
                      </p>
                      {deal.headline && (
                        <p className="text-xs text-muted line-clamp-1 mt-0.5">{deal.headline}</p>
                      )}
                    </div>
                  </Link>
                  <div className="px-4 pb-4 flex flex-col gap-2 mt-auto">
                    <div className="flex items-baseline gap-2">
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
                      {pct != null && (
                        <span className="ml-auto text-xs font-bold text-accent">{pct}% off</span>
                      )}
                    </div>
                    {savings != null && savings > 0 && (
                      <p className="text-xs font-medium text-green-700">
                        You save {formatIndianPrice(savings)}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      {deal.expires_at ? (
                        <DealCountdown expiresAt={deal.expires_at} compact />
                      ) : (
                        <span className="text-xs text-muted">{deal.store_name}</span>
                      )}
                      <AffiliateOutboundLink
                        href={`/go/${deal.id}`}
                        linkId={deal.id}
                        storeName={deal.store_name}
                        productName={deal.product.name}
                        priceInr={deal.deal_price_inr}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent/90"
                      >
                        <ShoppingCart size={12} />
                        Buy Now
                      </AffiliateOutboundLink>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ) : (
        !showDealOfDay &&
        hasContent === false && (
          <EmptyState
            icon={Tag}
            heading="No active deals"
            description="Check back soon — we track prices daily across Amazon, Flipkart & more."
            action={{ label: 'Browse Products', href: '/smartphones' }}
          />
        )
      )}

      {filtered.length === 0 && deals.length > 0 && (
        <EmptyState
          icon={Tag}
          heading="No deals match your filters"
          description="Try a different category or store"
        />
      )}
    </>
  )
}
