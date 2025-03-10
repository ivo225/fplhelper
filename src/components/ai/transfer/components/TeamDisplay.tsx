'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { UserTeam } from '../types';
import { formatPrice } from '../utils';

interface TeamDisplayProps {
  teamData: UserTeam;
}

export default function TeamDisplay({ teamData }: TeamDisplayProps) {
  return (
    <Card title={`Your Team for Gameweek ${teamData.gameweek}`} className="overflow-hidden mb-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--primary)] mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <span className="font-semibold">Team Value:</span> 
            <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded text-sm">
              £{teamData.team_value.toFixed(1)}m
            </span>
          </div>
          {teamData.chips && (
            <div className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {teamData.chips}
            </div>
          )}
        </div>
        
        {/* Team by position */}
        <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          {Object.entries(teamData.positions).map(([posId, posName]) => (
            <div key={posId} className="border-t pt-3 first:border-t-0 first:pt-0">
              <h4 className="font-medium mb-2 text-[var(--primary)] flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {String(posName)}s
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {teamData.team_by_position[posId].map((pick: any) => (
                  <div 
                    key={pick.element} 
                    className={`p-2 rounded-md ${
                      pick.is_captain 
                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200' 
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      {pick.is_captain && <span className="mr-1 text-yellow-600 font-bold text-xs bg-yellow-100 px-1 rounded">C</span>}
                      {pick.is_vice_captain && <span className="mr-1 text-yellow-600 font-bold text-xs bg-yellow-100 px-1 rounded">V</span>}
                      <span className="font-medium">{pick.player.web_name}</span>
                      <span className="ml-auto text-xs px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded">
                        {pick.player.team_short_name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1 text-xs text-gray-600">
                      <div>{formatPrice(pick.player.now_cost)}</div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0114 7h-2z" clipRule="evenodd" />
                        </svg>
                        {pick.player.form} form
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
