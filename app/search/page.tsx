import { Suspense } from 'react'
import Link from 'next/link'
import { Search, SearchX, Sparkles } from 'lucide-react'
import { searchProductsFull } from '@/lib/data/search'
import { getSearchSuggestions } from '@/lib/data/search-suggestions'
import { fetchAllCategories } from '@/lib/data/categories'
import { fetchFeaturedProducts } from '@/lib/data/products'
import { SearchFilterBar } from '@/components/ui/SearchFilterBar'
import { FilterBarSkeleton } from '@/components/ui/LoadingSkeleton'
import { SearchResultCard } from '@/components/ui/SearchResultCard'
import { RecentSearchesStrip } from '@/components/ui/RecentSearchesStrip'
import { ProductCard } from '@/components/ui/ProductCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getActiveDealMap } from '@/lib/data/product-deals'
import { priceRangeLabel } from '@/lib/constants/price-bands'
import { POPULAR_SEARCHES } from '@/lib/constants/popular-searches'
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

  const [results, categories, featuredProducts] = await Promise.all([
    searchProductsFull(q, filters),
    fetchAllCategories(),
    fetchFeaturedProducts(),
  ])

  // Popular / suggested products for empty-query state
  const featured = featuredProducts.slice(0, 8)

  const trimmedQ = q.trim()
  const hasQuery = trimmedQ.length >= 2
  const tooShort = trimmedQ.length === 1
  const hasBrowseFilters =
    sort !== 'relevance' ||
    !!category ||
    minPrice != null ||
    maxPrice != null ||
    minRating != null
  const showCatalog = !hasQuery && hasBrowseFilters
  const showResults = (hasQuery || showCatalog) && results.length > 0
  const hasResults = results.length > 0
  const suggestions = hasQuery && !hasResults ? await getSearchSuggestions(q) : []
  const dealMap = getActiveDealMap()

  const SORT_TITLES: Record<string, string> = {
    newest: 'Newest reviews',
    popular: 'Popular products',
    rating_desc: 'Top rated',
    price_asc: 'Lowest price',
    price_desc: 'Highest price',
  }
  const categoryName = categories.find((c) => c.slug === category)?.name
  const catalogTitle = [
    categoryName ?? (SORT_TITLES[sort ?? ''] ? undefined : 'All products'),
    SORT_TITLES[sort ?? ''],
    minPrice != null || maxPrice != null ? priceRangeLabel('', minPrice ?? null, maxPrice ?? null) : undefined,
    minRating != null ? `${minRating}+ rated` : undefined,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* ── Page header: heading + an editable search box ───────────── */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary">
          {hasQuery ? (
            <>Results for &ldquo;{trimmedQ}&rdquo;</>
          ) : showCatalog ? (
            catalogTitle
          ) : (
            <span className="flex items-center gap-2">
              <Search size={22} className="text-accent" aria-hidden />
              Search
            </span>
          )}
        </h1>

        {/* Plain GET form: works without JS and keeps any active filters. */}
        <form action="/search" method="get" role="search" className="mt-4 flex max-w-2xl gap-2">
          {category && <input type="hidden" name="category" value={category} />}
          {minPrice != null && <input type="hidden" name="minPrice" value={minPrice} />}
          {maxPrice != null && <input type="hidden" name="maxPrice" value={maxPrice} />}
          {minRating != null && <input type="hidden" name="minRating" value={minRating} />}
          {sort && sort !== 'relevance' && <input type="hidden" name="sort" value={sort} />}
          <label htmlFor="page-search" className="sr-only">Search products</label>
          <Input
            id="page-search"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search phones, laptops, earbuds…"
            className="flex-1 text-base sm:text-sm"
            autoComplete="off"
            aria-describedby={tooShort ? 'search-hint' : undefined}
          />
          <Button type="submit" size="auto" className="h-11 px-5 text-sm">Search</Button>
        </form>
        {tooShort && (
          <p id="search-hint" role="status" className="mt-2 text-sm text-muted">
            Type at least 2 characters to search.
          </p>
        )}
      </div>

      {/* ── Filter bar — client island ────────────────────────────── */}
      <div className="mb-6 space-y-4">
        <Suspense fallback={<FilterBarSkeleton />}>
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

      {/* ── Filters/browse mode with nothing to show ────────────────── */}
      {showCatalog && !hasResults && (
        <EmptyState
          icon={SearchX}
          heading="No products match these filters"
          description="Try a wider price range, a lower rating, or a different category."
          action={{ label: 'Clear filters', href: '/search' }}
        />
      )}

      {/* ── No results for a query ──────────────────────────────────── */}
      {hasQuery && !hasResults && (
        <div className="flex flex-col items-center gap-6 py-12 text-center">
          <EmptyState
            icon={SearchX}
            heading={`No results for “${trimmedQ}”`}
            description="Check the spelling, try fewer or different keywords, or browse a category below."
          />

          {suggestions.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Did you mean</h2>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <Chip key={s} size="md" href={`/search?q=${encodeURIComponent(s)}`}>
                    {s}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Browse a category</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <Chip key={c.slug} size="md" href={`/${c.slug}`}>
                  <span aria-hidden>{c.icon}</span> {c.name}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Popular searches</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_SEARCHES.slice(0, 6).map((term) => (
                <Chip key={term} href={`/search?q=${encodeURIComponent(term)}`}>
                  {term}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Empty query — landing state ──────────────────────────────── */}
      {!hasQuery && !showCatalog && (
        <div className="flex flex-col gap-10">
          <section>
            <h2 className="mb-4 font-heading text-base font-semibold text-primary">Browse by category</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${c.slug}`}
                  className="flex min-h-11 flex-col items-center gap-2 rounded-xl border border-border bg-surface p-5 text-center transition-all hover:border-accent hover:shadow-sm"
                >
                  <span className="text-3xl" aria-hidden>{c.icon}</span>
                  <span className="text-sm font-medium text-primary">{c.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {featured.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 font-heading text-base font-semibold text-primary">
                <Sparkles size={16} className="text-accent" aria-hidden />
                Popular right now
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {featured.map((p) => (
                  <ProductCard key={p.id} product={p} activeDeal={dealMap[p.id]} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 font-heading text-base font-semibold text-primary">Popular searches</h2>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <Chip key={term} href={`/search?q=${encodeURIComponent(term)}`}>
                  {term}
                </Chip>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
