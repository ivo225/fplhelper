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

export default function DifferentialRecommendations() {
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
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="mb-6 pb-6 border-b last:border-0">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full mr-3"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
                <div className="ml-auto">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
              </div>
              <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
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
        <p className="text-gray-500 dark:text-gray-400">
          No differential recommendations available for gameweek {gameweek}. Please check back later.
        </p>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card title={`Differential Picks for Gameweek ${gameweek}`}>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Last updated: {formatDate(updatedAt)}
        </p>
        
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-blue-800 dark:text-blue-200">
          <p>
            <span className="font-semibold">What are differentials?</span> Players with low ownership (under 10%) who could provide a competitive edge in your mini-leagues.
          </p>
        </div>
        
        {recommendations.map((rec) => (
          <div key={rec.id} className="mb-6 pb-6 border-b last:border-0">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center mr-3">
                {rec.rank}
              </div>
              <h3 className="text-xl font-semibold">
                {rec.players.first_name} {rec.players.second_name}
              </h3>
              <div className="ml-auto text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                {rec.players.teams.short_name} | {getPositionShort(rec.players.position)} | {formatPrice(rec.players.now_cost)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Form:</span> {rec.players.form}
              </div>
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Points per game:</span> {rec.players.points_per_game}
              </div>
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Ownership:</span> {rec.players.selected_by_percent}%
              </div>
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Predicted points:</span> {rec.predicted_points}
              </div>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
              <p>{rec.reasoning}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
} 