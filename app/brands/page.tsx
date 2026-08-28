import type { Metadata } from 'next'
import { BrandsSearchGrid } from '@/components/ui/BrandsSearchGrid'
import { fetchBrandsWithCounts } from '@/lib/data/brands'
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
    <main className="max-w-7xl mx-auto px-4 py-10">
      <header className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-3">
          All Brands
        </h1>
        <p className="text-muted leading-relaxed">
          Every brand we review — phones, laptops, audio and more. Pick a brand to see all products, ratings and prices.
        </p>
      </header>

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
