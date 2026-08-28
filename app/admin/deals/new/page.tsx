import Link from 'next/link'
import { db } from '@/lib/mock/db'
import { DealForm } from '@/components/admin/DealForm'

export default async function NewDealPage() {
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
        <h1 className="text-xl font-bold text-white">New Deal</h1>
      </div>

      <DealForm products={products} />
    </div>
  )
}
