import type { Metadata } from 'next'
import { BrandsSearchGrid } from '@/components/ui/BrandsSearchGrid'
import { fetchBrandsWithCounts } from '@/lib/data/brands'
import { ListingHeader } from '@/components/ui/ListingHeader'
import { siteConfig } from '@/lib/config'
import { SITE_URL } from '@/lib/utils/seo'

export const revalidate = 60

export const metadata: Metadata = {
  title: `All Brands — Reviews & Prices | ${siteConfig.site_name}`,
  description: 'Browse every tech brand we review — Samsung, Apple, OnePlus, Sony and more. Specs, ratings and best prices in India.',
  alternates: { canonical: `${SITE_URL}/brands` },
}

export default async function BrandsIndexPage() {
  const brands = await fetchBrandsWithCounts()

  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8">
      <ListingHeader
        title="All brands"
        subtitle="Every brand we review. Pick one to see all its products, ratings and prices."
        count={brands.length}
        countLabel="brands"
      />

      <BrandsSearchGrid
        brands={brands.map((b) => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          productCount: b.productCount,
        }))}
      />
    </main>
  )
}
