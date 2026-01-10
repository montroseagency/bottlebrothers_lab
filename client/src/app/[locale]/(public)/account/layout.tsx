'use client';

import React from 'react';
import { ClientAuthProvider } from '@/contexts/ClientAuthContext';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientAuthProvider>
      <div className="min-h-screen bg-gray-900">
        {children}
      </div>
    </ClientAuthProvider>
  );
}
