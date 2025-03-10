'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CaptainRecommendations from '@/components/ai/CaptainRecommendations';
import TransferRecommendations from '@/components/ai/TransferRecommendations';
import DifferentialRecommendations from '@/components/ai/DifferentialRecommendations';

export default function AIRecommendationsPage() {
  const [activeTab, setActiveTab] = useState<'captains' | 'transfers' | 'differentials'>('captains');
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">AI Recommendations</h1>
        
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('captains')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'captains'
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                Captain Picks
              </button>
              <button
                onClick={() => setActiveTab('transfers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transfers'
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                Transfer Suggestions
              </button>
              <button
                onClick={() => setActiveTab('differentials')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'differentials'
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                Differential Picks
              </button>
            </nav>
          </div>
        </div>
        
        <div className="mt-6">
          {activeTab === 'captains' && <CaptainRecommendations />}
          {activeTab === 'transfers' && <TransferRecommendations />}
          {activeTab === 'differentials' && <DifferentialRecommendations />}
        </div>
        
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">About AI Recommendations</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            These recommendations are generated using advanced AI analysis of FPL data, including form, fixtures, historical performance, and team strength.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Recommendations are updated weekly after each gameweek deadline. The AI considers multiple factors to provide you with data-driven insights to help you make better FPL decisions.
          </p>
        </div>
      </div>
    </MainLayout>
  );
} 