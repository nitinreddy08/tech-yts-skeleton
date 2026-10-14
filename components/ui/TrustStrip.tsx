import Link from 'next/link'
import { ShieldCheck, GitCompare, IndianRupee, PlayCircle } from 'lucide-react'

// Each claim links to the page that backs it up; the video claim has no page.
const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'Honest, creator-tested reviews', href: '/how-we-test' },
  { icon: IndianRupee, label: 'Prices compared across stores', href: '/deals' },
  { icon: GitCompare, label: 'Compare up to 4 products', href: '/compare' },
  { icon: PlayCircle, label: 'Video reviews', href: null },
] as const

/** A single slim trust bar — not a full section with headings and card borders. */
export function TrustStrip() {
  return (
    <section aria-label="Why trust us" className="border-b border-border bg-surface-alt">
      <ul className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 px-4">
        {TRUST_ITEMS.map(({ icon: Icon, label, href }) => {
          const content = (
            <>
              <Icon size={14} className="text-accent shrink-0" aria-hidden />
              {label}
            </>
          )
          const base = 'flex min-h-11 items-center gap-1.5 text-xs font-medium text-muted'
          return (
            <li key={label}>
              {href ? (
                <Link href={href} className={`${base} hover:text-primary hover:underline`}>
                  {content}
                </Link>
              ) : (
                <span className={base}>{content}</span>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
