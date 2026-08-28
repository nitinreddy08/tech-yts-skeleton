import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/mock/db'
import { DealForm } from '@/components/admin/DealForm'
import type { Deal } from '@/types'

export default async function EditDealPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const deal = db.deals.find(d => d.id === id)
  if (!deal) notFound()

  const products = db.products
    .filter(p => p.is_published)
    .map(p => ({ id: p.id, name: p.name }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/deals" className="text-sm text-white/40 hover:text-white">
          ← Deals
        </Link>
        <span className="text-white/20">/</span>
        <h1 className="text-xl font-bold text-white">Edit Deal</h1>
      </div>

      <DealForm deal={deal as Deal} products={products} />
    </div>
  )
}
