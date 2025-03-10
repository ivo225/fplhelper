'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';

interface Player {
  id: number;
  first_name: string;
  second_name: string;
  web_name: string;
  team: number;
  position: number;
  now_cost: number;
  form: string;
  points_per_game: string;
  total_points: number;
  teams: {
    name: string;
    short_name: string;
  };
}

interface CaptainRecommendation {
  id: number;
  gameweek: number;
  player_id: number;
  rank: number;
  points_prediction: number;
  confidence_score: number;
  reasoning: string;
  created_at: string;
  players: Player;
}

interface CaptainRecommendationsResponse {
  gameweek: number;
  recommendations: CaptainRecommendation[];
  updated_at: string;
}

export default function CaptainRecommendations({ compact = false }: { compact?: boolean }) {
  const [recommendations, setRecommendations] = useState<CaptainRecommendation[]>([]);
  const [gameweek, setGameweek] = useState<number>(0);
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        const response = await fetch('/api/recommendations/captains');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch captain recommendations: ${response.status}`);
        }
        
        const data: CaptainRecommendationsResponse = await response.json();
        
        // Filter out duplicates by player_id, keeping only the most recent one
        const uniqueRecommendations = data.recommendations.reduce((acc: CaptainRecommendation[], current) => {
          const existingIndex = acc.findIndex(item => item.player_id === current.player_id);
          if (existingIndex === -1) {
            // Item doesn't exist in accumulator, add it
            acc.push(current);
          } else {
            // Item exists, check if current is more recent
            const existing = acc[existingIndex];
            if (new Date(current.created_at) > new Date(existing.created_at)) {
              // Replace with more recent one
              acc[existingIndex] = current;
            }
          }
          return acc;
        }, []);
        
        // Sort by rank
        uniqueRecommendations.sort((a, b) => a.rank - b.rank);
        
        setRecommendations(uniqueRecommendations);
        setGameweek(data.gameweek);
        setUpdatedAt(data.updated_at);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching captain recommendations:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecommendations();
  }, []);
  
  // Helper function to get position abbreviation
  function getPositionShort(position: number): string {
    const positions: Record<number, string> = {
      1: 'GK',
      2: 'DEF',
      3: 'MID',
      4: 'FWD'
    };
    return positions[position] || 'UNK';
  }
  
  // Helper function to format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  
  if (loading) {
    return (
      <Card className="mb-6" title="Top Captain Picks">
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-6 pb-6 border-b last:border-0">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                <div className="h-6 bg-gray-300 rounded w-48"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="mb-6">
        <div className="text-red-500">Error: {error}</div>
      </Card>
    );
  }
  
  if (recommendations.length === 0) {
    return (
      <Card className="mb-6" title="Top Captain Picks">
        <p className="text-gray-500">
          No captain recommendations available for gameweek {gameweek}. Please check back later.
        </p>
      </Card>
    );
  }
  
  // Render in compact or full mode based on props
  if (compact) {
    return (
      <Card title={`Captain Picks - GW${gameweek}`} className="h-full">
        <div className="text-base font-medium text-gray-700 mb-6">
          Updated: {formatDate(updatedAt)}
        </div>
        
        <div className="flex flex-col space-y-4 mb-6">
          {recommendations.slice(0, 3).map((rec) => (
            <div key={rec.id} className="flex items-center">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center mr-4 text-lg font-bold">
                {rec.rank}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="text-lg font-bold text-gray-900">
                    {rec.players.web_name || `${rec.players.first_name} ${rec.players.second_name}`}
                  </h3>
                </div>
                
                <div className="flex items-center mt-1">
                  <span className="text-base font-medium text-gray-800 mr-2">
                    {rec.players.teams.short_name}
                  </span>
                  <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded font-medium">
                    {getPositionShort(rec.players.position)}
                  </span>
                </div>
              </div>
              
              <div className="bg-purple-100 text-purple-800 text-xl font-bold px-4 py-2 rounded-lg">
                {rec.points_prediction} pts
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-6">
          <a href="/ai-recommendations" className="text-base font-semibold text-purple-600 hover:underline">
            View all captain picks →
          </a>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card title={`Top Captain Picks for Gameweek ${gameweek}`}>
        <p className="text-sm text-gray-500 mb-4">
          Last updated: {formatDate(updatedAt)}
        </p>
        
        {recommendations.map((rec) => (
          <div key={rec.id} className="mb-6 pb-6 border-b last:border-0">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[var(--fpl-purple)] to-[var(--fpl-blue)] text-white rounded-full flex items-center justify-center mr-3 text-lg font-bold">
                {rec.rank}
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {rec.players.first_name} {rec.players.second_name}
                </h3>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">{rec.players.teams.short_name}</span>
                  <span className="px-2 py-0.5 bg-gray-200 rounded text-xs text-gray-800">
                    {getPositionShort(rec.players.position)}
                  </span>
                </div>
              </div>
              <div className="ml-auto text-center">
                <div className="text-2xl font-bold text-[var(--primary)]">{rec.points_prediction}</div>
                <div className="text-xs text-gray-500">Predicted pts</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 bg-white p-3 rounded-md border border-gray-200">
              <div className="text-sm">
                <div className="text-xs text-gray-500">Form</div>
                <div className="font-medium text-gray-800">{rec.players.form}</div>
              </div>
              <div className="text-sm">
                <div className="text-xs text-gray-500">Points/Game</div>
                <div className="font-medium text-gray-800">{rec.players.points_per_game}</div>
              </div>
              <div className="text-sm">
                <div className="text-xs text-gray-500">Total Points</div>
                <div className="font-medium text-gray-800">{rec.players.total_points}</div>
              </div>
              <div className="text-sm">
                <div className="text-xs text-gray-500">Confidence</div>
                <div className="font-medium text-gray-800">{rec.confidence_score ? `${(rec.confidence_score * 100).toFixed(0)}%` : 'N/A'}</div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-2">AI Analysis</h4>
              <p className="text-gray-900 text-base leading-relaxed">{rec.reasoning}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
