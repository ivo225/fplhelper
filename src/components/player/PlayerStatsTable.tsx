'use client';

import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';

interface PlayerStats {
  id: number;
  name: string;
  team: string;
  position: string;
  price: number;
  total_points: number;
  points_per_game: number;
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
  influence: number;
  creativity: number;
  threat: number;
  ict_index: number;
  form: number;
  selected_by_percent: number;
  xG: number;
  xA: number;
}

interface FilterOptions {
  position: string;
  team: string;
  priceMin: number;
  priceMax: number;
  ownershipMin: number;
  ownershipMax: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function PlayerStatsTable() {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerStats[]>([]);
  const [displayedPlayers, setDisplayedPlayers] = useState<PlayerStats[]>([]);
  const [teams, setTeams] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [playersPerPage] = useState<number>(50);
  
  const [filters, setFilters] = useState<FilterOptions>({
    position: 'ALL',
    team: 'ALL',
    priceMin: 0,
    priceMax: 15,
    ownershipMin: 0,
    ownershipMax: 100,
    sortBy: 'total_points',
    sortOrder: 'desc',
  });

  // Fetch player data
  useEffect(() => {
    async function fetchPlayerStats() {
      try {
        setLoading(true);
        const response = await fetch('/api/fpl/players/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch player stats');
        }
        
        const data = await response.json();
        setPlayers(data.players);
        setTeams(data.teams);
        setError(null);
      } catch (err) {
        console.error('Error fetching player stats:', err);
        setError('Failed to load player statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchPlayerStats();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    if (players.length === 0) return;

    let result = [...players];

    // Apply position filter
    if (filters.position !== 'ALL') {
      result = result.filter(player => player.position === filters.position);
    }

    // Apply team filter
    if (filters.team !== 'ALL') {
      result = result.filter(player => player.team === filters.team);
    }

    // Apply price filter
    result = result.filter(player => 
      player.price >= filters.priceMin && 
      player.price <= filters.priceMax
    );

    // Apply ownership filter
    result = result.filter(player => {
      const ownership = player.selected_by_percent;
      return ownership >= filters.ownershipMin && ownership <= filters.ownershipMax;
    });

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[filters.sortBy as keyof PlayerStats];
      const bValue = b[filters.sortBy as keyof PlayerStats];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return filters.sortOrder === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });

    setFilteredPlayers(result);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [players, filters]);

  // Update displayed players based on pagination
  useEffect(() => {
    if (filteredPlayers.length === 0) return;
    
    const indexOfLastPlayer = currentPage * playersPerPage;
    const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
    setDisplayedPlayers(filteredPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer));
  }, [filteredPlayers, currentPage, playersPerPage]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'priceMin' || name === 'priceMax' || name === 'ownershipMin' || name === 'ownershipMax') {
      setFilters(prev => ({
        ...prev,
        [name]: parseFloat(value),
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSortChange = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  const getSortIndicator = (field: string) => {
    if (filters.sortBy !== field) return null;
    return filters.sortOrder === 'asc' ? '↑' : '↓';
  };

  // Pagination controls
  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const renderPaginationControls = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Show current page and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pageNumbers.includes(i)) {
        pageNumbers.push(i);
      }
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1 && !pageNumbers.includes(totalPages)) {
      // Add ellipsis if there's a gap
      if (pageNumbers[pageNumbers.length - 1] !== totalPages - 1) {
        pageNumbers.push(-1); // -1 represents ellipsis
      }
      pageNumbers.push(totalPages);
    }
    
    return (
      <div className="flex items-center justify-center space-x-2 mt-4">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded ${
            currentPage === 1
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Previous
        </button>
        
        {pageNumbers.map((number, index) => (
          number === -1 ? (
            <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
          ) : (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`px-3 py-1 rounded ${
                currentPage === number
                  ? 'bg-blue-500 text-white dark:bg-blue-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {number}
            </button>
          )
        ))}
        
        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages || totalPages === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <Card title="Player Statistics" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading player data...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Player Statistics" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Player Statistics" className="h-full">
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Position Filter */}
        <div>
          <label htmlFor="position-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Position:
          </label>
          <select
            id="position-filter"
            name="position"
            value={filters.position}
            onChange={handleFilterChange}
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
            name="team"
            value={filters.team}
            onChange={handleFilterChange}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="ALL">All Teams</option>
            {teams.map(team => (
              <option key={team.id} value={team.name}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Price Range (£m):
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              name="priceMin"
              value={filters.priceMin}
              onChange={handleFilterChange}
              min="0"
              max="15"
              step="0.1"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              name="priceMax"
              value={filters.priceMax}
              onChange={handleFilterChange}
              min="0"
              max="15"
              step="0.1"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Ownership Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ownership Range (%):
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              name="ownershipMin"
              value={filters.ownershipMin}
              onChange={handleFilterChange}
              min="0"
              max="100"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              name="ownershipMax"
              value={filters.ownershipMax}
              onChange={handleFilterChange}
              min="0"
              max="100"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('name')}
              >
                Player {getSortIndicator('name')}
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('team')}
              >
                Team {getSortIndicator('team')}
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('position')}
              >
                Pos {getSortIndicator('position')}
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('price')}
              >
                Price {getSortIndicator('price')}
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('total_points')}
              >
                Pts {getSortIndicator('total_points')}
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('form')}
              >
                Form {getSortIndicator('form')}
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('minutes')}
              >
                Mins {getSortIndicator('minutes')}
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('goals_scored')}
              >
                G {getSortIndicator('goals_scored')}
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('assists')}
              >
                A {getSortIndicator('assists')}
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('xG')}
              >
                xG {getSortIndicator('xG')}
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('xA')}
              >
                xA {getSortIndicator('xA')}
              </th>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('selected_by_percent')}
              >
                Owned {getSortIndicator('selected_by_percent')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {displayedPlayers.length > 0 ? (
              displayedPlayers.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {player.name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {player.team}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      player.position === 'GK' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      player.position === 'DEF' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      player.position === 'MID' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {player.position}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    £{player.price.toFixed(1)}m
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {player.total_points}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {player.form}
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
                    {player.xG?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {player.xA?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {player.selected_by_percent.toFixed(1)}%
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="px-3 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  No players match the selected filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination controls */}
      {renderPaginationControls()}
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Showing {displayedPlayers.length} of {filteredPlayers.length} players (Page {currentPage} of {totalPages || 1})</p>
      </div>
    </Card>
  );
} 