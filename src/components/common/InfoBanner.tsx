'use client';

import React from 'react';
import Link from 'next/link';

interface InfoBannerProps {
  pageDescription: string;
}

export default function InfoBanner({ pageDescription }: InfoBannerProps) {
  return (
    <div className="mb-6 bg-gradient-to-r from-[var(--fpl-purple-light)] to-[var(--fpl-blue-light)] p-4 rounded-lg shadow-sm border border-[var(--fpl-purple-light)]">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--fpl-purple-dark)]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-[var(--fpl-purple-dark)] font-medium mb-3">
            {pageDescription}
          </p>
          <div className="flex justify-between items-center">
            <p className="text-sm text-[var(--fpl-purple-dark)]">
              <span className="font-bold">NEW:</span> We've improved our captain recommendations for Gameweek 29! Check out our top picks featuring Haaland, Foden, and Salah.
            </p>
            <Link href="/ai-recommendations" className="ml-4 px-3 py-1 bg-[var(--fpl-purple-dark)] text-white text-sm font-medium rounded hover:bg-[var(--fpl-purple)] transition-colors">
              View AI Picks →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 