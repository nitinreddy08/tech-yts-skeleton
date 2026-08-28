import { ShieldCheck, GitCompare, IndianRupee, PlayCircle } from 'lucide-react'
import { siteConfig } from '@/lib/config'

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Honest Reviews',
    desc: 'Creator-tested, no paid rankings',
  },
  {
    icon: IndianRupee,
    title: 'Best Prices',
    desc: 'Tracked across Amazon, Flipkart & more',
  },
  {
    icon: GitCompare,
    title: 'Side-by-Side Compare',
    desc: 'Spec diff up to 4 products at once',
  },
  {
    icon: PlayCircle,
    title: 'Video Reviews',
    desc: 'Watch before you buy',
  },
] as const

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-surface-alt py-8 px-4">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted mb-5">
          Why {siteConfig.site_name}?
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center gap-2 rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <Icon size={20} className="text-accent" />
              </div>
              <p className="text-sm font-semibold text-primary">{title}</p>
              <p className="text-xs text-muted leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
