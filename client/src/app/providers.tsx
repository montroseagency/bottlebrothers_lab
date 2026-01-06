'use client'

import React from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LocaleProvider } from '@/components/providers/LocaleProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <LocaleProvider>
        {children}
      </LocaleProvider>
    </ErrorBoundary>
  )
}
