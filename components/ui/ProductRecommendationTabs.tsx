'use client'

import { useId, useState } from 'react'
import { Sparkles, Building2, TrendingDown } from 'lucide-react'
import { ProductCard } from '@/components/ui/ProductCard'
import { TabList, TabPanel } from '@/components/ui/Tabs'
import { SimilarCompareStrip } from '@/components/ui/ProductComparePanel'
import { formatIndianPrice } from '@/lib/utils/format'
import { Rail } from '@/components/ui/Section'
import type { ProductSummary } from '@/types'

interface ProductRecommendationTabsProps {
  current: ProductSummary
  similar: ProductSummary[]
  moreFromBrand: ProductSummary[]
  brandName: string
  cheaperAlternatives: ProductSummary[]
  currentPrice: number | null
  categoryName: string
}

export function ProductRecommendationTabs({
  current,
  similar,
  moreFromBrand,
  brandName,
  cheaperAlternatives,
  currentPrice,
  categoryName,
}: ProductRecommendationTabsProps) {
  const tabs = [
    { key: 'similar', label: 'Similar', icon: Sparkles, products: similar },
    { key: 'brand', label: `More from ${brandName}`, icon: Building2, products: moreFromBrand },
    ...(currentPrice != null
      ? [{ key: 'cheaper', label: 'Cheaper', icon: TrendingDown, products: cheaperAlternatives }]
      : []),
  ].filter((t) => t.products.length > 0)

  const [active, setActive] = useState(tabs[0]?.key ?? '')
  const prefix = useId()

  if (tabs.length === 0) return null

  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0]

  return (
    <section id="similar" className="scroll-mt-32">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <h2 className="text-h2 text-primary">You might also like</h2>
        <TabList
          label="Recommendations"
          idPrefix={prefix}
          variant="pill"
          active={activeTab.key}
          onChange={setActive}
          tabs={tabs.map((t) => {
            const Icon = t.icon
            return { id: t.key, label: t.label, icon: <Icon size={13} aria-hidden /> }
          })}
        />
      </div>

      {activeTab.key === 'similar' && <SimilarCompareStrip current={current} similar={similar} />}

      {activeTab.key === 'cheaper' && currentPrice != null && (
        <p className="text-xs text-muted mb-3 flex items-center gap-1.5">
          <TrendingDown size={14} className="text-success-700" aria-hidden />
          Other {categoryName.toLowerCase()} under {formatIndianPrice(currentPrice)}
        </p>
      )}

      <TabPanel idPrefix={prefix} id={activeTab.key} active>
        <Rail>
          {activeTab.products.slice(0, 4).map((s) => (
            <ProductCard key={s.id} product={s} />
          ))}
        </Rail>
      </TabPanel>
    </section>
  )
}
