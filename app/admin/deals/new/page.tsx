import Link from 'next/link'
import { productRepository } from '@/lib/repositories'
import { DealForm } from '@/components/admin/DealForm'

export default async function NewDealPage() {
  const products = await productRepository.publishedOptions()

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
