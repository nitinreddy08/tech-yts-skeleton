import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { fetchAllCategories, fetchCategoryBySlug } from '@/lib/data/categories'
import { filterAndSortProducts } from '@/lib/utils/filter'
import { getSpecFiltersForCategory, parseSpecFiltersFromParams } from '@/lib/utils/spec-filters'
import { getProductClickCounts } from '@/lib/data/trending'
import { getActiveDealMap } from '@/lib/data/product-deals'
import { generateCategoryMetadata, generateBreadcrumbJsonLd, generateCategoryItemListJsonLd } from '@/lib/utils/seo'
import { db } from '@/lib/mock/db'
import { CategoryProductResults } from '@/components/ui/CategoryProductResults'
import { CategoryPopularTags } from '@/components/ui/CategoryPopularTags'
import { EmptyState } from '@/components/ui/EmptyState'
import { CategoryFilterClient } from '@/components/ui/CategoryFilterClient'
import { CategoryBudgetChips } from '@/components/ui/CategoryBudgetChips'
import { SearchX, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { SortOption, ProductFilters, ProductSummary } from '@/types'

export const revalidate = 60

const CATEGORY_EMOJI: Record<string, string> = {
  smartphones: '📱',
  laptops: '💻',
  headphones: '🎧',
  tablets: '📟',
}

export async function generateStaticParams() {
  const categories = await fetchAllCategories()
  return categories.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const cat = await fetchCategoryBySlug(category)
  if (!cat) return {}
  return generateCategoryMetadata(cat.name)
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { category } = await params
  const sp = await searchParams

  const cat = await fetchCategoryBySlug(category)
  if (!cat) notFound()

  const allProductsWithSpecs = db.products
    .filter((p) => p.is_published && p.category_slug === category)
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category_id: p.category_id,
      category_slug: p.category_slug,
      brand_id: p.brand_id,
      brand_name: p.brand_name,
      thumbnail_url: p.thumbnail_url,
      creator_rating: p.creator_rating,
      current_price_inr: p.current_price_inr,
      launch_price_inr: p.launch_price_inr,
      is_featured: p.is_featured,
      is_deal_of_the_day: p.is_deal_of_the_day,
      deal_badge_text: p.deal_badge_text,
      tags: p.tags,
      youtube_video_url: p.youtube_video_url,
      created_at: p.created_at,
      specifications: p.specifications,
    }))

  const allProducts: ProductSummary[] = allProductsWithSpecs

  const brandsParam = sp.brands
  const brands = brandsParam
    ? (Array.isArray(brandsParam) ? brandsParam : brandsParam.split(','))
    : undefined

  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined
  const rating = sp.rating ? Number(sp.rating) : undefined
  const sort = (sp.sort as SortOption) ?? 'rating_desc'
  const query = typeof sp.q === 'string' ? sp.q.trim().toLowerCase() : ''
  const specFiltersParsed = parseSpecFiltersFromParams(sp)

  const filters: ProductFilters = {
    brands: brands?.length ? brands : undefined,
    priceRange:
      minPrice !== undefined && maxPrice !== undefined
        ? { min: minPrice, max: maxPrice }
        : undefined,
    rating,
    specs: Object.keys(specFiltersParsed).length > 0 ? specFiltersParsed : undefined,
  }

  let products = filterAndSortProducts(allProductsWithSpecs, filters, sort, getProductClickCounts())

  if (query) {
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand_name.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query))
    )
  }

  const availableBrands = [...new Set(allProducts.map((p) => p.brand_name))].sort()
  const specFilterDefs = getSpecFiltersForCategory(cat)
  const dealMap = getActiveDealMap()
  const emoji = CATEGORY_EMOJI[cat.slug] ?? cat.icon
  const categoryItemListLd = generateCategoryItemListJsonLd(cat.name, cat.slug, allProducts)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: cat.name, path: `/${cat.slug}` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryItemListLd) }}
      />
    <main className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={12} />
        <span className="text-primary font-medium">{cat.name}</span>
      </nav>

      {/* Page header */}
      <div className="mb-6 flex items-center gap-4 rounded-xl bg-surface-alt p-6 border border-border">
        <span className="text-4xl" role="img" aria-hidden>{emoji}</span>
        <div className="flex-1 min-w-0">
          <h1 className="font-heading text-2xl font-bold text-primary">{cat.name}</h1>
          {cat.description && <p className="text-sm text-muted mt-0.5">{cat.description}</p>}
        </div>
        <p className="hidden sm:block text-sm text-muted shrink-0">
          <span className="font-semibold text-primary">{products.length}</span> of{' '}
          {allProducts.length} products
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Suspense fallback={null}>
          <CategoryFilterClient
            categorySlug={cat.slug}
            availableBrands={availableBrands}
            specFilters={specFilterDefs}
            resultCount={products.length}
            totalCount={allProducts.length}
          />
        </Suspense>

        <div className="flex-1 min-w-0">
          <CategoryPopularTags categorySlug={cat.slug} categoryName={cat.name} />
          <Suspense fallback={null}>
            <CategoryBudgetChips categorySlug={cat.slug} />
          </Suspense>
          {products.length === 0 ? (
            <EmptyState
              icon={SearchX}
              heading={query ? `No results for "${query}"` : 'No products match'}
              description="Try adjusting your filters or search term"
              action={{ label: 'Clear Filters', href: `/${cat.slug}` }}
            />
          ) : (
            <CategoryProductResults products={products} dealMap={dealMap} />
          )}
        </div>
      </div>
    </main>
    </>
  )
}
