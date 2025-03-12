'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import LiveUpdates from '@/components/live/LiveUpdates';
import InfoBanner from '@/components/common/InfoBanner';

export default function Content() {
  const liveUpdatesDescription = "Stay on top of the action with real-time FPL updates during gameweeks. This page provides live player performance data, bonus point projections, and in-game stats to help you track your team's progress and make informed decisions for upcoming gameweeks.";
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Live Updates</h1>
        
        <InfoBanner pageDescription={liveUpdatesDescription} />
        
        <div className="grid grid-cols-1 gap-6">
          <LiveUpdates />
        </div>
      </div>
    </MainLayout>
  );
} 