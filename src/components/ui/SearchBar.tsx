'use client';

import React, { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

export default function SearchBar({ 
  placeholder = 'Search...', 
  onSearch, 
  className = '' 
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className={`${className}`}>
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-gray-400" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        <div className="relative w-full rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--fpl-purple-dark)] via-[var(--fpl-purple)] to-[var(--fpl-blue)]"></div>
          <div className="relative p-[2px]">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-2 pl-10 pr-20 rounded-full bg-white text-[var(--fpl-purple-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--fpl-purple)]"
            />
            <button
              type="submit"
              className="absolute right-0 inset-y-0 px-6 text-white bg-fpl-gradient rounded-r-full font-medium"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
