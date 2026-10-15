import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { siteConfig } from '@/lib/config'

interface LegalPageShellProps {
  title: string
  children: React.ReactNode
}

export function LegalPageShell({ title, children }: LegalPageShellProps) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 md:py-10">
      <Breadcrumb className="mb-3 md:mb-4" items={[{ label: 'Home', href: '/' }, { label: title }]} />
      <h1 className="mb-4 text-h1 text-primary md:mb-6">{title}</h1>
      {/* Body copy: tuned for the plain <p>/<h2>/<ul> these pages use (no typography plugin installed). */}
      <div className="space-y-4 text-base leading-relaxed text-neutral-900 [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
      <p className="mt-8 border-t border-border pt-4 text-xs text-muted">
        {siteConfig.site_name} · Last updated August 2026
      </p>
    </main>
  )
}
