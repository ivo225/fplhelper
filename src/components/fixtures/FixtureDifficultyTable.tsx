'use client';

import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';

interface TeamFixture {
  id: number;
  team: string;
  nextFiveFixtures: {
    opponent: string;
    difficulty: 1 | 2 | 3 | 4 | 5; // 1 = easiest, 5 = hardest
    isHome: boolean;
    event: number | null;
  }[];
  averageDifficulty: number;
}

export default function FixtureDifficultyTable() {
  const [fixtures, setFixtures] = useState<TeamFixture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'easiest' | 'hardest'>('easiest');

  useEffect(() => {
    async function fetchFixtureDifficulty() {
      try {
        setLoading(true);
        const response = await fetch('/api/fpl/fixture-difficulty');
        
        if (!response.ok) {
          throw new Error('Failed to fetch fixture difficulty data');
        }
        
        const data = await response.json();
        setFixtures(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching fixture difficulty:', err);
        setError('Failed to load fixture difficulty data');
      } finally {
        setLoading(false);
      }
    }

    fetchFixtureDifficulty();
  }, []);

  // Function to get the color based on difficulty
  const getDifficultyColor = (difficulty: number) => {
    switch(difficulty) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-green-300';
      case 3: return 'bg-gray-300';
      case 4: return 'bg-red-300';
      case 5: return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  // Function to get text color based on difficulty
  const getDifficultyTextColor = (difficulty: number) => {
    // Darker colors for better readability
    switch(difficulty) {
      case 1: 
      case 2: 
      case 3: 
      case 4: 
      case 5: return 'text-white';
      default: return 'text-white';
    }
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortBy(sortBy === 'easiest' ? 'hardest' : 'easiest');
  };

  if (loading) {
    return (
      <Card title="Fixture Difficulty Rankings" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading fixture data...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Fixture Difficulty Rankings" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </Card>
    );
  }

  // Sort fixtures by difficulty
  const sortedFixtures = [...fixtures].sort((a, b) => {
    if (sortBy === 'easiest') {
      return a.averageDifficulty - b.averageDifficulty;
    } else {
      return b.averageDifficulty - a.averageDifficulty;
    }
  });

  return (
    <Card title="Fixture Difficulty Rankings" className="h-full">
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">
          Teams ranked by fixture difficulty for the next 5 gameweeks
        </p>
        <div className="flex justify-end">
          <button 
            onClick={toggleSortOrder}
            className="px-3 py-1 text-sm font-medium text-[var(--fpl-purple)] border border-gray-300 rounded hover:bg-gray-50 focus:outline-none"
          >
            Sort: {sortBy === 'easiest' ? 'Easiest First' : 'Hardest First'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[var(--fpl-purple)]">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Rank</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Team</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Next 5</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Avg</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedFixtures.map((team, index) => (
              <tr key={team.id} className="hover:bg-gray-50">
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {team.team}
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="flex space-x-1">
                    {team.nextFiveFixtures.map((fixture, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 flex items-center justify-center text-xs font-medium ${getDifficultyColor(fixture.difficulty)} ${getDifficultyTextColor(fixture.difficulty)}`}
                          title={`${fixture.isHome ? 'vs' : '@'} ${fixture.opponent} ${fixture.event ? `(GW${fixture.event})` : ''} (FDR: ${fixture.difficulty})`}
                        >
                          {fixture.opponent}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {fixture.isHome ? 'H' : 'A'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {fixture.event ?? ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`font-medium ${team.averageDifficulty <= 2.5 ? 'text-green-600' : team.averageDifficulty >= 3.5 ? 'text-red-600' : 'text-gray-900'}`}>
                    {team.averageDifficulty.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
