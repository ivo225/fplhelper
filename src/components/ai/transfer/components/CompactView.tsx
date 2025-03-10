'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { TransferRecommendation } from '../types';
import { formatDate, formatPrice } from '../utils';

interface CompactViewProps {
  buyRecommendations: TransferRecommendation[];
  sellRecommendations: TransferRecommendation[];
  gameweek: number;
  updatedAt: string;
}

export default function CompactView({
  buyRecommendations,
  sellRecommendations,
  gameweek,
  updatedAt
}: CompactViewProps) {
  return (
    <Card title={`Transfer Tips - GW${gameweek || '?'}`} className="h-full">
      <div className="text-base font-medium text-gray-700 mb-4">
        {buyRecommendations.length > 0 || sellRecommendations.length > 0 ? 
          `Updated: ${formatDate(updatedAt)}` :
          "Get personalized transfer suggestions"
        }
      </div>
      
      {(buyRecommendations.length === 0 && sellRecommendations.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-6">
          <p className="text-xl text-center font-medium mb-6 text-gray-800">
            Enter your FPL ID to get personalized transfer suggestions
          </p>
          <a 
            href="/ai-recommendations" 
            className="text-base font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-md hover:opacity-90 transition-opacity shadow-md"
          >
            Get Transfer Tips
          </a>
        </div>
      ) : (
        <>
          <div className="flex flex-col space-y-6 mb-6">
            <div>
              <div className="text-lg font-semibold text-green-600 mb-3 border-b pb-1">Players to Buy</div>
              
              {buyRecommendations.slice(0, 2).map((rec) => (
                <div key={rec.id} className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center mr-4 text-lg font-bold">
                    in
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-bold text-gray-900">
                        {rec.players.web_name || `${rec.players.first_name} ${rec.players.second_name}`}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap mt-1">
                      <span className="text-base font-medium text-gray-800 mr-2">
                        {rec.players.teams.short_name}
                      </span>
                      <span className="mr-2">•</span>
                      <span className="font-medium">
                        {formatPrice(rec.players.now_cost)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-700 max-w-[180px] truncate">
                    {rec.reasoning.substring(0, 60)}...
                  </div>
                </div>
              ))}
            </div>
            
            <div>
              <div className="text-lg font-semibold text-red-600 mb-3 border-b pb-1">Players to Sell</div>
              
              {sellRecommendations.slice(0, 2).map((rec) => (
                <div key={rec.id} className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center mr-4 text-lg font-bold">
                    out
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-bold text-gray-900">
                        {rec.players.web_name || `${rec.players.first_name} ${rec.players.second_name}`}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap mt-1">
                      <span className="text-base font-medium text-gray-800 mr-2">
                        {rec.players.teams.short_name}
                      </span>
                      <span className="mr-2">•</span>
                      <span className="font-medium">
                        {formatPrice(rec.players.now_cost)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-700 max-w-[180px] truncate">
                    {rec.reasoning.substring(0, 60)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center mt-6">
            <a href="/ai-recommendations" className="text-base font-semibold text-purple-600 hover:underline">
              View all transfer suggestions →
            </a>
          </div>
        </>
      )}
    </Card>
  );
}
