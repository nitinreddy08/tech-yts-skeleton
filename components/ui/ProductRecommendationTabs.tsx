'use client'

import { useState } from 'react'
import { Sparkles, Building2, TrendingDown } from 'lucide-react'
import { ProductCard } from '@/components/ui/ProductCard'
import { SimilarCompareStrip } from '@/components/ui/ProductComparePanel'
import { formatIndianPrice } from '@/lib/utils/format'
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
    { key: 'similar', label: 'Similar Products', icon: Sparkles, products: similar },
    { key: 'brand', label: `More from ${brandName}`, icon: Building2, products: moreFromBrand },
    ...(currentPrice != null
      ? [{ key: 'cheaper', label: 'Cheaper Picks', icon: TrendingDown, products: cheaperAlternatives }]
      : []),
  ].filter((t) => t.products.length > 0)

  const [active, setActive] = useState(tabs[0]?.key ?? '')

  if (tabs.length === 0) return null

  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0]

  return (
    <section id="similar" className="scroll-mt-32">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-heading text-lg font-bold text-primary">You Might Also Like</h2>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab.key === tab.key
                    ? 'bg-accent text-white'
                    : 'bg-surface-alt text-muted hover:text-primary border border-border'
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {activeTab.key === 'similar' && <SimilarCompareStrip current={current} similar={similar} />}

      {activeTab.key === 'cheaper' && currentPrice != null && (
        <p className="text-xs text-muted mb-3 flex items-center gap-1.5">
          <TrendingDown size={14} className="text-green-600" />
          Other {categoryName.toLowerCase()} under {formatIndianPrice(currentPrice)}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {activeTab.products.slice(0, 8).map((s) => (
          <ProductCard key={s.id} product={s} />
        ))}
      </div>
    </section>
  )
}
