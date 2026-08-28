import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight } from 'lucide-react'
import { fetchBrandBySlug, fetchProductsByBrand } from '@/lib/data/brands'
import { getActiveDealMap } from '@/lib/data/product-deals'
import { CategoryProductResults } from '@/components/ui/CategoryProductResults'
import { BrandProductResults } from '@/components/ui/BrandProductResults'
import { EmptyState } from '@/components/ui/EmptyState'
import { generateBreadcrumbJsonLd, SITE_URL } from '@/lib/utils/seo'
import { siteConfig } from '@/lib/config'
import { SearchX } from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'

export const revalidate = 60

export async function generateStaticParams() {
  const { fetchAllBrands } = await import('@/lib/data/brands')
  const brands = await fetchAllBrands()
  return brands.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const brand = await fetchBrandBySlug(slug)
  if (!brand) return {}
  return {
    title: `${brand.name} Products — Reviews & Prices | ${siteConfig.site_name}`,
    description: `All ${brand.name} phones, laptops & accessories reviewed — specs, ratings and best prices in India.`,
    alternates: { canonical: `${SITE_URL}/brand/${slug}` },
  }
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const brand = await fetchBrandBySlug(slug)
  if (!brand) notFound()

  const products = await fetchProductsByBrand(slug)
  const dealMap = getActiveDealMap()
  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: brand.name, path: `/brand/${slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <span className="text-primary font-medium">{brand.name}</span>
        </nav>

        <div className="mb-8 flex items-center gap-4 rounded-xl border border-border bg-surface-alt p-6">
          <BrandLogo name={brand.name} size="lg" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Brand</p>
            <h1 className="font-heading text-3xl font-bold text-primary">{brand.name}</h1>
            <p className="text-sm text-muted mt-2">
              {products.length} reviewed product{products.length !== 1 ? 's' : ''} — sorted by creator rating
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={SearchX}
            heading={`No ${brand.name} products yet`}
            description="Check back soon — we're always adding new reviews."
            action={{ label: 'Browse Smartphones', href: '/smartphones' }}
          />
        ) : (
          <BrandProductResults products={products} dealMap={dealMap} brandName={brand.name} />
        )}
      </main>
    </>
  )
}
