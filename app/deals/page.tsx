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
          <Zap size={28} className="text-accent" /> Deals & Offers
        </h1>
        <p className="text-muted mt-2 max-w-xl">
          Price drops, bank offers, and daily deals — tracked across Amazon, Flipkart and more.
          All links go through our tracker so you always get the best price.
        </p>
      </div>

      <ExpiringSoonStrip deals={expiringSoon} />

      <DealsClient deals={deals} dealOfDay={dealOfDay} />
      </main>
    </>
  )
}
