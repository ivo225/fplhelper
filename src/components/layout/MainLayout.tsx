'use client';

import React from 'react';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-[var(--fpl-purple-dark)] text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">FPL Analytics</h2>
              <p className="text-sm text-gray-300">Your ultimate Fantasy Premier League companion</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white hover:underline decoration-[var(--fpl-cyan)]">
                Terms
              </a>
              <a href="#" className="text-gray-300 hover:text-white hover:underline decoration-[var(--fpl-blue)]">
                Privacy
              </a>
              <a href="#" className="text-gray-300 hover:text-white hover:underline decoration-[var(--fpl-purple)]">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-[var(--fpl-purple)] pt-4 text-sm text-center text-gray-300">
            &copy; {new Date().getFullYear()} FPL Analytics. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
