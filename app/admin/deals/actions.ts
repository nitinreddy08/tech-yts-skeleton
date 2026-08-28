'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { db, newId } from '@/lib/mock/db'
import { revalidateTag } from '@/lib/mock/revalidate'
import type { Deal } from '@/types'

function productSummary(productId: string) {
  const p = db.products.find(x => x.id === productId)
  if (!p) return undefined
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category_id: p.category_id,
    category_slug: p.category_slug,
    brand_id: p.brand_id,
    brand_name: p.brand_name,
    thumbnail_url: p.thumbnail_url,
    creator_rating: p.creator_rating,
    current_price_inr: p.current_price_inr,
    launch_price_inr: p.launch_price_inr,
    is_featured: p.is_featured,
    is_deal_of_the_day: p.is_deal_of_the_day,
    deal_badge_text: p.deal_badge_text,
    tags: p.tags,
    youtube_video_url: p.youtube_video_url,
    created_at: p.created_at,
  }
}

const DealSchema = z
  .object({
    product_id: z.string().min(1, 'Product is required'),
    deal_type: z.enum([
      'deal_of_day',
      'price_drop',
      'upcoming_sale',
      'bank_offer',
      'sale_event',
      'coupon',
    ]),
    headline: z.string().min(1, 'Headline is required'),
    original_price_inr: z.preprocess(
      v => (v === '' || v == null ? null : Number(v)),
      z.number().positive().nullable().optional()
    ),
    deal_price_inr: z.preprocess(
      v => (v === '' || v == null ? null : Number(v)),
      z.number().positive().nullable().optional()
    ),
    store_name: z.string().min(1, 'Store name is required'),
    affiliate_url: z.string().url('Must be a valid URL'),
    starts_at: z.string().nullable().optional(),
    expires_at: z.string().nullable().optional(),
    is_active: z.preprocess(
      v => v === 'true' || v === true || v === 'on',
      z.boolean().default(true)
    ),
  })
  .refine(
    data =>
      !(
        data.deal_price_inr != null &&
        data.original_price_inr != null &&
        data.deal_price_inr >= data.original_price_inr
      ),
    { message: 'Deal price must be less than original price', path: ['deal_price_inr'] }
  )

export type DealActionState = { errors?: Record<string, string[]>; message?: string }

function parseFormData(formData: FormData) {
  return {
    product_id: formData.get('product_id'),
    deal_type: formData.get('deal_type'),
    headline: formData.get('headline'),
    original_price_inr: formData.get('original_price_inr'),
    deal_price_inr: formData.get('deal_price_inr'),
    store_name: formData.get('store_name'),
    affiliate_url: formData.get('affiliate_url'),
    starts_at: formData.get('starts_at') || null,
    expires_at: formData.get('expires_at') || null,
    is_active: formData.get('is_active'),
  }
}

export async function createDeal(
  _prev: DealActionState,
  formData: FormData
): Promise<DealActionState> {
  const parsed = DealSchema.safeParse(parseFormData(formData))
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const data = parsed.data
  const id = newId()
  const deal: Deal = {
    id,
    product_id: data.product_id,
    deal_type: data.deal_type,
    headline: data.headline,
    original_price_inr: data.original_price_inr ?? null,
    deal_price_inr: data.deal_price_inr ?? null,
    store_name: data.store_name,
    affiliate_url: data.affiliate_url,
    starts_at: data.starts_at ?? null,
    expires_at: data.expires_at ?? null,
    is_active: data.is_active,
    created_at: new Date().toISOString(),
    product: productSummary(data.product_id),
  }

  db.deals.push(deal)
  revalidateTag('deals')
  redirect('/admin/deals')
}

export async function updateDeal(
  dealId: string,
  _prev: DealActionState,
  formData: FormData
): Promise<DealActionState> {
  const parsed = DealSchema.safeParse(parseFormData(formData))
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const idx = db.deals.findIndex(d => d.id === dealId)
  if (idx === -1) return { message: 'Deal not found.' }

  const data = parsed.data
  db.deals[idx] = {
    ...db.deals[idx],
    product_id: data.product_id,
    deal_type: data.deal_type,
    headline: data.headline,
    original_price_inr: data.original_price_inr ?? null,
    deal_price_inr: data.deal_price_inr ?? null,
    store_name: data.store_name,
    affiliate_url: data.affiliate_url,
    starts_at: data.starts_at ?? null,
    expires_at: data.expires_at ?? null,
    is_active: data.is_active,
    product: productSummary(data.product_id),
  }

  revalidateTag('deals')
  redirect('/admin/deals')
}

export async function deleteDeal(dealId: string): Promise<{ error?: string }> {
  const idx = db.deals.findIndex(d => d.id === dealId)
  if (idx === -1) return { error: 'Deal not found' }
  db.deals.splice(idx, 1)
  revalidateTag('deals')
  return {}
}

export async function toggleDealActive(
  dealId: string,
  currentState: boolean
): Promise<{ error?: string }> {
  const deal = db.deals.find(d => d.id === dealId)
  if (!deal) return { error: 'Deal not found' }
  deal.is_active = !currentState
  revalidateTag('deals')
  return {}
}
