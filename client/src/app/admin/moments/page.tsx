'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { MomentsManagement } from '@/components/admin/MomentsManagement'

export default function MomentsManagementPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminLayout>
        <MomentsManagement />
      </AdminLayout>
    </ProtectedRoute>
  )
}
