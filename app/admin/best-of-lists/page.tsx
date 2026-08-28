import Link from 'next/link'
import { Suspense } from 'react'
import { bestOfListRepository } from '@/lib/repositories'
import { BestOfListRowActions } from '@/components/admin/BestOfListRowActions'
import { AdminBestOfFilter } from '@/components/admin/AdminBestOfFilter'

export default async function AdminBestOfListsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const q = ((sp.q as string) ?? '').trim().toLowerCase()
  const status = (sp.status as string) ?? ''

  let lists = await bestOfListRepository.list({ publishedOnly: false })

  if (q) {
    lists = lists.filter(
      (l) => l.title.toLowerCase().includes(q) || l.slug.toLowerCase().includes(q)
    )
  }
  if (status === 'published') lists = lists.filter((l) => l.is_published)
  if (status === 'draft') lists = lists.filter((l) => !l.is_published)

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-primary">Best-Of Lists</h1>
        <Link
          href="/admin/best-of-lists/new"
          className="inline-flex justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          + New List
        </Link>
      </div>

      <Suspense fallback={null}>
        <AdminBestOfFilter currentQ={q} currentStatus={status} resultCount={lists.length} />
      </Suspense>

      {lists.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-6 text-sm text-muted text-center">
          {q || status ? 'No lists match your filters.' : 'No best-of lists yet.'}
        </p>
      ) : (
        <>
          <div className="hidden md:block rounded-xl border border-border bg-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lists.map((list) => (
                  <tr key={list.id} className="hover:bg-surface-alt transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/best-of-lists/${list.id}/edit`} className="font-medium text-primary hover:text-accent">
                        {list.title}
                      </Link>
                      {list.description && (
                        <p className="text-xs text-muted line-clamp-1 mt-0.5">{list.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted font-mono text-xs">{list.slug}</td>
                    <td className="px-4 py-3 text-muted">{list.items.length} picks</td>
                    <td className="px-4 py-3 text-muted">{list.display_order}</td>
                    <td className="px-4 py-3">
                      <StatusBadge published={list.is_published} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <BestOfListRowActions listId={list.id} slug={list.slug} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden flex flex-col gap-3">
            {lists.map((list) => (
              <div key={list.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-medium text-primary">{list.title}</p>
                    <p className="text-xs text-muted font-mono">{list.slug}</p>
                  </div>
                  <StatusBadge published={list.is_published} />
                </div>
                <p className="text-xs text-muted mb-3">{list.items.length} picks · order {list.display_order}</p>
                <BestOfListRowActions listId={list.id} slug={list.slug} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${published ? 'bg-green-100 text-green-700' : 'bg-surface-alt text-muted'}`}>
      {published ? 'Published' : 'Draft'}
    </span>
  )
}
