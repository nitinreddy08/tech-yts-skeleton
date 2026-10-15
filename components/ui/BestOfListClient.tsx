'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Trophy,
  GitCompare,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  FlaskConical,
} from 'lucide-react'
import { RatingBadge } from '@/components/ui/RatingBadge'
import { Price } from '@/components/ui/Price'
import { siteConfig } from '@/lib/config'
import { ShareBar } from '@/components/ui/ShareBar'
import { Badge } from '@/components/ui/Badge'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button, buttonVariants } from '@/components/ui/Button'
import { buildCompareUrl } from '@/lib/utils/compare-url'
import type { BestOfList, BestOfListItem } from '@/types'

function getPickBadge(rank: number, items: BestOfListItem[]): { label: string; className: string } | null {
  if (rank === 1) {
    return { label: 'Best Overall', className: 'bg-accent text-white' }
  }
  if (rank === 2) {
    return { label: 'Runner Up', className: 'bg-primary text-white' }
  }
  if (rank === 3) {
    return { label: 'Also Great', className: 'bg-surface-alt text-primary border border-border' }
  }

  const prices = items
    .map((i) => i.product?.current_price_inr)
    .filter((p): p is number => p != null)
  const minPrice = prices.length ? Math.min(...prices) : null
  const item = items.find((i) => i.rank === rank)
  if (minPrice != null && item?.product?.current_price_inr === minPrice) {
    return { label: 'Best Value', className: 'bg-success-700 text-white' }
  }
  return null
}

function BestOfItemCard({
  item,
  badge,
  isActive,
}: {
  item: BestOfListItem
  badge: { label: string; className: string } | null
  isActive: boolean
}) {
  const product = item.product
  if (!product) return null
  const href = `/${product.category_slug}/${product.slug}`

  return (
    <article
      id={`item-${item.rank}`}
      className={`scroll-mt-28 overflow-hidden rounded-xl border bg-surface transition-shadow ${
        isActive ? 'border-accent shadow-md' : 'border-border'
      }`}
    >
      {item.rank === 1 && (
        <div className="border-b border-accent/10 bg-gradient-to-r from-accent/15 to-accent/5 px-4 py-1.5 md:px-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-accent">
            <Trophy size={14} aria-hidden /> Our top recommendation — start here
          </p>
        </div>
      )}

      <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-3 p-4 md:grid-cols-[auto_1fr_auto] md:gap-x-5 md:p-5">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="w-6 font-heading text-2xl font-bold leading-none text-accent/40 md:w-8 md:text-3xl">{item.rank}</span>
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-alt md:h-24 md:w-24">
            {product.thumbnail_url ? (
              <Image src={product.thumbnail_url} alt="" fill sizes="96px" className="object-contain p-2" />
            ) : null}
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            {badge && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
            )}
            <span className="text-xs text-muted">{product.brand_name}</span>
          </div>
          <h2 className="text-h3 text-primary">
            <Link href={href} className="transition-colors hover:text-accent">
              {product.name}
            </Link>
          </h2>
          {item.pick_reason && <p className="mt-1 line-clamp-2 text-sm text-muted">{item.pick_reason}</p>}
          <div className="mt-2">
            <RatingBadge score={product.creator_rating} showVerdict />
          </div>
        </div>

        <div className="col-span-2 flex items-center justify-between gap-3 border-t border-border pt-3 md:col-span-1 md:flex-col md:items-end md:border-t-0 md:pt-0">
          <Price value={product.current_price_inr} size="md" />
          <div className="flex items-center gap-2">
            <Link
              href={`/compare?products=${product.slug}`}
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              title="Start a comparison with this product"
            >
              <GitCompare size={14} aria-hidden /> <span className="hidden sm:inline">Compare</span>
              <span className="sr-only sm:hidden">Compare {product.name}</span>
            </Link>
            <Link href={href} className={buttonVariants({ variant: 'primary', size: 'sm' })}>
              Review <ArrowRight size={14} aria-hidden />
              <span className="sr-only"> of {product.name}</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

interface BestOfListClientProps {
  list: BestOfList
  shareUrl: string
}

export function BestOfListClient({ list, shareUrl }: BestOfListClientProps) {
  const [activeRank, setActiveRank] = useState<number | null>(list.items[0]?.rank ?? null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const compareSlugList = list.items
    .slice(0, 4)
    .map((i) => i.product?.slug)
    .filter((s): s is string => !!s)

  useEffect(() => {
    observerRef.current?.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) {
          const rank = Number(visible[0].target.id.replace('item-', ''))
          if (!isNaN(rank)) setActiveRank(rank)
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5] }
    )

    list.items.forEach((item) => {
      const el = document.getElementById(`item-${item.rank}`)
      if (el) observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [list.items])

  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8">
      {/* Editorial header */}
      <header className="mb-5 md:mb-8">
        <Breadcrumb
          className="mb-3 md:mb-4"
          items={[{ label: 'Home', href: '/' }, { label: "Editor's Guides", href: '/best-of' }, { label: list.title }]}
        />
        <h1 className="text-h1 text-primary">{list.title}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <Badge variant="accent" size="sm">
            <Trophy size={10} aria-hidden /> Editor&apos;s guide
          </Badge>
          {list.items.length} products tested · Updated{' '}
          {new Date(list.updated_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </p>
        {list.description && <p className="mt-3 max-w-3xl leading-relaxed text-primary/90">{list.description}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {compareSlugList.length >= 2 && (
            <Button href={buildCompareUrl(compareSlugList)} variant="secondary" size="auto" className="h-11 px-4 text-sm">
              <GitCompare size={16} aria-hidden />
              Compare top {compareSlugList.length}
            </Button>
          )}
          <ShareBar
            url={shareUrl}
            title={list.title}
            text={`${list.title} — our top picks tested and ranked for India.`}
          />
        </div>

        {/* "How we picked" stays one tap away without taking a screen of space. */}
        <details className="group mt-4 rounded-lg border border-border bg-surface-alt px-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden">
            <FlaskConical size={16} className="text-accent" aria-hidden />
            How we picked these
            <ChevronRight size={14} className="ml-auto text-muted transition-transform group-open:rotate-90" aria-hidden />
          </summary>
          <p className="pb-3 text-sm leading-relaxed text-muted">
            Every product on this list was hands-on tested by {siteConfig.creator_name || 'our team'}. We compare
            specs, real-world performance, and value at current Indian retail prices. Rankings reflect our honest
            creator rating — no brand pays for placement. Some links on this page are affiliate links; any commission
            never changes a ranking.
          </p>
        </details>
      </header>

      {/* Mobile ToC chips */}
      {list.items.length > 0 && (
        <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:hidden">
          <div className="flex gap-2 pb-2">
            {list.items.map((item) => (
              <a
                key={item.id}
                href={`#item-${item.rank}`}
                aria-current={activeRank === item.rank ? 'location' : undefined}
                className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors ${
                  activeRank === item.rank
                    ? 'bg-accent text-white'
                    : 'border border-border bg-surface text-primary'
                }`}
              >
                #{item.rank} {item.product?.name.split(' ').slice(0, 2).join(' ')}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-6 lg:gap-8">
        {/* Desktop sticky ToC with scroll spy */}
        {list.items.length > 0 && (
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 rounded-xl border border-border bg-surface p-4">
              <p className="mb-2 text-sm font-semibold text-primary">In this guide</p>
              <nav className="flex flex-col gap-0.5">
                {list.items.map((item) => {
                  const badge = getPickBadge(item.rank, list.items)
                  return (
                    <a
                      key={item.id}
                      href={`#item-${item.rank}`}
                      className={`flex items-start gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                        activeRank === item.rank
                          ? 'bg-accent/10 text-accent font-medium'
                          : 'text-muted hover:text-primary hover:bg-surface-alt'
                      }`}
                    >
                      <span className="font-bold tabular-nums shrink-0">{item.rank}.</span>
                      <span className="line-clamp-2 leading-snug">{item.product?.name}</span>
                      {badge && item.rank <= 2 && (
                        <ChevronRight size={14} className="shrink-0 ml-auto mt-0.5" />
                      )}
                    </a>
                  )
                })}
              </nav>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="flex items-center gap-1.5 text-[11px] text-muted">
                  <ShieldCheck size={12} />
                  Updated {new Date(list.updated_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </aside>
        )}

        {/* Ranked items */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {list.items.map((item) => (
            <BestOfItemCard
              key={item.id}
              item={item}
              badge={getPickBadge(item.rank, list.items)}
              isActive={activeRank === item.rank}
            />
          ))}

          {list.items.length === 0 && (
            <p className="text-center text-muted py-12">No items in this list yet.</p>
          )}
        </div>
      </div>
    </main>
  )
}
