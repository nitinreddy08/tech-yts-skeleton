'use client'

import { Download } from 'lucide-react'
import type { NewsletterSubscriber } from '@/lib/mock/newsletter'

export function NewsletterExportButton({ subscribers }: { subscribers: NewsletterSubscriber[] }) {
  function exportCsv() {
    const rows = [
      ['email', 'subscribed_at'],
      ...subscribers.map((s) => [s.email, s.subscribed_at]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={exportCsv}
      disabled={subscribers.length === 0}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-primary hover:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download size={16} />
      Export CSV
    </button>
  )
}
