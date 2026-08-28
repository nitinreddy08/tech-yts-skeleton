'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db, newId, syncProductRelations } from '@/lib/mock/db'
import { revalidateTag } from '@/lib/mock/revalidate'
import type { ProductDetail, AffiliateLink, FAQ } from '@/types'

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
  const idx = db.products.findIndex(p => p.id === productId)
  if (idx === -1) return { error: 'Product not found' }
  db.products.splice(idx, 1)
  db.affiliateLinks = db.affiliateLinks.filter(l => l.product_id !== productId)
  db.faqs = db.faqs.filter(f => f.product_id !== productId)
  revalidateTag('products')
  return {}
}

export async function togglePublishProduct(
  productId: string,
  currentState: boolean
): Promise<{ error?: string }> {
  const product = db.products.find(p => p.id === productId)
  if (!product) return { error: 'Product not found' }
  product.is_published = !currentState
  product.updated_at = new Date().toISOString()
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
  const now = new Date().toISOString()

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

    if (db.products.find(p => p.slug === slug)) {
      result.failed.push({ row: rowNum, reason: `Slug "${slug}" already exists` })
      continue
    }

    const category = db.categories.find(c => c.id === d.category_id)
    const brand = db.brands.find(b => b.id === d.brand_id)
    if (!category || !brand) {
      result.failed.push({ row: rowNum, reason: 'Invalid category_id or brand_id' })
      continue
    }

    const id = newId()
    const product: ProductDetail = {
      id,
      name: d.name,
      slug,
      category_id: category.id,
      category_slug: category.slug,
      brand_id: brand.id,
      brand_name: brand.name,
      tagline: d.tagline ?? null,
      description: d.description ?? null,
      specifications: {},
      pros: [],
      cons: [],
      creator_rating: d.creator_rating,
      youtube_video_url: d.youtube_video_url ?? null,
      youtube_short_url: null,
      thumbnail_url: d.thumbnail_url,
      gallery_images: [],
      launch_price_inr: d.launch_price_inr ?? null,
      current_price_inr: d.current_price_inr ?? null,
      is_featured: d.is_featured,
      is_deal_of_the_day: d.is_deal_of_the_day,
      deal_badge_text: null,
      is_published: d.is_published,
      tags: d.tags,
      created_at: now,
      updated_at: now,
      affiliate_links: [],
      faqs: [],
      category,
      brand,
    }
    db.products.push(product)
    result.inserted++
  }

  if (result.inserted > 0) revalidateTag('products')
  return result
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const AffiliateLinkSchema = z.object({
  store_name: z.string().min(1),
  store_icon: z.string().nullable().optional(),
  affiliate_url: z.string().url(),
  price_inr: z.number().nullable().optional(),
  is_best_price: z.boolean().optional().default(false),
  last_updated: z.string().optional(),
})

const FAQSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  display_order: z.number().int().default(0),
})

const ProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be URL-safe (lowercase, numbers, hyphens)'),
  category_id: z.string().min(1, 'Category is required'),
  brand_id: z.string().min(1, 'Brand is required'),
  tagline: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  specifications: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  creator_rating: z.number().min(0, 'Rating must be ≥ 0').max(10, 'Rating must be ≤ 10'),
  youtube_video_url: z.string().nullable().optional(),
  youtube_short_url: z.string().nullable().optional(),
  thumbnail_url: z.string(),
  gallery_images: z.array(z.string()),
  launch_price_inr: z.number().nullable().optional(),
  current_price_inr: z.number().nullable().optional(),
  is_featured: z.boolean(),
  is_deal_of_the_day: z.boolean(),
  deal_badge_text: z.string().nullable().optional(),
  is_published: z.boolean(),
  tags: z.array(z.string()),
  affiliate_links: z.array(AffiliateLinkSchema),
  faqs: z.array(FAQSchema),
})

export type ProductActionState = {
  errors?: Record<string, string[]>
  message?: string
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createProduct(
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const raw = JSON.parse(formData.get('payload') as string)
  if (!raw.slug && raw.name) raw.slug = slugify(raw.name)

  const parsed = ProductSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const data = parsed.data

  if (data.is_published) {
    if (!data.thumbnail_url) return { message: 'Cannot publish: thumbnail is required.' }
    if (!data.affiliate_links.length)
      return { message: 'Cannot publish: at least one affiliate link is required.' }
  }

  if (db.products.find(p => p.slug === data.slug)) {
    return { message: 'A product with this slug already exists.' }
  }

  const category = db.categories.find(c => c.id === data.category_id)
  const brand = db.brands.find(b => b.id === data.brand_id)
  if (!category || !brand) return { message: 'Invalid category or brand.' }

  const id = newId()
  const now = new Date().toISOString()
  const { affiliate_links, faqs, ...productFields } = data

  const product: ProductDetail = {
    ...productFields,
    id,
    tagline: productFields.tagline ?? null,
    description: productFields.description ?? null,
    youtube_video_url: productFields.youtube_video_url ?? null,
    youtube_short_url: productFields.youtube_short_url ?? null,
    deal_badge_text: productFields.deal_badge_text ?? null,
    launch_price_inr: productFields.launch_price_inr ?? null,
    current_price_inr: productFields.current_price_inr ?? null,
    category_id: category.id,
    category_slug: category.slug,
    brand_id: brand.id,
    brand_name: brand.name,
    created_at: now,
    updated_at: now,
    affiliate_links: [],
    faqs: [],
    category,
    brand,
  }
  db.products.push(product)

  for (const l of affiliate_links) {
    db.affiliateLinks.push({
      ...(l as any),
      id: newId(),
      product_id: id,
      last_updated: l.last_updated ?? now,
    } as AffiliateLink)
  }
  for (const [i, f] of faqs.entries()) {
    db.faqs.push({
      ...(f as any),
      id: newId(),
      product_id: id,
      display_order: f.display_order ?? i,
    } as FAQ)
  }
  syncProductRelations(id)
  revalidateTag('products')
  redirect('/admin/products')
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateProduct(
  productId: string,
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const raw = JSON.parse(formData.get('payload') as string)
  if (!raw.slug && raw.name) raw.slug = slugify(raw.name)

  const parsed = ProductSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const data = parsed.data

  if (data.is_published) {
    if (!data.thumbnail_url) return { message: 'Cannot publish: thumbnail is required.' }
    if (!data.affiliate_links.length)
      return { message: 'Cannot publish: at least one affiliate link is required.' }
  }

  const idx = db.products.findIndex(p => p.id === productId)
  if (idx === -1) return { message: 'Product not found.' }

  // Slug clash with another product
  const clash = db.products.find(p => p.slug === data.slug && p.id !== productId)
  if (clash) return { message: 'A product with this slug already exists.' }

  const category = db.categories.find(c => c.id === data.category_id) ?? db.products[idx].category
  const brand = db.brands.find(b => b.id === data.brand_id) ?? db.products[idx].brand

  const { affiliate_links, faqs, ...productFields } = data
  const now = new Date().toISOString()

  db.products[idx] = {
    ...db.products[idx],
    ...productFields,
    category,
    brand,
    category_slug: category.slug,
    brand_name: brand.name,
    updated_at: now,
    affiliate_links: [],
    faqs: [],
  }

  // Replace affiliate_links
  db.affiliateLinks = db.affiliateLinks.filter(l => l.product_id !== productId)
  for (const l of affiliate_links) {
    db.affiliateLinks.push({
      ...(l as any),
      id: newId(),
      product_id: productId,
      last_updated: (l as any).last_updated ?? now,
    } as AffiliateLink)
  }

  // Replace faqs
  db.faqs = db.faqs.filter(f => f.product_id !== productId)
  for (const [i, f] of faqs.entries()) {
    db.faqs.push({
      ...(f as any),
      id: newId(),
      product_id: productId,
      display_order: f.display_order ?? i,
    } as FAQ)
  }

  syncProductRelations(productId)
  revalidateTag('products')
  redirect('/admin/products')
}
