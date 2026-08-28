import type { Metadata } from 'next'
import type { WithContext, Product as SchemaProduct, BreadcrumbList } from 'schema-dts'
import type { ProductDetail, AffiliateLink, FAQ, Deal } from '@/types'
import { siteConfig } from '@/lib/config'
import { extractYouTubeId } from '@/lib/utils/format'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'

export function generateProductMetadata(product: ProductDetail): Metadata {
  const title = `${product.name} Review & Price in India | ${siteConfig.site_name}`
  const description =
    product.description ??
    `${product.name} specs, price, and review by ${siteConfig.creator_name}. Buy at the best price in India.`
  const canonicalUrl = `${SITE_URL}/${product.category_slug}/${product.slug}`

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteConfig.site_name,
      images: product.thumbnail_url ? [{ url: product.thumbnail_url, alt: product.name }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.thumbnail_url ? [product.thumbnail_url] : [],
    },
  }
}

export function generateProductJsonLd(
  product: ProductDetail,
  affiliateLinks: AffiliateLink[]
): WithContext<SchemaProduct> {
  const offers = affiliateLinks.map((link) => ({
    '@type': 'Offer' as const,
    url: `${SITE_URL}/go/${link.id}`,
    priceCurrency: 'INR',
    price: link.price_inr?.toString() ?? '0',
    seller: { '@type': 'Organization' as const, name: link.store_name },
    availability: 'https://schema.org/InStock',
  }))

  const jsonLd: WithContext<SchemaProduct> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    image: product.thumbnail_url || undefined,
    brand: { '@type': 'Brand', name: product.brand_name },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.creator_rating.toString(),
      bestRating: '10',
      worstRating: '0',
      reviewCount: '1',
    },
    offers: offers as any,
  }

  if (product.youtube_video_url) {
    ;(jsonLd as any).review = {
      '@type': 'Review',
      author: { '@type': 'Person', name: product.brand_name },
      reviewBody: product.description ?? '',
    }
  }

  return jsonLd
}

export function generateCategoryMetadata(categoryName: string): Metadata {
  const title = `Best ${categoryName} in India 2026 — Reviews & Prices | ${siteConfig.site_name}`
  const description = `Browse the best ${categoryName} in India. Compare specs, prices, and read expert reviews by ${siteConfig.creator_name}.`
  const canonicalUrl = `${SITE_URL}/${categoryName.toLowerCase().replace(/\s+/g, '-')}`

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description, url: canonicalUrl, siteName: siteConfig.site_name },
    twitter: { card: 'summary', title, description },
  }
}

export function generateComparisonMetadata(
  productNames: string[],
  canonicalPath?: string
): Metadata {
  const title = `${productNames.join(' vs ')} — Full Comparison | ${siteConfig.site_name}`
  const description = `Compare ${productNames.join(' vs ')} side-by-side. Full specs, prices, and verdict by ${siteConfig.creator_name}.`
  const canonicalUrl = canonicalPath ? `${SITE_URL}${canonicalPath}` : undefined

  return {
    title,
    description,
    ...(canonicalUrl ? { alternates: { canonical: canonicalUrl } } : {}),
    openGraph: {
      title,
      description,
      siteName: siteConfig.site_name,
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
    },
    twitter: { card: 'summary', title, description },
  }
}

export function generateCompareLandingMetadata(): Metadata {
  const title = `Compare Products — Side-by-Side Specs | ${siteConfig.site_name}`
  const description = `Compare up to 4 phones, laptops or headphones side-by-side. Specs, prices, and creator ratings for India.`
  const canonicalUrl = `${SITE_URL}/compare`

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description, url: canonicalUrl, siteName: siteConfig.site_name },
    twitter: { card: 'summary', title, description },
  }
}

export function generateCategoryItemListJsonLd(
  categoryName: string,
  categorySlug: string,
  products: { name: string; slug: string; category_slug: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${categoryName} in India`,
    description: `Reviewed ${categoryName.toLowerCase()} with specs, ratings and prices.`,
    url: `${SITE_URL}/${categorySlug}`,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `${SITE_URL}/${p.category_slug}/${p.slug}`,
    })),
  }
}

export function generateWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.site_name,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateVideoObjectJsonLd(product: ProductDetail, videoUrl: string) {
  const id = extractYouTubeId(videoUrl)
  if (!id) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: `${product.name} Review`,
    description: product.description ?? `${product.name} hands-on review`,
    thumbnailUrl: product.thumbnail_url ?? undefined,
    uploadDate: product.updated_at,
    contentUrl: videoUrl,
    embedUrl: `https://www.youtube.com/embed/${id}`,
  }
}

export function generateBreadcrumbJsonLd(
  items: { name: string; path: string }[]
): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

export function generateFaqJsonLd(faqs: FAQ[]) {
  if (faqs.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function generateBestOfMetadata(list: { title: string; description: string; slug: string; cover_image_url: string | null }) {
  const title = `${list.title} | ${siteConfig.site_name}`
  const description = list.description || `Our top picks for ${list.title.toLowerCase()} — tested and ranked for India.`
  const canonicalUrl = `${SITE_URL}/best-of/${list.slug}`

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteConfig.site_name,
      images: list.cover_image_url ? [{ url: list.cover_image_url, alt: list.title }] : [],
      type: 'article' as const,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: list.cover_image_url ? [list.cover_image_url] : [],
    },
  }
}

export function generateBestOfFaqJsonLd(
  list: {
    title: string
    description: string
    items: { rank: number; pick_reason: string | null; product?: { name: string } | null }[]
  }
) {
  const top = list.items.find((i) => i.rank === 1)

  const faqs: { question: string; answer: string }[] = [
    {
      question: `What is the best pick in ${list.title}?`,
      answer: top?.product
        ? `Our #1 pick is ${top.product.name}. ${top.pick_reason ?? list.description}`
        : list.description,
    },
    {
      question: 'How does TechReviews rank products on this list?',
      answer: `Every product was hands-on tested. We rank by creator rating, real-world performance, and value at current Indian retail prices. ${siteConfig.creator_name || 'Our team'} does not accept payment for placement.`,
    },
  ]

  const valuePick = list.items.find(
    (i) =>
      i.pick_reason?.toLowerCase().includes('value') ||
      i.pick_reason?.toLowerCase().includes('budget')
  )
  if (valuePick?.product) {
    faqs.push({
      question: 'What is the best value pick on this list?',
      answer: `${valuePick.product.name} — ${valuePick.pick_reason ?? 'Strong specs for the price.'}`,
    })
  }

  return generateFaqJsonLd(
    faqs.map((f, i) => ({
      id: `bestof-faq-${i}`,
      product_id: '',
      question: f.question,
      answer: f.answer,
      display_order: i,
    }))
  )
}

export function generateBestOfItemListJsonLd(
  list: { title: string; description: string; slug: string; items: { rank: number; product?: { name: string; slug: string; category_slug: string } | null }[] }
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: list.title,
    description: list.description,
    url: `${SITE_URL}/best-of/${list.slug}`,
    numberOfItems: list.items.length,
    itemListElement: list.items
      .filter((item) => item.product)
      .map((item) => ({
        '@type': 'ListItem',
        position: item.rank,
        name: item.product!.name,
        url: `${SITE_URL}/${item.product!.category_slug}/${item.product!.slug}`,
      })),
  }
}

export function generateDealsMetadata(activeCount: number): Metadata {
  const title = `Deals & Offers — Price Drops & Daily Deals | ${siteConfig.site_name}`
  const description = `${activeCount} active tech deals in India — price drops, bank offers, and deal of the day across Amazon, Flipkart and more.`
  const canonicalUrl = `${SITE_URL}/deals`

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteConfig.site_name,
      type: 'website',
    },
    twitter: { card: 'summary', title, description },
  }
}

export function generateDealsItemListJsonLd(deals: Deal[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Tech Deals & Offers',
    description: 'Active price drops and deals tracked by TechReviews India.',
    url: `${SITE_URL}/deals`,
    numberOfItems: deals.length,
    itemListElement: deals
      .filter((d) => d.product)
      .map((d, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: d.headline || d.product!.name,
        url: `${SITE_URL}/${d.product!.category_slug}/${d.product!.slug}`,
      })),
  }
}
