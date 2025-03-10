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

export default function FixtureDifficultyRankingCard() {
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

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortBy(sortBy === 'easiest' ? 'hardest' : 'easiest');
  };

  if (loading) {
    return (
      <Card title="Fixture Difficulty Rankings" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading fixture data...</p>
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
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Teams ranked by fixture difficulty for the next 5 gameweeks
        </p>
        <button 
          onClick={toggleSortOrder}
          className="px-3 py-1 text-sm font-medium text-[var(--primary)] hover:text-[#27ae60] focus:outline-none transition-colors border border-[var(--primary)] rounded-md"
        >
          Sort: {sortBy === 'easiest' ? 'Easiest First' : 'Hardest First'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Next 5</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedFixtures.map((team, index) => (
              <tr key={team.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {index + 1}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {team.team}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex space-x-1">
                    {team.nextFiveFixtures.map((fixture, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div 
                          className={`w-8 h-8 flex items-center justify-center text-xs font-medium text-white ${getDifficultyColor(fixture.difficulty)}`}
                          title={`${fixture.isHome ? 'vs' : '@'} ${fixture.opponent} ${fixture.event ? `(GW${fixture.event})` : ''} (FDR: ${fixture.difficulty})`}
                        >
                          {fixture.opponent}
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {fixture.isHome ? 'H' : 'A'}
                          </span>
                          {fixture.event && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {fixture.event}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span className={`font-bold ${sortBy === 'easiest' && index < 5 ? 'text-green-600 dark:text-green-400' : (sortBy === 'hardest' && index < 5 ? 'text-red-600 dark:text-red-400' : '')}`}>
                    {team.averageDifficulty.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>FDR = Fixture Difficulty Rating (1 = Easiest, 5 = Hardest)</p>
      </div>
    </Card>
  );
} 