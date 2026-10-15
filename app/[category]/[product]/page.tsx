import { notFound } from 'next/navigation'
import { fetchProductDetail, fetchProductsByCategory } from '@/lib/data/products'
import { generateProductMetadata, generateProductJsonLd, generateBreadcrumbJsonLd, generateFaqJsonLd, generateVideoObjectJsonLd, SITE_URL } from '@/lib/utils/seo'
import { PriceAlertButton } from '@/components/ui/PriceAlertButton'
import { ProductActions } from '@/components/ui/ProductActions'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { RatingBadge } from '@/components/ui/RatingBadge'
import { VideoEmbed } from '@/components/ui/VideoEmbed'
import { extractYouTubeId } from '@/lib/utils/format'
import { getBestOffer } from '@/lib/utils/best-offer'
import { ProductGallery } from '@/components/ui/ProductGallery'
import { BuySection } from '@/components/ui/BuySection'
import { SpecsTable } from '@/components/ui/SpecsTable'
import { FAQAccordion } from '@/components/ui/FAQAccordion'
import { StickyBuyBar } from '@/components/ui/StickyBuyBar'
import { UseCaseBadges } from '@/components/ui/UseCaseBadges'
import Link from 'next/link'
import { KeySpecStrip } from '@/components/ui/KeySpecStrip'
import { RecentlyViewedTracker } from '@/components/ui/RecentlyViewedTracker'
import { getAllActiveDealsForProduct } from '@/lib/data/product-deals'
import { getSpecHighlights } from '@/lib/utils/spec-highlights'
import { generatePriceHistory } from '@/lib/utils/price-history'
import { getRelatedGuidesForProduct } from '@/lib/data/related-guides'
import { getCheaperAlternatives } from '@/lib/data/alternatives'
import { tagSlug } from '@/lib/data/tags'
import { fetchProductsByBrand } from '@/lib/data/brands'
import { SpecsCopyButton } from '@/components/ui/SpecsCopyButton'
import { ReviewUpdatedBadge } from '@/components/ui/ReviewUpdatedBadge'
import { BottomLineVerdict } from '@/components/ui/BottomLineVerdict'
import { ProductOffersPanel } from '@/components/ui/ProductOffersPanel'
import { YouTubeShortEmbed } from '@/components/ui/YouTubeShortEmbed'
import { BenchmarkScores } from '@/components/ui/BenchmarkScores'
import { PriceHistoryChart } from '@/components/ui/PriceHistoryChart'
import { ProductDetailTabs, type DetailTab } from '@/components/ui/ProductDetailTabs'
import { ProductRecommendationTabs } from '@/components/ui/ProductRecommendationTabs'
import { Trophy } from 'lucide-react'
import { Chip } from '@/components/ui/Chip'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateStaticParams() {
  const { fetchFeaturedProducts } = await import('@/lib/data/products')
  const products = await fetchFeaturedProducts()
  return products.map((p) => ({ category: p.category_slug, product: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; product: string }>
}): Promise<Metadata> {
  const { category, product } = await params
  const data = await fetchProductDetail(category, product)
  if (!data) return {}
  return generateProductMetadata(data)
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; product: string }>
}) {
  const { category, product } = await params
  const p = await fetchProductDetail(category, product)
  if (!p) notFound()

  const [similar, brandSiblings] = await Promise.all([
    fetchProductsByCategory(category),
    fetchProductsByBrand(p.brand.slug),
  ])
  const similarProducts = similar.filter((x) => x.id !== p.id).slice(0, 6)
  const moreFromBrand = brandSiblings.filter((x) => x.id !== p.id).slice(0, 4)

  const jsonLd = generateProductJsonLd(p, p.affiliate_links)
  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: p.category.name, path: `/${p.category_slug}` },
    { name: p.name, path: `/${p.category_slug}/${p.slug}` },
  ])
  const youtubeId = p.youtube_video_url ? extractYouTubeId(p.youtube_video_url) : null
  const allImages = [...(p.thumbnail_url ? [p.thumbnail_url] : []), ...p.gallery_images]

  // Stock-aware: an out-of-stock store never counts as the "best" price.
  const bestPrice = getBestOffer(p.affiliate_links).price

  const shareUrl = `${SITE_URL}/${p.category_slug}/${p.slug}`
  const shareText = `${p.name} — ${p.creator_rating.toFixed(1)}/10 creator rating. See best prices in India.`
  const specHighlights = getSpecHighlights(p.category_slug, p.category.spec_template, p.specifications)
  const allDeals = getAllActiveDealsForProduct(p.id)
  const faqLd = generateFaqJsonLd(p.faqs)
  const videoLd = p.youtube_video_url
    ? generateVideoObjectJsonLd(p, p.youtube_video_url)
    : p.youtube_short_url
      ? generateVideoObjectJsonLd(p, p.youtube_short_url)
      : null
  const relatedGuides = await getRelatedGuidesForProduct(p.id)
  const cheaperAlternatives = await getCheaperAlternatives(p.id, p.category_slug, bestPrice)
  const priceHistory = generatePriceHistory({
    launchPrice: p.launch_price_inr,
    currentPrice: bestPrice,
    createdAt: p.created_at,
  })

  const detailTabs: DetailTab[] = []
  if (p.description || youtubeId || p.youtube_short_url) {
    detailTabs.push({
      id: 'review',
      label: 'Review',
      content: (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          {youtubeId && <VideoEmbed youtubeId={youtubeId} title={`${p.name} review`} />}
          <div className={`flex flex-col gap-4 ${youtubeId ? '' : 'lg:col-span-2 lg:max-w-3xl'}`}>
            {p.description && <p className="leading-relaxed text-primary/90">{p.description}</p>}
            {p.youtube_short_url && <YouTubeShortEmbed url={p.youtube_short_url} title={p.name} />}
          </div>
        </div>
      ),
    })
  }
  if (p.benchmarks) {
    detailTabs.push({
      id: 'benchmarks',
      label: 'Benchmarks',
      content: <BenchmarkScores benchmarks={p.benchmarks} productName={p.name} />,
    })
  }
  detailTabs.push({
    id: 'specs',
    label: 'Full Specs',
    content: (
      <div className="flex flex-col gap-8">
        <div>
          <div className="flex items-center justify-end mb-3">
            <SpecsCopyButton
              productName={p.name}
              specifications={p.specifications}
              template={p.category.spec_template}
            />
          </div>
          <SpecsTable specifications={p.specifications} template={p.category.spec_template} />
        </div>
        {priceHistory.length >= 2 && (
          <PriceHistoryChart points={priceHistory} productName={p.name} />
        )}
      </div>
    ),
  })
  if (p.faqs.length > 0) {
    detailTabs.push({
      id: 'faq',
      label: 'FAQ',
      content: <FAQAccordion faqs={p.faqs} />,
    })
  }

  const productSummary = {
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
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      {videoLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoLd) }}
        />
      )}

      <RecentlyViewedTracker product={productSummary} />

      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-6">
        <Breadcrumb
          className="mb-3 md:mb-4"
          items={[
            { label: 'Home', href: '/' },
            { label: p.category.name, href: `/${p.category_slug}` },
            { label: p.name },
          ]}
        />

        {/* Hero. Phones, top to bottom: title → gallery → buy box → key specs.
            Desktop: left column = gallery + key specs, right column = title + the one buy box + side actions. */}
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-x-8">
          <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-5">
            <div className="order-2 min-w-0 lg:order-1">
              <ProductGallery images={allImages} productName={p.name} />
            </div>
            <KeySpecStrip highlights={specHighlights} className="order-4 lg:order-2" />
          </div>

          <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-3">
            <header className="order-1 min-w-0 lg:mb-1">
              <Link href={`/brand/${p.brand.slug}`} className="text-sm font-medium text-muted transition-colors hover:text-accent">
                {p.brand_name}
              </Link>
              <h1 className="text-h1 mt-0.5 text-primary">{p.name}</h1>
              {p.tagline && <p className="mt-1 text-muted">{p.tagline}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <RatingBadge score={p.creator_rating} showVerdict className="text-sm" />
                <ReviewUpdatedBadge updatedAt={p.updated_at} />
              </div>
              {relatedGuides[0] && (
                <Link
                  href={`/best-of/${relatedGuides[0].slug}`}
                  className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                >
                  <Trophy size={14} aria-hidden />
                  #{relatedGuides[0].rank} pick in {relatedGuides[0].title} →
                </Link>
              )}
              <UseCaseBadges tags={p.tags} specifications={p.specifications} />
            </header>

            <div className="order-3 flex min-w-0 flex-col gap-3">
              <BuySection links={p.affiliate_links} productName={p.name} launchPrice={p.launch_price_inr} />
              {allDeals.length > 0 && <ProductOffersPanel deals={allDeals} productName={p.name} />}
              <PriceAlertButton
                productId={p.id}
                productName={p.name}
                slug={p.slug}
                categorySlug={p.category_slug}
                currentPrice={bestPrice}
              />
              <ProductActions product={productSummary} shareUrl={shareUrl} shareText={shareText} />
            </div>
          </div>
        </div>

        {(p.pros.length > 0 || p.cons.length > 0) && (
          <div id="verdict" className="mt-8 scroll-mt-28 md:mt-10">
            <BottomLineVerdict rating={p.creator_rating} pros={p.pros} cons={p.cons} />
          </div>
        )}

        <div className="mt-8 md:mt-10">
          <ProductDetailTabs tabs={detailTabs} />
        </div>

        {p.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {p.tags.map((tag) => (
              <Chip key={tag} href={`/tag/${tagSlug(tag)}`}>
                #{tag}
              </Chip>
            ))}
          </div>
        )}

        <div className="mt-8 md:mt-10">
          <ProductRecommendationTabs
            current={p}
            similar={similarProducts}
            moreFromBrand={moreFromBrand}
            brandName={p.brand_name}
            cheaperAlternatives={cheaperAlternatives}
            currentPrice={bestPrice}
            categoryName={p.category.name}
          />
        </div>
      </main>

      {/* Sticky buy bar — slides up once the buy box has scrolled out of view */}
      <StickyBuyBar
        productName={p.name}
        thumbnailUrl={p.thumbnail_url}
        links={p.affiliate_links}
      />
    </>
  )
}
