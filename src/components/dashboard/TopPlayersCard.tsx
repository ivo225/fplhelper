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
          <p className="text-gray-500 dark:text-gray-400">Loading player data...</p>
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
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Player</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pos</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pts</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">xG</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">xA</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {players.map((player) => (
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
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                  {player.points}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {player.xG.toFixed(1)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
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