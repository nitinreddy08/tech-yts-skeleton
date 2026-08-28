import Link from 'next/link'
import { Search, Home, ArrowRight } from 'lucide-react'
import { fetchAllCategories } from '@/lib/data/categories'
import { fetchFeaturedProducts } from '@/lib/data/products'
import { ProductCard } from '@/components/ui/ProductCard'
import { RecentSearchesStrip } from '@/components/ui/RecentSearchesStrip'
import { CompareSuggestions } from '@/components/ui/CompareSuggestions'
import { siteConfig } from '@/lib/config'

export default async function NotFoundPage() {
  const [categories, featured] = await Promise.all([
    fetchAllCategories(),
    fetchFeaturedProducts(),
  ])

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg mb-10">
        <p className="text-7xl font-heading font-bold text-accent/20 leading-none mb-4">404</p>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary mb-3">
          Page not found
        </h1>
        <p className="text-muted leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
          Let&apos;s get you back to discovering great tech on {siteConfig.site_name}.
        </p>
      </div>

      {/* Primary actions */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
        >
          <Home size={16} />
          Go Home
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-primary hover:border-accent transition-colors"
        >
          <Search size={16} />
          Search Products
        </Link>
        <Link
          href="/deals"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-primary hover:border-accent transition-colors"
        >
          View Deals
        </Link>
      </div>

      {/* Search recovery */}
      <section className="w-full max-w-xl mb-10">
        <RecentSearchesStrip className="text-left" />
      </section>

      <CompareSuggestions className="w-full max-w-2xl mb-12" />

      {/* Category recovery */}
      <section className="w-full max-w-3xl mb-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted text-center mb-4">
          Browse by category
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-primary hover:border-accent hover:text-accent transition-colors"
            >
              <span aria-hidden>{cat.icon}</span>
              {cat.name}
              <ArrowRight size={12} className="text-muted" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products recirculation */}
      {featured.length > 0 && (
        <section className="w-full max-w-7xl">
          <h2 className="font-heading text-lg font-bold text-primary text-center mb-6">
            Popular right now
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {featured.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
