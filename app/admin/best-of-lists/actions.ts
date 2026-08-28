'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { db, newId } from '@/lib/mock/db'
import { revalidateTag } from '@/lib/mock/revalidate'
import type { BestOfList, BestOfListItem } from '@/types'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function productSummary(productId: string) {
  const p = db.products.find(x => x.id === productId)
  if (!p) return null
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

const ListSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be URL-safe'),
  description: z.string().optional().default(''),
  cover_image_url: z.string().nullable().optional(),
  display_order: z.preprocess(
    v => (v === '' || v == null ? 0 : Number(v)),
    z.number().int().default(0)
  ),
  is_published: z.preprocess(
    v => v === 'true' || v === true || v === 'on',
    z.boolean().default(false)
  ),
})

export type ListActionState = { errors?: Record<string, string[]>; message?: string }

function parseFormData(formData: FormData) {
  const title = formData.get('title') as string
  const rawSlug = formData.get('slug') as string
  const slug = rawSlug?.trim() ? rawSlug.trim() : slugify(title ?? '')
  return {
    title,
    slug,
    description: formData.get('description'),
    cover_image_url: formData.get('cover_image_url') || null,
    display_order: formData.get('display_order'),
    is_published: formData.get('is_published'),
  }
}

function parseItems(
  listId: string,
  itemsJson: string | null
): BestOfListItem[] {
  if (!itemsJson) return []
  let raw: { product_id: string; rank: number; pick_reason: string | null }[]
  try {
    raw = JSON.parse(itemsJson)
  } catch {
    return []
  }
  return raw.map(item => ({
    id: newId(),
    list_id: listId,
    product_id: item.product_id,
    rank: item.rank,
    pick_reason: item.pick_reason ?? null,
    product: productSummary(item.product_id) as any,
  }))
}

export async function createList(
  _prev: ListActionState,
  formData: FormData
): Promise<ListActionState> {
  const parsed = ListSchema.safeParse(parseFormData(formData))
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  if (db.bestOfLists.find(l => l.slug === parsed.data.slug)) {
    return { message: 'A list with this slug already exists.' }
  }

  const id = newId()
  const now = new Date().toISOString()
  const items = parseItems(id, formData.get('items_json') as string | null)

  const list: BestOfList = {
    id,
    ...parsed.data,
    description: parsed.data.description ?? '',
    cover_image_url: parsed.data.cover_image_url ?? null,
    created_at: now,
    updated_at: now,
    items,
  }

  db.bestOfLists.push(list)
  revalidateTag('best-of-lists')
  redirect('/admin/best-of-lists')
}

export async function updateList(
  listId: string,
  _prev: ListActionState,
  formData: FormData
): Promise<ListActionState> {
  const parsed = ListSchema.safeParse(parseFormData(formData))
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const idx = db.bestOfLists.findIndex(l => l.id === listId)
  if (idx === -1) return { message: 'List not found.' }

  const clash = db.bestOfLists.find(l => l.slug === parsed.data.slug && l.id !== listId)
  if (clash) return { message: 'A list with this slug already exists.' }

  const items = parseItems(listId, formData.get('items_json') as string | null)

  db.bestOfLists[idx] = {
    ...db.bestOfLists[idx],
    ...parsed.data,
    description: parsed.data.description ?? db.bestOfLists[idx].description,
    cover_image_url: parsed.data.cover_image_url ?? db.bestOfLists[idx].cover_image_url,
    updated_at: new Date().toISOString(),
    items,
  }

  revalidateTag('best-of-lists')
  redirect('/admin/best-of-lists')
}

export async function deleteList(listId: string): Promise<{ error?: string }> {
  const idx = db.bestOfLists.findIndex(l => l.id === listId)
  if (idx === -1) return { error: 'List not found' }
  db.bestOfLists.splice(idx, 1)
  revalidateTag('best-of-lists')
  return {}
}

export async function upsertListItems(
  listId: string,
  items: { product_id: string; rank: number; pick_reason: string | null }[]
): Promise<{ error?: string }> {
  const list = db.bestOfLists.find(l => l.id === listId)
  if (!list) return { error: 'List not found' }

  list.items = items.map(item => ({
    id: newId(),
    list_id: listId,
    product_id: item.product_id,
    rank: item.rank,
    pick_reason: item.pick_reason ?? null,
    product: productSummary(item.product_id) as any,
  }))
  list.updated_at = new Date().toISOString()

  revalidateTag('best-of-lists')
  return {}
}
