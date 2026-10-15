import { Package } from 'lucide-react'
import { fetchFeaturedProducts, fetchLatestProducts } from '@/lib/data/products'
import { fetchTrendingProducts } from '@/lib/data/trending'
import { getActiveDealMap } from '@/lib/data/product-deals'
import { fetchActiveDeals } from '@/lib/data/deals'
import { fetchBestOfLists } from '@/lib/data/best-of-lists'
import { fetchAllCategories } from '@/lib/data/categories'
import { EmptyState } from '@/components/ui/EmptyState'
import { Section, SectionHeader, Rail, Container } from '@/components/ui/Section'
import { HeroFinder } from '@/components/ui/HeroFinder'
import { HomeDealsPanel } from '@/components/ui/HomeDealsPanel'
import { BestOfPreviewCard } from '@/components/ui/BestOfPreviewCard'
import { HomeProductTabs } from '@/components/ui/HomeProductTabs'
import { RecentlyViewedStrip } from '@/components/ui/RecentlyViewedStrip'
import { Chip } from '@/components/ui/Chip'
import { siteConfig } from '@/lib/config'

export const revalidate = 60

export default async function HomePage() {
  const [featured, latest, deals, bestOfLists, categories, trending] = await Promise.all([
    fetchFeaturedProducts(),
    fetchLatestProducts(8),
    fetchActiveDeals(),
    fetchBestOfLists(),
    fetchAllCategories(),
    fetchTrendingProducts(8),
  ])

  const dealOfDay = deals.find((d) => d.deal_type === 'deal_of_day') ?? null
  const hotDeals = deals.filter((d) => d.deal_type !== 'deal_of_day')
  const dealMap = getActiveDealMap()
  const hasAnyProducts = featured.length > 0 || latest.length > 0 || trending.length > 0
  const picks = bestOfLists.slice(0, 3)

  return (
    <main className="flex flex-col">
      {/* Hero: headline, then two balanced cards — find a gadget | today's deals */}
      <section className="border-b border-border bg-surface-alt py-6 md:py-10">
        <Container>
          <div className="mb-4 md:mb-6">
            <h1 className="text-h1 max-w-3xl text-balance text-primary">{siteConfig.hero_heading}</h1>
            <p className="mt-1 max-w-2xl text-muted">{siteConfig.hero_subheading}</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr] lg:gap-6">
            <HeroFinder />
            <HomeDealsPanel dealOfDay={dealOfDay} deals={hotDeals} />
          </div>
        </Container>
      </section>

      {/* Phones have no category row in the header, so browsing is one chip row here. */}
      {categories.length > 0 && (
        <nav aria-label="Browse categories" className="border-b border-border md:hidden">
          <Container className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
            {categories.map((cat) => (
              <Chip key={cat.id} href={`/${cat.slug}`} size="md">
                <span aria-hidden>{cat.icon}</span> {cat.name}
              </Chip>
            ))}
          </Container>
        </nav>
      )}

      <HomeProductTabs trending={trending} featured={featured} latest={latest} dealMap={dealMap} />

      {picks.length > 0 && (
        <Section tone="alt">
          <SectionHeader
            title="Editor's picks"
            description="Curated lists for every budget"
            action={{ label: 'All guides', href: '/best-of' }}
          />
          <Rail
            className="md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] [&>*]:w-[82%] sm:[&>*]:w-[46%]"
          >
            {picks.map((list) => (
              <BestOfPreviewCard key={list.id} list={list} />
            ))}
          </Rail>
        </Section>
      )}

      <RecentlyViewedStrip />

      {!hasAnyProducts && (
        <Section>
          <EmptyState icon={Package} heading="No products yet" description="Check back soon" />
        </Section>
      )}
    </main>
  )
}
