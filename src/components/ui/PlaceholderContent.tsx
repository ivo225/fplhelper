'use client';

import React from 'react';
import Card from './Card';

interface PlaceholderContentProps {
  title: string;
  description: string;
  features: string[];
}

export default function PlaceholderContent({ title, description, features }: PlaceholderContentProps) {
  return (
    <Card className="mb-8">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">{title} Coming Soon</h2>
        <p className="text-gray-600 dark:text-gray-300">
          {description}
        </p>
        <ul className="list-disc pl-5 mt-2 text-gray-600 dark:text-gray-300">
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
} 