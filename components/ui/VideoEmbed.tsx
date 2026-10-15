'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface VideoEmbedProps {
  youtubeId: string
  title: string
  className?: string
  /** 'wide' = 16:9 (reviews), 'tall' = 9:16 (shorts). */
  ratio?: 'wide' | 'tall'
}

/**
 * Click-to-load YouTube. Shows a poster with a play button and only mounts the
 * iframe (privacy-friendly youtube-nocookie) when asked, so the page loads
 * faster and never shows a blank box. If the thumbnail can't load, the poster
 * still reads as a deliberate "Watch the video" tile.
 */
export function VideoEmbed({ youtubeId, title, className, ratio = 'wide' }: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false)
  const [posterFailed, setPosterFailed] = useState(false)
  const box = ratio === 'wide' ? 'aspect-video' : 'aspect-[9/16] max-w-xs'

  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-border bg-primary', box, className)}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-900 to-primary-700 text-white"
          aria-label={`Play video: ${title}`}
        >
          {!posterFailed && (
            <Image
              src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
              onError={() => setPosterFailed(true)}
              unoptimized
            />
          )}
          <span className="relative flex flex-col items-center gap-2 drop-shadow">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-primary-700 transition-transform group-hover:scale-105">
              <Play size={28} className="ml-1 fill-current" aria-hidden />
            </span>
            <span className="max-w-[16rem] px-3 text-center text-sm font-semibold">Watch: {title}</span>
          </span>
        </button>
      )}
    </div>
  )
}
