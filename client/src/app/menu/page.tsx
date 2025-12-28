'use client'

import Menu from '@/pages/Menu'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FloatingReservation } from '@/components/ui/FloatingReservation'

export default function MenuPage() {
  return (
    <>
      <Header />
      <Menu />
      <Footer />
      <FloatingReservation position="bottom-right" style="compact" />
    </>
  )
}
