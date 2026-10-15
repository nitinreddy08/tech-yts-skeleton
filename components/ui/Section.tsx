import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/**
 * Page rhythm lives here, not in each page. Every page section uses <Section>
 * (vertical padding: 32px phones / 48px desktop), content width and gutters
 * come from <Container>, and every section title comes from <SectionHeader>.
 * That is what keeps the gaps between blocks even instead of 96px bands.
 */
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6', className)}>{children}</div>
}

interface SectionProps {
  children: React.ReactNode
  /** Full-bleed soft background (the content stays in the container). */
  tone?: 'default' | 'alt'
  /** Tighter padding, for stacked sections that belong together. */
  compact?: boolean
  className?: string
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

export function Section({ children, tone = 'default', compact = false, className, ...rest }: SectionProps) {
  return (
    <section
      {...rest}
      className={cn(
        compact ? 'py-6 md:py-8' : 'py-8 md:py-12',
        tone === 'alt' && 'border-y border-border bg-surface-alt',
        className
      )}
    >
      <Container>{children}</Container>
    </section>
  )
}

interface SectionHeaderProps {
  title: string
  description?: string
  action?: { label: string; href: string }
  id?: string
  level?: 1 | 2
  className?: string
}

export function SectionHeader({ title, description, action, id, level = 2, className }: SectionHeaderProps) {
  const Heading = level === 1 ? 'h1' : 'h2'
  return (
    <div className={cn('mb-4 flex items-end justify-between gap-4 md:mb-6', className)}>
      <div className="min-w-0">
        <Heading id={id} className="text-h2 text-primary">
          {title}
        </Heading>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-accent hover:underline"
        >
          {action.label} <ArrowRight size={14} aria-hidden />
        </Link>
      )}
    </div>
  )
}

/** Horizontal swipe rail on phones, normal grid from `md` — turns long card lists into one row. */
export function Rail({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        '-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 no-scrollbar',
        'sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0 md:pb-0',
        '[&>*]:w-[68%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-[42%] md:[&>*]:w-auto',
        className
      )}
    >
      {children}
    </div>
  )
}
