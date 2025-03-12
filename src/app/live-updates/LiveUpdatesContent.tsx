'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import LiveUpdates from '@/components/live/LiveUpdates';

export default function LiveUpdatesContent() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Live Updates</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <LiveUpdates />
        </div>
      </div>
    </MainLayout>
  );
} 