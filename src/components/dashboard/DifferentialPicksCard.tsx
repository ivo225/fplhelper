'use client';

import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';

interface DifferentialPick {
  id: number;
  name: string;
  team: string;
  position: string;
  price: number;
  ownership: number | string;
  expectedPoints: number;
  nextFixture: string;
}

export default function DifferentialPicksCard() {
  const [differentials, setDifferentials] = useState<DifferentialPick[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDifferentialPicks() {
      try {
        setLoading(true);
        const response = await fetch('/api/fpl/differential-picks');
        
        if (!response.ok) {
          throw new Error('Failed to fetch differential picks data');
        }
        
        const data = await response.json();
        setDifferentials(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching differential picks:', err);
        setError('Failed to load differential picks data');
      } finally {
        setLoading(false);
      }
    }

    fetchDifferentialPicks();
  }, []);

  // Function to format ownership value
  const formatOwnership = (ownership: number | string): string => {
    if (typeof ownership === 'number') {
      return ownership.toFixed(1);
    } else if (typeof ownership === 'string') {
      return parseFloat(ownership).toFixed(1);
    }
    return '0.0';
  };

  if (loading) {
    return (
      <Card title="Best Differential Picks" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading differential picks data...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Best Differential Picks" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Best Differential Picks" className="h-full">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Player</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Team</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Pos</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Price</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Owned</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">xPts</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Next</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {differentials.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-[var(--fpl-purple-dark)]">
                  {player.name}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-[var(--fpl-purple-dark)]">
                  {player.team}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    player.position === 'GK' ? 'bg-yellow-100 text-yellow-800' :
                    player.position === 'DEF' ? 'bg-blue-100 text-blue-800' :
                    player.position === 'MID' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {player.position}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-[var(--fpl-purple-dark)]">
                  £{player.price.toFixed(1)}m
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-[var(--fpl-blue)] font-medium">
                  {formatOwnership(player.ownership)}%
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-[var(--fpl-purple)]">
                  {player.expectedPoints.toFixed(1)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-[var(--fpl-purple-dark)]">
                  {player.nextFixture}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-[var(--fpl-purple-dark)]">
        <p>Differentials are players with less than 10% ownership that have high expected points for upcoming gameweeks.</p>
      </div>
    </Card>
  );
}
