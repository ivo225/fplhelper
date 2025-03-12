'use client';

import React from 'react';
import Link from 'next/link';

interface Player {
  id: number;
  web_name: string;
  team_name: string;
  team_short_name: string;
  position_name: string;
  total_points: number;
  now_cost: number;
  form: string;
}

interface SearchResultsProps {
  results: Player[];
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

export default function SearchResults({ 
  results, 
  isLoading, 
  error, 
  onClose 
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--fpl-purple)]"></div>
          <span className="ml-2 text-gray-600">Searching...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4">
        <div className="text-red-500 p-2">{error}</div>
        <button 
          onClick={onClose}
          className="mt-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4">
        <div className="text-gray-500 p-2">No players found. Try a different search term.</div>
        <button 
          onClick={onClose}
          className="mt-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
      <div className="p-2 sticky top-0 bg-white border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-[var(--fpl-purple-dark)]">Search Results</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <ul className="divide-y divide-gray-200">
        {results.map((player) => (
          <li key={player.id} className="hover:bg-gray-50">
            <Link 
              href={`/player-stats?player=${player.id}`}
              className="block p-4"
              onClick={onClose}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs text-white ${getPositionColor(player.position_name)}`}>
                    {player.position_name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-[var(--fpl-purple-dark)]">{player.web_name}</p>
                    <p className="text-sm text-gray-500">{player.team_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[var(--fpl-purple)]">{player.total_points} pts</p>
                  <p className="text-sm text-gray-500">£{(player.now_cost / 10).toFixed(1)}m</p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Helper function to get position color
function getPositionColor(position: string): string {
  switch (position) {
    case 'GK':
      return 'bg-amber-700';
    case 'DEF':
      return 'bg-blue-600';
    case 'MID':
      return 'bg-green-600';
    case 'FWD':
      return 'bg-red-600';
    default:
      return 'bg-gray-600';
  }
} 