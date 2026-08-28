import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { fetchBrandsWithCounts } from '@/lib/data/brands'
import { BrandLogo } from '@/components/ui/BrandLogo'

export async function PopularBrandsStrip({ limit = 8 }: { limit?: number }) {
  const brands = await fetchBrandsWithCounts()
  const top = brands.slice(0, limit)

  if (top.length === 0) return null

  return (
    <section className="py-10 px-4 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
              <Building2 size={18} className="text-accent" />
              Shop by Brand
            </h2>
            <p className="text-sm text-muted mt-0.5">
              All reviewed products from top manufacturers
            </p>
          </div>
          <Link href="/brands" className="text-xs text-accent hover:underline shrink-0">
            All brands →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {top.map((brand) => (
            <Link
              key={brand.id}
              href={`/brand/${brand.slug}`}
              className="group flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-surface p-4 hover:border-accent hover:shadow-sm transition-all text-center min-h-[88px]"
            >
              <BrandLogo name={brand.name} size="sm" />
              <span className="font-heading text-xs font-bold text-primary group-hover:text-accent transition-colors">
                {brand.name}
              </span>
              <span className="text-[10px] text-muted tabular-nums">
                {brand.productCount} product{brand.productCount !== 1 ? 's' : ''}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
