'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';

interface Player {
  id: number;
  first_name: string;
  second_name: string;
  web_name: string;
  team: number;
  position: number;
  now_cost: number;
  form: string;
  points_per_game: string;
  total_points: number;
  teams: {
    name: string;
    short_name: string;
  };
}

interface TransferRecommendation {
  id: number;
  gameweek: number;
  player_id: number;
  type: 'buy' | 'sell';
  reasoning: string;
  confidence_score: number;
  created_at: string;
  players: Player;
}

interface TransferRecommendationsResponse {
  gameweek: number;
  buy_recommendations: TransferRecommendation[];
  sell_recommendations: TransferRecommendation[];
  updated_at: string;
  is_personalized: boolean;
  status?: 'success' | 'no_recommendations' | 'schema_issue' | 'error';
}

export default function TransferRecommendations() {
  const [buyRecommendations, setBuyRecommendations] = useState<TransferRecommendation[]>([]);
  const [sellRecommendations, setSellRecommendations] = useState<TransferRecommendation[]>([]);
  const [gameweek, setGameweek] = useState<number>(0);
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [fplId, setFplId] = useState<string>('');
  const [teamData, setTeamData] = useState<any>(null);
  const [isPersonalized, setIsPersonalized] = useState<boolean>(false);
  const [loadingTeam, setLoadingTeam] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [status, setStatus] = useState<string | null>(null);
  
  // Function to fetch recommendations
  async function fetchRecommendations(userId?: string) {
    try {
      setLoading(true);
      setError(null);
      const url = userId 
        ? `/api/recommendations/transfers?fplId=${userId}` 
        : '/api/recommendations/transfers';
        
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Failed to fetch transfer recommendations: ${response.status}${errorData.error ? ` - ${errorData.error}` : ''}`);
      }
      
      const data: TransferRecommendationsResponse = await response.json();
      
      // Set status from response
      setStatus(data.status || 'success');
      
      // Filter out duplicates in buy recommendations by player_id, keeping only the most recent one
      const uniqueBuyRecommendations = data.buy_recommendations.reduce((acc: TransferRecommendation[], current) => {
        const existingIndex = acc.findIndex(item => item.player_id === current.player_id);
        if (existingIndex === -1) {
          // Item doesn't exist in accumulator, add it
          acc.push(current);
        } else {
          // Item exists, check if current is more recent
          const existing = acc[existingIndex];
          if (new Date(current.created_at) > new Date(existing.created_at)) {
            // Replace with more recent one
            acc[existingIndex] = current;
          }
        }
        return acc;
      }, []);
      
      // Filter out duplicates in sell recommendations by player_id, keeping only the most recent one
      const uniqueSellRecommendations = data.sell_recommendations.reduce((acc: TransferRecommendation[], current) => {
        const existingIndex = acc.findIndex(item => item.player_id === current.player_id);
        if (existingIndex === -1) {
          // Item doesn't exist in accumulator, add it
          acc.push(current);
        } else {
          // Item exists, check if current is more recent
          const existing = acc[existingIndex];
          if (new Date(current.created_at) > new Date(existing.created_at)) {
            // Replace with more recent one
            acc[existingIndex] = current;
          }
        }
        return acc;
      }, []);
      
      // Sort by confidence score (descending)
      uniqueBuyRecommendations.sort((a, b) => b.confidence_score - a.confidence_score);
      uniqueSellRecommendations.sort((a, b) => b.confidence_score - a.confidence_score);
      
      setBuyRecommendations(uniqueBuyRecommendations);
      setSellRecommendations(uniqueSellRecommendations);
      setGameweek(data.gameweek);
      setUpdatedAt(data.updated_at);
      setIsPersonalized(data.is_personalized || false);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching transfer recommendations:', err);
    } finally {
      setLoading(false);
    }
  }
  
  // Effect to fetch personalized recommendations when team data is available
  useEffect(() => {
    if (teamData && isPersonalized) {
      fetchRecommendations(fplId);
    }
  }, [teamData, isPersonalized, fplId]);
  
  // Function to fetch user's team data
  async function fetchUserTeam(id: string) {
    try {
      setLoadingTeam(true);
      setError(null);
      
      // Use the new API endpoint
      const response = await fetch(`/api/my-team/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`FPL ID ${id} not found. Please check and try again.`);
        }
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Failed to fetch team data: ${response.status}${errorData.error ? ` - ${errorData.error}` : ''}`);
      }
      
      const data = await response.json();
      setTeamData(data);
      
      // After getting team data, fetch personalized recommendations
      fetchRecommendations(id);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching team data:', err);
    } finally {
      setLoadingTeam(false);
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fplId && fplId.trim() !== '') {
      fetchUserTeam(fplId);
    }
  };
  
  // Helper function to get position abbreviation
  function getPositionShort(position: number): string {
    const positions: Record<number, string> = {
      1: 'GK',
      2: 'DEF',
      3: 'MID',
      4: 'FWD'
    };
    return positions[position] || 'UNK';
  }
  
  // Helper function to format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  
  // Helper function to format price
  function formatPrice(price: number): string {
    return `£${(price / 10).toFixed(1)}m`;
  }
  
  if (loading && !isPersonalized) {
    return (
      <Card className="mb-6" title="Transfer Recommendations">
        <div className="animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="mb-6 pb-6 border-b last:border-0">
              <div className="flex items-center mb-2">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
                <div className="ml-auto">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
              </div>
              <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  if (error && !isPersonalized) {
    return (
      <Card className="mb-6">
        <div className="text-red-500">Error: {error}</div>
      </Card>
    );
  }
  
  // Handle schema issues
  if (status === 'schema_issue') {
    return (
      <Card className="mb-6">
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md mb-4">
          <h3 className="text-lg font-semibold mb-2">Database Schema Issue</h3>
          <p>There appears to be an issue with the database schema for transfer recommendations. The system couldn't determine which column contains player IDs.</p>
          <p className="mt-2">Please contact the administrator to update the database schema.</p>
        </div>
      </Card>
    );
  }
  
  // Define the empty recommendations UI component
  const NoRecommendationsMessage = ({ type }: { type: 'buy' | 'sell' }) => (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
      <p className="text-center text-gray-700 dark:text-gray-300">
        No {type === 'buy' ? 'buy' : 'sell'} recommendations available for your team at this time.
      </p>
    </div>
  );
  
  return (
    <div className="space-y-6">
      {/* User's Team Card (when available) */}
      {isPersonalized && teamData && (
        <Card title={`Your Team for Gameweek ${teamData.gameweek}`}>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Team Value:</span> £{teamData.team_value.toFixed(1)}m
              </div>
              {teamData.chips && (
                <div className="text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                  Active Chip: {teamData.chips}
                </div>
              )}
            </div>
            
            {/* Team by position */}
            <div className="space-y-4">
              {Object.entries(teamData.positions).map(([posId, posName]) => (
                <div key={posId} className="border-t pt-2">
                  <h4 className="font-medium mb-2">{String(posName)}s</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {teamData.team_by_position[posId].map((pick: any) => (
                      <div 
                        key={pick.element} 
                        className={`p-2 rounded ${pick.is_captain ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}
                      >
                        <div className="flex items-center">
                          {pick.is_captain && <span className="mr-1 text-yellow-600 dark:text-yellow-400 font-bold">C</span>}
                          {pick.is_vice_captain && <span className="mr-1 text-yellow-600 dark:text-yellow-400 font-bold">V</span>}
                          <span className="font-medium">{pick.player.web_name}</span>
                          <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">
                            {pick.player.team_short_name}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          £{(pick.player.now_cost / 10).toFixed(1)}m | {pick.player.form} form
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
      
      <Card title={`Transfer Recommendations${teamData ? ` for Gameweek ${gameweek}` : ''}`}>
        {isPersonalized && updatedAt && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Last updated: {formatDate(updatedAt)}
          </p>
        )}
        
        {/* FPL ID Form */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">Get Personalized Recommendations</h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            Enter your FPL ID to get transfer suggestions tailored to your team.
          </p>
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1">
              <label htmlFor="fplId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                FPL ID
              </label>
              <input
                type="text"
                id="fplId"
                value={fplId}
                onChange={(e) => setFplId(e.target.value)}
                placeholder="e.g., 1234567"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] dark:bg-gray-800 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loadingTeam}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:opacity-50"
            >
              {loadingTeam ? 'Loading...' : 'Get Recommendations'}
            </button>
          </form>
          {isPersonalized && teamData && (
            <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/20 rounded text-green-800 dark:text-green-200 text-sm">
              ✓ Showing personalized recommendations for your team
            </div>
          )}
          {!teamData && !loadingTeam && (
            <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/20 rounded text-blue-800 dark:text-blue-200 text-sm">
              Enter your FPL ID above to see recommendations tailored to your team.
            </div>
          )}
        </div>
        
        {/* Only show tabs and recommendations after team data is loaded */}
        {teamData && (
          <>
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'buy'
                    ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('buy')}
              >
                Players to Buy
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'sell'
                    ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('sell')}
              >
                Players to Sell
              </button>
            </div>
            
            {loading && isPersonalized && (
              <div className="animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="mb-6 pb-6 border-b last:border-0">
                    <div className="flex items-center mb-2">
                      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
                      <div className="ml-auto">
                        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                    <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                ))}
              </div>
            )}
            
            {!loading && (
              <>
                {activeTab === 'buy' && (
                  <>
                    {buyRecommendations.length === 0 ? (
                      <NoRecommendationsMessage type="buy" />
                    ) : (
                      buyRecommendations.map((rec) => (
                        <div key={rec.id} className="mb-6 pb-6 border-b last:border-0">
                          <div className="flex items-center mb-2">
                            <h3 className="text-xl font-semibold">
                              {rec.players.first_name} {rec.players.second_name}
                            </h3>
                            <div className="ml-auto text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                              {rec.players.teams.short_name} | {getPositionShort(rec.players.position)} | {formatPrice(rec.players.now_cost)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Form:</span> {rec.players.form}
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Points per game:</span> {rec.players.points_per_game}
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Total points:</span> {rec.players.total_points}
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Confidence:</span> {(rec.confidence_score * 100).toFixed(0)}%
                            </div>
                          </div>
                          
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                            <p>{rec.reasoning}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}
                
                {activeTab === 'sell' && (
                  <>
                    {sellRecommendations.length === 0 ? (
                      <NoRecommendationsMessage type="sell" />
                    ) : (
                      sellRecommendations.map((rec) => (
                        <div key={rec.id} className="mb-6 pb-6 border-b last:border-0">
                          <div className="flex items-center mb-2">
                            <h3 className="text-xl font-semibold">
                              {rec.players.first_name} {rec.players.second_name}
                            </h3>
                            <div className="ml-auto text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                              {rec.players.teams.short_name} | {getPositionShort(rec.players.position)} | {formatPrice(rec.players.now_cost)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Form:</span> {rec.players.form}
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Points per game:</span> {rec.players.points_per_game}
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Total points:</span> {rec.players.total_points}
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Confidence:</span> {(rec.confidence_score * 100).toFixed(0)}%
                            </div>
                          </div>
                          
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                            <p>{rec.reasoning}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
} 