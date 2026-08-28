import type { Metadata } from 'next'
import { Tag } from 'lucide-react'
import { fetchAllTags } from '@/lib/data/tags'
import { TagsSearchGrid } from '@/components/ui/TagsSearchGrid'
import { siteConfig } from '@/lib/config'
import { SITE_URL } from '@/lib/utils/seo'

export const revalidate = 60

export const metadata: Metadata = {
  title: `Browse by Tag | ${siteConfig.site_name}`,
  description: 'Explore products by feature — 5G, ANC, gaming, budget picks and more.',
  alternates: { canonical: `${SITE_URL}/tags` },
}

export default async function TagsIndexPage() {
  const tags = await fetchAllTags()

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <header className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="font-heading text-3xl font-bold text-primary flex items-center justify-center gap-2 mb-3">
          <Tag size={28} className="text-accent" /> Browse by Tag
        </h1>
        <p className="text-muted">Find products by feature, use case, or tech spec.</p>
      </header>

      <TagsSearchGrid tags={tags} />
    </main>
  )
}
