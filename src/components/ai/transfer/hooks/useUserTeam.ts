'use client';

import { useState } from 'react';
import { UserTeam } from '../types';

interface UseUserTeamResult {
  teamData: UserTeam | null;
  fplId: string;
  setFplId: (id: string) => void;
  loading: boolean;
  error: string | null;
  fetchUserTeam: (id: string) => Promise<void>;
}

export function useUserTeam(): UseUserTeamResult {
  const [teamData, setTeamData] = useState<UserTeam | null>(null);
  const [fplId, setFplId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  async function fetchUserTeam(id: string) {
    try {
      setLoading(true);
      setError(null);
      
      // Use the API endpoint
      const response = await fetch(`/api/my-team/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`FPL ID ${id} not found. Please check and try again.`);
        }
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Failed to fetch team data: ${response.status}${errorData.error ? ` - ${errorData.error}` : ''}`);
      }
      
      const data = await response.json();
      setTeamData(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching team data:', err);
    } finally {
      setLoading(false);
    }
  }
  
  return {
    teamData,
    fplId,
    setFplId,
    loading,
    error,
    fetchUserTeam
  };
}
