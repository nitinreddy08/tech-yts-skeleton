'use client'

import { useState, type ReactNode } from 'react'
import { PlayCircle, Gauge, ListChecks, HelpCircle, type LucideIcon } from 'lucide-react'

export interface DetailTab {
  id: string
  label: string
  content: ReactNode
}

const TAB_ICONS: Record<string, LucideIcon> = {
  review: PlayCircle,
  benchmarks: Gauge,
  specs: ListChecks,
  faq: HelpCircle,
}

/** Collapses long-form PDP sections (review, benchmarks, specs, FAQ) behind
 * tabs so a shopper sees one focused block at a time instead of an endless
 * scroll — content stays server-rendered, only visibility toggles. */
export function ProductDetailTabs({ tabs }: { tabs: DetailTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '')

  if (tabs.length === 0) return null

  return (
    <section id="details" className="scroll-mt-32">
      <div className="flex gap-2 overflow-x-auto scrollbar-none border-b border-border mb-6">
        {tabs.map((tab) => {
          const isActive = active === tab.id
          const Icon = TAB_ICONS[tab.id]
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              aria-current={isActive}
              className={`shrink-0 inline-flex items-center gap-1.5 border-b-2 px-1 pb-3 text-sm font-semibold transition-colors ${
                isActive
                  ? 'border-accent text-primary'
                  : 'border-transparent text-muted hover:text-primary'
              }`}
            >
              {Icon && <Icon size={15} />}
              {tab.label}
            </button>
          )
        })}
      </div>

      {tabs.map((tab) => (
        <div key={tab.id} className={tab.id === active ? 'block' : 'hidden'}>
          {tab.content}
        </div>
      ))}
    </section>
  )
}
