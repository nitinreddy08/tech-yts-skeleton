import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { fetchAllCategories, fetchCategoryBySlug } from '@/lib/data/categories'
import { filterAndSortProducts } from '@/lib/utils/filter'
import { getSpecFiltersForCategory, parseSpecFiltersFromParams } from '@/lib/utils/spec-filters'
import { getProductClickCounts } from '@/lib/data/trending'
import { getActiveDealMap } from '@/lib/data/product-deals'
import { getPopularTagsForCategory } from '@/lib/data/category-tags'
import { generateCategoryMetadata, generateBreadcrumbJsonLd, generateCategoryItemListJsonLd } from '@/lib/utils/seo'
import { productRepository } from '@/lib/repositories'
import { CategoryProductResults } from '@/components/ui/CategoryProductResults'
import { CategoryQuickFilters } from '@/components/ui/CategoryQuickFilters'
import { ListingHeader } from '@/components/ui/ListingHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { CategoryFilterClient, CategorySortSelect } from '@/components/ui/CategoryFilterClient'
import { FilterBarSkeleton } from '@/components/ui/LoadingSkeleton'
import { SearchX } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import type { Metadata } from 'next'
import type { SortOption, ProductFilters, ProductSummary } from '@/types'

export const revalidate = 60

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

  const [categoryProducts, popularTags] = await Promise.all([
    productRepository.listDetailed({ categorySlug: category }),
    getPopularTagsForCategory(category),
  ])
  const allProductsWithSpecs = categoryProducts.map((p) => ({
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
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8">
      <Breadcrumb className="mb-3 md:mb-4" items={[{ label: 'Home', href: '/' }, { label: cat.name }]} />

      <ListingHeader
        title={cat.name}
        subtitle={cat.description ?? undefined}
        count={products.length}
        actions={
          <Suspense fallback={null}>
            <CategorySortSelect categorySlug={cat.slug} />
          </Suspense>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-8">
        <Suspense fallback={<FilterBarSkeleton />}>
          <CategoryFilterClient
            categorySlug={cat.slug}
            availableBrands={availableBrands}
            specFilters={specFilterDefs}
            resultCount={products.length}
            totalCount={allProducts.length}
          />
        </Suspense>

        <div className="min-w-0 flex-1">
          {products.length === 0 ? (
            <EmptyState
              icon={SearchX}
              heading={query ? `No results for "${query}"` : 'No products match'}
              description="Try adjusting your filters or search term"
              action={{ label: 'Clear Filters', href: `/${cat.slug}` }}
            />
          ) : (
            <CategoryProductResults
              products={products}
              dealMap={dealMap}
              toolbar={
                <Suspense fallback={<div className="h-9 flex-1" aria-hidden />}>
                  <CategoryQuickFilters categorySlug={cat.slug} tags={popularTags} />
                </Suspense>
              }
            />
          )}
        </div>
      </div>
    </main>
    </>
  )
}
