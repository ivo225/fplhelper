'use client';

import React, { useState, useRef, useEffect } from 'react';
import SearchResults from './SearchResults';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export default function SearchBar({ 
  placeholder = 'Search...', 
  onSearch, 
  className = '' 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Call the onSearch prop if provided (for backward compatibility)
    if (onSearch) {
      onSearch(query);
    }
    
    // Search using the API
    try {
      setIsLoading(true);
      setError(null);
      setShowResults(true);
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search');
      }
      
      const data = await response.json();
      setResults(data.results);
    } catch (err: any) {
      setError(err.message || 'An error occurred while searching');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="w-full">
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
                onFocus={() => {
                  if (results.length > 0 || isLoading || error) {
                    setShowResults(true);
                  }
                }}
              />
              <button
                type="submit"
                className="absolute right-0 inset-y-0 px-6 text-white bg-gradient-to-r from-[var(--fpl-purple)] via-[var(--fpl-blue)] to-[var(--fpl-cyan)] rounded-r-full font-medium"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </form>
      
      {showResults && (
        <SearchResults 
          results={results} 
          isLoading={isLoading} 
          error={error} 
          onClose={() => setShowResults(false)} 
        />
      )}
    </div>
  );
}
