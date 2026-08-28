import Link from 'next/link'
import { TrendingUp, ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/ui/ProductCard'
import type { ProductSummary } from '@/types'
import type { ProductDealBadge } from '@/lib/data/product-deals'

interface TrendingProductsStripProps {
  products: ProductSummary[]
  dealMap?: Record<string, ProductDealBadge>
}

export function TrendingProductsStrip({ products, dealMap = {} }: TrendingProductsStripProps) {
  if (products.length === 0) return null

  return (
    <section className="py-14 px-4 bg-surface-alt border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary flex items-center gap-2">
              <TrendingUp size={22} className="text-accent" /> Trending Now
            </h2>
            <p className="text-sm text-muted mt-1">Most clicked this week — buyers are checking these out</p>
          </div>
          <Link href="/search?sort=popular" className="text-sm text-accent hover:underline hidden sm:flex items-center gap-1">
            See all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} activeDeal={dealMap[p.id]} />
          ))}
        </div>
      </div>
    </section>
  )
}
