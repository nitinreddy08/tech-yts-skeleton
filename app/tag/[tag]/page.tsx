import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight, Tag } from 'lucide-react'
import { fetchProductsByTag } from '@/lib/data/tags'
import { getActiveDealMap } from '@/lib/data/product-deals'
import { TagProductResults } from '@/components/ui/TagProductResults'
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
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={12} />
        <Link href="/tags" className="hover:text-primary transition-colors">Tags</Link>
        <ChevronRight size={12} />
        <span className="text-primary font-medium capitalize">{data.tag}</span>
      </nav>

      <div className="mb-8 rounded-xl border border-border bg-surface-alt p-6">
        <div className="flex items-center gap-2 mb-2">
          <Tag size={20} className="text-accent" />
          <h1 className="font-heading text-2xl font-bold text-primary capitalize">{data.tag}</h1>
        </div>
        <p className="text-sm text-muted">
          {data.products.length} reviewed product{data.products.length !== 1 ? 's' : ''} tagged &ldquo;{data.tag}&rdquo;
        </p>
      </div>

      <TagProductResults products={data.products} dealMap={dealMap} />
    </main>
  )
}
