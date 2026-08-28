import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminMobileNav } from '@/components/admin/AdminMobileNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-surface-admin">
      <AdminSidebar />
      <main className="flex-1 overflow-auto pb-16 lg:pb-0">
        {children}
      </main>
      <AdminMobileNav />
    </div>
  )
}
