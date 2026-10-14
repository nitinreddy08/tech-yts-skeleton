'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Trophy,
  GitCompare,
  ArrowRight,
  Star,
  ChevronRight,
  ShieldCheck,
  FlaskConical,
} from 'lucide-react'
import { formatIndianPrice } from '@/lib/utils/format'
import { siteConfig } from '@/lib/config'
import { ShareBar } from '@/components/ui/ShareBar'
import { Eyebrow } from '@/components/ui/Eyebrow'
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

  return (
    <article
      id={`item-${item.rank}`}
      className={`scroll-mt-28 rounded-2xl border bg-surface overflow-hidden transition-shadow ${
        isActive ? 'border-accent shadow-md' : 'border-border shadow-sm'
      }`}
    >
      {item.rank === 1 && (
        <div className="bg-gradient-to-r from-accent/15 to-accent/5 px-5 py-2 border-b border-accent/10">
          <p className="text-xs font-semibold text-accent flex items-center gap-1.5">
            <Trophy size={14} /> Our top recommendation — start here
          </p>
        </div>
      )}

      <div className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="flex items-start gap-4 md:w-48 shrink-0">
            <span className="font-heading text-4xl font-bold text-accent/30 leading-none w-10">
              {item.rank}
            </span>
            <div className="relative h-28 w-28 rounded-xl bg-surface-alt border border-border overflow-hidden">
              {product.thumbnail_url ? (
                <Image
                  src={product.thumbnail_url}
                  alt={product.name}
                  fill
                  sizes="112px"
                  className="object-contain p-2"
                />
              ) : null}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {badge && (
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${badge.className}`}>
                  {badge.label}
                </span>
              )}
              <span className="text-xs text-muted">{product.brand_name}</span>
            </div>

            <h2 className="text-lg md:text-xl font-bold text-primary mb-2">
              <Link href={`/${product.category_slug}/${product.slug}`} className="hover:text-accent transition-colors">
                {product.name}
              </Link>
            </h2>

            {item.pick_reason && (
              <p className="text-sm text-muted leading-relaxed mb-4">{item.pick_reason}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-white">
                <Star size={12} className="fill-white" />
                {product.creator_rating.toFixed(1)}/10
              </div>
              {product.current_price_inr != null && (
                <span className="text-lg font-bold text-accent">
                  {formatIndianPrice(product.current_price_inr)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${product.category_slug}/${product.slug}`}
                className={buttonVariants({ variant: 'primary', size: 'sm' })}
              >
                Read full review <ArrowRight size={14} aria-hidden />
              </Link>
              <Link
                href={`/compare?products=${product.slug}`}
                className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                title="Start a comparison with this product"
              >
                <GitCompare size={14} aria-hidden /> Compare with…
              </Link>
            </div>
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
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* Editorial header */}
      <header className="mb-10">
        <Breadcrumb
          className="mb-4"
          items={[{ label: 'Home', href: '/' }, { label: "Editor's Guides", href: '/best-of' }, { label: list.title }]}
        />
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="accent">
            <Trophy size={12} aria-hidden /> Editor&apos;s Guide
          </Badge>
          <span className="text-xs text-muted">{list.items.length} products tested</span>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary leading-tight">
          {list.title}
        </h1>
        {list.description && (
          <p className="text-muted leading-relaxed mt-4 max-w-3xl text-base">{list.description}</p>
        )}

        <ShareBar
          url={shareUrl}
          title={list.title}
          text={`${list.title} — our top picks tested and ranked for India.`}
          className="mt-5"
        />

        {/* Methodology strip — Wirecutter "How we picked" */}
        <div className="mt-6 rounded-xl border border-border bg-surface-alt p-5">
          <div className="flex items-start gap-3">
            <FlaskConical size={20} className="text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-primary mb-1">How we picked these</p>
              <p className="text-sm text-muted leading-relaxed">
                Every product on this list was hands-on tested by {siteConfig.creator_name || 'our team'}.
                We compare specs, real-world performance, and value at current Indian retail prices.
                Rankings reflect our honest creator rating — no brand pays for placement. Some links on this
                page are affiliate links; any commission never changes a ranking.
              </p>
            </div>
          </div>
        </div>

        {compareSlugList.length >= 2 && (
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href={buildCompareUrl(compareSlugList)} variant="secondary">
              <GitCompare size={16} aria-hidden />
              Compare top {compareSlugList.length} side-by-side
            </Button>
          </div>
        )}

      </header>

      {/* Mobile ToC chips */}
      {list.items.length > 0 && (
        <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto">
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

      <div className="flex gap-8">
        {/* Desktop sticky ToC with scroll spy */}
        {list.items.length > 0 && (
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 rounded-xl border border-border bg-surface p-4">
              <Eyebrow className="mb-3">In this guide</Eyebrow>
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
        <div className="flex-1 flex flex-col gap-6 min-w-0">
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
