import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/mock/db'
import { BestOfListForm } from '@/components/admin/BestOfListForm'

export default async function EditBestOfListPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const list = db.bestOfLists.find(l => l.id === id)
  if (!list) notFound()

  const products = db.products
    .filter(p => p.is_published)
    .map(p => ({ id: p.id, name: p.name }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const listWithItems = {
    ...list,
    items: [...list.items].sort((a, b) => a.rank - b.rank),
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/best-of-lists" className="text-sm text-white/40 hover:text-white">
          ← Best-Of Lists
        </Link>
        <span className="text-white/20">/</span>
        <h1 className="text-xl font-bold text-white">Edit List</h1>
      </div>

      <BestOfListForm list={listWithItems as any} products={products} />
    </div>
  )
}
