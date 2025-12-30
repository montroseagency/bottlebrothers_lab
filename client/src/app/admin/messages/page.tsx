'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import AdminMessages from '@/components/admin/AdminMessages'

export default function MessagesPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminLayout>
        <AdminMessages />
      </AdminLayout>
    </ProtectedRoute>
  )
}
