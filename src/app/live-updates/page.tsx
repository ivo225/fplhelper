import React from 'react';
import type { Metadata } from 'next';
// Import the client component
import Content from './Content';

// Add metadata for SEO
export const metadata: Metadata = {
  title: 'Live Updates | FPL Analytics',
  description: 'Get real-time Fantasy Premier League updates, including live match data, bonus points, and player performance tracking during gameweeks.',
  keywords: 'FPL live updates, Fantasy Premier League live, live FPL scores, bonus points, live match data, real-time FPL, gameweek live, FPL tracking',
  openGraph: {
    title: 'Live Updates | FPL Analytics',
    description: 'Get real-time Fantasy Premier League updates, including live match data, bonus points, and player performance tracking.',
    url: 'https://fplanalytics.com/live-updates',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Updates | FPL Analytics',
    description: 'Get real-time Fantasy Premier League updates, including live match data and bonus points.',
  },
};

// Server component that exports metadata
export default function LiveUpdatesPage() {
  return <Content />;
} 