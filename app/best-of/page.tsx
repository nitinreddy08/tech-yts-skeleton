import { Trophy, GitCompare, ShieldCheck, ArrowRight } from 'lucide-react'
import { fetchBestOfLists } from '@/lib/data/best-of-lists'
import { fetchAllCategories } from '@/lib/data/categories'
import { BestOfPreviewCard } from '@/components/ui/BestOfPreviewCard'
import { Badge } from '@/components/ui/Badge'
import { Chip } from '@/components/ui/Chip'
import { EmptyState } from '@/components/ui/EmptyState'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { siteConfig } from '@/lib/config'

export const revalidate = 60

export const metadata = {
  title: "Editor's Guides — Best Of Lists",
  description: `Curated product picks by ${siteConfig.site_name}. Honest rankings for every budget.`,
}

export default async function BestOfIndexPage() {
  const [lists, categories] = await Promise.all([
    fetchBestOfLists(),
    fetchAllCategories(),
  ])

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* Hero */}
      <header className="mb-12 text-center max-w-2xl mx-auto">
        <Breadcrumb className="mb-4 flex justify-center" items={[{ label: 'Home', href: '/' }, { label: "Editor's Guides" }]} />
        <Badge variant="accent" className="mb-4">
          <Trophy size={12} aria-hidden /> Editor&apos;s Guides
        </Badge>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
          Best Of Lists
        </h1>
        <p className="text-muted leading-relaxed">
          Hand-tested rankings for every category and budget. No sponsored picks —
          just honest recommendations from {siteConfig.creator_name || 'our creator team'}.
        </p>
      </header>

      {/* Trust row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {[
          { icon: ShieldCheck, title: 'Tested hands-on', desc: 'Every product reviewed in real use' },
          { icon: Trophy, title: 'Clear rankings', desc: 'Best overall, value, and runner-up picks' },
          { icon: GitCompare, title: 'Compare any pick', desc: 'Side-by-side spec diff in one click' },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-xl border border-border bg-surface-alt p-4"
          >
            <Icon size={20} className="text-accent shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-primary">{title}</p>
              <p className="text-xs text-muted mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lists grid */}
      {lists.length > 0 ? (
        <section>
          <h2 className="font-heading text-xl font-bold text-primary mb-6">
            All guides
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => (
              <BestOfPreviewCard key={list.id} list={list} />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          icon={Trophy}
          heading="No guides published yet"
          description="Check back soon — new editor's guides land here as they're published."
          action={{ label: 'Browse all products', href: '/search' }}
        />
      )}

      {/* Browse by category CTA */}
      <section className="mt-16 rounded-2xl border border-border bg-surface-alt p-8 text-center">
        <h2 className="font-heading text-xl font-bold text-primary mb-2">
          Browse all reviewed products
        </h2>
        <p className="text-sm text-muted mb-6">
          Explore full reviews with specs, pros/cons, and best prices
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <Chip key={cat.slug} size="md" href={`/${cat.slug}`}>
              <span aria-hidden>{cat.icon}</span>
              {cat.name}
              <ArrowRight size={12} className="text-muted" aria-hidden />
            </Chip>
          ))}
        </div>
      </section>
    </main>
  )
}
