'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default function DashboardPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    </ProtectedRoute>
  )
}
