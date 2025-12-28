'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import AdminAnalytics from '@/components/admin/AdminAnalytics'

export default function AnalyticsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminLayout>
        <AdminAnalytics />
      </AdminLayout>
    </ProtectedRoute>
  )
}
