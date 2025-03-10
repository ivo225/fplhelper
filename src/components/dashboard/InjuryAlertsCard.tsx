'use client';

import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';

interface InjuryAlert {
  id: number;
  name: string;
  team: string;
  position: string;
  status: 'Injured' | 'Doubtful' | 'Suspended';
  returnDate: string;
  ownership: number | string;
  info: string;
}

export default function InjuryAlertsCard() {
  const [injuries, setInjuries] = useState<InjuryAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInjuryAlerts() {
      try {
        setLoading(true);
        const response = await fetch('/api/fpl/injury-alerts');
        
        if (!response.ok) {
          throw new Error('Failed to fetch injury alerts data');
        }
        
        const data = await response.json();
        setInjuries(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching injury alerts:', err);
        setError('Failed to load injury alerts data');
      } finally {
        setLoading(false);
      }
    }

    fetchInjuryAlerts();
  }, []);

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Injured': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Doubtful': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Suspended': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

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
      <Card title="Injury & Suspension Alerts" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading injury data...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Injury & Suspension Alerts" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Injury & Suspension Alerts" className="h-full">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Player</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pos</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Return</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owned</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Info</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {injuries.map((player) => (
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
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(player.status)}`}>
                    {player.status}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {player.returnDate}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatOwnership(player.ownership)}%
                </td>
                <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  {player.info}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
} 