'use server'

import { redirect } from 'next/navigation'
import { bestOfListRepository, isRepositoryError } from '@/lib/repositories'
import { revalidateTag } from '@/lib/mock/revalidate'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export type ListActionState = { errors?: Record<string, string[]>; message?: string }

/** FormData → the loose JSON shape bestOfListCreateSchema validates. */
function parseFormData(formData: FormData): Record<string, unknown> {
  const title = formData.get('title') as string
  const rawSlug = formData.get('slug') as string
  const slug = rawSlug?.trim() ? rawSlug.trim() : slugify(title ?? '')

  const itemsJson = formData.get('items_json') as string | null
  let items: unknown[] = []
  if (itemsJson) {
    try {
      items = JSON.parse(itemsJson)
    } catch {
      items = []
    }
  }

  return {
    title,
    slug,
    description: formData.get('description') ?? undefined,
    cover_image_url: formData.get('cover_image_url') || null,
    display_order: (() => {
      const v = formData.get('display_order')
      return v === '' || v == null ? 0 : Number(v)
    })(),
    is_published: (() => {
      const v = formData.get('is_published')
      return v === 'true' || v === 'on'
    })(),
    items,
  }
}

async function runListAction(fn: () => Promise<unknown>): Promise<ListActionState> {
  try {
    await fn()
  } catch (error) {
    if (isRepositoryError(error)) {
      return { errors: error.fieldErrors, message: error.fieldErrors ? undefined : error.message }
    }
    throw error
  }
  revalidateTag('best-of-lists')
  redirect('/admin/best-of-lists')
}

export async function createList(
  _prev: ListActionState,
  formData: FormData
): Promise<ListActionState> {
  return runListAction(() => bestOfListRepository.create(parseFormData(formData)))
}

export async function updateList(
  listId: string,
  _prev: ListActionState,
  formData: FormData
): Promise<ListActionState> {
  return runListAction(() => bestOfListRepository.update(listId, parseFormData(formData)))
}

export async function deleteList(listId: string): Promise<{ error?: string }> {
  try {
    await bestOfListRepository.remove(listId)
  } catch (error) {
    return { error: isRepositoryError(error) ? error.message : 'Failed to delete list' }
  }
  revalidateTag('best-of-lists')
  return {}
}

export async function upsertListItems(
  listId: string,
  items: { product_id: string; rank: number; pick_reason: string | null }[]
): Promise<{ error?: string }> {
  try {
    await bestOfListRepository.replaceItems(listId, items)
  } catch (error) {
    return { error: isRepositoryError(error) ? error.message : 'Failed to update list items' }
  }
  revalidateTag('best-of-lists')
  return {}
}
