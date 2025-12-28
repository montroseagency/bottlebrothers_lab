'use client'

import ContactReservations from '@/components/admin/ContactReservations'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FloatingReservation } from '@/components/ui/FloatingReservation'

export default function ContactPage() {
  return (
    <>
      <Header />
      <ContactReservations />
      <Footer />
      <FloatingReservation position="bottom-right" style="compact" />
    </>
  )
}
