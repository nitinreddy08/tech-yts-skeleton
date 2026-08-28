'use server'

import { redirect } from 'next/navigation'
import { dealRepository, isRepositoryError } from '@/lib/repositories'
import { revalidateTag } from '@/lib/mock/revalidate'

export type DealActionState = { errors?: Record<string, string[]>; message?: string }

/**
 * FormData → the loose JSON shape dealInputSchema validates. Coercion (string
 * "" → null, "true"/"on" → boolean) happens once here; the repository's Zod
 * schema is the actual source of truth for what's valid.
 */
function parseFormData(formData: FormData) {
  const num = (v: FormDataEntryValue | null) => (v === '' || v == null ? null : Number(v))
  return {
    product_id: formData.get('product_id'),
    deal_type: formData.get('deal_type'),
    headline: formData.get('headline'),
    original_price_inr: num(formData.get('original_price_inr')),
    deal_price_inr: num(formData.get('deal_price_inr')),
    store_name: formData.get('store_name'),
    affiliate_url: formData.get('affiliate_url'),
    starts_at: formData.get('starts_at') || null,
    expires_at: formData.get('expires_at') || null,
    is_active: (() => {
      const v = formData.get('is_active')
      return v === 'true' || v === 'on'
    })(),
  }
}

/** Runs a repository mutation, mapping RepositoryError into the form's error shape. */
async function runDealAction(fn: () => Promise<unknown>): Promise<DealActionState> {
  try {
    await fn()
  } catch (error) {
    if (isRepositoryError(error)) {
      return { errors: error.fieldErrors, message: error.fieldErrors ? undefined : error.message }
    }
    throw error
  }
  revalidateTag('deals')
  redirect('/admin/deals')
}

export async function createDeal(
  _prev: DealActionState,
  formData: FormData
): Promise<DealActionState> {
  return runDealAction(() => dealRepository.create(parseFormData(formData)))
}

export async function updateDeal(
  dealId: string,
  _prev: DealActionState,
  formData: FormData
): Promise<DealActionState> {
  return runDealAction(() => dealRepository.update(dealId, parseFormData(formData)))
}

export async function deleteDeal(dealId: string): Promise<{ error?: string }> {
  try {
    await dealRepository.remove(dealId)
  } catch (error) {
    return { error: isRepositoryError(error) ? error.message : 'Failed to delete deal' }
  }
  revalidateTag('deals')
  return {}
}

/**
 * `currentState` is accepted for backward compatibility with existing call
 * sites but unused — the repository always flips the value it actually has
 * stored, which is the only safe source of truth under concurrent toggles.
 */
export async function toggleDealActive(
  dealId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for call-site compatibility, see doc comment above
  _currentState?: boolean
): Promise<{ error?: string }> {
  try {
    await dealRepository.toggleActive(dealId)
  } catch (error) {
    return { error: isRepositoryError(error) ? error.message : 'Failed to toggle deal' }
  }
  revalidateTag('deals')
  return {}
}
