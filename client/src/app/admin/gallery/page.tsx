'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { GalleryManagement } from '@/components/admin/GalleryManagement'

export default function GalleryManagementPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminLayout>
        <GalleryManagement />
      </AdminLayout>
    </ProtectedRoute>
  )
}
