'use client';

import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';

interface PlayerData {
  id: number;
  name: string;
  team: string;
  position: string;
  points: number;
  xG: number;
  xA: number;
  form: number[];
}

export default function TopPlayersCard() {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopPlayers() {
      try {
        setLoading(true);
        const response = await fetch('/api/fpl/top-players');
        
        if (!response.ok) {
          throw new Error('Failed to fetch top players');
        }
        
        const data = await response.json();
        setPlayers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching top players:', err);
        setError('Failed to load top players data');
      } finally {
        setLoading(false);
      }
    }

    fetchTopPlayers();
  }, []);

  // Function to render the mini form graph
  const renderFormGraph = (form: number[]) => {
    if (!form || form.length === 0) {
      return <div className="h-6">No form data</div>;
    }
    
    const max = Math.max(...form);
    
    return (
      <div className="flex items-end h-6 space-x-1">
        {form.map((points, index) => {
          const height = max > 0 ? (points / max) * 100 : 0;
          return (
            <div 
              key={index}
              className="w-1 bg-[var(--data-blue)] rounded-t"
              style={{ height: `${height}%` }}
              title={`GW${index + 1}: ${points} pts`}
            />
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <Card title="Top Players of the Week" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading player data...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Top Players of the Week" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Top Players of the Week" className="h-full">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Player</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Team</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Pos</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Pts</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">xG</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">xA</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {players.map((player) => (
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
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-[var(--fpl-purple-dark)]">
                  {player.points}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-[var(--fpl-purple-dark)]">
                  {player.xG.toFixed(1)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-[var(--fpl-purple-dark)]">
                  {player.xA.toFixed(1)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {renderFormGraph(player.form)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
