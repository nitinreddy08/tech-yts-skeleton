import Link from 'next/link'
import { TrendingDown } from 'lucide-react'
import { ProductCard } from '@/components/ui/ProductCard'
import { formatIndianPrice } from '@/lib/utils/format'
import type { ProductSummary } from '@/types'

interface CheaperAlternativesStripProps {
  alternatives: ProductSummary[]
  currentPrice: number
  categoryName: string
}

export function CheaperAlternativesStrip({
  alternatives,
  currentPrice,
  categoryName,
}: CheaperAlternativesStripProps) {
  if (alternatives.length === 0) return null

  return (
    <section className="rounded-xl border border-green-200 bg-green-50/50 p-5">
      <div className="flex items-center gap-2 mb-1">
        <TrendingDown size={18} className="text-green-700" />
        <h2 className="font-heading text-sm font-bold text-primary">
          Save money — cheaper {categoryName.toLowerCase()} options
        </h2>
      </div>
      <p className="text-xs text-muted mb-4">
        Same category, rated by us, below {formatIndianPrice(currentPrice)}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {alternatives.map((p) => (
          <ProductCard key={p.id} product={p} showDealBadge={false} />
        ))}
      </div>
      {alternatives[0]?.category_slug && (
        <Link
          href={`/${alternatives[0].category_slug}?sort=price_asc`}
          className="inline-block mt-4 text-xs font-semibold text-accent hover:underline"
        >
          Browse all budget {categoryName.toLowerCase()} →
        </Link>
      )}
    </section>
  )
}
