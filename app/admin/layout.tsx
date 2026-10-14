import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminMobileNav } from '@/components/admin/AdminMobileNav'
import { AdminShell } from '@/components/admin/AdminShell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminShell sidebar={<AdminSidebar />} mobileNav={<AdminMobileNav />}>
      {children}
    </AdminShell>
  )
}
