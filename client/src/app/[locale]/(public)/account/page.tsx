'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useClientAuth } from '@/contexts/ClientAuthContext';

export default function AccountPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { isAuthenticated, isLoading } = useClientAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace(`/${locale}/account/profile`);
      } else {
        router.replace(`/${locale}/account/login`);
      }
    }
  }, [isAuthenticated, isLoading, router, locale]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500"></div>
    </div>
  );
}
