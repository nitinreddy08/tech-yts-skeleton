import { ShieldCheck, GitCompare, IndianRupee, PlayCircle } from 'lucide-react'

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'Honest, creator-tested reviews' },
  { icon: IndianRupee, label: 'Best prices, tracked daily' },
  { icon: GitCompare, label: 'Compare up to 4 products' },
  { icon: PlayCircle, label: 'Video reviews' },
] as const

/** A single slim trust bar — not a full section with headings and card borders. */
export function TrustStrip() {
  return (
    <div className="border-b border-border bg-surface-alt">
      <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {TRUST_ITEMS.map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <Icon size={14} className="text-accent shrink-0" />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
