import { Suspense } from 'react'
import { Zap } from 'lucide-react'
import type { Metadata } from 'next'
import { fetchActiveDeals, fetchExpiringSoonDeals } from '@/lib/data/deals'
import { DealsClient } from '@/components/ui/DealsClient'
import { ExpiringSoonStrip } from '@/components/ui/ExpiringSoonStrip'
import { generateDealsMetadata, generateDealsItemListJsonLd } from '@/lib/utils/seo'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const deals = await fetchActiveDeals()
  return generateDealsMetadata(deals.length)
}

export default async function DealsPage() {
  const [deals, expiringSoon] = await Promise.all([
    fetchActiveDeals(),
    fetchExpiringSoonDeals(48),
  ])
  const dealOfDay = deals.find((d) => d.deal_type === 'deal_of_day') ?? null
  const dealsLd = generateDealsItemListJsonLd(deals)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dealsLd) }}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary flex items-center gap-2">
          <Zap size={28} className="text-accent" aria-hidden /> Deals &amp; Offers
        </h1>
        <p className="text-muted mt-2 max-w-xl">
          Price drops, bank offers and daily deals across Amazon, Flipkart and more. Links are
          affiliate links — we may earn a commission at no extra cost to you.
        </p>
      </div>

      {/* The featured deal already has the hero below; don't repeat it here. */}
      <ExpiringSoonStrip deals={expiringSoon.filter((d) => d.id !== dealOfDay?.id)} />

      {/* useSearchParams (filters live in the URL) needs a Suspense boundary. */}
      <Suspense fallback={<div className="h-64 shimmer rounded-2xl" aria-hidden />}>
        <DealsClient deals={deals} dealOfDay={dealOfDay} />
      </Suspense>
      </main>
    </>
  )
}
