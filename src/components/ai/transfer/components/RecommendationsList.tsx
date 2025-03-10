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

  return (
    <Card title={`${title} for Gameweek ${gameweek}`}>
      <p className="text-sm text-gray-500 mb-4">
        Last updated: {formatDate(updatedAt)}
      </p>
      
      {recommendations.map((rec) => (
        <PlayerCard key={rec.id} recommendation={rec} type={type} />
      ))}
    </Card>
  );
}
