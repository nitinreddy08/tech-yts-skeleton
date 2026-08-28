'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { productRepository, isRepositoryError } from '@/lib/repositories'
import { revalidateTag } from '@/lib/mock/revalidate'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ─── Simple actions ───────────────────────────────────────────────────────────

export async function deleteProduct(productId: string): Promise<{ error?: string }> {
  try {
    await productRepository.remove(productId)
  } catch (error) {
    return { error: isRepositoryError(error) ? error.message : 'Failed to delete product' }
  }
  revalidateTag('products')
  return {}
}

/**
 * `currentState` is accepted for backward compatibility with existing call
 * sites but unused — the repository flips whatever it actually has stored.
 * A toggle that would publish a product missing a thumbnail/affiliate link is
 * rejected by the repository's publish invariant (see lib/schemas/product.ts).
 */
export async function togglePublishProduct(
  productId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for call-site compatibility, see doc comment above
  _currentState?: boolean
): Promise<{ error?: string }> {
  try {
    await productRepository.togglePublish(productId)
  } catch (error) {
    return { error: isRepositoryError(error) ? error.message : 'Failed to toggle product' }
  }
  revalidateTag('products')
  return {}
}

// ─── CSV Import ───────────────────────────────────────────────────────────────

const CsvRowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .optional()
    .transform(v => v || undefined),
  category_id: z.string().min(1, 'category_id is required'),
  brand_id: z.string().min(1, 'brand_id is required'),
  tagline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  creator_rating: z.coerce.number().min(0).max(10).default(0),
  launch_price_inr: z.preprocess(
    v => (v === '' || v == null ? null : Number(v)),
    z.number().nullable().optional()
  ),
  current_price_inr: z.preprocess(
    v => (v === '' || v == null ? null : Number(v)),
    z.number().nullable().optional()
  ),
  thumbnail_url: z.string().optional().default(''),
  youtube_video_url: z.string().optional().nullable(),
  tags: z
    .string()
    .optional()
    .transform(v =>
      v
        ? v
            .split('|')
            .map(t => t.trim())
            .filter(Boolean)
        : []
    ),
  is_featured: z.preprocess(v => v === 'true' || v === '1', z.boolean().default(false)),
  is_deal_of_the_day: z.preprocess(v => v === 'true' || v === '1', z.boolean().default(false)),
  is_published: z.preprocess(v => v === 'true' || v === '1', z.boolean().default(false)),
})

export type CsvImportResult = {
  inserted: number
  failed: { row: number; reason: string }[]
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

export async function importProductsCsv(
  _prev: CsvImportResult | null,
  formData: FormData
): Promise<CsvImportResult> {
  const file = formData.get('csv') as File | null
  if (!file || file.size === 0) {
    return { inserted: 0, failed: [{ row: 0, reason: 'No CSV file provided' }] }
  }

  const text = await file.text()
  const rows = parseCsv(text)
  if (rows.length === 0) {
    return { inserted: 0, failed: [{ row: 0, reason: 'CSV is empty or has no data rows' }] }
  }

  const result: CsvImportResult = { inserted: 0, failed: [] }

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2
    const parsed = CsvRowSchema.safeParse(rows[i])
    if (!parsed.success) {
      const msgs = parsed.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ')
      result.failed.push({ row: rowNum, reason: msgs })
      continue
    }
    const d = parsed.data
    const slug = d.slug || slugify(d.name)

    try {
      await productRepository.create({
        name: d.name,
        slug,
        category_id: d.category_id,
        brand_id: d.brand_id,
        tagline: d.tagline ?? null,
        description: d.description ?? null,
        creator_rating: d.creator_rating,
        youtube_video_url: d.youtube_video_url ?? null,
        thumbnail_url: d.thumbnail_url,
        launch_price_inr: d.launch_price_inr ?? null,
        current_price_inr: d.current_price_inr ?? null,
        is_featured: d.is_featured,
        is_deal_of_the_day: d.is_deal_of_the_day,
        is_published: d.is_published,
        tags: d.tags,
      })
      result.inserted++
    } catch (error) {
      const reason = isRepositoryError(error) ? error.message : 'Failed to import row'
      result.failed.push({ row: rowNum, reason })
    }
  }

  if (result.inserted > 0) revalidateTag('products')
  return result
}

// ─── Create / Update ────────────────────────────────────────────────────────

export type ProductActionState = {
  errors?: Record<string, string[]>
  message?: string
}

/** JSON payload shape ProductForm posts — validated by productRepository via Zod. */
function parsePayload(formData: FormData): Record<string, unknown> {
  const raw = JSON.parse(formData.get('payload') as string)
  if (!raw.slug && raw.name) raw.slug = slugify(raw.name)
  return raw
}

async function runProductAction(fn: () => Promise<unknown>): Promise<ProductActionState> {
  try {
    await fn()
  } catch (error) {
    if (isRepositoryError(error)) {
      // ProductForm only ever renders `state.message` (it validates individual
      // fields client-side via react-hook-form), so every repository error —
      // including field-level ValidationErrors like the publish invariant —
      // must surface through `message` to actually be visible.
      return { errors: error.fieldErrors, message: error.message }
    }
    throw error
  }
  revalidateTag('products')
  redirect('/admin/products')
}

export async function createProduct(
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  return runProductAction(() => productRepository.create(parsePayload(formData)))
}

export async function updateProduct(
  productId: string,
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  return runProductAction(() => productRepository.update(productId, parsePayload(formData)))
}
