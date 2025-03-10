'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import PlaceholderContent from '@/components/ui/PlaceholderContent';

export default function CommunityPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Community & Leaderboards</h1>
        
        <PlaceholderContent 
          title="Community & Leaderboards"
          description="This page will provide community features and leaderboards, including:"
          features={[
            "Mini-league rankings and performance stats",
            "Community discussions and forums",
            "User-created content and strategy guides",
            "Global leaderboards and top manager profiles",
            "FPL expert picks and analysis"
          ]}
        />
      </div>
    </MainLayout>
  );
} 