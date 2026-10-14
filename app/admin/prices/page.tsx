import Link from 'next/link'
import type { Metadata } from 'next'
import { AlertTriangle, PackageX, Clock, IndianRupee } from 'lucide-react'
import { getPriceHealthQueue, type PriceHealthRow } from '@/lib/admin/price-health'
import { relativePriceTime } from '@/lib/utils/price-trust'

export const metadata: Metadata = {
  title: 'Price Health | Admin',
}

const ISSUE_META: Record<
  PriceHealthRow['issue'],
  { label: string; icon: typeof AlertTriangle; className: string }
> = {
  stale: { label: 'Stale price', icon: Clock, className: 'text-amber-700 bg-amber-50 border-amber-200' },
  missing_price: { label: 'Missing price', icon: IndianRupee, className: 'text-red-700 bg-red-50 border-red-200' },
  no_links: { label: 'No store links', icon: PackageX, className: 'text-red-700 bg-red-50 border-red-200' },
  out_of_stock: { label: 'Out of stock', icon: PackageX, className: 'text-gray-600 bg-gray-50 border-gray-200' },
}

export default async function AdminPricesPage() {
  const queue = await getPriceHealthQueue()
  const grouped = queue.reduce<Record<string, PriceHealthRow[]>>((acc, row) => {
    if (!acc[row.issue]) acc[row.issue] = []
    acc[row.issue].push(row)
    return acc
  }, {})

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <header className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-primary">Price health</h1>
        <p className="text-sm text-muted mt-1">
          Products needing price refresh, missing data, or stock updates — {queue.length} issue
          {queue.length !== 1 ? 's' : ''} found
        </p>
      </header>

      {queue.length === 0 ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <p className="font-semibold text-green-800">All prices look healthy</p>
          <p className="text-sm text-green-700 mt-1">No stale or missing prices in the catalog.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {(Object.keys(ISSUE_META) as PriceHealthRow['issue'][]).map((issue) => {
            const rows = grouped[issue]
            if (!rows?.length) return null
            const meta = ISSUE_META[issue]
            const Icon = meta.icon

            return (
              <section key={issue}>
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted mb-3">
                  <Icon size={14} />
                  {meta.label} ({rows.length})
                </h2>
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-alt text-left text-xs text-muted">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Product</th>
                        <th className="px-4 py-3 font-semibold hidden sm:table-cell">Store</th>
                        <th className="px-4 py-3 font-semibold hidden md:table-cell">Last updated</th>
                        <th className="px-4 py-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((row, i) => (
                        <tr key={`${row.productId}-${row.store ?? i}`} className="bg-surface hover:bg-surface-alt/50">
                          <td className="px-4 py-3">
                            <Link
                              href={`/${row.categorySlug}/${row.slug}`}
                              className="font-medium text-primary hover:text-accent"
                              target="_blank"
                            >
                              {row.productName}
                            </Link>
                            <span
                              className={`ml-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.className}`}
                            >
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted hidden sm:table-cell">{row.store ?? '—'}</td>
                          <td className="px-4 py-3 text-muted hidden md:table-cell">
                            {row.lastUpdated ? relativePriceTime(row.lastUpdated) : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/admin/products/${row.productId}/edit`}
                              className="text-xs font-semibold text-accent hover:underline"
                            >
                              Edit prices →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
