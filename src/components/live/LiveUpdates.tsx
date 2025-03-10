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

  const getPositionColor = (position: string): string => {
    switch (position) {
      case 'GK':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'DEF':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'MID':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'FWD':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getBonusColor = (bonus: number): string => {
    switch (bonus) {
      case 3:
        return 'text-yellow-500 font-bold';
      case 2:
        return 'text-gray-500 font-bold';
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

  if (loading && !liveData) {
    return (
      <Card title="Live Updates" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading live data...</p>
        </div>
      </Card>
    );
  }

  if (error && !liveData) {
    return (
      <Card title="Live Updates" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </Card>
    );
  }

  if (!liveData || !liveData.isLive) {
    return (
      <Card title="Live Updates" className="h-full">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-2">No live matches currently in progress</p>
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
      {/* Live Fixtures Card */}
      <Card title={`Gameweek ${liveData.gameweek} Live Matches`} className="h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveData.fixtures.map(fixture => (
            <div key={fixture.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {fixture.minutes}' {fixture.minutes >= 45 && fixture.minutes < 60 ? 'HT' : fixture.minutes >= 90 ? 'FT' : ''}
                </span>
                <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                  Live
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{fixture.home_team_name}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{fixture.home_team_score}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{fixture.away_team_name}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{fixture.away_team_score}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-right">
          Last updated: {formatLastUpdated()}
        </div>
      </Card>

      {/* Tabs for Points and Bonus */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('points')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'points'
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Live Points Tracker
          </button>
          <button
            onClick={() => setActiveTab('bonus')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bonus'
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bonus Points Predictions
          </button>
        </nav>
      </div>

      {/* Live Points Tracker */}
      {activeTab === 'points' && (
        <Card title="Live Points Tracker" className="h-full">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Position Filter */}
            <div>
              <label htmlFor="position-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Position:
              </label>
              <select
                id="position-filter"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="ALL">All Positions</option>
                <option value="GK">Goalkeepers</option>
                <option value="DEF">Defenders</option>
                <option value="MID">Midfielders</option>
                <option value="FWD">Forwards</option>
              </select>
            </div>

            {/* Team Filter */}
            <div>
              <label htmlFor="team-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Team:
              </label>
              <select
                id="team-filter"
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="ALL">All Teams</option>
                {getTeams().map(team => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Filter */}
            <div>
              <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search Player:
              </label>
              <input
                id="search-filter"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter player name..."
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pos
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pts
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Mins
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    G
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    A
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    CS
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Saves
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Bonus
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {getFilteredPlayers().length > 0 ? (
                  getFilteredPlayers().map((player) => (
                    <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {player.name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {player.team}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPositionColor(player.position)}`}>
                          {player.position}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                        {player.points}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {player.minutes}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {player.goals_scored}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {player.assists}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {player.clean_sheets}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {player.saves}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {player.bonus}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-3 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                      No players match the selected filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-right">
            Last updated: {formatLastUpdated()}
          </div>
        </Card>
      )}

      {/* Bonus Points Predictions */}
      {activeTab === 'bonus' && (
        <Card title="Bonus Points Predictions" className="h-full">
          <div className="space-y-6">
            {liveData.bonusPredictions.length > 0 ? (
              liveData.bonusPredictions.map((prediction) => (
                <div key={prediction.fixture_id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    {prediction.home_team} vs {prediction.away_team}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Player
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Team
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            BPS
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Predicted Bonus
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {prediction.players.map((player) => (
                          <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {player.name}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {player.team}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {player.bps}
                            </td>
                            <td className={`px-3 py-2 whitespace-nowrap text-sm ${getBonusColor(player.predicted_bonus)}`}>
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
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No bonus point predictions available</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-right">
            Last updated: {formatLastUpdated()}
          </div>
        </Card>
      )}
    </div>
  );
} 