'use client'

import { useState } from 'react'
import { TrendingUp, Star, Clock } from 'lucide-react'
import { ProductCard } from '@/components/ui/ProductCard'
import type { ProductSummary } from '@/types'
import type { ProductDealBadge } from '@/lib/data/product-deals'

interface Tab {
  key: string
  label: string
  icon: typeof TrendingUp
  products: ProductSummary[]
}

interface HomeProductTabsProps {
  trending: ProductSummary[]
  featured: ProductSummary[]
  latest: ProductSummary[]
  dealMap: Record<string, ProductDealBadge>
}

/**
 * Replaces what used to be three stacked, near-identical "Trending" /
 * "Featured" / "Latest" grid sections with one tabbed picker — same data,
 * one section's worth of vertical space instead of three.
 */
export function HomeProductTabs({ trending, featured, latest, dealMap }: HomeProductTabsProps) {
  const tabs: Tab[] = [
    { key: 'trending', label: 'Trending', icon: TrendingUp, products: trending },
    { key: 'featured', label: 'Top Rated', icon: Star, products: featured },
    { key: 'latest', label: 'Newest', icon: Clock, products: latest },
  ].filter((t) => t.products.length > 0)

  const [active, setActive] = useState(tabs[0]?.key)
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0]

  if (!activeTab) return null

  return (
    <section className="py-12 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold text-primary">Top Picks</h2>
          <div className="flex gap-1 rounded-full border border-border bg-surface-alt p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = tab.key === activeTab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActive(tab.key)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    isActive ? 'bg-surface text-accent shadow-sm' : 'text-muted hover:text-primary'
                  }`}
                  aria-pressed={isActive}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {activeTab.products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} activeDeal={dealMap[p.id]} />
          ))}
        </div>
      </div>
    </section>
  )
}
