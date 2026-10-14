'use client'

import { useId, useState } from 'react'
import { TrendingUp, Star, Clock } from 'lucide-react'
import { ProductCard } from '@/components/ui/ProductCard'
import { TabList, TabPanel } from '@/components/ui/Tabs'
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
  const prefix = useId()

  if (!activeTab) return null

  return (
    <section className="py-12 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold text-primary">Top Picks</h2>
          <TabList
            label="Product picks"
            idPrefix={prefix}
            variant="segmented"
            active={activeTab.key}
            onChange={setActive}
            tabs={tabs.map((t) => {
              const Icon = t.icon
              return { id: t.key, label: t.label, icon: <Icon size={14} aria-hidden /> }
            })}
          />
        </div>

        <TabPanel idPrefix={prefix} id={activeTab.key} active>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {activeTab.products.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} activeDeal={dealMap[p.id]} />
            ))}
          </div>
        </TabPanel>
      </div>
    </section>
  )
}
