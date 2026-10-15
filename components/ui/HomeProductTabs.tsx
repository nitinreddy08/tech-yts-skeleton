'use client'

import { useId, useState } from 'react'
import { TrendingUp, Star, Clock } from 'lucide-react'
import { ProductCard } from '@/components/ui/ProductCard'
import { TabList, TabPanel } from '@/components/ui/Tabs'
import { Section, Rail } from '@/components/ui/Section'
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
 * One tabbed picker instead of three stacked grids. On phones the cards sit in
 * a swipe rail (one row) rather than a four-row grid.
 */
export function HomeProductTabs({ trending, featured, latest, dealMap }: HomeProductTabsProps) {
  const tabs: Tab[] = [
    { key: 'trending', label: 'Trending', icon: TrendingUp, products: trending },
    { key: 'featured', label: 'Top rated', icon: Star, products: featured },
    { key: 'latest', label: 'Newest', icon: Clock, products: latest },
  ].filter((t) => t.products.length > 0)

  const [active, setActive] = useState(tabs[0]?.key)
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0]
  const prefix = useId()

  if (!activeTab) return null

  return (
    <Section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 md:mb-6">
        <h2 className="text-h2 text-primary">Top picks</h2>
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
        <Rail>
          {activeTab.products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} activeDeal={dealMap[p.id]} />
          ))}
        </Rail>
      </TabPanel>
    </Section>
  )
}
