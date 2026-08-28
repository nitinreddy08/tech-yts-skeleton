import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { ProductCard } from '@/components/ui/ProductCard'
import type { ProductSummary } from '@/types'

interface MoreFromBrandStripProps {
  brandName: string
  brandSlug: string
  products: ProductSummary[]
}

export function MoreFromBrandStrip({ brandName, brandSlug, products }: MoreFromBrandStripProps) {
  if (products.length === 0) return null

  return (
    <section className="scroll-mt-32">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
            <Building2 size={18} className="text-accent" />
            More from {brandName}
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Other {brandName} products we&apos;ve reviewed
          </p>
        </div>
        <Link
          href={`/brand/${brandSlug}`}
          className="text-xs font-semibold text-accent hover:underline shrink-0"
        >
          All {brandName} →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
