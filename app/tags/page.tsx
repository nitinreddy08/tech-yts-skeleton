import type { Metadata } from 'next'
import { fetchAllTags } from '@/lib/data/tags'
import { TagsSearchGrid } from '@/components/ui/TagsSearchGrid'
import { ListingHeader } from '@/components/ui/ListingHeader'
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
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8">
      <ListingHeader
        title="Browse by tag"
        subtitle="Find products by feature, use case or tech spec."
        count={tags.length}
        countLabel="tags"
      />

      <TagsSearchGrid tags={tags} />
    </main>
  )
}
