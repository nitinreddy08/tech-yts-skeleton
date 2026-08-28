import Link from 'next/link'
import { notFound } from 'next/navigation'
import { dealRepository, productRepository } from '@/lib/repositories'
import { DealForm } from '@/components/admin/DealForm'

export default async function EditDealPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [deal, products] = await Promise.all([
    dealRepository.findById(id),
    productRepository.publishedOptions(),
  ])
  if (!deal) notFound()

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/deals" className="text-sm text-white/40 hover:text-white">
          ← Deals
        </Link>
        <span className="text-white/20">/</span>
        <h1 className="text-xl font-bold text-white">Edit Deal</h1>
      </div>

      <DealForm deal={deal} products={products} />
    </div>
  )
}
