'use client'

import { useActionState, useRef } from 'react'
import { importProductsCsv, type CsvImportResult } from '@/app/admin/products/actions'

export function CsvImportForm() {
  const [result, formAction, pending] = useActionState<CsvImportResult | null, FormData>(
    importProductsCsv,
    null
  )
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted">
        Bulk CSV Import
      </h2>
      <p className="mb-4 text-xs text-muted">
        Required columns:{' '}
        <code className="rounded bg-surface-alt px-1 py-0.5 text-primary font-mono">
          name, category_id, brand_id, creator_rating
        </code>
        . Optional:{' '}
        <code className="rounded bg-surface-alt px-1 py-0.5 text-primary font-mono">
          slug, tagline, description, launch_price_inr, current_price_inr, thumbnail_url,
          youtube_video_url, tags (pipe-separated), is_featured, is_deal_of_the_day, is_published
        </code>
      </p>

      <form ref={formRef} action={formAction} className="flex items-center gap-3">
        <label htmlFor="csv-upload" className="sr-only">
          Upload CSV file
        </label>
        <input
          id="csv-upload"
          type="file"
          name="csv"
          accept=".csv,text/csv"
          required
          className="text-sm text-primary file:mr-3 file:rounded-lg file:border-0 file:bg-surface-alt file:px-3 file:py-1.5 file:text-xs file:text-primary"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Importing…' : 'Import'}
        </button>
      </form>

      {result && (
        <div className="mt-4 space-y-2">
          {result.inserted > 0 && (
            <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              ✓ {result.inserted} product{result.inserted !== 1 ? 's' : ''} imported successfully
            </p>
          )}
          {result.failed.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <p className="mb-1 text-sm font-medium text-red-700">
                {result.failed.length} row{result.failed.length !== 1 ? 's' : ''} failed:
              </p>
              <ul className="space-y-0.5 text-xs text-red-600">
                {result.failed.map((f, i) => (
                  <li key={i}>
                    Row {f.row}: {f.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
