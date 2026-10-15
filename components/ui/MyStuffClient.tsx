'use client'

import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Bookmark, Bell, GitCompare } from 'lucide-react'
import { SavedProductsClient } from '@/components/ui/SavedProductsClient'
import { PriceAlertsClient } from '@/components/ui/PriceAlertsClient'
import { EmptyState } from '@/components/ui/EmptyState'
import { TabList, TabPanel } from '@/components/ui/Tabs'
import { ListingHeader } from '@/components/ui/ListingHeader'
import { loadRecentCompares, type RecentCompare } from '@/lib/utils/recent-compares'
import { buildCompareUrl } from '@/lib/utils/compare-url'

type Tab = 'saved' | 'alerts' | 'compares'
const TAB_IDS: Tab[] = ['saved', 'alerts', 'compares']

function RecentComparesPanel() {
  const [items, setItems] = useState<RecentCompare[] | null>(null)

  useEffect(() => {
    const refresh = () => setItems(loadRecentCompares())
    refresh()
    window.addEventListener('recent-compares-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('recent-compares-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  if (items === null) {
    return <div className="h-20 shimmer rounded-xl" aria-busy="true" aria-label="Loading recent comparisons" />
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={GitCompare}
        heading="No comparisons yet"
        description="Compare two or more products and they'll be listed here."
        action={{ label: 'Start comparing', href: '/compare' }}
      />
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((c) => (
        <li key={c.id}>
          <Link
            href={buildCompareUrl(c.slugs)}
            className="flex min-h-11 items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent"
          >
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold text-primary">{c.label}</p>
              <p className="mt-0.5 text-xs text-muted">
                {c.slugs.length} products · {new Date(c.visitedAt).toLocaleDateString('en-IN')}
              </p>
            </div>
            <GitCompare size={18} className="ml-3 shrink-0 text-accent" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  )
}

/**
 * The single hub for everything stored on this device. /saved and /alerts
 * redirect here; the active tab lives in the URL (?tab=) so a reload, the back
 * button and shared links all land on the right one.
 */
export function MyStuffClient() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const prefix = useId()
  const requested = sp.get('tab')
  const tab: Tab = TAB_IDS.includes(requested as Tab) ? (requested as Tab) : 'saved'

  function setTab(next: string) {
    router.replace(`${pathname}?tab=${next}`, { scroll: false })
  }

  return (
    <>
      <ListingHeader
        title="My Stuff"
        subtitle="Saved products, price watches and recent comparisons — stored on this device."
      />

      <TabList
        label="My Stuff sections"
        idPrefix={prefix}
        variant="pill"
        active={tab}
        onChange={setTab}
        className="mb-4"
        tabs={[
          { id: 'saved', label: 'Saved', icon: <Bookmark size={16} aria-hidden /> },
          { id: 'alerts', label: 'Watches', icon: <Bell size={16} aria-hidden /> },
          { id: 'compares', label: 'Compares', icon: <GitCompare size={16} aria-hidden /> },
        ]}
      />

      <TabPanel idPrefix={prefix} id="saved" active={tab === 'saved'}>
        {tab === 'saved' && <SavedProductsClient />}
      </TabPanel>
      <TabPanel idPrefix={prefix} id="alerts" active={tab === 'alerts'}>
        {tab === 'alerts' && <PriceAlertsClient />}
      </TabPanel>
      <TabPanel idPrefix={prefix} id="compares" active={tab === 'compares'}>
        {tab === 'compares' && <RecentComparesPanel />}
      </TabPanel>
    </>
  )
}
