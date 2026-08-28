import Link from 'next/link'
import { notFound } from 'next/navigation'
import { bestOfListRepository, productRepository } from '@/lib/repositories'
import { BestOfListForm } from '@/components/admin/BestOfListForm'

export default async function EditBestOfListPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [list, products] = await Promise.all([
    bestOfListRepository.findById(id),
    productRepository.publishedOptions(),
  ])
  if (!list) notFound()

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/best-of-lists" className="text-sm text-white/40 hover:text-white">
          ← Best-Of Lists
        </Link>
        <span className="text-white/20">/</span>
        <h1 className="text-xl font-bold text-white">Edit List</h1>
      </div>

      <BestOfListForm list={list} products={products} />
    </div>
  )
}
