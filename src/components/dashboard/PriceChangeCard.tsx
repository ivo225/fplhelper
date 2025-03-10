'use client';

import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';

interface PriceChange {
  id: number;
  name: string;
  team: string;
  position: string;
  oldPrice: number;
  newPrice: number;
  ownership: number | string;
}

interface PriceChangeData {
  priceRises: PriceChange[];
  priceFalls: PriceChange[];
}

export default function PriceChangeCard() {
  const [priceChanges, setPriceChanges] = useState<PriceChangeData>({ priceRises: [], priceFalls: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPriceChanges() {
      try {
        setLoading(true);
        const response = await fetch('/api/fpl/price-changes');
        
        if (!response.ok) {
          throw new Error('Failed to fetch price changes data');
        }
        
        const data = await response.json();
        setPriceChanges(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching price changes:', err);
        setError('Failed to load price changes data');
      } finally {
        setLoading(false);
      }
    }

    fetchPriceChanges();
  }, []);

  const renderPriceChangeRow = (player: PriceChange, isRise: boolean) => {
    const changeAmount = (player.newPrice - player.oldPrice).toFixed(1);
    const changeClass = isRise ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    const changeSymbol = isRise ? '+' : '';
    
    // Ensure ownership is a number before calling toFixed
    const ownershipValue = typeof player.ownership === 'number' 
      ? player.ownership.toFixed(1) 
      : typeof player.ownership === 'string' 
        ? parseFloat(player.ownership).toFixed(1)
        : '0.0';
    
    return (
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
          £{player.oldPrice.toFixed(1)}m
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
          <span className={changeClass}>
            £{player.newPrice.toFixed(1)}m ({changeSymbol}{changeAmount}m)
          </span>
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          {ownershipValue}%
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <Card title="Price Changes" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading price changes data...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Price Changes" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Price Changes" className="h-full">
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Price Rises</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Player</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pos</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Old</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">New</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {priceChanges.priceRises.map(player => renderPriceChangeRow(player, true))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Price Falls</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Player</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pos</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Old</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">New</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {priceChanges.priceFalls.map(player => renderPriceChangeRow(player, false))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
} 