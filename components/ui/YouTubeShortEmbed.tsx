import { extractYouTubeId } from '@/lib/utils/format'
import { VideoEmbed } from '@/components/ui/VideoEmbed'

interface YouTubeShortEmbedProps {
  url: string
  title: string
}

/** The 60-second vertical take, as a click-to-load tile. */
export function YouTubeShortEmbed({ url, title }: YouTubeShortEmbedProps) {
  const id = extractYouTubeId(url)
  if (!id) return null
  return (
    <div>
      <h3 className="mb-2 text-h3 text-primary">60-second take</h3>
      <VideoEmbed youtubeId={id} title={`${title} — quick take`} ratio="tall" />
    </div>
  )
}
