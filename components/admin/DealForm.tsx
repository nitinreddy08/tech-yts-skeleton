'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createDeal, updateDeal } from '@/app/admin/deals/actions'
import type { Deal } from '@/types'
import type { DealActionState } from '@/app/admin/deals/actions'

const DEAL_TYPES = [
  { value: 'deal_of_day', label: 'Deal of the Day' },
  { value: 'price_drop', label: 'Price Drop' },
  { value: 'upcoming_sale', label: 'Upcoming Sale' },
  { value: 'bank_offer', label: 'Bank Offer' },
  { value: 'sale_event', label: 'Sale Event' },
  { value: 'coupon', label: 'Coupon' },
]

const INPUT =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-primary)]'
const LABEL = 'mb-1 block text-sm font-medium text-white/70'
const SECTION = 'rounded-xl border border-white/10 bg-zinc-900 p-5'

interface DealFormProps {
  deal?: Deal
  products: { id: string; name: string }[]
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  // datetime-local expects "YYYY-MM-DDTHH:mm"
  return iso.slice(0, 16)
}

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? 'Saving…' : mode === 'create' ? 'Create Deal' : 'Save Changes'}
    </button>
  )
}

export function DealForm({ deal, products }: DealFormProps) {
  const mode = deal ? 'edit' : 'create'
  const action = deal ? updateDeal.bind(null, deal.id) : createDeal
  const [state, formAction] = useActionState<DealActionState, FormData>(action, {})

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Server message */}
      {state.message && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.message}
        </div>
      )}

      <section className={SECTION}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
          Deal Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Product */}
          <div className="sm:col-span-2">
            <label htmlFor="product_id" className={LABEL}>
              Product *
            </label>
            <select
              id="product_id"
              name="product_id"
              defaultValue={deal?.product_id ?? ''}
              required
              className={`${INPUT} bg-zinc-900`}
            >
              <option value="">— Select product —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {state.errors?.product_id && (
              <p className="mt-1 text-xs text-red-400">{state.errors.product_id[0]}</p>
            )}
          </div>

          {/* Deal type */}
          <div>
            <label htmlFor="deal_type" className={LABEL}>
              Deal Type *
            </label>
            <select
              id="deal_type"
              name="deal_type"
              defaultValue={deal?.deal_type ?? ''}
              required
              className={`${INPUT} bg-zinc-900`}
            >
              <option value="">— Select type —</option>
              {DEAL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {state.errors?.deal_type && (
              <p className="mt-1 text-xs text-red-400">{state.errors.deal_type[0]}</p>
            )}
          </div>

          {/* Store name */}
          <div>
            <label htmlFor="store_name" className={LABEL}>
              Store Name *
            </label>
            <input
              id="store_name"
              name="store_name"
              type="text"
              defaultValue={deal?.store_name ?? ''}
              required
              className={INPUT}
              placeholder="Amazon"
            />
            {state.errors?.store_name && (
              <p className="mt-1 text-xs text-red-400">{state.errors.store_name[0]}</p>
            )}
          </div>

          {/* Headline */}
          <div className="sm:col-span-2">
            <label htmlFor="headline" className={LABEL}>
              Headline *
            </label>
            <input
              id="headline"
              name="headline"
              type="text"
              defaultValue={deal?.headline ?? ''}
              required
              className={INPUT}
              placeholder="Get 20% off on iPhone 16 Pro"
            />
            {state.errors?.headline && (
              <p className="mt-1 text-xs text-red-400">{state.errors.headline[0]}</p>
            )}
          </div>

          {/* Affiliate URL */}
          <div className="sm:col-span-2">
            <label htmlFor="affiliate_url" className={LABEL}>
              Affiliate URL *
            </label>
            <input
              id="affiliate_url"
              name="affiliate_url"
              type="url"
              defaultValue={deal?.affiliate_url ?? ''}
              required
              className={INPUT}
              placeholder="https://amzn.to/…"
            />
            {state.errors?.affiliate_url && (
              <p className="mt-1 text-xs text-red-400">{state.errors.affiliate_url[0]}</p>
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={SECTION}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
          Pricing
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="original_price_inr" className={LABEL}>
              Original Price (₹)
            </label>
            <input
              id="original_price_inr"
              name="original_price_inr"
              type="number"
              min="0"
              step="0.01"
              defaultValue={deal?.original_price_inr ?? ''}
              className={INPUT}
              placeholder="89999"
            />
            {state.errors?.original_price_inr && (
              <p className="mt-1 text-xs text-red-400">{state.errors.original_price_inr[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="deal_price_inr" className={LABEL}>
              Deal Price (₹)
            </label>
            <input
              id="deal_price_inr"
              name="deal_price_inr"
              type="number"
              min="0"
              step="0.01"
              defaultValue={deal?.deal_price_inr ?? ''}
              className={INPUT}
              placeholder="71999"
            />
            {state.errors?.deal_price_inr && (
              <p className="mt-1 text-xs text-red-400">{state.errors.deal_price_inr[0]}</p>
            )}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className={SECTION}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
          Schedule
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="starts_at" className={LABEL}>
              Starts At
            </label>
            <input
              id="starts_at"
              name="starts_at"
              type="datetime-local"
              defaultValue={toDatetimeLocal(deal?.starts_at)}
              className={INPUT}
            />
          </div>
          <div>
            <label htmlFor="expires_at" className={LABEL}>
              Expires At
            </label>
            <input
              id="expires_at"
              name="expires_at"
              type="datetime-local"
              defaultValue={toDatetimeLocal(deal?.expires_at)}
              className={INPUT}
            />
          </div>
        </div>
      </section>

      {/* Active toggle */}
      <section className={SECTION}>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="is_active"
            value="on"
            defaultChecked={deal?.is_active ?? true}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          <div>
            <p className="text-sm font-medium text-white">Active</p>
            <p className="text-xs text-white/40">Inactive deals are hidden from the site</p>
          </div>
        </label>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 pb-8">
        <SubmitButton mode={mode} />
        <a href="/admin/deals" className="text-sm text-white/50 hover:text-white">
          Cancel
        </a>
      </div>
    </form>
  )
}
