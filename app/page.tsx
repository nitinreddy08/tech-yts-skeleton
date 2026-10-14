import Link from 'next/link'
import Image from 'next/image'
import { Zap, ArrowRight } from 'lucide-react'
import { fetchFeaturedProducts, fetchLatestProducts } from '@/lib/data/products'
import { fetchTrendingProducts } from '@/lib/data/trending'
import { getActiveDealMap } from '@/lib/data/product-deals'
import { fetchActiveDeals } from '@/lib/data/deals'
import { fetchBestOfLists } from '@/lib/data/best-of-lists'
import { fetchAllCategories } from '@/lib/data/categories'
import { productRepository } from '@/lib/repositories'
import { EmptyState } from '@/components/ui/EmptyState'
import { MotionSection } from '@/components/ui/MotionSection'
import { HeroFinder } from '@/components/ui/HeroFinder'
import { HomeDealCard } from '@/components/ui/HomeDealCard'
import { BestOfPreviewCard } from '@/components/ui/BestOfPreviewCard'
import { CategoryDiscoveryGrid } from '@/components/ui/CategoryDiscoveryGrid'
import { TrustStrip } from '@/components/ui/TrustStrip'
import { HomeProductTabs } from '@/components/ui/HomeProductTabs'
import { RecentlyViewedStrip } from '@/components/ui/RecentlyViewedStrip'
import { DealCountdown } from '@/components/ui/DealCountdown'
import { DealBuyLink } from '@/components/ui/DealBuyLink'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { formatIndianPrice } from '@/lib/utils/format'
import { siteConfig } from '@/lib/config'
import { Package } from 'lucide-react'

export const revalidate = 60

function discountPercent(original: number, deal: number): number {
  return Math.round(((original - deal) / original) * 100)
}

export default async function HomePage() {
  const [featured, latest, deals, bestOfLists, categories, trending, allPublished] = await Promise.all([
    fetchFeaturedProducts(),
    fetchLatestProducts(8),
    fetchActiveDeals(),
    fetchBestOfLists(),
    fetchAllCategories(),
    fetchTrendingProducts(8),
    productRepository.list(),
  ])

  const dealOfDay = deals.find((d) => d.deal_type === 'deal_of_day') ?? null
  const hotDeals = deals.filter((d) => d.deal_type !== 'deal_of_day').slice(0, 4)

  const productCounts: Record<string, number> = {}
  for (const p of allPublished) {
    productCounts[p.category_slug] = (productCounts[p.category_slug] ?? 0) + 1
  }
  const dealMap = getActiveDealMap()
  const hasAnyProducts = featured.length > 0 || latest.length > 0 || trending.length > 0

  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="bg-surface-alt border-b border-border py-8 md:py-10 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 text-center lg:text-left">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary text-balance">
              {siteConfig.hero_heading}
            </h1>
            <p className="text-muted mt-1 max-w-2xl mx-auto lg:mx-0">{siteConfig.hero_subheading}</p>
          </div>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-[58%] shrink-0">
              <HeroFinder />
            </div>
            <div className="flex-1 min-w-0 rounded-xl border border-border bg-surface shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
                  <Zap size={18} className="text-accent" aria-hidden /> Today&apos;s Hot Deals
                </h2>
                <Link href="/deals" className="inline-flex min-h-11 items-center gap-0.5 text-sm text-accent hover:underline">
                  View all <ArrowRight size={14} aria-hidden />
                </Link>
              </div>
              {hotDeals.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {hotDeals.map((deal) => (
                    <HomeDealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface-alt px-4 py-10 text-center">
                  <p className="text-sm font-medium text-primary">No hot deals right now</p>
                  <p className="text-sm text-muted">New price drops and bank offers land here as they go live.</p>
                  <Link href="/deals" className="inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:underline">
                    Browse all offers →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <TrustStrip />

      {/* Core navigation — what most visitors want first: "show me my category" */}
      <CategoryDiscoveryGrid categories={categories} productCounts={productCounts} />

      {/* Deal of the Day — high-urgency, kept near the top */}
      {dealOfDay && dealOfDay.product && (
        <MotionSection>
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="relative overflow-hidden rounded-2xl border border-secondary-200 bg-secondary-50 p-6 md:p-10">
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
                  <Badge variant="deal" className="mb-3">
                    <Zap size={12} aria-hidden /> Deal of the Day
                  </Badge>
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
                      <Badge variant="success">
                        {discountPercent(dealOfDay.original_price_inr, dealOfDay.deal_price_inr)}% off
                      </Badge>
                    )}
                  </div>
                  {dealOfDay.expires_at && (
                    <div className="mb-4 flex justify-center md:justify-start">
                      <DealCountdown expiresAt={dealOfDay.expires_at} />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <DealBuyLink
                      expiresAt={dealOfDay.expires_at}
                      href={`/go/${dealOfDay.id}`}
                      linkId={dealOfDay.id}
                      storeName={dealOfDay.store_name}
                      productName={dealOfDay.product?.name}
                      priceInr={dealOfDay.deal_price_inr}
                      className={buttonVariants({ variant: 'deal' })}
                    >
                      Buy on {dealOfDay.store_name}
                    </DealBuyLink>
                    <Link
                      href={`/${dealOfDay.product.category_slug}/${dealOfDay.product.slug}`}
                      className={buttonVariants({ variant: 'secondary' })}
                    >
                      Read the review
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionSection>
      )}

      {/* Trending / Top Rated / Newest — one tabbed section instead of three stacked grids */}
      <HomeProductTabs trending={trending} featured={featured} latest={latest} dealMap={dealMap} />

      {/* Best Of */}
      {bestOfLists.length > 0 && (
        <MotionSection className="py-12 px-4 bg-surface-alt">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-primary">Editor&apos;s Picks</h2>
                <p className="text-sm text-muted mt-1">Curated lists for every budget</p>
              </div>
              <Link href="/best-of" className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-accent hover:underline">
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

      <RecentlyViewedStrip />

      {!hasAnyProducts && (
        <MotionSection className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <EmptyState icon={Package} heading="No products yet" description="Check back soon" />
          </div>
        </MotionSection>
      )}
    </main>
  )
}
