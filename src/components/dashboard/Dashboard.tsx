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
    // The search functionality is now handled by the SearchBar component
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="mb-12 bg-gradient-to-r from-white via-gray-50 to-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-4xl font-bold text-[var(--fpl-purple-dark)] mb-4">FPL Analytics Dashboard</h1>
        <div className="max-w-4xl">
          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            Get expert Fantasy Premier League recommendations, fixture analysis, and real-time player form updates to maximize your points every gameweek. Stay ahead of the competition with AI-driven picks, captain suggestions, and injury alerts—all in one place.
          </p>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--fpl-purple)] flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
              </svg>
              Top Features:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✅</span>
                <span className="text-gray-700">Smart Player Recommendations</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✅</span>
                <span className="text-gray-700">Fixture Difficulty & Rotation Planner</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✅</span>
                <span className="text-gray-700">Live Form & Injury Updates</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✅</span>
                <span className="text-gray-700">Captain & Transfer Suggestions</span>
              </div>
            </div>
          </div>
        </div>
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
