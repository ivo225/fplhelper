'use client';

import React from 'react';
import Button from '@/components/ui/Button';

interface FplIdFormProps {
  fplId: string;
  setFplId: (id: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  isPersonalized: boolean;
  hasTeamData: boolean;
}

export default function FplIdForm({
  fplId,
  setFplId,
  onSubmit,
  loading,
  isPersonalized,
  hasTeamData
}: FplIdFormProps) {
  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-[var(--fpl-purple-dark)] via-[var(--fpl-purple)] to-[var(--fpl-blue)] rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2 text-white">Get Personalized Recommendations</h3>
      <p className="text-sm text-white/90 mb-3">
        Enter your FPL ID to get transfer suggestions tailored to your team.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row items-start sm:items-end gap-2">
        <div className="flex-1 w-full">
          <label htmlFor="fplId" className="block text-sm font-medium text-white mb-1">
            FPL ID
          </label>
          <input
            type="text"
            id="fplId"
            value={fplId}
            onChange={(e) => setFplId(e.target.value)}
            placeholder="e.g., 1234567"
            className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white placeholder-white/70 rounded-md shadow-sm focus:outline-none focus:ring-white focus:border-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 bg-white text-[var(--fpl-purple)] rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[var(--fpl-purple)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </span>
          ) : 'Get Recommendations'}
        </button>
      </form>
      {isPersonalized && hasTeamData && (
        <div className="mt-3 p-2 bg-white/90 rounded text-[var(--fpl-purple-dark)] text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Showing personalized recommendations for your team
        </div>
      )}
      {!hasTeamData && !loading && (
        <div className="mt-3 p-2 bg-white/20 rounded text-white text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Enter your FPL ID above to see recommendations tailored to your team
        </div>
      )}
    </div>
  );
}
