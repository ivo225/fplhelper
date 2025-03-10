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

export default function FixtureDifficultyCard() {
  const [fixtures, setFixtures] = useState<TeamFixture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);

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

  // Toggle expanded view
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  if (loading) {
    return (
      <Card title="Fixture Difficulty Ratings" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading fixture data...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Fixture Difficulty Ratings" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </Card>
    );
  }

  // Determine which teams to display based on expanded state
  const teamsToDisplay = expanded ? fixtures : fixtures.slice(0, 5);

  return (
    <Card title="Fixture Difficulty Ratings" className="h-full">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Team</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Next 5</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Avg</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teamsToDisplay.map((team) => (
              <tr key={team.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-[var(--fpl-purple-dark)]">
                  {team.team}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex space-x-1">
                    {team.nextFiveFixtures.map((fixture, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className={`w-8 h-8 flex items-center justify-center text-xs font-medium text-white ${getDifficultyColor(fixture.difficulty)}`}
                          title={`${fixture.isHome ? 'vs' : '@'} ${fixture.opponent} ${fixture.event ? `(GW${fixture.event})` : ''} (FDR: ${fixture.difficulty})`}
                        >
                          {fixture.opponent}
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-[var(--fpl-purple-dark)]">
                            {fixture.isHome ? 'H' : 'A'}
                          </span>
                          {fixture.event && (
                            <span className="text-xs text-gray-500">
                              {fixture.event}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-[var(--fpl-purple-dark)]">
                  {team.averageDifficulty.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Show/Hide button */}
      <div className="mt-4 text-center">
        <button 
          onClick={toggleExpanded}
          className="bg-fpl-gradient px-4 py-2 text-sm font-medium text-white hover:opacity-90 rounded-md focus:outline-none transition-all"
        >
          {expanded ? 'Show Less Teams' : `Show All Teams (${fixtures.length})`}
        </button>
      </div>
    </Card>
  );
}
