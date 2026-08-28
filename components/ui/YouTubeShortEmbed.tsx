import { extractYouTubeId } from '@/lib/utils/format'

interface YouTubeShortEmbedProps {
  url: string
  title: string
}

export function YouTubeShortEmbed({ url, title }: YouTubeShortEmbedProps) {
  const id = extractYouTubeId(url)
  if (!id) return null

  return (
    <section className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-alt/50">
        <h2 className="text-sm font-semibold text-primary">Quick take (Short)</h2>
        <p className="text-xs text-muted">60-second verdict from our review</p>
      </div>
      <div className="mx-auto max-w-[280px] p-4">
        <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${id}`}
            title={`${title} — YouTube Short`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    </section>
  )
}
