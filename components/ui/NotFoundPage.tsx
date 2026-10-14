import { Home, Search, Zap } from 'lucide-react'
import { fetchAllCategories } from '@/lib/data/categories'
import { fetchFeaturedProducts } from '@/lib/data/products'
import { ProductCard } from '@/components/ui/ProductCard'
import { RecentSearchesStrip } from '@/components/ui/RecentSearchesStrip'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { Input } from '@/components/ui/Input'
import { siteConfig } from '@/lib/config'

/** Dead-end recovery: a search box first, three clear exits, then browse paths — nothing more. */
export default async function NotFoundPage() {
  const [categories, featured] = await Promise.all([
    fetchAllCategories(),
    fetchFeaturedProducts(),
  ])

  return (
    <main className="flex flex-col items-center px-4 py-12 md:py-16">
      <div className="mb-8 max-w-lg text-center">
        <p className="mb-3 font-heading text-6xl font-bold leading-none text-accent/20" aria-hidden>404</p>
        <h1 className="mb-3 font-heading text-2xl font-bold text-primary md:text-3xl">Page not found</h1>
        <p className="leading-relaxed text-muted">
          That page doesn&apos;t exist or may have moved. Search {siteConfig.site_name}, or pick up where you left off.
        </p>
      </div>

      <form action="/search" method="get" role="search" className="mb-6 flex w-full max-w-xl gap-2">
        <label htmlFor="nf-search" className="sr-only">Search products</label>
        <Input id="nf-search" name="q" type="search" placeholder="Search phones, laptops, earbuds…" autoComplete="off" />
        <Button type="submit" size="auto" className="h-11 shrink-0 px-5 text-sm">
          <Search size={16} aria-hidden />
          Search
        </Button>
      </form>

      <div className="mb-10 flex flex-wrap justify-center gap-3">
        <Button href="/" variant="secondary" size="auto" className="h-11 px-5 text-sm">
          <Home size={16} aria-hidden />
          Go home
        </Button>
        <Button href="/deals" variant="secondary" size="auto" className="h-11 px-5 text-sm">
          <Zap size={16} aria-hidden />
          View deals
        </Button>
      </div>

      <section className="mb-10 w-full max-w-xl">
        <RecentSearchesStrip className="text-left" />
      </section>

      <section className="mb-12 w-full max-w-3xl">
        <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-muted">Browse by category</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <Chip key={cat.slug} size="md" href={`/${cat.slug}`}>
              <span aria-hidden>{cat.icon}</span>
              {cat.name}
            </Chip>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="w-full max-w-7xl">
          <h2 className="mb-6 text-center font-heading text-lg font-bold text-primary">Popular right now</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {featured.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
