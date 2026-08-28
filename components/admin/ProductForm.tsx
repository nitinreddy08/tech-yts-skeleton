'use client'

import { useActionState, useState, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { DynamicSpecForm } from '@/components/admin/DynamicSpecForm'
import { uploadProductImage, generateImagePath } from '@/lib/admin/storage'
import type { ProductDetail, Category, Brand } from '@/types'
import type { ProductActionState } from '@/app/admin/products/actions'

interface FormValues {
  name: string
  slug: string
  category_id: string
  brand_id: string
  tagline: string
  description: string
  creator_rating: number
  youtube_video_url: string
  youtube_short_url: string
  launch_price_inr: string
  current_price_inr: string
  is_featured: boolean
  is_deal_of_the_day: boolean
  deal_badge_text: string
  is_published: boolean
  tags: string
  pros: string
  cons: string
  affiliate_links: { store_name: string; affiliate_url: string; price_inr: string; store_icon: string }[]
  faqs: { question: string; answer: string; display_order: number }[]
}

interface ProductFormProps {
  categories: Category[]
  brands: Brand[]
  product?: ProductDetail
  action: (prev: ProductActionState, formData: FormData) => Promise<ProductActionState>
  mode: 'create' | 'edit'
}

const INPUT = 'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-accent'
const LABEL = 'mb-1 block text-sm font-medium text-muted'
const SECTION = 'rounded-xl border border-border bg-surface p-5'

export function ProductForm({ categories, brands, product, action, mode }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, {})

  const [thumbnailUrl, setThumbnailUrl] = useState(product?.thumbnail_url ?? '')
  const [galleryImages, setGalleryImages] = useState<string[]>(product?.gallery_images ?? [])
  const [specs, setSpecs] = useState<Record<string, string | number | boolean | null>>(product?.specifications ?? {})
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: product?.name ?? '',
      slug: product?.slug ?? '',
      category_id: product?.category_id ?? '',
      brand_id: product?.brand_id ?? '',
      tagline: product?.tagline ?? '',
      description: product?.description ?? '',
      creator_rating: product?.creator_rating ?? 8,
      youtube_video_url: product?.youtube_video_url ?? '',
      youtube_short_url: product?.youtube_short_url ?? '',
      launch_price_inr: product?.launch_price_inr?.toString() ?? '',
      current_price_inr: product?.current_price_inr?.toString() ?? '',
      is_featured: product?.is_featured ?? false,
      is_deal_of_the_day: product?.is_deal_of_the_day ?? false,
      deal_badge_text: product?.deal_badge_text ?? '',
      is_published: product?.is_published ?? false,
      tags: product?.tags?.join(', ') ?? '',
      pros: product?.pros?.join('\n') ?? '',
      cons: product?.cons?.join('\n') ?? '',
      affiliate_links: product?.affiliate_links?.map((l) => ({
        store_name: l.store_name,
        affiliate_url: l.affiliate_url,
        price_inr: l.price_inr?.toString() ?? '',
        store_icon: l.store_icon ?? '',
      })) ?? [],
      faqs: product?.faqs?.map((f) => ({ question: f.question, answer: f.answer, display_order: f.display_order })) ?? [],
    },
  })

  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({ control, name: 'affiliate_links' })
  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({ control, name: 'faqs' })

  const categoryId = watch('category_id')
  const productName = watch('name')
  const slugValue = watch('slug')

  const handleThumbnailUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploadingThumb(true)
    try {
      const slug = slugValue || productName.toLowerCase().replace(/\s+/g, '-') || 'product'
      const url = await uploadProductImage(file, generateImagePath(slug, file.name))
      setThumbnailUrl(url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Thumbnail upload failed')
    } finally {
      setUploadingThumb(false)
    }
  }, [slugValue, productName])

  const handleGalleryUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploadError(null)
    setUploadingGallery(true)
    try {
      const slug = slugValue || productName.toLowerCase().replace(/\s+/g, '-') || 'product'
      const urls = await Promise.all(files.map((f) => uploadProductImage(f, generateImagePath(slug, f.name))))
      setGalleryImages((prev) => [...prev, ...urls])
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Gallery upload failed')
    } finally {
      setUploadingGallery(false)
    }
  }, [slugValue, productName])

  const onSubmit = handleSubmit((values) => {
    const toNum = (v: string) => (v === '' ? null : Number(v))
    const payload = {
      name: values.name,
      slug: values.slug || undefined,
      category_id: values.category_id,
      brand_id: values.brand_id,
      tagline: values.tagline || null,
      description: values.description || null,
      creator_rating: Number(values.creator_rating),
      youtube_video_url: values.youtube_video_url || null,
      youtube_short_url: values.youtube_short_url || null,
      launch_price_inr: toNum(values.launch_price_inr),
      current_price_inr: toNum(values.current_price_inr),
      is_featured: values.is_featured,
      is_deal_of_the_day: values.is_deal_of_the_day,
      deal_badge_text: values.deal_badge_text || null,
      is_published: values.is_published,
      tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean),
      pros: values.pros.split('\n').map((s) => s.trim()).filter(Boolean),
      cons: values.cons.split('\n').map((s) => s.trim()).filter(Boolean),
      thumbnail_url: thumbnailUrl,
      gallery_images: galleryImages,
      specifications: specs,
      affiliate_links: values.affiliate_links.map((l) => ({
        store_name: l.store_name,
        affiliate_url: l.affiliate_url,
        price_inr: toNum(l.price_inr),
        store_icon: l.store_icon || null,
      })),
      faqs: values.faqs,
    }
    const fd = new FormData()
    fd.set('payload', JSON.stringify(payload))
    formAction(fd)
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {state.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      {/* Basic Info */}
      <section className={SECTION}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">Basic Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className={LABEL}>Name *</label>
            <input id="name" {...register('name', { required: 'Name is required' })} className={INPUT} placeholder="iPhone 16 Pro" />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="slug" className={LABEL}>Slug <span className="text-muted/60">(auto-generated if empty)</span></label>
            <input id="slug" {...register('slug', { pattern: { value: /^[a-z0-9-]*$/, message: 'Lowercase, numbers, hyphens only' } })} className={INPUT} placeholder="iphone-16-pro" />
            {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
          </div>
          <div>
            <label htmlFor="category_id" className={LABEL}>Category *</label>
            <select id="category_id" {...register('category_id', { required: 'Category is required' })} className={INPUT}>
              <option value="">— Select category —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            {errors.category_id && <p className="mt-1 text-xs text-red-600">{errors.category_id.message}</p>}
          </div>
          <div>
            <label htmlFor="brand_id" className={LABEL}>Brand *</label>
            <select id="brand_id" {...register('brand_id', { required: 'Brand is required' })} className={INPUT}>
              <option value="">— Select brand —</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            {errors.brand_id && <p className="mt-1 text-xs text-red-600">{errors.brand_id.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="tagline" className={LABEL}>Tagline</label>
            <input id="tagline" {...register('tagline')} className={INPUT} placeholder="Short one-liner" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className={LABEL}>Description</label>
            <textarea id="description" {...register('description')} rows={4} className={INPUT} placeholder="Full review text…" />
          </div>
        </div>
      </section>

      {/* Ratings & Pricing */}
      <section className={SECTION}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">Ratings &amp; Pricing</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="creator_rating" className={LABEL}>Creator Rating (0–10) *</label>
            <input id="creator_rating" type="number" step="0.1" min="0" max="10" {...register('creator_rating', { required: 'Rating is required', min: { value: 0, message: 'Must be ≥ 0' }, max: { value: 10, message: 'Must be ≤ 10' } })} className={INPUT} />
            {errors.creator_rating && <p className="mt-1 text-xs text-red-600">{errors.creator_rating.message}</p>}
          </div>
          <div>
            <label htmlFor="launch_price_inr" className={LABEL}>Launch Price (₹)</label>
            <input id="launch_price_inr" type="number" {...register('launch_price_inr')} className={INPUT} placeholder="89999" />
          </div>
          <div>
            <label htmlFor="current_price_inr" className={LABEL}>Current Price (₹)</label>
            <input id="current_price_inr" type="number" {...register('current_price_inr')} className={INPUT} placeholder="79999" />
          </div>
        </div>
      </section>

      {/* Media */}
      <section className={SECTION}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">Media</h2>
        {uploadError && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{uploadError}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className={LABEL}>Thumbnail *</p>
            {thumbnailUrl && <img src={thumbnailUrl} alt="Thumbnail preview" className="mb-2 h-24 w-24 rounded-lg object-cover" />}
            <label htmlFor="thumbnail-upload" className="sr-only">Upload thumbnail image</label>
            <input id="thumbnail-upload" type="file" accept="image/*" onChange={handleThumbnailUpload} disabled={uploadingThumb} className="text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface-alt file:px-3 file:py-1.5 file:text-xs file:text-primary" />
            {uploadingThumb && <p className="mt-1 text-xs text-muted">Uploading…</p>}
            {!thumbnailUrl && <p className="mt-1 text-xs text-muted">Required before publishing</p>}
          </div>
          <div>
            <p className={LABEL}>Gallery Images</p>
            <div className="mb-2 flex flex-wrap gap-2">
              {galleryImages.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt={`Gallery image ${i + 1}`} className="h-16 w-16 rounded-lg object-cover" />
                  <button type="button" onClick={() => setGalleryImages((prev) => prev.filter((_, j) => j !== i))} aria-label={`Remove gallery image ${i + 1}`} className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">×</button>
                </div>
              ))}
            </div>
            <label htmlFor="gallery-upload" className="sr-only">Upload gallery images</label>
            <input id="gallery-upload" type="file" accept="image/*" multiple onChange={handleGalleryUpload} disabled={uploadingGallery} className="text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface-alt file:px-3 file:py-1.5 file:text-xs file:text-primary" />
            {uploadingGallery && <p className="mt-1 text-xs text-muted">Uploading…</p>}
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="youtube_video_url" className={LABEL}>YouTube Review URL</label>
            <input id="youtube_video_url" {...register('youtube_video_url')} className={INPUT} placeholder="https://youtube.com/watch?v=…" />
          </div>
          <div>
            <label htmlFor="youtube_short_url" className={LABEL}>YouTube Short URL</label>
            <input id="youtube_short_url" {...register('youtube_short_url')} className={INPUT} placeholder="https://youtube.com/shorts/…" />
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className={SECTION}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">Specifications</h2>
        {categoryId ? (
          <DynamicSpecForm categoryId={categoryId} existingSpecs={specs} onChange={setSpecs} />
        ) : (
          <p className="text-sm text-muted">Select a category to see spec fields.</p>
        )}
      </section>

      {/* Pros & Cons */}
      <section className={SECTION}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">Pros &amp; Cons</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pros" className={LABEL}>Pros <span className="text-muted/60">(one per line)</span></label>
            <textarea id="pros" {...register('pros')} rows={5} className={INPUT} placeholder={'Great camera\nLong battery life'} />
          </div>
          <div>
            <label htmlFor="cons" className={LABEL}>Cons <span className="text-muted/60">(one per line)</span></label>
            <textarea id="cons" {...register('cons')} rows={5} className={INPUT} placeholder={'Expensive\nNo charger in box'} />
          </div>
        </div>
      </section>

      {/* Affiliate Links */}
      <section className={SECTION}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Affiliate Links</h2>
          <button type="button" onClick={() => appendLink({ store_name: '', affiliate_url: '', price_inr: '', store_icon: '' })} className="rounded-lg border border-border bg-surface-alt px-3 py-1.5 text-xs font-medium text-primary hover:bg-border transition-colors">
            + Add Link
          </button>
        </div>
        {linkFields.length === 0 && <p className="text-sm text-muted">No affiliate links yet. Required before publishing.</p>}
        <div className="flex flex-col gap-3">
          {linkFields.map((field, i) => (
            <div key={field.id} className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-4">
              <div>
                <label htmlFor={`link-store-${i}`} className={LABEL}>Store *</label>
                <input id={`link-store-${i}`} {...register(`affiliate_links.${i}.store_name`, { required: 'Store name required' })} className={INPUT} placeholder="Amazon" />
                {errors.affiliate_links?.[i]?.store_name && <p className="mt-1 text-xs text-red-600">{errors.affiliate_links[i]?.store_name?.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`link-url-${i}`} className={LABEL}>Affiliate URL *</label>
                <input id={`link-url-${i}`} {...register(`affiliate_links.${i}.affiliate_url`, { required: 'URL required', pattern: { value: /^https?:\/\//, message: 'Must be a valid URL' } })} className={INPUT} placeholder="https://amzn.to/…" />
                {errors.affiliate_links?.[i]?.affiliate_url && <p className="mt-1 text-xs text-red-600">{errors.affiliate_links[i]?.affiliate_url?.message}</p>}
              </div>
              <div>
                <label htmlFor={`link-price-${i}`} className={LABEL}>Price (₹)</label>
                <div className="flex gap-2">
                  <input id={`link-price-${i}`} type="number" {...register(`affiliate_links.${i}.price_inr`)} className={INPUT} placeholder="79999" />
                  <button type="button" onClick={() => removeLink(i)} aria-label={`Remove affiliate link ${i + 1}`} className="shrink-0 rounded-lg border border-red-200 px-2 text-xs text-red-600 hover:bg-red-50">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className={SECTION}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">FAQs</h2>
          <button type="button" onClick={() => appendFaq({ question: '', answer: '', display_order: faqFields.length })} className="rounded-lg border border-border bg-surface-alt px-3 py-1.5 text-xs font-medium text-primary hover:bg-border transition-colors">
            + Add FAQ
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {faqFields.map((field, i) => (
            <div key={field.id} className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-muted">FAQ #{i + 1}</span>
                <button type="button" onClick={() => removeFaq(i)} className="text-xs text-red-600 hover:text-red-700">Remove</button>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor={`faq-q-${i}`} className="sr-only">FAQ {i + 1} question</label>
                <input id={`faq-q-${i}`} {...register(`faqs.${i}.question`, { required: 'Question required' })} className={INPUT} placeholder="Question" />
                {errors.faqs?.[i]?.question && <p className="text-xs text-red-600">{errors.faqs[i]?.question?.message}</p>}
                <label htmlFor={`faq-a-${i}`} className="sr-only">FAQ {i + 1} answer</label>
                <textarea id={`faq-a-${i}`} {...register(`faqs.${i}.answer`, { required: 'Answer required' })} rows={2} className={INPUT} placeholder="Answer" />
                {errors.faqs?.[i]?.answer && <p className="text-xs text-red-600">{errors.faqs[i]?.answer?.message}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tags & Badges */}
      <section className={SECTION}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">Tags &amp; Badges</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="tags" className={LABEL}>Tags <span className="text-muted/60">(comma-separated)</span></label>
            <input id="tags" {...register('tags')} className={INPUT} placeholder="5g, flagship, camera" />
          </div>
          <div>
            <label htmlFor="deal_badge_text" className={LABEL}>Deal Badge Text</label>
            <input id="deal_badge_text" {...register('deal_badge_text')} className={INPUT} placeholder="Limited Deal" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
            <input type="checkbox" {...register('is_featured')} className="accent-accent" />
            Featured product
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
            <input type="checkbox" {...register('is_deal_of_the_day')} className="accent-accent" />
            Deal of the day
          </label>
        </div>
      </section>

      {/* Publish */}
      <section className={SECTION}>
        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" {...register('is_published')} className="h-4 w-4 accent-accent" />
          <div>
            <p className="text-sm font-medium text-primary">Publish product</p>
            <p className="text-xs text-muted">Requires thumbnail and at least one affiliate link</p>
          </div>
        </label>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 pb-8">
        <button type="submit" disabled={pending || uploadingThumb || uploadingGallery} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">
          {pending ? 'Saving…' : mode === 'create' ? 'Create Product' : 'Save Changes'}
        </button>
        <a href="/admin/products" className="text-sm text-muted hover:text-primary">Cancel</a>
      </div>
    </form>
  )
}
