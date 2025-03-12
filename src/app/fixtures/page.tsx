import React from 'react';
import type { Metadata } from 'next';
// Import the client component
import Content from './Content';

// Add metadata for SEO
export const metadata: Metadata = {
  title: 'Fixtures & Schedule | FPL Analytics',
  description: 'View upcoming Premier League fixtures, fixture difficulty ratings, and match predictions to plan your FPL transfers and captain picks strategically.',
  keywords: 'FPL fixtures, Premier League schedule, fixture difficulty, FDR, upcoming matches, FPL planning, fixture analysis, team fixtures',
  openGraph: {
    title: 'Fixtures & Schedule | FPL Analytics',
    description: 'View upcoming Premier League fixtures, fixture difficulty ratings, and match predictions to plan your FPL transfers.',
    url: 'https://fplanalytics.com/fixtures',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fixtures & Schedule | FPL Analytics',
    description: 'View upcoming Premier League fixtures and fixture difficulty ratings to plan your FPL strategy.',
  },
};

// Server component that exports metadata
export default function FixturesPage() {
  return <Content />;
}
