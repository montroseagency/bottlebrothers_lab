'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { EventsManagement } from '@/components/admin/EventsManagement'

export default function EventsManagementPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminLayout>
        <EventsManagement />
      </AdminLayout>
    </ProtectedRoute>
  )
}
