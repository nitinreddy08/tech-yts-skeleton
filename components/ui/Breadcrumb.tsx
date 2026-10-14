import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  /** Omit on the last item (the current page). */
  href?: string
}

/**
 * Page breadcrumb: a labelled <nav> with an ordered list, decorative chevrons
 * hidden from screen readers, and aria-current on the current page. Link rows
 * grow to a 44px target on touch screens only, so desktop stays compact.
 */
export function Breadcrumb({ items, className = 'mb-5' }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link href={item.href} className="inline-flex items-center hover:text-primary transition-colors pointer-coarse:min-h-11">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className="font-medium text-primary">
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight size={12} aria-hidden />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
