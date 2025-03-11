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
  
  // Use adjusted confidence if available, otherwise use normal confidence score
  const confidenceScore = recommendation.adjusted_confidence || recommendation.confidence_score;
  
  // Helper function to render fixture difficulty dots
  const renderFixtureDifficulty = (fixtures: any[]) => {
    if (!fixtures || fixtures.length === 0) return null;
    
    return (
      <div className="mt-2">
        <div className="text-xs text-gray-500 mb-1">Next fixtures:</div>
        <div className="flex space-x-1">
          {fixtures.slice(0, 5).map((fixture, index) => (
            <div 
              key={index}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                fixture.difficulty === 1 ? 'bg-green-500 text-white' :
                fixture.difficulty === 2 ? 'bg-green-300 text-green-800' :
                fixture.difficulty === 3 ? 'bg-gray-300 text-gray-800' :
                fixture.difficulty === 4 ? 'bg-red-300 text-red-800' :
                'bg-red-500 text-white'
              }`}
              title={`GW${fixture.event}: ${fixture.isHome ? 'Home' : 'Away'} (Difficulty: ${fixture.difficulty})`}
            >
              {fixture.difficulty}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
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
              {getPositionShort(player.element_type)}
            </span>
            
            {/* Show position priority badge if applicable */}
            {recommendation.position_priority && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                Priority Position
              </span>
            )}
            
            {/* Premium asset badge */}
            {recommendation.is_premium_asset && (
              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">
                Premium Asset
              </span>
            )}
          </div>
        </div>
        
        <div className="ml-auto">
          <div className="text-xl font-bold">{formatPrice(player.now_cost)}</div>
          <div className="text-xs flex justify-end items-center">
            <span className={`px-2 py-0.5 rounded-full ${isBuy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {Math.round(confidenceScore * 100)}% confidence
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
      
      {/* Fixture Difficulty Section */}
      {recommendation.upcoming_fixtures && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          {renderFixtureDifficulty(recommendation.upcoming_fixtures)}
          
          {/* Show fixture score if available */}
          {recommendation.fixture_score !== undefined && (
            <div className="mt-2">
              <div className="text-xs text-gray-500">Fixture Difficulty Rating:</div>
              <div className={`font-medium ${
                recommendation.fixture_score < 2.5 ? 'text-green-600' : 
                recommendation.fixture_score < 3.5 ? 'text-gray-800' : 'text-red-600'
              }`}>
                {recommendation.fixture_score.toFixed(1)}
                <span className="text-xs text-gray-500 ml-1">(lower is better)</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Personalized Recommendation Section */}
      <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
        <h4 className="text-sm font-medium text-gray-500 mb-2">Reasoning</h4>
        
        {/* If replacing a specific player, show that information */}
        {recommendation.replacing_player && (
          <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-100">
            <p className="text-blue-800 text-sm font-medium">
              Recommended replacement for: {recommendation.replacing_player}
              {recommendation.similarity_score !== undefined && (
                <span className="ml-1 text-xs text-blue-600">
                  (Similarity: {Math.round(recommendation.similarity_score * 100)}%)
                </span>
              )}
            </p>
          </div>
        )}
        
        {/* Premium asset warning for sell recommendations */}
        {!isBuy && player.now_cost >= 60 && recommendation.fixture_score && recommendation.fixture_score < 3 && (
          <div className="mb-2 p-2 bg-yellow-50 rounded border border-yellow-100">
            <p className="text-yellow-800 text-sm flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                Consider keeping due to favorable upcoming fixtures
              </span>
            </p>
          </div>
        )}
        
        {/* Show personalized reason if available, otherwise fallback to general reasoning */}
        <p className="text-gray-900 text-base leading-relaxed">
          {recommendation.recommendation_reason || recommendation.reasoning}
        </p>
        
        {/* Position-specific fixture bonus */}
        {recommendation.position_fixture_bonus !== undefined && recommendation.position_fixture_bonus > 3 && (
          <div className="mt-2 p-2 bg-green-50 rounded">
            <p className="text-green-700 text-sm">
              <span className="font-medium">✓</span> Favorable fixtures for {
                player.element_type === 1 ? 'a goalkeeper' : 
                player.element_type === 2 ? 'a defender' : 
                player.element_type === 3 ? 'a midfielder' : 'a forward'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
