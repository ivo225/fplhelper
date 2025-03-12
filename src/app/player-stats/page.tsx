import React from 'react';
import type { Metadata } from 'next';
// Import the client component
import Content from './Content';

// Add metadata for SEO
export const metadata: Metadata = {
  title: 'Player Statistics | FPL Analytics',
  description: 'Comprehensive Fantasy Premier League player statistics, including form, points, goals, assists, and expected data (xG, xA) to help you make informed FPL decisions.',
  keywords: 'FPL player stats, Fantasy Premier League statistics, player form, player points, xG, xA, goals, assists, FPL data',
  openGraph: {
    title: 'Player Statistics | FPL Analytics',
    description: 'Comprehensive Fantasy Premier League player statistics, including form, points, goals, assists, and expected data (xG, xA).',
    url: 'https://fplanalytics.com/player-stats',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Player Statistics | FPL Analytics',
    description: 'Comprehensive Fantasy Premier League player statistics to help you make informed FPL decisions.',
  },
};

// Server component that exports metadata
export default function PlayerStatsPage() {
  return <Content />;
} 