'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { useDialog } from '@/lib/hooks/useDialog'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

function GalleryLightbox({
  images,
  productName,
  startIndex,
  onClose,
}: {
  images: string[]
  productName: string
  startIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(startIndex)

  useEffect(() => {
    setIndex(startIndex)
  }, [startIndex])

  // Focus trap, Escape-to-close, scroll lock and focus restore.
  const dialogRef = useDialog<HTMLDivElement>(true, onClose)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(images.length - 1, i + 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length])

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-[70] bg-black/90 flex flex-col outline-none"
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} image gallery`}
    >
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <p className="text-sm text-white/80">
          {index + 1} / {images.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
          aria-label="Close gallery"
        >
          <X size={24} />
        </button>
      </div>

      <div className="relative flex-1 flex items-center justify-center px-4 pb-4 min-h-0">
        {index > 0 && (
          <button
            type="button"
            onClick={() => setIndex((i) => i - 1)}
            className="absolute left-2 md:left-6 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
          <Image
            src={images[index]}
            alt={`${productName} - image ${index + 1}`}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        {index < images.length - 1 && (
          <button
            type="button"
            onClick={() => setIndex((i) => i + 1)}
            className="absolute right-2 md:right-6 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="shrink-0 px-4 pb-6 flex gap-2 justify-center overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === index ? 'border-white' : 'border-white/30 hover:border-white/60'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={src} alt="" fill sizes="56px" className="object-contain p-1 bg-white" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  useEffect(() => {
    emblaApi?.scrollTo(selected)
  }, [selected, emblaApi])

  if (!images.length) return null

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main carousel */}
        <div className="relative group">
          <div ref={emblaRef} className="overflow-hidden rounded-xl border border-border bg-surface-alt">
            <div className="flex">
              {images.map((src, i) => (
                <div key={i} className="relative min-w-0 flex-[0_0_100%] aspect-[4/3]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(i)
                      setLightboxOpen(true)
                    }}
                    className="relative block w-full h-full cursor-zoom-in"
                    aria-label={`Expand image ${i + 1} of ${images.length}`}
                  >
                    <Image
                      src={src}
                      alt={`${productName} - image ${i + 1}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className="object-contain p-4"
                      preload={i === 0}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Image counter */}
          {images.length > 1 && (
            <span className="absolute top-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {selected + 1} / {images.length}
            </span>
          )}

          {/* Expand hint */}
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-lg bg-black/50 text-white backdrop-blur-sm transition-opacity focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Open fullscreen gallery"
          >
            <Expand size={16} />
          </button>

          {/* Arrow nav */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={scrollPrev}
                disabled={selected === 0}
                className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 border border-border shadow-sm text-primary hover:bg-surface disabled:opacity-30 transition-opacity"
                aria-label="Previous image"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                disabled={selected === images.length - 1}
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 border border-border shadow-sm text-primary hover:bg-surface disabled:opacity-30 transition-opacity"
                aria-label="Next image"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails — all visible, no truncation (Baymard) */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all bg-surface ${
                  i === selected
                    ? 'border-accent ring-2 ring-accent/20 scale-105'
                    : 'border-border hover:border-accent/50 opacity-80 hover:opacity-100'
                }`}
                aria-label={`View image ${i + 1}`}
                aria-current={i === selected}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <GalleryLightbox
          images={images}
          productName={productName}
          startIndex={selected}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
