'use client'

import { useState, useCallback } from 'react'
import { Share2, Check, MessageCircle } from 'lucide-react'

interface ShareBarProps {
  url: string
  title: string
  text?: string
  className?: string
}

function buildWhatsAppUrl(text: string, url: string): string {
  const message = `${text}\n\n${url}`
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

export function ShareBar({ url, title, text, className = '' }: ShareBarProps) {
  const [copied, setCopied] = useState(false)
  const shareText = text ?? `Check out ${title} on TechReviews India`

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [url])

  const nativeShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url })
        return
      } catch {
        // user cancelled or failed — fall through to copy
      }
    }
    copyLink()
  }, [title, shareText, url, copyLink])

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* One Share control: native share sheet where available, otherwise copies the link. */}
      <button
        type="button"
        onClick={nativeShare}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
      >
        {copied ? <Check size={16} className="text-success-700" aria-hidden /> : <Share2 size={16} aria-hidden />}
        {copied ? 'Link copied' : 'Share'}
      </button>

      {/* WhatsApp — the dominant share channel in India, so it gets its own button. */}
      <a
        href={buildWhatsAppUrl(shareText, url)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface text-success-700 transition-colors hover:border-success-500 hover:bg-success-50"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
      >
        <MessageCircle size={18} aria-hidden />
      </a>
    </div>
  )
}
