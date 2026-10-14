import { notFound } from 'next/navigation'
import { fetchProductDetail, fetchProductsByCategory } from '@/lib/data/products'
import { generateProductMetadata, generateProductJsonLd, generateBreadcrumbJsonLd, generateFaqJsonLd, generateVideoObjectJsonLd, SITE_URL } from '@/lib/utils/seo'
import { PriceAlertButton } from '@/components/ui/PriceAlertButton'
import { ProductSectionNav } from '@/components/ui/ProductSectionNav'
import { SaveButton } from '@/components/ui/SaveButton'
import { ShareBar } from '@/components/ui/ShareBar'
import { extractYouTubeId } from '@/lib/utils/format'
import { getBestOffer } from '@/lib/utils/best-offer'
import { ProductGallery } from '@/components/ui/ProductGallery'
import { BuySection } from '@/components/ui/BuySection'
import { SpecsTable } from '@/components/ui/SpecsTable'
import { FAQAccordion } from '@/components/ui/FAQAccordion'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { StickyBuyBar } from '@/components/ui/StickyBuyBar'
import { UseCaseBadges } from '@/components/ui/UseCaseBadges'
import Link from 'next/link'
import { ProductComparePanel } from '@/components/ui/ProductComparePanel'
import { KeySpecStrip } from '@/components/ui/KeySpecStrip'
import { RecentlyViewedTracker } from '@/components/ui/RecentlyViewedTracker'
import { RecentlyViewedStrip } from '@/components/ui/RecentlyViewedStrip'
import { getAllActiveDealsForProduct } from '@/lib/data/product-deals'
import { getSpecHighlights } from '@/lib/utils/spec-highlights'
import { generatePriceHistory } from '@/lib/utils/price-history'
import { getRelatedGuidesForProduct } from '@/lib/data/related-guides'
import { getCheaperAlternatives } from '@/lib/data/alternatives'
import { getFrequentComparesForProduct } from '@/lib/data/frequent-compares'
import { tagSlug } from '@/lib/data/tags'
import { RelatedGuidesStrip } from '@/components/ui/RelatedGuidesStrip'
import { fetchProductsByBrand } from '@/lib/data/brands'
import { SpecsCopyButton } from '@/components/ui/SpecsCopyButton'
import { ReviewUpdatedBadge } from '@/components/ui/ReviewUpdatedBadge'
import { BottomLineVerdict } from '@/components/ui/BottomLineVerdict'
import { FrequentComparesStrip } from '@/components/ui/FrequentComparesStrip'
import { ProductOffersPanel } from '@/components/ui/ProductOffersPanel'
import { YouTubeShortEmbed } from '@/components/ui/YouTubeShortEmbed'
import { BenchmarkScores } from '@/components/ui/BenchmarkScores'
import { PriceHistoryChart } from '@/components/ui/PriceHistoryChart'
import { ProductDetailTabs, type DetailTab } from '@/components/ui/ProductDetailTabs'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ProductRecommendationTabs } from '@/components/ui/ProductRecommendationTabs'
import { ChevronRight } from 'lucide-react'
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
  const frequentComparePairs = await getFrequentComparesForProduct(p.slug)
  const priceHistory = generatePriceHistory({
    launchPrice: p.launch_price_inr,
    currentPrice: bestPrice,
    createdAt: p.created_at,
  })

  const navSections: { id: string; label: string }[] = []
  if (p.affiliate_links.length > 0) navSections.push({ id: 'buy-box', label: 'Prices' })
  if (p.pros.length > 0 || p.cons.length > 0) navSections.push({ id: 'verdict', label: 'Verdict' })
  navSections.push({ id: 'details', label: 'Details' })
  if (similarProducts.length > 0 || moreFromBrand.length > 0 || cheaperAlternatives.length > 0) {
    navSections.push({ id: 'similar', label: 'You Might Like' })
  }

  const detailTabs: DetailTab[] = []
  if (p.description || youtubeId || p.youtube_short_url) {
    detailTabs.push({
      id: 'review',
      label: 'Review',
      content: (
        <div className="flex flex-col gap-4">
          {youtubeId && (
            <div className="aspect-video rounded-xl overflow-hidden border border-border">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                title={`${p.name} Review`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="h-full w-full"
              />
            </div>
          )}
          {p.description && (
            <p className="text-sm text-muted leading-relaxed">{p.description}</p>
          )}
          {p.youtube_short_url && <YouTubeShortEmbed url={p.youtube_short_url} title={p.name} />}
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

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* ── Breadcrumb + save ─────────────────────────────────────────── */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex items-center gap-1.5 text-xs text-muted">
              <li className="shrink-0">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              <li aria-hidden className="shrink-0"><ChevronRight size={12} /></li>
              <li className="shrink-0">
                <Link href={`/${p.category_slug}`} className="hover:text-primary transition-colors capitalize">
                  {p.category.name}
                </Link>
              </li>
              <li aria-hidden className="shrink-0"><ChevronRight size={12} /></li>
              <li aria-current="page" className="min-w-0 truncate font-medium text-primary">{p.name}</li>
            </ol>
          </nav>
          <SaveButton product={productSummary} className="shrink-0" />
        </div>

        {/* ── Title block: name on the left, the creator's score on the right ── */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Eyebrow>
              <Link href={`/brand/${p.brand.slug}`} className="hover:text-accent transition-colors">
                {p.brand_name}
              </Link>
            </Eyebrow>
            <h1 className="font-heading text-2xl font-bold text-primary mt-0.5 leading-tight sm:text-3xl">
              {p.name}
            </h1>
            {p.tagline && <p className="mt-1 text-sm text-muted">{p.tagline}</p>}
            <ReviewUpdatedBadge updatedAt={p.updated_at} className="mt-2" />
            <div className="mt-3">
              <UseCaseBadges tags={p.tags} specifications={p.specifications} />
            </div>
          </div>

          {/* The one score on the page: ring + verdict word + "Creator Rating". */}
          {p.pros.length > 0 || p.cons.length > 0 ? (
            <a href="#verdict" className="shrink-0 rounded-xl p-1" aria-label={`Creator rating ${p.creator_rating.toFixed(1)} out of 10 — jump to the verdict`}>
              <ScoreRing score={p.creator_rating} size={80} label="Creator Rating" />
            </a>
          ) : (
            <div className="shrink-0 p-1">
              <ScoreRing score={p.creator_rating} size={80} label="Creator Rating" />
            </div>
          )}
        </div>

        {/* ── Hero: gallery + the single buy box, above the fold ─────────── */}
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_380px] lg:items-start mb-6">
          <ProductGallery images={allImages} productName={p.name} />

          <div className="flex flex-col gap-4">
            <BuySection links={p.affiliate_links} productName={p.name} launchPrice={p.launch_price_inr} />

            {allDeals.length > 0 && (
              <ProductOffersPanel deals={allDeals} productName={p.name} />
            )}

            <PriceAlertButton
              productId={p.id}
              productName={p.name}
              slug={p.slug}
              categorySlug={p.category_slug}
              currentPrice={bestPrice}
            />
          </div>
        </div>

        <KeySpecStrip highlights={specHighlights} className="mb-6" />

        <FrequentComparesStrip productName={p.name} pairs={frequentComparePairs} />

        {(p.pros.length > 0 || p.cons.length > 0) && (
          <div className="mb-6" id="verdict">
            <BottomLineVerdict
              rating={p.creator_rating}
              pros={p.pros}
              cons={p.cons}
              productName={p.name}
            />
          </div>
        )}

        <ProductSectionNav sections={navSections} />

        {relatedGuides.length > 0 && (
          <RelatedGuidesStrip guides={relatedGuides} productName={p.name} />
        )}

        {/* ── Two-column layout: deep content + secondary sidebar ─────────── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-10">
            <ProductDetailTabs tabs={detailTabs} />

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

          {/* ── RIGHT COLUMN — secondary, sticky ──────────────────────── */}
          <div className="lg:sticky lg:top-[calc(var(--navbar-height)_+_4.5rem)] flex flex-col gap-4 h-fit">
            <ShareBar url={shareUrl} title={p.name} text={shareText} />

            <ProductComparePanel product={p} />

            <RecentlyViewedStrip excludeId={p.id} variant="compact" />

            {p.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {p.tags.map((tag) => (
                  <Chip key={tag} href={`/tag/${tagSlug(tag)}`}>
                    #{tag}
                  </Chip>
                ))}
              </div>
            )}
          </div>
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
