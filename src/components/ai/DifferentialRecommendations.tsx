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
  selected_by_percent: string;
  teams: {
    name: string;
    short_name: string;
  };
}

interface DifferentialRecommendation {
  id: number;
  gameweek: number;
  player_id: number;
  rank: number;
  predicted_points: number;
  reasoning: string;
  created_at: string;
  players: Player;
}

interface DifferentialRecommendationsResponse {
  gameweek: number;
  recommendations: DifferentialRecommendation[];
  updated_at: string;
}

export default function DifferentialRecommendations({ compact = false }: { compact?: boolean }) {
  const [recommendations, setRecommendations] = useState<DifferentialRecommendation[]>([]);
  const [gameweek, setGameweek] = useState<number>(0);
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        const response = await fetch('/api/recommendations/differentials');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch differential recommendations: ${response.status}`);
        }
        
        const data: DifferentialRecommendationsResponse = await response.json();
        
        // Filter out duplicates by player_id, keeping only the most recent one
        const uniqueRecommendations = data.recommendations.reduce((acc: DifferentialRecommendation[], current) => {
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
        console.error('Error fetching differential recommendations:', err);
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
  
  // Helper function to format price
  function formatPrice(price: number): string {
    return `£${(price / 10).toFixed(1)}m`;
  }
  
  if (loading) {
    return (
      <Card className="mb-6" title="Differential Picks">
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
      <Card className="mb-6" title="Differential Picks">
        <p className="text-gray-500">
          No differential recommendations available for gameweek {gameweek}. Please check back later.
        </p>
      </Card>
    );
  }
  
  // Render in compact or full mode based on props
  if (compact) {
    return (
      <Card title={`Differential Picks - GW${gameweek}`} className="h-full">
        <div className="text-base font-medium text-gray-700 mb-4">
          Updated: {formatDate(updatedAt)}
        </div>
        
        <div className="mb-4 p-3 bg-white rounded-md text-gray-800 text-base font-medium border border-gray-200">
          <p>
            Low-ownership players (&lt;10%) that could give you an edge
          </p>
        </div>
        
        <div className="flex flex-col space-y-4 mb-6">
          {recommendations.slice(0, 3).map((rec) => (
            <div key={rec.id} className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 text-lg font-bold">
                {rec.rank}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="text-lg font-bold text-gray-900">
                    {rec.players.web_name || `${rec.players.first_name} ${rec.players.second_name}`}
                  </h3>
                  <span className="ml-3 font-medium text-green-600">
                    {rec.players.selected_by_percent}% owned
                  </span>
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
              
              <div className="bg-blue-100 text-blue-800 text-xl font-bold px-4 py-2 rounded-lg">
                {formatPrice(rec.players.now_cost)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-6">
          <a href="/ai-recommendations?tab=differentials" className="text-base font-semibold text-blue-600 hover:underline">
            View all differential picks →
          </a>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card title={`Differential Picks for Gameweek ${gameweek}`}>
        <p className="text-sm text-gray-500 mb-4">
          Last updated: {formatDate(updatedAt)}
        </p>
        
        <div className="mb-4 p-4 bg-white rounded-md text-gray-800 border border-gray-200">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[var(--fpl-blue)]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">What are differentials?</span> Players with low ownership (under 10%) who could provide a competitive edge in your mini-leagues.
          </p>
        </div>
        
        {recommendations.map((rec) => (
          <div key={rec.id} className="mb-6 pb-6 border-b last:border-0">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[var(--fpl-blue)] to-[var(--fpl-cyan)] text-white rounded-full flex items-center justify-center mr-3 text-lg font-bold">
                {rec.rank}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {rec.players.first_name} {rec.players.second_name}
                </h3>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">{rec.players.teams.short_name}</span>
                  <span className="px-2 py-0.5 bg-gray-200 rounded text-xs text-gray-800">
                    {getPositionShort(rec.players.position)}
                  </span>
                </div>
              </div>
              <div className="ml-auto flex flex-col items-end">
                <div className="text-lg font-bold text-[var(--fpl-blue)]">{formatPrice(rec.players.now_cost)}</div>
                <div className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  {rec.players.selected_by_percent}% owned
                </div>
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
                <div className="text-xs text-gray-500">Predicted Points</div>
                <div className="font-medium text-gray-800">{rec.predicted_points}</div>
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
