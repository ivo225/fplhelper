'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import PlayerStatsTable from '@/components/player/PlayerStatsTable';
import PlayerPerformanceMetrics from '@/components/player/PlayerPerformanceMetrics';
import InfoBanner from '@/components/common/InfoBanner';

export default function Content() {
  const playerStatsDescription = "On this page, you'll find comprehensive statistics for all Premier League players, including form, points, expected goals (xG), and expected assists (xA). Use these insights to identify in-form players, spot value picks, and make data-driven decisions for your FPL squad.";
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Player Statistics</h1>
        
        <InfoBanner pageDescription={playerStatsDescription} />
        
        <div className="grid grid-cols-1 gap-6 mb-6">
          <PlayerPerformanceMetrics />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <PlayerStatsTable />
        </div>
      </div>
    </MainLayout>
  );
} 