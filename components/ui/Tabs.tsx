'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils/cn'

export type TabsVariant = 'underline' | 'pill' | 'segmented'

export interface TabDef {
  id: string
  label: React.ReactNode
  icon?: React.ReactNode
}

export const tabDomId = (prefix: string, id: string) => `${prefix}-tab-${id}`
export const panelDomId = (prefix: string, id: string) => `${prefix}-panel-${id}`

const LIST_CLASSES: Record<TabsVariant, string> = {
  underline: 'flex gap-2 overflow-x-auto no-scrollbar border-b border-border',
  pill: 'flex gap-1.5 overflow-x-auto no-scrollbar',
  segmented: 'inline-flex gap-1 rounded-full border border-border bg-surface-alt p-0.5',
}

const TAB_BASE = 'shrink-0 inline-flex min-h-11 items-center gap-1.5 font-semibold transition-colors'

function tabClasses(variant: TabsVariant, active: boolean) {
  switch (variant) {
    case 'underline':
      return cn(
        TAB_BASE,
        'border-b-2 px-1 -mb-px text-sm',
        active ? 'border-accent text-primary' : 'border-transparent text-muted hover:text-primary'
      )
    case 'pill':
      return cn(
        TAB_BASE,
        'rounded-full px-4 text-sm',
        active ? 'bg-accent text-white' : 'border border-border bg-surface-alt text-muted hover:text-primary'
      )
    case 'segmented':
      return cn(
        TAB_BASE,
        'rounded-full px-4 text-sm',
        active ? 'bg-surface text-accent shadow-sm' : 'text-muted hover:text-primary'
      )
  }
}

interface TabListProps {
  tabs: TabDef[]
  active: string
  onChange: (id: string) => void
  /** Accessible name for the tab list. */
  label: string
  /** Shared prefix (use `useId()` in the parent) that links tabs to their panels. */
  idPrefix: string
  variant?: TabsVariant
  className?: string
}

/**
 * Accessible tab list: `role=tablist/tab`, roving tabindex, and
 * Arrow/Home/End keyboard navigation with automatic activation. Pair each tab
 * with a <TabPanel> using the same `idPrefix` and tab `id`.
 */
export function TabList({ tabs, active, onChange, label, idPrefix, variant = 'underline', className }: TabListProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})

  function onKeyDown(e: React.KeyboardEvent) {
    const i = tabs.findIndex((t) => t.id === active)
    let next = -1
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    if (next < 0) return
    e.preventDefault()
    const id = tabs[next].id
    onChange(id)
    refs.current[id]?.focus()
  }

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className={cn(LIST_CLASSES[variant], className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[tab.id] = el
            }}
            type="button"
            role="tab"
            id={tabDomId(idPrefix, tab.id)}
            aria-selected={isActive}
            aria-controls={panelDomId(idPrefix, tab.id)}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={tabClasses(variant, isActive)}
          >
            {tab.icon}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

interface TabPanelProps {
  idPrefix: string
  id: string
  active: boolean
  children: React.ReactNode
  className?: string
}

export function TabPanel({ idPrefix, id, active, children, className }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={panelDomId(idPrefix, id)}
      aria-labelledby={tabDomId(idPrefix, id)}
      hidden={!active}
      className={className}
    >
      {children}
    </div>
  )
}
