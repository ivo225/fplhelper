'use client';

import React, { useState, useEffect, useCallback, useRef, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import { useTransferRecommendations } from './hooks/useTransferRecommendations';
import { useUserTeam } from './hooks/useUserTeam';
import { formatDate } from './utils';
import { UserTeam } from './types';

// Components
import FplIdForm from './components/FplIdForm';
import TeamDisplay from './components/TeamDisplay';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import RecommendationsList from './components/RecommendationsList';
import CompactView from './components/CompactView';
import SchemaIssueState from './components/SchemaIssueState';

interface TransferRecommendationsProps {
  compact?: boolean;
  externalFplId?: string;
  externalTeamData?: UserTeam | null;
  hideForm?: boolean;
}

export default function TransferRecommendations({ 
  compact = false, 
  externalFplId, 
  externalTeamData,
  hideForm = false 
}: TransferRecommendationsProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  
  // Use custom hooks for data fetching
  const {
    buyRecommendations,
    sellRecommendations,
    gameweek,
    updatedAt,
    isPersonalized,
    status,
    loading,
    error,
    fetchRecommendations
  } = useTransferRecommendations(!compact);
  
  // Only use the internal team hook if we're not getting external data
  const {
    teamData: internalTeamData,
    fplId: internalFplId,
    setFplId: setInternalFplId,
    loading: loadingTeam,
    error: teamError,
    fetchUserTeam
  } = useUserTeam();
  
  // Use either external or internal data
  const teamData = externalTeamData || internalTeamData;
  const fplId = externalFplId || internalFplId;
  const setFplId = setInternalFplId;
  
  // Flags to prevent excessive API calls
  const initialFetchDone = useRef<boolean>(false);
  const fetchedFplIds = useRef<Set<string>>(new Set());
  
  // Get fplId from URL if available (only if not using external data)
  const searchParams = useSearchParams();
  const urlFplId = searchParams.get('fplId');
  
  // Initialize with fplId from URL if available - only on first render and if not using external data
  useEffect(() => {
    if (!externalFplId && urlFplId && !initialFetchDone.current) {
      initialFetchDone.current = true;
      setFplId(urlFplId);
      fetchUserTeam(urlFplId);
    }
  }, [urlFplId, externalFplId, setFplId, fetchUserTeam]);
  
  // Effect to handle external data changes
  useEffect(() => {
    if (externalFplId && externalFplId !== internalFplId) {
      setInternalFplId(externalFplId);
    }
  }, [externalFplId, internalFplId, setInternalFplId]);
  
  // Effect to fetch personalized recommendations when team data is available
  useEffect(() => {
    if (teamData && fplId && !loading) {
      // Only fetch if we haven't already fetched for this fplId
      if (!fetchedFplIds.current.has(fplId)) {
        fetchedFplIds.current.add(fplId);
        fetchRecommendations(fplId);
      }
    }
  }, [teamData, fplId, loading, fetchRecommendations]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fplId && fplId.trim() !== '') {
      // Remove from fetchedFplIds to allow refetching the same ID
      fetchedFplIds.current.delete(fplId);
      fetchUserTeam(fplId);
    }
  };
  
  // Handle schema issues
  if (status === 'schema_issue') {
    return <SchemaIssueState />;
  }
  
  // Compact view for dashboard display
  if (compact) {
    return (
      <CompactView
        buyRecommendations={buyRecommendations}
        sellRecommendations={sellRecommendations}
        gameweek={gameweek}
        updatedAt={updatedAt}
      />
    );
  }
  
  // Loading state (non-personalized)
  if (loading && !isPersonalized) {
    return <LoadingState />;
  }
  
  // Error state (non-personalized)
  if (error && !isPersonalized) {
    return <ErrorState message={error} />;
  }

  // Full view with team data and recommendations
  return (
    <div className="space-y-6">
      {/* User's Team Card (when available) - Only show if we're not using external team data */}
      {isPersonalized && teamData && !externalTeamData && (
        <TeamDisplay teamData={teamData} />
      )}
      
      <Card title={`Transfer Recommendations${teamData ? ` for Gameweek ${gameweek}` : ''}`} className="relative overflow-hidden bg-white border border-gray-200">
        
        {isPersonalized && updatedAt && (
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Last updated: {formatDate(updatedAt)}
          </div>
        )}
        
        {/* FPL ID Form - Only show if not hidden by prop */}
        {!hideForm && (
          <FplIdForm
            fplId={fplId}
            setFplId={setFplId}
            onSubmit={handleSubmit}
            loading={loadingTeam}
            isPersonalized={isPersonalized}
            hasTeamData={!!teamData}
          />
        )}
        
        {/* Only show tabs and recommendations after team data is loaded */}
        {teamData && (
          <>
            {/* Loading state for personalized recommendations */}
            {loading && isPersonalized ? (
              <LoadingState count={3} />
            ) : (
              <>
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    className={`px-4 py-2 font-medium text-sm ${
                      activeTab === 'buy'
                        ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('buy')}
                  >
                    Players to Buy
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm ${
                      activeTab === 'sell'
                        ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('sell')}
                  >
                    Players to Sell
                  </button>
                </div>
                
                {activeTab === 'buy' && (
                  <RecommendationsList
                    title="Players to Buy"
                    recommendations={buyRecommendations}
                    type="buy"
                    gameweek={gameweek}
                    updatedAt={updatedAt}
                  />
                )}
                
                {activeTab === 'sell' && (
                  <RecommendationsList
                    title="Players to Sell"
                    recommendations={sellRecommendations}
                    type="sell"
                    gameweek={gameweek}
                    updatedAt={updatedAt}
                  />
                )}
              </>
            )}
          </>
        )}
        
        {/* Show team error */}
        {teamError && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{teamError}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
