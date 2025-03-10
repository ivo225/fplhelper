'use client';

import React from 'react';
import Card from '@/components/ui/Card';

interface LoadingStateProps {
  title?: string;
  count?: number;
}

export default function LoadingState({ title = "Transfer Recommendations", count = 5 }: LoadingStateProps) {
  return (
    <Card className="mb-6" title={title}>
      <div className="animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="mb-6 pb-6 border-b last:border-0">
            <div className="flex items-center mb-2">
              <div className="h-6 bg-gray-300 rounded w-48"></div>
              <div className="ml-auto">
                <div className="h-6 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="h-4 bg-gray-300 rounded w-32"></div>
              <div className="h-4 bg-gray-300 rounded w-32"></div>
            </div>
            <div className="h-20 bg-gray-300 rounded w-full"></div>
          </div>
        ))}
      </div>
    </Card>
  );
}
