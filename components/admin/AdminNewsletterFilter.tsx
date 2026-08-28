'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search } from 'lucide-react'

interface AdminNewsletterFilterProps {
  currentQ: string
  resultCount: number
  totalCount: number
}

export function AdminNewsletterFilter({ currentQ, resultCount, totalCount }: AdminNewsletterFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const update = useCallback(
    (key: string, value: string) => {
      const sp = new URLSearchParams(searchParams.toString())
      if (value) sp.set(key, value)
      else sp.delete(key)
      startTransition(() => router.push(`/admin/newsletter?${sp.toString()}`))
    },
    [router, searchParams]
  )

  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          defaultValue={currentQ}
          placeholder="Search by email…"
          className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-sm"
          onChange={(e) => update('q', e.target.value.trim())}
          disabled={pending}
        />
      </div>
      <p className="text-sm text-muted shrink-0">
        Showing <span className="font-semibold text-primary">{resultCount}</span> of{' '}
        <span className="font-semibold text-primary">{totalCount}</span> subscribers
      </p>
    </div>
  )
}
