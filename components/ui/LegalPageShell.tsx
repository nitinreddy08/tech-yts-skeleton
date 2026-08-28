import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { siteConfig } from '@/lib/config'

interface LegalPageShellProps {
  title: string
  children: React.ReactNode
}

export function LegalPageShell({ title, children }: LegalPageShellProps) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <span className="text-primary font-medium">{title}</span>
      </nav>
      <h1 className="font-heading text-3xl font-bold text-primary mb-6">{title}</h1>
      <div className="prose prose-sm max-w-none text-muted space-y-4 leading-relaxed">{children}</div>
      <p className="mt-10 text-xs text-muted border-t border-border pt-6">
        {siteConfig.site_name} · Last updated August 2026
      </p>
    </main>
  )
}
