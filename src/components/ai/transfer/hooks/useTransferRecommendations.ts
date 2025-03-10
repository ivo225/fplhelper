'use client';

import { useState, useEffect } from 'react';
import { TransferRecommendation, TransferRecommendationsResponse } from '../types';

interface UseTransferRecommendationsResult {
  buyRecommendations: TransferRecommendation[];
  sellRecommendations: TransferRecommendation[];
  gameweek: number;
  updatedAt: string;
  isPersonalized: boolean;
  status: string | null;
  loading: boolean;
  error: string | null;
  fetchRecommendations: (userId?: string) => Promise<void>;
}

export function useTransferRecommendations(initialFetch = true): UseTransferRecommendationsResult {
  const [buyRecommendations, setBuyRecommendations] = useState<TransferRecommendation[]>([]);
  const [sellRecommendations, setSellRecommendations] = useState<TransferRecommendation[]>([]);
  const [gameweek, setGameweek] = useState<number>(0);
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [isPersonalized, setIsPersonalized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  
  // Function to fetch recommendations
  async function fetchRecommendations(userId?: string) {
    try {
      setLoading(true);
      setError(null);
      const url = userId 
        ? `/api/recommendations/transfers?fplId=${userId}` 
        : '/api/recommendations/transfers';
        
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Failed to fetch transfer recommendations: ${response.status}${errorData.error ? ` - ${errorData.error}` : ''}`);
      }
      
      const data: TransferRecommendationsResponse = await response.json();
      
      // Set status from response
      setStatus(data.status || 'success');
      
      // Filter out duplicates in buy recommendations by player_id, keeping only the most recent one
      const uniqueBuyRecommendations = data.buy_recommendations.reduce((acc: TransferRecommendation[], current) => {
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
      
      // Filter out duplicates in sell recommendations by player_id, keeping only the most recent one
      const uniqueSellRecommendations = data.sell_recommendations.reduce((acc: TransferRecommendation[], current) => {
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
      
      // Sort by confidence score (descending)
      uniqueBuyRecommendations.sort((a, b) => b.confidence_score - a.confidence_score);
      uniqueSellRecommendations.sort((a, b) => b.confidence_score - a.confidence_score);
      
      setBuyRecommendations(uniqueBuyRecommendations);
      setSellRecommendations(uniqueSellRecommendations);
      setGameweek(data.gameweek);
      setUpdatedAt(data.updated_at);
      setIsPersonalized(data.is_personalized || false);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching transfer recommendations:', err);
    } finally {
      setLoading(false);
    }
  }
  
  // Fetch recommendations on mount if initialFetch is true
  useEffect(() => {
    if (initialFetch) {
      fetchRecommendations();
    }
  }, [initialFetch]);
  
  return {
    buyRecommendations,
    sellRecommendations,
    gameweek,
    updatedAt,
    isPersonalized,
    status,
    loading,
    error,
    fetchRecommendations
  };
}
