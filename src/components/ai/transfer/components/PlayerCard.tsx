'use client';

import React from 'react';
import { TransferRecommendation } from '../types';
import { formatPrice, getPositionShort } from '../utils';

interface PlayerCardProps {
  recommendation: TransferRecommendation;
  type: 'buy' | 'sell';
}

export default function PlayerCard({ recommendation, type }: PlayerCardProps) {
  const player = recommendation.players;
  const isBuy = type === 'buy';
  
  return (
    <div className="mb-6 pb-6 border-b last:border-0">
      <div className="flex items-center mb-3">
        <div className={`mr-3 flex-shrink-0 ${isBuy ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'} text-white rounded-full w-12 h-12 flex items-center justify-center`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isBuy ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            )}
          </svg>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold">
            {player.first_name} {player.second_name}
          </h3>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">{player.teams.short_name}</span>
            <span className="px-2 py-0.5 bg-gray-200 rounded text-xs text-gray-800">
              {getPositionShort(player.position)}
            </span>
          </div>
        </div>
        
        <div className="ml-auto">
          <div className="text-xl font-bold">{formatPrice(player.now_cost)}</div>
          <div className="text-xs flex justify-end items-center">
            <span className={`px-2 py-0.5 rounded-full ${isBuy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {Math.round(recommendation.confidence_score * 100)}% confidence
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 bg-gray-50 p-3 rounded-md">
        <div className="text-sm">
          <div className="text-xs text-gray-500">Form</div>
          <div className="font-medium text-gray-800">{player.form}</div>
        </div>
        <div className="text-sm">
          <div className="text-xs text-gray-500">Points/Game</div>
          <div className="font-medium text-gray-800">{player.points_per_game}</div>
        </div>
        <div className="text-sm">
          <div className="text-xs text-gray-500">Total Points</div>
          <div className="font-medium text-gray-800">{player.total_points}</div>
        </div>
        <div className="text-sm">
          <div className="text-xs text-gray-500">Team</div>
          <div className="font-medium text-gray-800">{player.teams.name}</div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
        <h4 className="text-sm font-medium text-gray-500 mb-2">Reasoning</h4>
        <p className="text-gray-900 text-base leading-relaxed">{recommendation.reasoning}</p>
      </div>
    </div>
  );
}
