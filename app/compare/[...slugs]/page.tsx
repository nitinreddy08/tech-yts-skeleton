import { notFound } from 'next/navigation'
import { fetchProductBySlug } from '@/lib/data/products'
import { buildSpecDiffTable } from '@/lib/utils/compare'
import { generateComparisonMetadata, generateCompareLandingMetadata, SITE_URL } from '@/lib/utils/seo'
import { CompareClient } from '@/components/ui/CompareClient'
import { productRepository } from '@/lib/repositories'
import type { Metadata } from 'next'
import type { ProductDetail } from '@/types'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slugs: string[] }>
}): Promise<Metadata> {
  const { slugs } = await params
  const productSlugs = slugs.join('/').split('-vs-')

  if (productSlugs.length < 2) return generateCompareLandingMetadata()

  const products = (
    await Promise.all(productSlugs.slice(0, 4).map((s) => fetchProductBySlug(s)))
  ).filter((p): p is NonNullable<Awaited<ReturnType<typeof fetchProductBySlug>>> => p !== null)

  const names = products.length >= 2 ? products.map((p) => p.name) : productSlugs
  const canonicalPath = `/compare/${productSlugs.slice(0, 4).join('-vs-')}`
  return generateComparisonMetadata(names, canonicalPath)
}

export default async function DirectComparePage({
  params,
}: {
  params: Promise<{ slugs: string[] }>
}) {
  const { slugs } = await params
  const productSlugs = slugs.join('/').split('-vs-')

  if (productSlugs.length < 2) notFound()

  const products = (
    await Promise.all(productSlugs.slice(0, 4).map((s) => fetchProductBySlug(s)))
  ).filter((p): p is ProductDetail => p !== null)

  if (products.length < 2) notFound()

  const requested = productSlugs.slice(0, 4)
  const missingSlugs = requested.filter((slug) => !products.some((p) => p.slug === slug))

  const diffRows = buildSpecDiffTable(products)

  const publishedProducts = await productRepository.list()
  const allProductOptions = publishedProducts
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      thumbnail_url: p.thumbnail_url,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const shareUrl = `${SITE_URL}/compare/${productSlugs.slice(0, 4).join('-vs-')}`

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <CompareClient
        products={products}
        diffRows={diffRows}
        allProductOptions={allProductOptions}
        shareUrl={shareUrl}
        missingSlugs={missingSlugs}
      />
    </main>
  )
}
