'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import UpcomingMatchesCard from '@/components/fixtures/UpcomingMatchesCard';
import FixtureDifficultyRankingCard from '@/components/fixtures/FixtureDifficultyRankingCard';

export default function FixturesPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Fixtures & Schedule</h1>
        
        <div className="grid grid-cols-1 gap-6 mb-6">
          <UpcomingMatchesCard />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <FixtureDifficultyRankingCard />
        </div>
      </div>
    </MainLayout>
  );
} 