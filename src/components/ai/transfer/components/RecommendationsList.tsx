'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { TransferRecommendation } from '../types';
import PlayerCard from './PlayerCard';
import { formatDate } from '../utils';

interface RecommendationsListProps {
  title: string;
  recommendations: TransferRecommendation[];
  type: 'buy' | 'sell';
  gameweek: number;
  updatedAt: string;
}

export default function RecommendationsList({
  title,
  recommendations,
  type,
  gameweek,
  updatedAt
}: RecommendationsListProps) {
  if (recommendations.length === 0) {
    return (
      <div className="p-4 bg-gray-100 rounded-md">
        <p className="text-center text-gray-700">
          No {type === 'buy' ? 'buy' : 'sell'} recommendations available at this time.
        </p>
      </div>
    );
  }

  // Check if any premium players were excluded from sell recommendations
  const hasPremiumAssets = recommendations.some(rec => rec.is_premium_asset);

  return (
    <Card title={`${title} for Gameweek ${gameweek}`}>
      <p className="text-sm text-gray-500 mb-4">
        Last updated: {formatDate(updatedAt)}
      </p>
      
      {/* Show a special note about premium assets with good fixtures */}
      {type === 'sell' && hasPremiumAssets && (
        <div className="p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-md mb-4">
          <p className="text-sm flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              <strong>Premium players with good fixtures</strong> like TAA, Salah, and Haaland are excluded from sell recommendations regardless of temporary form dips.
            </span>
          </p>
        </div>
      )}
      
      {recommendations.map((rec) => (
        <PlayerCard key={rec.id} recommendation={rec} type={type} />
      ))}
    </Card>
  );
}
