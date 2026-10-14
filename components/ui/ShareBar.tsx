'use client'

import { useState, useCallback } from 'react'
import { Share2, Link2, Check, MessageCircle } from 'lucide-react'

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
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-xs font-medium text-muted mr-1 flex items-center gap-1">
        <Share2 size={14} /> Share
      </span>

      {/* WhatsApp — primary for Indian market */}
      <a
        href={buildWhatsAppUrl(shareText, url)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-primary hover:border-success-500 hover:text-success-700 hover:bg-success-50 transition-colors"
        aria-label="Share on WhatsApp"
      >
        <MessageCircle size={14} className="text-success-700" aria-hidden />
        WhatsApp
      </a>

      {/* Native share (mobile) or copy fallback */}
      <button
        type="button"
        onClick={nativeShare}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-primary hover:border-accent transition-colors"
      >
        <Share2 size={14} />
        Share
      </button>

      <button
        type="button"
        onClick={copyLink}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-primary hover:border-accent transition-colors"
        aria-label="Copy link"
      >
        {copied ? (
          <>
            <Check size={14} className="text-success-700" aria-hidden />
            Copied!
          </>
        ) : (
          <>
            <Link2 size={14} />
            Copy link
          </>
        )}
      </button>
    </div>
  )
}
