'use client'

import { useId, useState, type ReactNode } from 'react'
import { PlayCircle, Gauge, ListChecks, HelpCircle, type LucideIcon } from 'lucide-react'
import { TabList, TabPanel } from '@/components/ui/Tabs'

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
  const prefix = useId()

  if (tabs.length === 0) return null

  return (
    <section id="details" className="scroll-mt-32">
      <TabList
        label="Product details"
        idPrefix={prefix}
        active={active}
        onChange={setActive}
        className="mb-4"
        tabs={tabs.map((t) => {
          const Icon = TAB_ICONS[t.id]
          return { id: t.id, label: t.label, icon: Icon ? <Icon size={15} aria-hidden /> : undefined }
        })}
      />

      {tabs.map((tab) => (
        <TabPanel key={tab.id} idPrefix={prefix} id={tab.id} active={tab.id === active}>
          {tab.content}
        </TabPanel>
      ))}
    </section>
  )
}
