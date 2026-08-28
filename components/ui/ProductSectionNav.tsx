'use client'

import { useEffect, useState } from 'react'

interface Section {
  id: string
  label: string
}

export function ProductSectionNav({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    if (sections.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) setActive(visible[0].target.id)
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5] }
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sections])

  if (sections.length === 0) return null

  return (
    <nav
      className="sticky top-[var(--navbar-height,56px)] z-30 -mx-4 px-4 py-2 mb-6 bg-surface/95 backdrop-blur border-b border-border lg:top-20"
      aria-label="Page sections"
    >
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              active === s.id
                ? 'bg-accent text-white'
                : 'bg-surface-alt text-muted hover:text-primary border border-border'
            }`}
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
