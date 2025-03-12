'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CaptainRecommendations from '@/components/ai/CaptainRecommendations';
import TransferRecommendations from '@/components/ai/TransferRecommendations';
import DifferentialRecommendations from '@/components/ai/DifferentialRecommendations';
import { useUserTeam } from '@/components/ai/transfer/hooks/useUserTeam';
import TeamDisplay from '@/components/ai/transfer/components/TeamDisplay';
import { useSearchParams } from 'next/navigation';

export default function AIRecommendationsContent() {
  const [fplId, setFplId] = useState<string>('');
  
  // Use the team hook at the page level
  const {
    teamData,
    fplId: hookFplId,
    setFplId: setHookFplId,
    loading: loadingTeam,
    error: teamError,
    fetchUserTeam
  } = useUserTeam();
  
  // Keep both fplId states in sync
  useEffect(() => {
    if (fplId !== hookFplId) {
      setHookFplId(fplId);
    }
  }, [fplId, hookFplId, setHookFplId]);
  
  // Get fplId from URL if available
  const searchParams = useSearchParams();
  const urlFplId = searchParams?.get('fplId');
  
  // Handle URL parameters for fplId
  useEffect(() => {
    if (urlFplId && urlFplId !== fplId) {
      setFplId(urlFplId);
      fetchUserTeam(urlFplId);
    }
  }, [urlFplId, fplId, fetchUserTeam]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fplId && fplId.trim() !== '') {
      // Update URL without page reload
      const url = new URL(window.location.href);
      url.searchParams.set('fplId', fplId);
      window.history.pushState({}, '', url);
      
      // Fetch the team data
      fetchUserTeam(fplId);
    }
  };
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
            AI-Powered FPL Insights
          </h1>
        </div>
        
        {/* 1. FPL ID Input Card - Section to enter player/user ID */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-[var(--fpl-purple-dark)] via-[var(--fpl-purple)] to-[var(--fpl-blue)] p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-3 text-white">FPL AI Assistant</h2>
            <p className="mb-4 text-white text-lg">Get personalized recommendations tailored to your team. Enter your FPL ID below.</p>
            <form className="flex flex-col sm:flex-row sm:items-end gap-3" onSubmit={handleSubmit}>
              <div className="flex-1">
                <input 
                  type="text" 
                  value={fplId}
                  onChange={(e) => setFplId(e.target.value)}
                  placeholder="Your FPL ID (e.g., 1234567)" 
                  className="w-full px-4 py-3 text-lg rounded border border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white focus:border-white" 
                />
              </div>
              <button 
                type="submit"
                disabled={loadingTeam}
                className="w-full sm:w-auto px-6 bg-white text-[var(--fpl-purple)] hover:bg-gray-100 text-lg font-medium rounded-md py-3 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 disabled:opacity-50 transition-all"
              >
                {loadingTeam ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : 'Get Insights'}
              </button>
            </form>
            
            {teamError && (
              <div className="mt-4 p-3 bg-red-100/90 text-red-800 rounded-md text-sm">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{teamError}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 2. Current Team Selection - Grid layout displaying the current team */}
        {teamData && (
          <div className="mb-6">
            <TeamDisplay teamData={teamData} />
          </div>
        )}
        
        {/* 3. Transfer Recommendations Tab */}
        <div className="mb-6">
          <TransferRecommendations 
            compact={false} 
            externalFplId={fplId} 
            externalTeamData={teamData} 
            hideForm={true}
          />
        </div>
        
        {/* 4. Captain + Differentials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <CaptainRecommendations compact={false} />
          </div>
          
          <div>
            <DifferentialRecommendations compact={false} />
          </div>
        </div>
        
        {/* About section - With gradient background */}
        <div className="mt-8 p-5 bg-gradient-to-r from-[var(--fpl-purple-dark)] via-[var(--fpl-purple)] to-[var(--fpl-blue)] text-white rounded-lg shadow-md">
          <div className="flex items-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h2 className="text-xl font-bold">About AI Recommendations</h2>
          </div>
          <p className="mb-4 text-white/90">
            These recommendations are generated using advanced AI analysis of FPL data, including form, fixtures, historical performance, and team strength.
          </p>
          <p className="text-white/90">
            Updated weekly after each gameweek deadline, our AI considers multiple factors to provide you with data-driven insights to help you make better FPL decisions.
          </p>
        </div>
      </div>
    </MainLayout>
  );
} 