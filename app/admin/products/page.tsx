import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { db } from '@/lib/mock/db'
import { CsvImportForm } from '@/components/admin/CsvImportForm'
import { ProductRowActions } from '@/components/admin/ProductRowActions'
import { AdminProductFilters } from '@/components/admin/AdminProductFilters'

const PAGE_SIZE = 20

function buildPageHref(page: number, params: { q?: string; status?: string; category?: string }) {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.status) sp.set('status', params.status)
  if (params.category) sp.set('category', params.category)
  if (page > 1) sp.set('page', String(page))
  const qs = sp.toString()
  return `/admin/products${qs ? `?${qs}` : ''}`
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt((params.page as string) ?? '1', 10) || 1)
  const q = ((params.q as string) ?? '').trim().toLowerCase()
  const status = (params.status as string) ?? ''
  const category = (params.category as string) ?? ''

  let filtered = [...db.products]

  if (q) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.brand?.name ?? '').toLowerCase().includes(q)
    )
  }

  if (status === 'published') filtered = filtered.filter((p) => p.is_published)
  if (status === 'draft') filtered = filtered.filter((p) => !p.is_published)

  if (category) {
    filtered = filtered.filter((p) => p.category?.slug === category)
  }

  const sorted = filtered.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const from = (page - 1) * PAGE_SIZE
  const products = sorted.slice(from, from + PAGE_SIZE)
  const count = sorted.length
  const totalPages = Math.ceil(count / PAGE_SIZE)

  const filterParams = { q: q || undefined, status: status || undefined, category: category || undefined }
  const categories = [...db.categories].sort((a, b) => a.display_order - b.display_order)

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-primary">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          + New Product
        </Link>
      </div>

      <Suspense fallback={null}>
        <AdminProductFilters
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
          currentQ={q}
          currentStatus={status}
          currentCategory={category}
          resultCount={count}
        />
      </Suspense>

      <div className="mb-6">
        <CsvImportForm />
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted">
            {q || status || category ? 'No products match your filters.' : 'No products yet.'}
          </p>
          {(q || status || category) && (
            <Link href="/admin/products" className="mt-2 inline-block text-sm text-accent hover:underline">
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-xl border border-border bg-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 font-medium w-16" />
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Brand</th>
                  <th className="px-4 py-3 font-medium">Rating</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-alt transition-colors">
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-12 rounded-lg border border-border bg-surface-alt overflow-hidden">
                        {p.thumbnail_url ? (
                          <Image
                            src={p.thumbnail_url}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-contain p-1"
                          />
                        ) : (
                          <div className="h-full w-full shimmer" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="group block"
                      >
                        <p className="font-medium text-primary group-hover:text-accent transition-colors">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted">{p.slug}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{p.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted">{p.brand?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted">{p.creator_rating ?? '—'}</td>
                    <td className="px-4 py-3 text-muted">
                      {p.current_price_inr != null
                        ? `₹${p.current_price_inr.toLocaleString('en-IN')}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge published={p.is_published} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ProductRowActions productId={p.id} isPublished={p.is_published} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-border bg-surface p-4 flex gap-3"
              >
                <div className="relative h-16 w-16 shrink-0 rounded-lg border border-border bg-surface-alt overflow-hidden">
                  {p.thumbnail_url ? (
                    <Image
                      src={p.thumbnail_url}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="h-full w-full shimmer" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/admin/products/${p.id}/edit`} className="min-w-0">
                      <p className="font-medium text-primary truncate">{p.name}</p>
                      <p className="text-xs text-muted truncate">{p.slug}</p>
                    </Link>
                    <StatusBadge published={p.is_published} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                    <span>{p.category?.name ?? '—'}</span>
                    <span>{p.brand?.name ?? '—'}</span>
                    {p.current_price_inr != null && (
                      <span className="font-medium text-primary">
                        ₹{p.current_price_inr.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <ProductRowActions productId={p.id} isPublished={p.is_published} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <p>
            Page {page} of {totalPages} &mdash; {count} total
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildPageHref(page - 1, filterParams)}
                className="rounded-lg border border-border px-3 py-1.5 text-primary hover:bg-surface-alt transition-colors"
              >
                ← Prev
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildPageHref(page + 1, filterParams)}
                className="rounded-lg border border-border px-3 py-1.5 text-primary hover:bg-surface-alt transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        published ? 'bg-green-100 text-green-700' : 'bg-surface-alt text-muted'
      }`}
    >
      {published ? 'Published' : 'Draft'}
    </span>
  )
}
