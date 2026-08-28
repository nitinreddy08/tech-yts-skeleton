import { notFound } from 'next/navigation'
import { fetchProductDetail, fetchProductsByCategory } from '@/lib/data/products'
import { generateProductMetadata, generateProductJsonLd, generateBreadcrumbJsonLd, generateFaqJsonLd, generateVideoObjectJsonLd, SITE_URL } from '@/lib/utils/seo'
import { PriceAlertButton } from '@/components/ui/PriceAlertButton'
import { ProductSectionNav } from '@/components/ui/ProductSectionNav'
import { SaveButton } from '@/components/ui/SaveButton'
import { ShareBar } from '@/components/ui/ShareBar'
import { extractYouTubeId, formatIndianPrice } from '@/lib/utils/format'
import { ProductGallery } from '@/components/ui/ProductGallery'
import { BuySection } from '@/components/ui/BuySection'
import { SpecsTable } from '@/components/ui/SpecsTable'
import { FAQAccordion } from '@/components/ui/FAQAccordion'
import { ProductCard } from '@/components/ui/ProductCard'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { StickyBuyBar } from '@/components/ui/StickyBuyBar'
import { UseCaseBadges } from '@/components/ui/UseCaseBadges'
import Link from 'next/link'
import { ProductComparePanel, SimilarCompareStrip } from '@/components/ui/ProductComparePanel'
import { KeySpecStrip } from '@/components/ui/KeySpecStrip'
import { RecentlyViewedTracker } from '@/components/ui/RecentlyViewedTracker'
import { RecentlyViewedStrip } from '@/components/ui/RecentlyViewedStrip'
import { getActiveDealForProduct, getAllActiveDealsForProduct } from '@/lib/data/product-deals'
import { ActiveDealBanner } from '@/components/ui/ActiveDealBanner'
import { getSpecHighlights } from '@/lib/utils/spec-highlights'
import { generatePriceHistory } from '@/lib/utils/price-history'
import { getRelatedGuidesForProduct } from '@/lib/data/related-guides'
import { getCheaperAlternatives } from '@/lib/data/alternatives'
import { tagSlug } from '@/lib/data/tags'
import { CheaperAlternativesStrip } from '@/components/ui/CheaperAlternativesStrip'
import { RelatedGuidesStrip } from '@/components/ui/RelatedGuidesStrip'
import { fetchProductsByBrand } from '@/lib/data/brands'
import { MoreFromBrandStrip } from '@/components/ui/MoreFromBrandStrip'
import { SpecsCopyButton } from '@/components/ui/SpecsCopyButton'
import { ReviewUpdatedBadge } from '@/components/ui/ReviewUpdatedBadge'
import { BottomLineVerdict } from '@/components/ui/BottomLineVerdict'
import { FrequentComparesStrip } from '@/components/ui/FrequentComparesStrip'
import { ProductOffersPanel } from '@/components/ui/ProductOffersPanel'
import { YouTubeShortEmbed } from '@/components/ui/YouTubeShortEmbed'
import { BenchmarkScores } from '@/components/ui/BenchmarkScores'
import { EmiHint } from '@/components/ui/EmiHint'
import { PriceHistoryChart } from '@/components/ui/PriceHistoryChart'
import {
  ChevronRight,
  CheckCircle,
  XCircle,
  TrendingDown,
  Star,
} from 'lucide-react'
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

  const sortedLinks = [...p.affiliate_links].sort(
    (a, b) => (a.price_inr ?? Infinity) - (b.price_inr ?? Infinity)
  )
  const bestPrice = sortedLinks.find((l) => l.price_inr != null)?.price_inr ?? null
  const launchPrice = p.launch_price_inr
  const discount =
    bestPrice && launchPrice && launchPrice > bestPrice
      ? Math.round(((launchPrice - bestPrice) / launchPrice) * 100)
      : null

  const shareUrl = `${SITE_URL}/${p.category_slug}/${p.slug}`
  const shareText = `${p.name} — ${p.creator_rating.toFixed(1)}/10 creator rating. See best prices in India.`
  const specHighlights = getSpecHighlights(p.category_slug, p.category.spec_template, p.specifications)
  const activeDeal = getActiveDealForProduct(p.id)
  const allDeals = getAllActiveDealsForProduct(p.id)
  const faqLd = generateFaqJsonLd(p.faqs)
  const videoLd = p.youtube_video_url
    ? generateVideoObjectJsonLd(p, p.youtube_video_url)
    : p.youtube_short_url
      ? generateVideoObjectJsonLd(p, p.youtube_short_url)
      : null
  const relatedGuides = await getRelatedGuidesForProduct(p.id)
  const cheaperAlternatives = getCheaperAlternatives(p.id, p.category_slug, bestPrice)
  const priceHistory = generatePriceHistory({
    launchPrice: p.launch_price_inr,
    currentPrice: bestPrice,
    createdAt: p.created_at,
  })

  const navSections: { id: string; label: string }[] = []
  if (p.pros.length > 0 || p.cons.length > 0) navSections.push({ id: 'verdict', label: 'Verdict' })
  if (p.description || youtubeId || p.youtube_short_url) navSections.push({ id: 'review', label: 'Review' })
  navSections.push({ id: 'specs', label: 'Specs' })
  if (p.faqs.length > 0) navSections.push({ id: 'faq', label: 'FAQ' })
  if (similarProducts.length > 0) navSections.push({ id: 'similar', label: 'Similar' })
  if (moreFromBrand.length > 0) navSections.push({ id: 'brand', label: p.brand_name })

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
        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link
            href={`/${p.category_slug}`}
            className="hover:text-primary transition-colors capitalize"
          >
            {p.category.name}
          </Link>
          <ChevronRight size={12} />
          <span className="truncate max-w-xs text-primary font-medium">{p.name}</span>
        </nav>

        {/* ── Page hero: title + score + price ───────────────────────────── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              <Link href={`/brand/${p.brand.slug}`} className="hover:text-accent transition-colors">
                {p.brand_name}
              </Link>
            </p>
            <h1 className="font-heading text-2xl font-bold text-primary mt-0.5 leading-tight">
              {p.name}
            </h1>
            {p.tagline && <p className="mt-1 text-sm text-muted">{p.tagline}</p>}
            <ReviewUpdatedBadge updatedAt={p.updated_at} className="mt-2" />
            {/* Use-case badges */}
            <div className="mt-3">
              <UseCaseBadges tags={p.tags} specifications={p.specifications} />
            </div>
          </div>

          {/* Score ring — desktop top-right, mobile below title */}
          <div className="shrink-0 sm:ml-6 flex flex-col items-end gap-2">
            <SaveButton product={productSummary} />
            <ScoreRing score={p.creator_rating} size={88} label="Creator Rating" />
          </div>
        </div>

        <KeySpecStrip highlights={specHighlights} className="mb-6" />

        <FrequentComparesStrip productSlug={p.slug} productName={p.name} />

        {(p.pros.length > 0 || p.cons.length > 0) && (
          <div className="mb-6">
            <BottomLineVerdict
              rating={p.creator_rating}
              pros={p.pros}
              cons={p.cons}
              productName={p.name}
            />
          </div>
        )}

        {activeDeal && <ActiveDealBanner deal={activeDeal} productName={p.name} />}

        <ProductSectionNav sections={navSections} />

        {relatedGuides.length > 0 && (
          <RelatedGuidesStrip guides={relatedGuides} productName={p.name} />
        )}

        {/* ── Two-column layout ───────────────────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-10">
            {/* Gallery */}
            <ProductGallery images={allImages} productName={p.name} />

            {/* Quick verdict bar */}
            <div className="rounded-xl border border-border bg-surface-alt p-4 flex flex-wrap gap-5">
              <div className="flex flex-col gap-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Rating</p>
                <p className="text-lg font-extrabold text-accent">{p.creator_rating.toFixed(1)}/10</p>
              </div>
              {bestPrice != null && (
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Best Price</p>
                  <p className="text-lg font-extrabold text-accent">{formatIndianPrice(bestPrice)}</p>
                </div>
              )}
              {discount != null && (
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Discount</p>
                  <p className="flex items-center gap-1 text-lg font-extrabold text-green-600">
                    <TrendingDown size={16} /> {discount}% off
                  </p>
                </div>
              )}
              {launchPrice && (
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Launch Price</p>
                  <p className="text-lg font-bold text-muted line-through">{formatIndianPrice(launchPrice)}</p>
                </div>
              )}
            </div>

            {/* Pros & Cons */}
            {(p.pros.length > 0 || p.cons.length > 0) && (
              <section id="verdict" className="scroll-mt-32">
                <h2 className="font-heading text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <Star size={18} className="text-accent" />
                  Verdict
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {p.pros.length > 0 && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-green-700 mb-3">
                        What we loved ✓
                      </p>
                      <ul className="flex flex-col gap-2.5">
                        {p.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-green-900">
                            <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {p.cons.length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-red-700 mb-3">
                        Watch out for ✗
                      </p>
                      <ul className="flex flex-col gap-2.5">
                        {p.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-red-900">
                            <XCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Creator's Review */}
            {(p.description || youtubeId || p.youtube_short_url) && (
              <section id="review" className="scroll-mt-32">
                <h2 className="font-heading text-lg font-bold text-primary mb-4">
                  Creator&apos;s Review
                </h2>
                {youtubeId && (
                  <div className="aspect-video rounded-xl overflow-hidden mb-4 border border-border">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                      title={`${p.name} Review`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                )}
                {p.description && (
                  <p className="text-sm text-muted leading-relaxed">{p.description}</p>
                )}
                {p.youtube_short_url && (
                  <div className={p.description || youtubeId ? 'mt-6' : ''}>
                    <YouTubeShortEmbed url={p.youtube_short_url} title={p.name} />
                  </div>
                )}
              </section>
            )}

            {p.benchmarks && (
              <BenchmarkScores benchmarks={p.benchmarks} productName={p.name} />
            )}

            {/* Full Specifications */}
            <section id="specs" className="scroll-mt-32">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="font-heading text-lg font-bold text-primary">Full Specifications</h2>
                <SpecsCopyButton
                  productName={p.name}
                  specifications={p.specifications}
                  template={p.category.spec_template}
                />
              </div>
              <SpecsTable specifications={p.specifications} template={p.category.spec_template} />
            </section>

            {priceHistory.length >= 2 && (
              <PriceHistoryChart points={priceHistory} productName={p.name} />
            )}

            {/* FAQ */}
            {p.faqs.length > 0 && (
              <section id="faq" className="scroll-mt-32">
                <h2 className="font-heading text-lg font-bold text-primary mb-4">
                  Ask Before You Buy
                </h2>
                <FAQAccordion faqs={p.faqs} />
              </section>
            )}

            {cheaperAlternatives.length > 0 && bestPrice != null && (
              <CheaperAlternativesStrip
                alternatives={cheaperAlternatives}
                currentPrice={bestPrice}
                categoryName={p.category.name}
              />
            )}

            {moreFromBrand.length > 0 && (
              <div id="brand" className="scroll-mt-32">
                <MoreFromBrandStrip
                  brandName={p.brand_name}
                  brandSlug={p.brand.slug}
                  products={moreFromBrand}
                />
              </div>
            )}

            {/* Similar Products */}
            {similarProducts.length > 0 && (
              <section id="similar" className="scroll-mt-32">
                <h2 className="font-heading text-lg font-bold text-primary mb-4">
                  Similar Products
                </h2>
                <SimilarCompareStrip current={p} similar={similarProducts} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {similarProducts.map((s) => (
                    <ProductCard key={s.id} product={s} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── RIGHT COLUMN — sticky ──────────────────────────────────── */}
          <div className="lg:sticky lg:top-20 flex flex-col gap-4 h-fit">
            {/* Price summary card */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  {bestPrice != null && (
                    <p className="text-2xl font-extrabold text-accent">
                      {formatIndianPrice(bestPrice)}
                    </p>
                  )}
                  {launchPrice && bestPrice && launchPrice > bestPrice && (
                    <p className="text-sm text-muted line-through">
                      {formatIndianPrice(launchPrice)}
                    </p>
                  )}
                  {bestPrice != null && <EmiHint priceInr={bestPrice} className="mt-1" />}
                </div>
                <ScoreRing score={p.creator_rating} size={64} />
              </div>

              {discount != null && (
                <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700">
                  <TrendingDown size={13} />
                  You save {discount}% vs launch price
                </div>
              )}
            </div>

            {/* Sentinel for sticky bar — placed right here so bar appears when this scrolls out */}
            <div id="buy-section-anchor" />

            {/* Store links */}
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

            <ShareBar url={shareUrl} title={p.name} text={shareText} />

            {/* Compare */}
            <ProductComparePanel product={p} />

            <RecentlyViewedStrip excludeId={p.id} variant="compact" />

            {/* Tags */}
            {p.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {p.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tag/${tagSlug(tag)}`}
                    className="rounded-full border border-border bg-surface-alt px-2.5 py-1 text-xs text-muted hover:text-primary hover:border-primary transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sticky buy bar — appears when right column scrolls out of view */}
      <StickyBuyBar
        productName={p.name}
        thumbnailUrl={p.thumbnail_url}
        bestPrice={bestPrice}
        links={p.affiliate_links}
      />
    </>
  )
}
