import Link from 'next/link'
import type { Category } from '@/types'

interface CategoryDiscoveryGridProps {
  categories: Category[]
  productCounts: Record<string, number>
}

export function CategoryDiscoveryGrid({ categories, productCounts }: CategoryDiscoveryGridProps) {
  return (
    <section className="py-12 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary">Browse by Category</h2>
            <p className="text-sm text-muted mt-1">Find the right gadget for your needs</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${cat.slug}`}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-5 hover:border-accent/40 hover:shadow-md transition-all text-center"
            >
              <span className="text-3xl" role="img" aria-hidden>
                {cat.icon}
              </span>
              <span className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">
                {cat.name}
              </span>
              <span className="text-xs text-muted">
                {productCounts[cat.slug] ?? 0} reviewed
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
