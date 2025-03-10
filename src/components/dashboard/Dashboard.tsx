'use client';

import React from 'react';
import SearchBar from '../ui/SearchBar';
import TopPlayersCard from './TopPlayersCard';
import FixtureDifficultyCard from './FixtureDifficultyCard';
import PriceChangeCard from './PriceChangeCard';
import InjuryAlertsCard from './InjuryAlertsCard';
import DifferentialPicksCard from './DifferentialPicksCard';

export default function Dashboard() {
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // In a real app, this would trigger a search API call
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">FPL Analytics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your ultimate Fantasy Premier League companion for data-driven decisions
        </p>
        <SearchBar 
          placeholder="Search for players, teams, or stats..." 
          onSearch={handleSearch} 
          className="max-w-2xl"
        />
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Players */}
        <div className="col-span-1 lg:col-span-2">
          <TopPlayersCard />
        </div>

        {/* Fixture Difficulty */}
        <div className="col-span-1">
          <FixtureDifficultyCard />
        </div>

        {/* Price Changes */}
        <div className="col-span-1">
          <PriceChangeCard />
        </div>

        {/* Injury Alerts */}
        <div className="col-span-1 lg:col-span-2">
          <InjuryAlertsCard />
        </div>

        {/* Differential Picks */}
        <div className="col-span-1 lg:col-span-2">
          <DifferentialPicksCard />
        </div>
      </div>
    </div>
  );
} 