import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, SearchX, Sparkles } from 'lucide-react'
import { searchProductsFull } from '@/lib/data/search'
import { getSearchSuggestions } from '@/lib/data/search-suggestions'
import { fetchAllCategories } from '@/lib/data/categories'
import { db } from '@/lib/mock/db'
import { SearchFilterBar } from '@/components/ui/SearchFilterBar'
import { SearchResultCard } from '@/components/ui/SearchResultCard'
import { RecentSearchesStrip } from '@/components/ui/RecentSearchesStrip'
import type { Metadata } from 'next'
import type { SearchFilters } from '@/lib/data/search'

export const revalidate = 60

type SP = { [key: string]: string | string[] | undefined }

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SP>
}): Promise<Metadata> {
  const sp = await searchParams
  const q = sp.q ? String(sp.q) : ''
  return {
    title: q ? `"${q}" — Search` : 'Search',
    description: q
      ? `${q} — find the best price, specs and reviews`
      : 'Search for phones, laptops, headphones and more',
  }
}

function str(sp: SP, key: string): string {
  const v = sp[key]
  return Array.isArray(v) ? v[0] : v ?? ''
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SP>
}) {
  const sp = await searchParams
  const q = str(sp, 'q')
  const category = str(sp, 'category')
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined
  const minRating = sp.minRating ? Number(sp.minRating) : undefined
  const sort = (str(sp, 'sort') || 'relevance') as SearchFilters['sort']

  const filters: SearchFilters = {
    category: category || undefined,
    minPrice,
    maxPrice,
    minRating,
    sort,
  }

  const [results, categories] = await Promise.all([
    searchProductsFull(q, filters),
    fetchAllCategories(),
  ])

  // Popular / suggested products for empty-query state
  const featured = db.products
    .filter((p) => p.is_published && p.is_featured)
    .slice(0, 8)

  const hasQuery = q.trim().length >= 2
  const hasBrowseFilters =
    sort !== 'relevance' ||
    !!category ||
    minPrice != null ||
    maxPrice != null ||
    minRating != null
  const showCatalog = !hasQuery && hasBrowseFilters
  const showResults = (hasQuery || showCatalog) && results.length > 0
  const hasResults = results.length > 0
  const suggestions = hasQuery && !hasResults ? getSearchSuggestions(q) : []

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="mb-6">
        {hasQuery ? (
          <h1 className="font-heading text-2xl font-bold text-primary">
            {q}
          </h1>
        ) : showCatalog ? (
          <h1 className="font-heading text-2xl font-bold text-primary">
            {sort === 'newest'
              ? 'Newest Reviews'
              : sort === 'popular'
                ? 'Popular Products'
                : sort === 'rating_desc'
                  ? 'Top Rated'
                  : sort === 'price_asc'
                    ? 'Lowest Price'
                    : sort === 'price_desc'
                      ? 'Highest Price'
                      : 'Browse Products'}
          </h1>
        ) : (
          <h1 className="font-heading text-2xl font-bold text-primary flex items-center gap-2">
            <Search size={22} className="text-accent" />
            Search
          </h1>
        )}
      </div>

      {/* ── Filter bar — client island ────────────────────────────── */}
      <div className="mb-6 space-y-4">
        <Suspense fallback={null}>
          <SearchFilterBar
            categories={categories.map((c) => ({
              slug: c.slug,
              name: c.name,
              icon: c.icon,
            }))}
            resultCount={results.length}
            query={q}
          />
        </Suspense>
        <RecentSearchesStrip currentQuery={q} />
      </div>

      {/* ── Results grid ────────────────────────────────────────────── */}
      {showResults && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((r) => (
            <SearchResultCard key={r.id} result={r} query={q} />
          ))}
        </div>
      )}

      {/* ── No results ──────────────────────────────────────────────── */}
      {hasQuery && !hasResults && (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-alt">
            <SearchX size={36} className="text-muted" />
          </div>
          <div>
            <p className="text-lg font-semibold text-primary">
              No results for &ldquo;{q}&rdquo;
            </p>
            <p className="mt-1 text-sm text-muted">
              Try different keywords, or browse a category below.
            </p>
          </div>

          {suggestions.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                Did you mean
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <Link
                    key={s}
                    href={`/search?q=${encodeURIComponent(s)}`}
                    className="rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-sm font-medium text-accent hover:bg-accent/10 transition-colors"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Category suggestions */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-primary hover:border-accent hover:text-accent transition-colors"
              >
                {c.icon} {c.name}
              </Link>
            ))}
          </div>

          {/* Popular searches */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              Popular searches
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {['flagship', '5g', 'budget', 'gaming', 'anc', 'ultrabook'].map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-border bg-surface-alt px-3 py-1 text-xs text-muted hover:text-accent hover:border-accent transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Empty query — landing state ──────────────────────────────── */}
      {!hasQuery && !showCatalog && (
        <div className="flex flex-col gap-10">
          {/* Browse by category */}
          <section>
            <h2 className="font-heading text-base font-semibold text-primary mb-4 flex items-center gap-2">
              Browse by Category
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${c.slug}`}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-5 text-center hover:border-accent hover:shadow-sm transition-all"
                >
                  <span className="text-3xl">{c.icon}</span>
                  <span className="text-sm font-medium text-primary">{c.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured products as inspiration */}
          {featured.length > 0 && (
            <section>
              <h2 className="font-heading text-base font-semibold text-primary mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-accent" />
                Popular Right Now
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {featured.map((p) => (
                  <Link
                    key={p.id}
                    href={`/${p.category_slug}/${p.slug}`}
                    className="group flex flex-col rounded-xl border border-border bg-surface p-3 hover:shadow-md hover:border-accent/30 transition-all"
                  >
                    <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-surface-alt">
                      {p.thumbnail_url && (
                        <Image
                          src={p.thumbnail_url}
                          alt={p.name}
                          fill
                          sizes="200px"
                          className="object-contain p-3 transition-transform group-hover:scale-105"
                        />
                      )}
                    </div>
                    <p className="text-[10px] text-muted">{p.brand_name}</p>
                    <p className="text-sm font-semibold text-primary leading-tight line-clamp-2">
                      {p.name}
                    </p>
                    {p.current_price_inr != null && (
                      <p className="mt-1 text-sm font-bold text-accent">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 0,
                        }).format(p.current_price_inr)}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Popular tag shortcuts */}
          <section>
            <h2 className="font-heading text-base font-semibold text-primary mb-3">
              Popular Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                'flagship',
                '5g',
                'budget',
                'gaming',
                'anc headphones',
                'ultrabook',
                'fast charging',
                'camera phone',
                '200mp',
                'apple',
                'samsung',
                'oneplus',
              ].map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:border-accent hover:text-accent hover:bg-surface-alt transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
