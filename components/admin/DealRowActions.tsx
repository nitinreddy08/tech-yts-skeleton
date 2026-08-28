'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteDeal, toggleDealActive } from '@/app/admin/deals/actions'

interface DealRowActionsProps {
  dealId: string
  isActive: boolean
}

export function DealRowActions({ dealId, isActive }: DealRowActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Delete this deal? This cannot be undone.')) return
    startTransition(async () => {
      await deleteDeal(dealId)
      router.refresh()
    })
  }

  function handleToggle() {
    startTransition(async () => {
      await toggleDealActive(dealId, isActive)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <a
        href={`/admin/deals/${dealId}/edit`}
        className="rounded-lg border border-border px-2.5 py-1 text-xs text-primary hover:bg-surface-alt transition-colors"
      >
        Edit
      </a>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={`rounded-lg border px-2.5 py-1 text-xs transition-colors disabled:opacity-50 ${
          isActive
            ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
            : 'border-green-300 text-green-700 hover:bg-green-50'
        }`}
      >
        {isActive ? 'Deactivate' : 'Activate'}
      </button>
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
