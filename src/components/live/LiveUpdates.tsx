'use client';

import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';

interface LivePlayer {
  id: number;
  name: string;
  team: string;
  position: string;
  points: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  in_dreamteam: boolean;
}

interface BonusPrediction {
  fixture_id: number;
  home_team: string;
  away_team: string;
  players: {
    id: number;
    name: string;
    team: string;
    bps: number;
    predicted_bonus: number;
  }[];
}

interface LiveFixture {
  id: number;
  started: boolean;
  finished: boolean;
  finished_provisional: boolean;
  kickoff_time: string;
  minutes: number;
  home_team_id: number;
  home_team_name: string;
  home_team_score: number;
  away_team_id: number;
  away_team_name: string;
  away_team_score: number;
  stats: any[];
}

interface LiveData {
  status: string;
  isLive: boolean;
  gameweek: number;
  lastUpdated: string;
  livePlayers: LivePlayer[];
  bonusPredictions: BonusPrediction[];
  fixtures: LiveFixture[];
}

export default function LiveUpdates() {
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'points' | 'bonus'>('points');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [teamFilter, setTeamFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [playersPerPage, setPlayersPerPage] = useState(15);

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/fpl/live');
        
        if (!response.ok) {
          throw new Error('Failed to fetch live data');
        }
        
        const data = await response.json();
        setLiveData(data);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        console.error('Error fetching live data:', err);
        setError('Failed to load live updates');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchLiveData();
    
    // Set up polling every 60 seconds
    const interval = setInterval(() => {
      fetchLiveData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [positionFilter, teamFilter, searchQuery, activeTab]);

  const getPositionColor = (position: string): string => {
    switch (position) {
      case 'GK':
        return 'bg-amber-700 text-white';
      case 'DEF':
        return 'bg-blue-600 text-white';
      case 'MID':
        return 'bg-green-600 text-white';
      case 'FWD':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getBonusColor = (bonus: number): string => {
    switch (bonus) {
      case 3:
        return 'text-yellow-500 font-bold';
      case 2:
        return 'text-gray-400 font-bold';
      case 1:
        return 'text-amber-700 font-bold';
      default:
        return 'text-gray-400';
    }
  };

  const getFilteredPlayers = () => {
    if (!liveData || !liveData.livePlayers) return [];
    
    return liveData.livePlayers.filter(player => {
      // Apply position filter
      if (positionFilter !== 'ALL' && player.position !== positionFilter) {
        return false;
      }
      
      // Apply team filter
      if (teamFilter !== 'ALL' && player.team !== teamFilter) {
        return false;
      }
      
      // Apply search filter
      if (searchQuery && !player.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  const getTeams = () => {
    if (!liveData || !liveData.livePlayers) return [];
    
    const teams = new Set<string>();
    liveData.livePlayers.forEach(player => teams.add(player.team));
    return Array.from(teams).sort();
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    
    return lastUpdated.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  // Get paginated data
  const getPaginatedPlayers = () => {
    const filteredPlayers = getFilteredPlayers();
    const indexOfLastPlayer = currentPage * playersPerPage;
    const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
    return filteredPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer);
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(getFilteredPlayers().length / playersPerPage);
  
  // Pagination controls
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading && !liveData) {
    return (
      <Card title="Live Updates" className="h-full">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-purple-500 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error && !liveData) {
    return (
      <Card title="Live Updates" className="h-full">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-gray-500 mt-2 text-sm">Please try refreshing the page.</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!liveData || !liveData.isLive) {
    return (
      <Card title="Live Updates" className="h-full">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2 text-lg font-medium">No live matches currently in progress</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Live updates will be available during active gameweeks
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main content card */}
      <Card title={`Gameweek ${liveData.gameweek} Live Updates`} className="overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex space-x-3 items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-600 text-white">
              Live
            </span>
            <span className="text-sm text-gray-500">
              Last updated: {formatLastUpdated()}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('points')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'points'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <div className="flex items-center space-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Points</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bonus')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'bonus'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <div className="flex items-center space-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>Bonus</span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Content based on active tab */}
        {activeTab === 'points' && (
          <div>
            {/* Filters in a row */}
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="position-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Position:
                  </label>
                  <select
                    id="position-filter"
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white"
                  >
                    <option value="ALL">All Positions</option>
                    <option value="GK">Goalkeepers</option>
                    <option value="DEF">Defenders</option>
                    <option value="MID">Midfielders</option>
                    <option value="FWD">Forwards</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="team-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Team:
                  </label>
                  <select
                    id="team-filter"
                    value={teamFilter}
                    onChange={(e) => setTeamFilter(e.target.value)}
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white"
                  >
                    <option value="ALL">All Teams</option>
                    {getTeams().map(team => (
                      <option key={team} value={team}>
                        {team}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Search Player:
                  </label>
                  <input
                    id="search-filter"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter player name..."
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white"
                  />
                </div>
              </div>
            </div>
            
            {/* Player count and entries per page control */}
            <div className="flex justify-between items-center mb-2 text-sm">
              <div className="text-gray-500">
                Showing {getFilteredPlayers().length > 0 ? ((currentPage - 1) * playersPerPage) + 1 : 0}-
                {Math.min(currentPage * playersPerPage, getFilteredPlayers().length)} of {getFilteredPlayers().length} players
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="per-page" className="text-gray-600 text-sm">Show:</label>
                <select
                  id="per-page"
                  value={playersPerPage}
                  onChange={(e) => setPlayersPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded text-sm px-2 py-1 bg-white"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Player table */}
            <div className="overflow-hidden rounded-md border border-gray-200">
              <div className="overflow-x-auto" style={{ maxHeight: '600px' }}>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-700 text-white sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                        Pos
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                        Pts
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                        Mins
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                        G
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                        A
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                        CS
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                        Saves
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                        Bonus
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getPaginatedPlayers().length > 0 ? (
                      getPaginatedPlayers().map((player) => (
                        <tr key={player.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {player.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {player.team}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded text-xs font-medium ${getPositionColor(player.position)}`}>
                              {player.position}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-center">
                            {player.points}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                            {player.minutes}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                            {player.goals_scored}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                            {player.assists}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                            {player.clean_sheets}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                            {player.saves}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-center">
                            {player.bonus}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="px-4 py-4 text-center text-sm text-gray-500">
                          No players match the selected filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Pagination controls */}
            {getFilteredPlayers().length > playersPerPage && (
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 border border-gray-300 rounded-md text-sm ${
                    currentPage === 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 border border-gray-300 rounded-md text-sm ${
                    currentPage === totalPages 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bonus Points Predictions */}
        {activeTab === 'bonus' && (
          <div className="space-y-6">
            {liveData.bonusPredictions.length > 0 ? (
              liveData.bonusPredictions.map((prediction) => (
                <div key={prediction.fixture_id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      {prediction.home_team} vs {prediction.away_team}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-600 text-white">
                      Live
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-purple-700 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Player
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Team
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                            BPS
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                            Predicted Bonus
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {prediction.players.map((player) => (
                          <tr key={player.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {player.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {player.team}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                              {player.bps}
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm text-center ${getBonusColor(player.predicted_bonus)}`}>
                              {player.predicted_bonus > 0 ? `+${player.predicted_bonus}` : '0'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center py-8">
                <div className="text-center">
                  <p className="text-gray-500">No bonus point predictions available yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Predictions will appear during live matches
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
} 