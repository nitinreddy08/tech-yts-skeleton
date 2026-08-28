import Link from 'next/link'
import { db } from '@/lib/mock/db'
import { productRepository, dealRepository } from '@/lib/repositories'
import { canPublish } from '@/lib/schemas'
import { newsletterSubscribers } from '@/lib/mock/newsletter'
import {
  Package,
  MousePointerClick,
  Plus,
  Zap,
  Trophy,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Mail,
  Clock,
} from 'lucide-react'
import { formatIndianPrice } from '@/lib/utils/format'
import { AdminClickAnalytics } from '@/components/admin/AdminClickAnalytics'

function formatClickTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminDashboard() {
  const [products, activeDeals, expiringDeals] = await Promise.all([
    productRepository.listDetailed({ includeUnpublished: true }),
    dealRepository.list({ liveOnly: true }),
    dealRepository.list({ expiringWithinHours: 7 * 24 }),
  ])
  const published = products.filter((p) => p.is_published)
  const drafts = products.filter((p) => !p.is_published)
  const publishedLists = db.bestOfLists.filter((l) => l.is_published)
  const clicks = db.clickLogs

  const last24h = clicks.filter(
    (c) => Date.now() - new Date(c.clicked_at).getTime() < 86400000
  )

  // Top clicked products
  const clickCounts = clicks.reduce<Record<string, { count: number; name: string; store: string }>>(
    (acc, log) => {
      if (!acc[log.product_id]) {
        const prod = products.find((p) => p.id === log.product_id)
        acc[log.product_id] = {
          count: 0,
          name: prod?.name ?? log.product_id,
          store: log.store_name,
        }
      }
      acc[log.product_id].count++
      return acc
    },
    {}
  )
  const topProducts = Object.entries(clickCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)

  // Needs attention — reuses the same canPublish invariant the repository
  // enforces before allowing is_published: true, so this list and the
  // publish gate never disagree about what's "ready to go live".
  const needsAttention = products.filter(
    (p) =>
      !p.is_published ||
      !canPublish({ thumbnail_url: p.thumbnail_url, affiliateLinkCount: p.affiliate_links.length })
  )

  const recentClicks = [...clicks]
    .sort((a, b) => new Date(b.clicked_at).getTime() - new Date(a.clicked_at).getTime())
    .slice(0, 8)

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-primary">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Overview of your content and affiliate performance</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        <div className="rounded-xl border border-border bg-surface p-5">
          <Package size={18} className="text-accent mb-2" />
          <p className="text-xs text-muted">Products</p>
          <p className="text-2xl font-bold text-primary mt-0.5">{products.length}</p>
          <p className="text-[10px] text-muted mt-1 flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-green-700">
              <Eye size={10} /> {published.length} live
            </span>
            <span className="flex items-center gap-0.5">
              <EyeOff size={10} /> {drafts.length} draft
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <MousePointerClick size={18} className="text-accent mb-2" />
          <p className="text-xs text-muted">Total Clicks</p>
          <p className="text-2xl font-bold text-primary mt-0.5">{clicks.length}</p>
          <p className="text-[10px] text-muted mt-1 flex items-center gap-1">
            <TrendingUp size={10} className="text-green-600" />
            {last24h.length} in last 24h
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <Zap size={18} className="text-accent mb-2" />
          <p className="text-xs text-muted">Active Deals</p>
          <p className="text-2xl font-bold text-primary mt-0.5">{activeDeals.length}</p>
          <Link href="/admin/deals" className="text-[10px] text-accent hover:underline mt-1 inline-block">
            Manage deals →
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <Trophy size={18} className="text-accent mb-2" />
          <p className="text-xs text-muted">Best-Of Guides</p>
          <p className="text-2xl font-bold text-primary mt-0.5">{publishedLists.length}</p>
          <Link href="/admin/best-of-lists" className="text-[10px] text-accent hover:underline mt-1 inline-block">
            Manage lists →
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <Mail size={18} className="text-accent mb-2" />
          <p className="text-xs text-muted">Newsletter</p>
          <p className="text-2xl font-bold text-primary mt-0.5">{newsletterSubscribers.length}</p>
          <Link href="/admin/newsletter" className="text-[10px] text-accent hover:underline mt-1 inline-block">
            View subscribers →
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <Clock size={18} className="text-amber-600 mb-2" />
          <p className="text-xs text-muted">Expiring (7d)</p>
          <p className="text-2xl font-bold text-primary mt-0.5">{expiringDeals.length}</p>
          <Link href="/admin/deals?status=active" className="text-[10px] text-accent hover:underline mt-1 inline-block">
            Review deals →
          </Link>
        </div>
      </div>

      {expiringDeals.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 mb-8">
          <h2 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
            <Clock size={16} className="text-amber-600" /> Deals expiring this week
          </h2>
          <div className="flex flex-col gap-2">
            {expiringDeals.slice(0, 5).map((d) => (
              <Link
                key={d.id}
                href={`/admin/deals/${d.id}/edit`}
                className="flex items-center justify-between rounded-lg bg-surface border border-border px-4 py-2 text-sm hover:border-accent transition-colors"
              >
                <span className="font-medium text-primary truncate">{d.headline || d.product?.name}</span>
                <span className="text-xs text-muted shrink-0 ml-2">
                  {d.expires_at && new Date(d.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <AdminClickAnalytics clicks={clicks} />

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Recent clicks */}
        <section className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primary">Recent Affiliate Clicks</h2>
            <span className="text-xs text-muted">{clicks.length} total</span>
          </div>
          {recentClicks.length > 0 ? (
            <div className="divide-y divide-border">
              {recentClicks.map((log) => {
                const prod = products.find((p) => p.id === log.product_id)
                return (
                  <div key={log.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-primary truncate">
                        {prod?.name ?? log.product_id}
                      </p>
                      <p className="text-xs text-muted">
                        {log.store_name} · {formatClickTime(log.clicked_at)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-green-50 text-green-700 px-2 py-0.5 text-[10px] font-semibold">
                      Click
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="px-5 py-8 text-sm text-muted text-center">
              No clicks yet. Clicks are logged when users use affiliate links on the public site.
            </p>
          )}
        </section>

        {/* Top products by clicks */}
        <section className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-primary">Top Products by Clicks</h2>
          </div>
          {topProducts.length > 0 ? (
            <div className="divide-y divide-border">
              {topProducts.map(([id, { count, name }], i) => (
                <div key={id} className="px-5 py-3 flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-alt text-xs font-bold text-muted">
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm text-primary truncate">{name}</p>
                  <span className="text-sm font-bold text-accent">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-sm text-muted text-center">No click data yet</p>
          )}
        </section>
      </div>

      {/* Needs attention */}
      {needsAttention.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50/50 overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-amber-200 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <h2 className="text-sm font-semibold text-primary">Needs Attention</h2>
            <span className="text-xs text-muted ml-auto">{needsAttention.length} items</span>
          </div>
          <div className="divide-y divide-amber-100">
            {needsAttention.slice(0, 5).map((p) => {
              const issues: string[] = []
              if (!p.is_published) issues.push('Unpublished')
              if (!p.thumbnail_url) issues.push('No thumbnail')
              if (p.affiliate_links.length === 0) issues.push('No affiliate links')
              return (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}/edit`}
                  className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-amber-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{p.name}</p>
                    <p className="text-xs text-amber-800">{issues.join(' · ')}</p>
                  </div>
                  <ArrowRight size={14} className="text-muted shrink-0" />
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section>
        <h2 className="text-sm font-semibold text-primary mb-3">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/products/new"
            className="rounded-xl border border-border bg-surface p-4 flex items-center gap-3 text-sm font-medium text-primary hover:border-accent hover:bg-surface-alt transition-colors"
          >
            <Plus size={18} className="text-accent" />
            Add Product
          </Link>
          <Link
            href="/admin/deals/new"
            className="rounded-xl border border-border bg-surface p-4 flex items-center gap-3 text-sm font-medium text-primary hover:border-accent hover:bg-surface-alt transition-colors"
          >
            <Zap size={18} className="text-accent" />
            Create Deal
          </Link>
          <Link
            href="/admin/best-of-lists/new"
            className="rounded-xl border border-border bg-surface p-4 flex items-center gap-3 text-sm font-medium text-primary hover:border-accent hover:bg-surface-alt transition-colors"
          >
            <Trophy size={18} className="text-accent" />
            New Best-Of List
          </Link>
          <Link
            href="/"
            target="_blank"
            className="rounded-xl border border-border bg-surface p-4 flex items-center gap-3 text-sm font-medium text-primary hover:border-accent hover:bg-surface-alt transition-colors"
          >
            <Eye size={18} className="text-accent" />
            View Live Site
          </Link>
        </div>
      </section>

      {/* Revenue hint */}
      {published.length > 0 && (
        <p className="mt-8 text-xs text-muted">
          {published.length} published products
          {published.some((p) => p.current_price_inr) &&
            ` · catalog value from ${formatIndianPrice(
              Math.min(...published.map((p) => p.current_price_inr ?? Infinity).filter((n) => n !== Infinity))
            )}`}
        </p>
      )}
    </div>
  )
}
