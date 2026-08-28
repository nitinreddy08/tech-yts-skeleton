'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProduct, togglePublishProduct } from '@/app/admin/products/actions'

interface ProductRowActionsProps {
  productId: string
  isPublished: boolean
}

export function ProductRowActions({ productId, isPublished }: ProductRowActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Delete this product? This cannot be undone.')) return
    startTransition(async () => {
      await deleteProduct(productId)
      router.refresh()
    })
  }

  function handleTogglePublish() {
    startTransition(async () => {
      await togglePublishProduct(productId, isPublished)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={`/admin/products/${productId}/edit`}
        className="rounded-lg border border-border px-2.5 py-1 text-xs text-primary hover:bg-surface-alt transition-colors"
      >
        Edit
      </a>
      <button
        onClick={handleTogglePublish}
        disabled={isPending}
        className={`rounded-lg border px-2.5 py-1 text-xs transition-colors disabled:opacity-50 ${
          isPublished
            ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
            : 'border-green-300 text-green-700 hover:bg-green-50'
        }`}
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  )
}
