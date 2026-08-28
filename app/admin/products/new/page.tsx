import Link from 'next/link'
import { fetchAllCategories, fetchAllBrands } from '@/lib/data/categories'
import { ProductForm } from '@/components/admin/ProductForm'
import { createProduct } from '@/app/admin/products/actions'

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    fetchAllCategories(),
    fetchAllBrands(),
  ])

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/products" className="text-sm text-white/40 hover:text-white">
          ← Products
        </Link>
        <span className="text-white/20">/</span>
        <h1 className="text-xl font-bold text-white">New Product</h1>
      </div>

      <ProductForm
        categories={categories}
        brands={brands}
        action={createProduct}
        mode="create"
      />
    </div>
  )
}
