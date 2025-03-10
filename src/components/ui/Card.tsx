'use client';

import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`border-fpl-gradient shadow-md overflow-hidden bg-white border border-gray-200 ${className}`}>
      <div className="h-full">
        {title && (
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-[var(--fpl-purple-dark)]">{title}</h3>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
