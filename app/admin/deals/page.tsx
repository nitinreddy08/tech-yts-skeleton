import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { db } from '@/lib/mock/db'
import { DealRowActions } from '@/components/admin/DealRowActions'
import { AdminDealsFilter } from '@/components/admin/AdminDealsFilter'

export default async function AdminDealsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const q = ((sp.q as string) ?? '').trim().toLowerCase()
  const status = (sp.status as string) ?? ''
  const type = (sp.type as string) ?? ''
  const now = new Date().toISOString()

  let deals = [...db.deals].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  if (q) {
    deals = deals.filter(
      (d) =>
        d.headline.toLowerCase().includes(q) ||
        (d.product?.name ?? '').toLowerCase().includes(q) ||
        d.store_name.toLowerCase().includes(q)
    )
  }
  if (type) deals = deals.filter((d) => d.deal_type === type)

  const active = deals.filter((d) => d.is_active && (d.expires_at == null || d.expires_at > now))
  const inactive = deals.filter((d) => !d.is_active || (d.expires_at != null && d.expires_at <= now))

  const showActive = status !== 'inactive'
  const showInactive = status !== 'active'
  const resultCount = (showActive ? active.length : 0) + (showInactive ? inactive.length : 0)

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-primary">Deals</h1>
        <Link
          href="/admin/deals/new"
          className="inline-flex justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          + New Deal
        </Link>
      </div>

      <Suspense fallback={null}>
        <AdminDealsFilter
          currentQ={q}
          currentStatus={status}
          currentType={type}
          resultCount={resultCount}
        />
      </Suspense>

      {showActive && (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
            Active ({active.length})
          </h2>
          <div className="mb-8">
            {active.length === 0 ? (
              <p className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">No active deals.</p>
            ) : (
              <DealsTable deals={active} />
            )}
          </div>
        </>
      )}

      {showInactive && (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
            Inactive / Expired ({inactive.length})
          </h2>
          <div>
            {inactive.length === 0 ? (
              <p className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">No inactive deals.</p>
            ) : (
              <DealsTable deals={inactive} />
            )}
          </div>
        </>
      )}
    </div>
  )
}

function DealsTable({ deals }: { deals: (typeof db.deals) }) {
  return (
    <>
      <div className="hidden md:block rounded-xl border border-border bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 w-14" />
              <th className="px-4 py-3 font-medium">Deal</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Store</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deals.map((d) => (
              <DealRow key={d.id} deal={d} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="md:hidden flex flex-col gap-3">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
      </div>
    </>
  )
}

function DealRow({ deal: d }: { deal: (typeof db.deals)[0] }) {
  return (
    <tr className="hover:bg-surface-alt transition-colors">
      <td className="px-4 py-3">
        <div className="relative h-10 w-10 rounded-lg border border-border bg-surface-alt overflow-hidden">
          {d.product?.thumbnail_url ? (
            <Image src={d.product.thumbnail_url} alt="" fill sizes="40px" className="object-contain p-1" />
          ) : null}
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="font-medium text-primary line-clamp-2">{d.headline}</p>
        <DealPrices deal={d} />
      </td>
      <td className="px-4 py-3 text-muted">{d.product?.name ?? '—'}</td>
      <td className="px-4 py-3 text-muted capitalize">{d.deal_type.replace(/_/g, ' ')}</td>
      <td className="px-4 py-3 text-muted">{d.store_name}</td>
      <td className="px-4 py-3 text-muted">
        {d.expires_at ? new Date(d.expires_at).toLocaleDateString('en-IN') : '—'}
      </td>
      <td className="px-4 py-3"><StatusBadge active={d.is_active} /></td>
      <td className="px-4 py-3 text-right"><DealRowActions dealId={d.id} isActive={d.is_active} /></td>
    </tr>
  )
}

function DealCard({ deal: d }: { deal: (typeof db.deals)[0] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 flex gap-3">
      <div className="relative h-14 w-14 shrink-0 rounded-lg border border-border bg-surface-alt overflow-hidden">
        {d.product?.thumbnail_url ? (
          <Image src={d.product.thumbnail_url} alt="" fill sizes="56px" className="object-contain p-1" />
        ) : null}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-primary text-sm line-clamp-2">{d.headline}</p>
          <StatusBadge active={d.is_active} />
        </div>
        <p className="text-xs text-muted mt-1">{d.product?.name}</p>
        <DealPrices deal={d} />
        <div className="mt-2 flex justify-end">
          <DealRowActions dealId={d.id} isActive={d.is_active} />
        </div>
      </div>
    </div>
  )
}

function DealPrices({ deal: d }: { deal: (typeof db.deals)[0] }) {
  if (d.deal_price_inr == null) return null
  return (
    <p className="text-xs text-muted mt-0.5">
      ₹{d.deal_price_inr.toLocaleString('en-IN')}
      {d.original_price_inr != null && (
        <span className="ml-1 line-through">₹{d.original_price_inr.toLocaleString('en-IN')}</span>
      )}
    </p>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${active ? 'bg-green-100 text-green-700' : 'bg-surface-alt text-muted'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}
