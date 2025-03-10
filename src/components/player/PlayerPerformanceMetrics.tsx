'use client';

import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';

interface PerformanceData {
  name: string;
  value: number;
  maxValue: number;
  color: string;
}

export default function PlayerPerformanceMetrics() {
  const [topPerformers, setTopPerformers] = useState<{
    points: PerformanceData[];
    form: PerformanceData[];
    ict: PerformanceData[];
    value: PerformanceData[];
  }>({
    points: [],
    form: [],
    ict: [],
    value: [],
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopPerformers() {
      try {
        setLoading(true);
        const response = await fetch('/api/fpl/players/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch player stats');
        }
        
        const data = await response.json();
        const players = data.players;
        
        if (!players || !Array.isArray(players)) {
          throw new Error('Invalid player data format');
        }

        // Sort players by total points
        const byPoints = [...players]
          .sort((a, b) => b.total_points - a.total_points)
          .slice(0, 5)
          .map(player => ({
            name: player.name,
            value: player.total_points,
            maxValue: Math.max(...players.map(p => p.total_points)),
            color: getPositionColor(player.position),
          }));

        // Sort players by form
        const byForm = [...players]
          .sort((a, b) => b.form - a.form)
          .slice(0, 5)
          .map(player => ({
            name: player.name,
            value: parseFloat(player.form),
            maxValue: Math.max(...players.map(p => parseFloat(p.form))),
            color: getPositionColor(player.position),
          }));

        // Sort players by ICT index
        const byICT = [...players]
          .sort((a, b) => b.ict_index - a.ict_index)
          .slice(0, 5)
          .map(player => ({
            name: player.name,
            value: parseFloat(player.ict_index),
            maxValue: Math.max(...players.map(p => parseFloat(p.ict_index))),
            color: getPositionColor(player.position),
          }));

        // Sort players by value (points per million)
        const byValue = [...players]
          .filter(player => player.minutes > 90) // Only include players with significant minutes
          .map(player => ({
            ...player,
            value_score: player.total_points / player.price,
          }))
          .sort((a, b) => b.value_score - a.value_score)
          .slice(0, 5)
          .map(player => ({
            name: player.name,
            value: parseFloat((player.total_points / player.price).toFixed(1)),
            maxValue: Math.max(...players
              .filter(p => p.minutes > 90)
              .map(p => p.total_points / p.price)),
            color: getPositionColor(player.position),
          }));

        setTopPerformers({
          points: byPoints,
          form: byForm,
          ict: byICT,
          value: byValue,
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching top performers:', err);
        setError('Failed to load player performance metrics');
      } finally {
        setLoading(false);
      }
    }

    fetchTopPerformers();
  }, []);

  const getPositionColor = (position: string): string => {
    switch (position) {
      case 'GK':
        return 'bg-yellow-500';
      case 'DEF':
        return 'bg-blue-500';
      case 'MID':
        return 'bg-green-500';
      case 'FWD':
        return 'bg-red-500';
      case 'COACH':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Check if any coaches are present in the top performers
  const hasCoaches = () => {
    return (
      topPerformers.points.some(player => player.color === 'bg-purple-500') ||
      topPerformers.form.some(player => player.color === 'bg-purple-500') ||
      topPerformers.ict.some(player => player.color === 'bg-purple-500') ||
      topPerformers.value.some(player => player.color === 'bg-purple-500')
    );
  };

  if (loading) {
    return (
      <Card title="Performance Metrics" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading performance data...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Performance Metrics" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Performance Metrics" className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Points Scorers */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Top Points</h3>
          <div className="space-y-3">
            {topPerformers.points.map((player, index) => (
              <div key={`points-${index}`} className="relative">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{player.name}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{player.value}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${player.color}`} 
                    style={{ width: `${(player.value / player.maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Form Players */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Best Form</h3>
          <div className="space-y-3">
            {topPerformers.form.map((player, index) => (
              <div key={`form-${index}`} className="relative">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{player.name}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{player.value.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${player.color}`} 
                    style={{ width: `${(player.value / player.maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top ICT Index */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Highest ICT Index</h3>
          <div className="space-y-3">
            {topPerformers.ict.map((player, index) => (
              <div key={`ict-${index}`} className="relative">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{player.name}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{player.value.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${player.color}`} 
                    style={{ width: `${(player.value / player.maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Value (Points per Million) */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Best Value (Pts/£m)</h3>
          <div className="space-y-3">
            {topPerformers.value.map((player, index) => (
              <div key={`value-${index}`} className="relative">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{player.name}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{player.value.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${player.color}`} 
                    style={{ width: `${(player.value / player.maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center">
            <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
            <span>Goalkeeper</span>
          </span>
          
          <span className="inline-flex items-center ml-4">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
            <span>Defender</span>
          </span>
          
          <span className="inline-flex items-center ml-4">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
            <span>Midfielder</span>
          </span>
          
          <span className="inline-flex items-center ml-4">
            <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
            <span>Forward</span>
          </span>
          
          {hasCoaches() && (
            <span className="inline-flex items-center ml-4">
              <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-1"></span>
              <span>Coach</span>
            </span>
          )}
        </div>
      </div>
    </Card>
  );
} 