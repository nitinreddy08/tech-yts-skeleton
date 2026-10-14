'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { SpecTemplate } from '@/types'

interface SpecsCopyButtonProps {
  productName: string
  specifications: Record<string, string | number | boolean | null>
  template: SpecTemplate
}

function formatSpecsText(
  productName: string,
  specifications: Record<string, string | number | boolean | null>,
  template: SpecTemplate
): string {
  const lines = [`${productName} — Specifications`, '']

  for (const field of template.fields) {
    const value = specifications[field.key]
    if (value === null || value === undefined) continue
    const formatted =
      typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
    const unit = field.unit ? ` ${field.unit}` : ''
    lines.push(`${field.label}: ${formatted}${unit}`)
  }

  return lines.join('\n')
}

export function SpecsCopyButton({ productName, specifications, template }: SpecsCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const text = formatSpecsText(productName, specifications, template)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-primary hover:border-accent hover:text-accent transition-colors"
      aria-label={copied ? 'Specs copied' : 'Copy specifications to clipboard'}
    >
      {copied ? (
        <>
          <Check size={14} className="text-success-700" aria-hidden />
          Copied
        </>
      ) : (
        <>
          <Copy size={14} />
          Copy specs
        </>
      )}
    </button>
  )
}
