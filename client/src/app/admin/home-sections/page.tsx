'use client';

import React from 'react';
import HomeSectionsManagement from '@/components/admin/HomeSectionsManagement';

export default function HomeSectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Home Sections</h1>
        <p className="text-gray-400">Manage homepage content and translations</p>
      </div>
      <HomeSectionsManagement />
    </div>
  );
}
