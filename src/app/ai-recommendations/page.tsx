import React from 'react';
import type { Metadata } from 'next';
// Import the client component
import Content from './Content';

// Add metadata for SEO
export const metadata: Metadata = {
  title: 'AI Recommendations | FPL Analytics',
  description: 'Get AI-powered Fantasy Premier League recommendations for captains, transfers, and differentials. Data-driven insights to maximize your FPL points every gameweek.',
  keywords: 'FPL AI, Fantasy Premier League AI, captain picks, FPL transfers, FPL differentials, AI recommendations, FPL algorithm, fantasy football AI',
  openGraph: {
    title: 'AI Recommendations | FPL Analytics',
    description: 'Get AI-powered Fantasy Premier League recommendations for captains, transfers, and differentials to maximize your points.',
    url: 'https://fplanalytics.com/ai-recommendations',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Recommendations | FPL Analytics',
    description: 'Get AI-powered Fantasy Premier League recommendations for captains, transfers, and differentials.',
  },
};

// Server component that exports metadata
export default function AIRecommendationsPage() {
  return <Content />;
}
