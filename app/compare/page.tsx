import { fetchProductBySlug } from '@/lib/data/products'
import { buildSpecDiffTable } from '@/lib/utils/compare'
import { generateComparisonMetadata, generateCompareLandingMetadata, SITE_URL } from '@/lib/utils/seo'
import { CompareClient } from '@/components/ui/CompareClient'
import { CompareSuggestions } from '@/components/ui/CompareSuggestions'
import { RecentComparesStrip } from '@/components/ui/RecentComparesStrip'
import { productRepository } from '@/lib/repositories'
import type { Metadata } from 'next'
import type { ProductDetail } from '@/types'

export const revalidate = 60

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const sp = await searchParams
  const raw = sp.products
  const slugs = raw ? (Array.isArray(raw) ? raw : raw.split(',')) : []

  if (slugs.length < 2) return generateCompareLandingMetadata()

  const products = (
    await Promise.all(slugs.slice(0, 4).map((s) => fetchProductBySlug(s)))
  ).filter((p): p is NonNullable<Awaited<ReturnType<typeof fetchProductBySlug>>> => p !== null)

  const names = products.length >= 2 ? products.map((p) => p.name) : slugs
  const canonicalPath = `/compare?products=${slugs.slice(0, 4).join(',')}`
  return generateComparisonMetadata(names, canonicalPath)
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const raw = sp.products
  const slugs = raw ? (Array.isArray(raw) ? raw : raw.split(',')) : []

  const products = (
    await Promise.all(slugs.slice(0, 4).map((s) => fetchProductBySlug(s)))
  ).filter((p): p is ProductDetail => p !== null)

  const diffRows = products.length >= 2 ? buildSpecDiffTable(products) : []

  // All published products as picker options
  const publishedProducts = await productRepository.list()
  const allProductOptions = publishedProducts
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      thumbnail_url: p.thumbnail_url,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const shareUrl =
    products.length >= 2
      ? `${SITE_URL}/compare?products=${products.map((p) => p.slug).join(',')}`
      : undefined

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <CompareClient
        products={products}
        diffRows={diffRows}
        allProductOptions={allProductOptions}
        shareUrl={shareUrl}
      />
      {products.length >= 2 && (
        <div className="mt-10 pt-8 border-t border-border">
          <CompareSuggestions className="max-w-3xl mx-auto" />
        </div>
      )}
      <div className="mt-12">
        <RecentComparesStrip />
      </div>
    </main>
  )
}
