import type { Metadata } from 'next'
import '@/app/globals.css'
import { Providers } from '@/app/providers'
import { ScrollProgressBar } from '@/components/ui/ScrollProgressBar'

export const metadata: Metadata = {
  title: 'Bottle Brothers',
  description: 'Premium cocktail bar experience',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 flex flex-col">
        <Providers>
          <ScrollProgressBar position="top" color="gradient" style="glow" />
          {children}
        </Providers>
      </body>
    </html>
  )
}
