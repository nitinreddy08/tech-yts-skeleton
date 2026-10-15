import { Suspense } from 'react'
import type { Metadata } from 'next'
import { fetchActiveDeals } from '@/lib/data/deals'
import { DealsClient } from '@/components/ui/DealsClient'
import { ListingHeader } from '@/components/ui/ListingHeader'
import { generateDealsMetadata, generateDealsItemListJsonLd } from '@/lib/utils/seo'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const deals = await fetchActiveDeals()
  return generateDealsMetadata(deals.length)
}

export default async function DealsPage() {
  const deals = await fetchActiveDeals()
  const dealOfDay = deals.find((d) => d.deal_type === 'deal_of_day') ?? null
  const dealsLd = generateDealsItemListJsonLd(deals)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dealsLd) }}
      />
      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8">
        <ListingHeader
          title="Deals & offers"
          subtitle="Price drops, bank offers and daily deals. Affiliate links — we may earn a commission at no extra cost to you."
          count={deals.length}
          countLabel="deals"
        />

      {/* useSearchParams (filters live in the URL) needs a Suspense boundary. */}
      <Suspense fallback={<div className="h-64 shimmer rounded-2xl" aria-hidden />}>
        <DealsClient deals={deals} dealOfDay={dealOfDay} />
      </Suspense>
      </main>
    </>
  )
}
