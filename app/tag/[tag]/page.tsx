import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SearchX, Tag } from 'lucide-react'
import { fetchProductsByTag } from '@/lib/data/tags'
import { getActiveDealMap } from '@/lib/data/product-deals'
import { TagProductResults } from '@/components/ui/TagProductResults'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { EmptyState } from '@/components/ui/EmptyState'
import { SITE_URL } from '@/lib/utils/seo'
import { siteConfig } from '@/lib/config'

export const revalidate = 60

export async function generateStaticParams() {
  const { fetchAllTags } = await import('@/lib/data/tags')
  const tags = await fetchAllTags()
  return tags.map((t) => ({ tag: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  const data = await fetchProductsByTag(tag)
  if (!data) return {}
  const title = `${data.tag} — Products & Reviews | ${siteConfig.site_name}`
  return {
    title,
    description: `Browse ${data.products.length} ${data.tag} products — specs, ratings and best prices in India.`,
    alternates: { canonical: `${SITE_URL}/tag/${tag}` },
  }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  const data = await fetchProductsByTag(tag)
  if (!data) notFound()

  const dealMap = getActiveDealMap()

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Tags', href: '/tags' }, { label: data.tag }]} />

      <div className="mb-8 rounded-xl border border-border bg-surface-alt p-6">
        <div className="flex items-center gap-2 mb-2">
          <Tag size={20} className="text-accent" aria-hidden />
          <h1 className="font-heading text-2xl font-bold text-primary capitalize">{data.tag}</h1>
        </div>
        <p className="text-sm text-muted">
          {data.products.length} reviewed product{data.products.length !== 1 ? 's' : ''} tagged &ldquo;{data.tag}&rdquo;
        </p>
      </div>

      {data.products.length === 0 ? (
        <EmptyState
          icon={SearchX}
          heading="No products with this tag yet"
          description="Browse another tag, or search the catalogue."
          action={{ label: 'Browse all tags', href: '/tags' }}
        />
      ) : (
        <TagProductResults products={data.products} dealMap={dealMap} />
      )}
    </main>
  )
}
