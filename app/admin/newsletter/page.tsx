import { Suspense } from 'react'
import { newsletterRepository } from '@/lib/repositories'
import { AdminNewsletterFilter } from '@/components/admin/AdminNewsletterFilter'
import { NewsletterExportButton } from '@/components/admin/NewsletterExportButton'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const q = ((sp.q as string) ?? '').trim().toLowerCase()

  const [subscribers, totalCount] = await Promise.all([
    newsletterRepository.list({ search: q || undefined }),
    newsletterRepository.count(),
  ])

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Newsletter</h1>
          <p className="text-sm text-muted mt-1">Deal alerts & new review subscribers</p>
        </div>
        <NewsletterExportButton subscribers={subscribers} />
      </div>

      <Suspense fallback={null}>
        <AdminNewsletterFilter currentQ={q} resultCount={subscribers.length} totalCount={totalCount} />
      </Suspense>

      {subscribers.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-6 text-sm text-muted text-center">
          {q ? 'No subscribers match your search.' : 'No subscribers yet — they appear when users sign up in the footer.'}
        </p>
      ) : (
        <>
          <div className="hidden md:block rounded-xl border border-border bg-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-alt text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-surface-alt/50">
                    <td className="px-4 py-3 font-medium text-primary">{s.email}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(s.subscribed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {subscribers.map((s) => (
              <div key={s.id} className="rounded-xl border border-border bg-surface p-4">
                <p className="text-sm font-medium text-primary break-all">{s.email}</p>
                <p className="text-xs text-muted mt-1">{formatDate(s.subscribed_at)}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
