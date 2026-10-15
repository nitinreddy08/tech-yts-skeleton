import { Trophy } from 'lucide-react'
import { fetchBestOfLists } from '@/lib/data/best-of-lists'
import { BestOfPreviewCard } from '@/components/ui/BestOfPreviewCard'
import { ListingHeader } from '@/components/ui/ListingHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { siteConfig } from '@/lib/config'

export const revalidate = 60

export const metadata = {
  title: "Editor's Guides — Best Of Lists",
  description: `Curated product picks by ${siteConfig.site_name}. Honest rankings for every budget.`,
}

export default async function BestOfIndexPage() {
  const lists = await fetchBestOfLists()

  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8">
      <Breadcrumb className="mb-3 md:mb-4" items={[{ label: 'Home', href: '/' }, { label: "Editor's guides" }]} />
      <ListingHeader
        title="Editor's guides"
        subtitle={`Hand-tested rankings for every category and budget. No sponsored picks — just honest recommendations from ${siteConfig.creator_name || 'our creator team'}.`}
        count={lists.length}
        countLabel="guides"
      />

      {lists.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {lists.map((list) => (
            <BestOfPreviewCard key={list.id} list={list} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Trophy}
          heading="No guides published yet"
          description="Check back soon — new editor's guides land here as they're published."
          action={{ label: 'Browse all products', href: '/search' }}
        />
      )}
    </main>
  )
}
