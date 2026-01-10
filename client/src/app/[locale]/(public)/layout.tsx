import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/Footer'
import { FloatingReservation } from '@/components/ui/FloatingReservation'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <FloatingReservation />
      <Footer />
    </>
  )
}
