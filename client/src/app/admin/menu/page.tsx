'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import MenuManagement from '@/components/admin/MenuManagement'

export default function MenuManagementPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminLayout>
        <MenuManagement />
      </AdminLayout>
    </ProtectedRoute>
  )
}
