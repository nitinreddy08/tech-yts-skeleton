import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { fetchBestOfListBySlug } from '@/lib/data/best-of-lists'
import { BestOfListClient } from '@/components/ui/BestOfListClient'
import {
  SITE_URL,
  generateBestOfMetadata,
  generateBestOfItemListJsonLd,
  generateBestOfFaqJsonLd,
  generateBreadcrumbJsonLd,
} from '@/lib/utils/seo'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const list = await fetchBestOfListBySlug(slug)
  if (!list) return {}
  return generateBestOfMetadata(list)
}

export default async function BestOfListPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const list = await fetchBestOfListBySlug(slug)

  if (!list) notFound()

  const itemListLd = generateBestOfItemListJsonLd(list)
  const faqLd = generateBestOfFaqJsonLd(list)
  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Best Of', path: '/best-of' },
    { name: list.title, path: `/best-of/${slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
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
      <BestOfListClient list={list} shareUrl={`${SITE_URL}/best-of/${slug}`} />
    </>
  )
}
