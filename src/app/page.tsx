'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Dashboard from '@/components/dashboard/Dashboard';

export default function Home() {
  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
}
