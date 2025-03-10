'use client';

import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';

interface Match {
  id: number;
  event: number | null; // Gameweek
  kickoff_time: string;
  team_h: number;
  team_a: number;
  team_h_name: string;
  team_a_name: string;
  team_h_difficulty: number;
  team_a_difficulty: number;
}

export default function UpcomingMatchesCard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGameweek, setSelectedGameweek] = useState<number | null>(null);
  const [gameweeks, setGameweeks] = useState<number[]>([]);

  useEffect(() => {
    async function fetchUpcomingMatches() {
      try {
        setLoading(true);
        const response = await fetch('/api/fpl/fixtures/upcoming');
        
        if (!response.ok) {
          throw new Error('Failed to fetch upcoming matches');
        }
        
        const data = await response.json();
        setMatches(data.matches);
        setGameweeks(data.gameweeks);
        
        // Set the default selected gameweek to the first available
        if (data.gameweeks.length > 0 && !selectedGameweek) {
          setSelectedGameweek(data.gameweeks[0]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching upcoming matches:', err);
        setError('Failed to load upcoming matches data');
      } finally {
        setLoading(false);
      }
    }

    fetchUpcomingMatches();
  }, [selectedGameweek]);

  const handleGameweekChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const gw = parseInt(event.target.value);
    setSelectedGameweek(gw);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card title="Upcoming Matches" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading match data...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Upcoming Matches" className="h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </Card>
    );
  }

  // Filter matches by selected gameweek
  const filteredMatches = selectedGameweek 
    ? matches.filter(match => match.event === selectedGameweek)
    : matches;

  return (
    <Card title="Upcoming Matches" className="h-full">
      <div className="mb-4">
        <label htmlFor="gameweek-select" className="block text-sm font-medium text-[var(--fpl-purple-dark)] mb-1">
          Select Gameweek:
        </label>
        <select
          id="gameweek-select"
          value={selectedGameweek || ''}
          onChange={handleGameweekChange}
          className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--fpl-purple)] focus:border-[var(--fpl-purple)] bg-white text-[var(--fpl-purple-dark)]"
        >
          {gameweeks.map(gw => (
            <option key={gw} value={gw}>
              Gameweek {gw}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Date & Time</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Home Team</th>
              <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wider">vs</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Away Team</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Difficulty (H/A)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match) => (
                <tr key={match.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-[var(--fpl-purple-dark)]">
                    {formatDate(match.kickoff_time)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-[var(--fpl-purple-dark)]">
                    {match.team_h_name}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-[var(--fpl-purple)]">
                    vs
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-[var(--fpl-purple-dark)]">
                    {match.team_a_name}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-[var(--fpl-purple-dark)]">
                    {match.team_h_difficulty} / {match.team_a_difficulty}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-3 py-3 text-center text-sm text-[var(--fpl-purple-dark)]">
                  No matches scheduled for this gameweek
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
