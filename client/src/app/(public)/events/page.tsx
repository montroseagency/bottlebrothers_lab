'use client'

import Events from '@/pages/Events'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/Footer'
import { FloatingReservation } from '@/components/ui/FloatingReservation'

export default function EventsPage() {
  return (
    <>
      <Header />
      <Events />
      <Footer />
      <FloatingReservation position="bottom-right" style="compact" />
    </>
  )
}
