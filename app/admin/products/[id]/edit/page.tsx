import Link from 'next/link'
import { notFound } from 'next/navigation'
import { productRepository } from '@/lib/repositories'
import { fetchAllCategories, fetchAllBrands } from '@/lib/data/categories'
import { ProductForm } from '@/components/admin/ProductForm'
import { updateProduct } from '@/app/admin/products/actions'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product, categories, brands] = await Promise.all([
    productRepository.findById(id, { includeUnpublished: true }),
    fetchAllCategories(),
    fetchAllBrands(),
  ])

  if (!product) notFound()

  const boundAction = updateProduct.bind(null, id)

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/products" className="text-sm text-white/40 hover:text-white">
          ← Products
        </Link>
        <span className="text-white/20">/</span>
        <h1 className="text-xl font-bold text-white">Edit: {product.name}</h1>
      </div>

      <ProductForm
        categories={categories}
        brands={brands}
        product={product}
        action={boundAction}
        mode="edit"
      />
    </div>
  )
}
