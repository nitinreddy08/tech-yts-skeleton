import Link from 'next/link'
import Image from 'next/image'
import { Zap, ArrowRight, Star } from 'lucide-react'
import { fetchFeaturedProducts, fetchLatestProducts } from '@/lib/data/products'
import { fetchTrendingProducts } from '@/lib/data/trending'
import { getActiveDealMap } from '@/lib/data/product-deals'
import { fetchActiveDeals } from '@/lib/data/deals'
import { fetchBestOfLists } from '@/lib/data/best-of-lists'
import { fetchAllCategories } from '@/lib/data/categories'
import { db } from '@/lib/mock/db'
import { ProductCard } from '@/components/ui/ProductCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { MotionSection } from '@/components/ui/MotionSection'
import { HeroFinder } from '@/components/ui/HeroFinder'
import { HomeDealCard } from '@/components/ui/HomeDealCard'
import { BestOfPreviewCard } from '@/components/ui/BestOfPreviewCard'
import { CategoryDiscoveryGrid } from '@/components/ui/CategoryDiscoveryGrid'
import { TrustStrip } from '@/components/ui/TrustStrip'
import { TrendingProductsStrip } from '@/components/ui/TrendingProductsStrip'
import { QuickCompareStrip } from '@/components/ui/QuickCompareStrip'
import { RecentlyViewedStrip } from '@/components/ui/RecentlyViewedStrip'
import { SavedProductsStrip } from '@/components/ui/SavedProductsStrip'
import { RecentComparesStrip } from '@/components/ui/RecentComparesStrip'
import { PopularTagsStrip } from '@/components/ui/PopularTagsStrip'
import { PopularBrandsStrip } from '@/components/ui/PopularBrandsStrip'
import { DealCountdown } from '@/components/ui/DealCountdown'
import { AffiliateOutboundLink } from '@/components/ui/AffiliateOutboundLink'
import { formatIndianPrice } from '@/lib/utils/format'
import { siteConfig } from '@/lib/config'
import { Package } from 'lucide-react'

export const revalidate = 60

function discountPercent(original: number, deal: number): number {
  return Math.round(((original - deal) / original) * 100)
}

export default async function HomePage() {
  const [featured, latest, deals, bestOfLists, categories, trending] = await Promise.all([
    fetchFeaturedProducts(),
    fetchLatestProducts(8),
    fetchActiveDeals(),
    fetchBestOfLists(),
    fetchAllCategories(),
    fetchTrendingProducts(4),
  ])

  const dealOfDay = deals.find((d) => d.deal_type === 'deal_of_day') ?? null
  const hotDeals = deals.filter((d) => d.deal_type !== 'deal_of_day').slice(0, 4)

  const productCounts = Object.fromEntries(
    categories.map((cat) => [
      cat.slug,
      db.products.filter((p) => p.is_published && p.category_slug === cat.slug).length,
    ])
  )
  const dealMap = getActiveDealMap()

  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="bg-surface-alt border-b border-border py-10 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 text-center lg:text-left">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">
              {siteConfig.site_name}
            </h1>
            <p className="text-muted mt-1">{siteConfig.tagline}</p>
          </div>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-[58%] shrink-0">
              <HeroFinder />
            </div>
            <div className="flex-1 min-w-0 rounded-xl border border-border bg-surface shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
                  <Zap size={18} className="text-accent" /> Today&apos;s Hot Deals
                </h2>
                <Link href="/deals" className="text-xs text-accent hover:underline flex items-center gap-0.5">
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              {hotDeals.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {hotDeals.map((deal) => (
                    <HomeDealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border bg-surface-alt p-3 flex flex-col gap-2">
                      <div className="h-24 w-full rounded-lg shimmer" />
                      <div className="h-3 w-3/4 rounded shimmer" />
                      <div className="h-3 w-1/2 rounded shimmer" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <TrustStrip />

      <RecentlyViewedStrip />

      <SavedProductsStrip />

      <RecentComparesStrip />

      <TrendingProductsStrip products={trending} dealMap={dealMap} />

      <CategoryDiscoveryGrid categories={categories} productCounts={productCounts} />

      <PopularTagsStrip />

      <PopularBrandsStrip />

      {/* Deal of the Day */}
      {dealOfDay && dealOfDay.product && (
        <MotionSection>
          <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/10 via-surface to-surface-alt border border-accent/15 p-6 md:p-10">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="relative h-44 w-44 shrink-0 rounded-2xl bg-surface border border-border overflow-hidden">
                  {dealOfDay.product.thumbnail_url && (
                    <Image
                      src={dealOfDay.product.thumbnail_url}
                      alt={dealOfDay.product.name}
                      fill
                      sizes="176px"
                      className="object-contain p-4"
                    />
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white mb-3">
                    <Zap size={12} /> Deal of the Day
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-primary mb-1">
                    {dealOfDay.product.name}
                  </h2>
                  {dealOfDay.headline && (
                    <p className="text-sm text-muted mb-3">{dealOfDay.headline}</p>
                  )}
                  <div className="flex flex-wrap items-baseline justify-center md:justify-start gap-3 mb-3">
                    {dealOfDay.deal_price_inr != null && (
                      <span className="text-3xl font-bold text-accent">
                        {formatIndianPrice(dealOfDay.deal_price_inr)}
                      </span>
                    )}
                    {dealOfDay.original_price_inr != null && (
                      <span className="text-sm text-muted line-through">
                        {formatIndianPrice(dealOfDay.original_price_inr)}
                      </span>
                    )}
                    {dealOfDay.original_price_inr != null && dealOfDay.deal_price_inr != null && (
                      <span className="rounded-full bg-green-100 text-green-800 px-2.5 py-0.5 text-xs font-bold">
                        {discountPercent(dealOfDay.original_price_inr, dealOfDay.deal_price_inr)}% OFF
                      </span>
                    )}
                  </div>
                  {dealOfDay.expires_at && (
                    <div className="mb-4 flex justify-center md:justify-start">
                      <DealCountdown expiresAt={dealOfDay.expires_at} />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <AffiliateOutboundLink
                      href={`/go/${dealOfDay.id}`}
                      linkId={dealOfDay.id}
                      storeName={dealOfDay.store_name}
                      productName={dealOfDay.product?.name}
                      priceInr={dealOfDay.deal_price_inr}
                      className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
                    >
                      Buy on {dealOfDay.store_name}
                    </AffiliateOutboundLink>
                    <Link
                      href={`/${dealOfDay.product.category_slug}/${dealOfDay.product.slug}`}
                      className="rounded-full border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-primary hover:border-accent transition-colors"
                    >
                      Read Review
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionSection>
      )}

      <QuickCompareStrip />

      {/* Best Of */}
      {bestOfLists.length > 0 && (
        <MotionSection className="py-16 px-4 bg-surface-alt">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-primary">Editor&apos;s Picks</h2>
                <p className="text-sm text-muted mt-1">Curated top 10 lists for every budget</p>
              </div>
              <Link href="/best-of/best-smartphones-2026" className="text-sm text-accent hover:underline hidden sm:block">
                See all lists →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bestOfLists.slice(0, 3).map((list) => (
                <BestOfPreviewCard key={list.id} list={list} />
              ))}
            </div>
          </div>
        </MotionSection>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <MotionSection className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-primary flex items-center gap-2">
                  <Star size={22} className="text-accent" /> Featured Reviews
                </h2>
                <p className="text-sm text-muted mt-1">Hand-picked by our creator team</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} activeDeal={dealMap[p.id]} />
              ))}
            </div>
          </div>
        </MotionSection>
      )}

      {/* Latest */}
      {latest.length > 0 && (
        <MotionSection className="py-16 px-4 bg-surface-alt">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-6">
              <h2 className="font-heading text-2xl font-bold text-primary">Latest Reviews</h2>
              <Link href="/search?sort=newest" className="text-sm text-accent hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {latest.map((p) => (
                <ProductCard key={p.id} product={p} activeDeal={dealMap[p.id]} />
              ))}
            </div>
          </div>
        </MotionSection>
      )}

      {featured.length === 0 && latest.length === 0 && (
        <MotionSection className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <EmptyState icon={Package} heading="No products yet" description="Check back soon" />
          </div>
        </MotionSection>
      )}
    </main>
  )
}
