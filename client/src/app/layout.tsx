import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import '@/app/globals.css'
import { Providers } from '@/app/providers'
import { ScrollProgressBar } from '@/components/ui/ScrollProgressBar'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bottle Brothers - Premium Lounge & Restaurant in Tirana',
  description: 'Experience luxury dining, cocktails, and events at Bottle Brothers.',
  keywords: ['restaurant', 'lounge', 'cocktails', 'fine dining', 'tirana', 'events'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-neutral-900 flex flex-col font-sans antialiased">
        <Providers>
          <ScrollProgressBar position="top" color="gradient" style="glow" />
          {children}
        </Providers>
      </body>
    </html>
  )
}
