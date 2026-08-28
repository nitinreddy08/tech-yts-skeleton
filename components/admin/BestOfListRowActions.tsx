'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteList } from '@/app/admin/best-of-lists/actions'

interface BestOfListRowActionsProps {
  listId: string
  slug: string
}

export function BestOfListRowActions({ listId, slug }: BestOfListRowActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Delete this list and all its items? This cannot be undone.')) return
    startTransition(async () => {
      await deleteList(listId)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <a
        href={`/admin/best-of-lists/${listId}/edit`}
        className="rounded-lg border border-border px-2.5 py-1 text-xs text-primary hover:bg-surface-alt transition-colors"
      >
        Edit
      </a>
      <a
        href={`/best-of/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-border px-2.5 py-1 text-xs text-primary hover:bg-surface-alt transition-colors"
      >
        View
      </a>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  )
}
