'use client'

import { GalleryPage } from '@/pages/Gallery'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FloatingReservation } from '@/components/ui/FloatingReservation'

export default function Gallery() {
  return (
    <>
      <Header />
      <GalleryPage />
      <Footer />
      <FloatingReservation position="bottom-right" style="compact" />
    </>
  )
}
