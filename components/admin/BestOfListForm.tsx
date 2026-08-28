'use client'

import { useActionState, useState } from 'react'
import { createList, updateList } from '@/app/admin/best-of-lists/actions'
import type { BestOfList } from '@/types'
import type { ListActionState } from '@/app/admin/best-of-lists/actions'

const INPUT =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-primary)]'
const LABEL = 'mb-1 block text-sm font-medium text-white/70'
const SECTION = 'rounded-xl border border-white/10 bg-zinc-900 p-5'

interface ListItem {
  product_id: string
  rank: number
  pick_reason: string | null
}

interface BestOfListFormProps {
  list?: BestOfList & {
    items: { id: string; product_id: string; rank: number; pick_reason: string | null }[]
  }
  products: { id: string; name: string }[]
}

function SubmitButton({ mode, pending }: { mode: 'create' | 'edit'; pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? 'Saving…' : mode === 'create' ? 'Create List' : 'Save Changes'}
    </button>
  )
}

export function BestOfListForm({ list, products }: BestOfListFormProps) {
  const mode = list ? 'edit' : 'create'
  const action = list ? updateList.bind(null, list.id) : createList
  const [state, formAction, pending] = useActionState<ListActionState, FormData>(action, {})

  const [items, setItems] = useState<ListItem[]>(
    list?.items.map((i) => ({
      product_id: i.product_id,
      rank: i.rank,
      pick_reason: i.pick_reason,
    })) ?? []
  )

  function addItem() {
    setItems((prev) => [
      ...prev,
      { product_id: products[0]?.id ?? '', rank: prev.length + 1, pick_reason: null },
    ])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof ListItem, value: string | number | null) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Hidden items JSON */}
      <input type="hidden" name="items_json" value={JSON.stringify(items)} />

      {/* Server message */}
      {state.message && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.message}
        </div>
      )}

      {/* Metadata */}
      <section className={SECTION}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
          List Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Title */}
          <div className="sm:col-span-2">
            <label htmlFor="title" className={LABEL}>
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={list?.title ?? ''}
              required
              className={INPUT}
              placeholder="Best Earbuds Under ₹5000"
            />
            {state.errors?.title && (
              <p className="mt-1 text-xs text-red-400">{state.errors.title[0]}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className={LABEL}>
              Slug <span className="text-white/30">(auto-generated if empty)</span>
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              defaultValue={list?.slug ?? ''}
              className={INPUT}
              placeholder="best-earbuds-under-5000"
            />
            {state.errors?.slug && (
              <p className="mt-1 text-xs text-red-400">{state.errors.slug[0]}</p>
            )}
          </div>

          {/* Display order */}
          <div>
            <label htmlFor="display_order" className={LABEL}>
              Display Order
            </label>
            <input
              id="display_order"
              name="display_order"
              type="number"
              min="0"
              defaultValue={list?.display_order ?? 0}
              className={INPUT}
            />
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label htmlFor="description" className={LABEL}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={list?.description ?? ''}
              className={INPUT}
              placeholder="A curated list of the best earbuds…"
            />
          </div>

          {/* Cover image URL */}
          <div className="sm:col-span-2">
            <label htmlFor="cover_image_url" className={LABEL}>
              Cover Image URL
            </label>
            <input
              id="cover_image_url"
              name="cover_image_url"
              type="url"
              defaultValue={list?.cover_image_url ?? ''}
              className={INPUT}
              placeholder="https://…"
            />
          </div>
        </div>
      </section>

      {/* Published toggle */}
      <section className={SECTION}>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="is_published"
            value="on"
            defaultChecked={list?.is_published ?? false}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          <div>
            <p className="text-sm font-medium text-white">Published</p>
            <p className="text-xs text-white/40">Unpublished lists are hidden from the public site</p>
          </div>
        </label>
      </section>

      {/* Items */}
      <section className={SECTION}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
            Items ({items.length})
          </h2>
          <button
            type="button"
            onClick={addItem}
            disabled={products.length === 0}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40"
          >
            + Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-white/30">No items yet. Click &quot;+ Add Item&quot; to start.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-lg border border-white/10 bg-white/5 p-4 sm:grid-cols-[auto_1fr_1fr_auto]"
              >
                {/* Rank */}
                <div className="flex flex-col gap-1">
                  <label htmlFor={`rank-${index}`} className={LABEL}>Rank</label>
                  <input
                    id={`rank-${index}`}
                    type="number"
                    min="1"
                    value={item.rank}
                    onChange={(e) => updateItem(index, 'rank', parseInt(e.target.value, 10) || 1)}
                    className={`${INPUT} w-20`}
                  />
                </div>

                {/* Product */}
                <div className="flex flex-col gap-1">
                  <label htmlFor={`product-${index}`} className={LABEL}>Product</label>
                  <select
                    id={`product-${index}`}
                    value={item.product_id}
                    onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                    className={`${INPUT} bg-zinc-900`}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pick reason */}
                <div className="flex flex-col gap-1">
                  <label htmlFor={`pick-reason-${index}`} className={LABEL}>Pick Reason</label>
                  <input
                    id={`pick-reason-${index}`}
                    type="text"
                    value={item.pick_reason ?? ''}
                    onChange={(e) =>
                      updateItem(index, 'pick_reason', e.target.value || null)
                    }
                    className={INPUT}
                    placeholder="Best value for money"
                  />
                </div>

                {/* Remove */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="rounded-lg border border-red-500/30 px-2.5 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 pb-8">
        <SubmitButton mode={mode} pending={pending} />
        <a href="/admin/best-of-lists" className="text-sm text-white/50 hover:text-white">
          Cancel
        </a>
      </div>
    </form>
  )
}
