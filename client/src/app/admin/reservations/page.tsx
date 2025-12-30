'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import AdminReservations from '@/components/admin/AdminReservations'

export default function ReservationsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminLayout>
        <AdminReservations />
      </AdminLayout>
    </ProtectedRoute>
  )
}
