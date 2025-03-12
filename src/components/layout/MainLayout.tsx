'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <footer className="bg-[var(--fpl-purple-dark)] text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">FPL Analytics</h3>
              <p className="text-gray-300 mt-2">Advanced analytics for Fantasy Premier League managers</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-gray-300 hover:text-white">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-300 hover:text-white">
                Privacy
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-[var(--fpl-purple)] pt-4 text-center text-gray-300">
            <p>&copy; {new Date().getFullYear()} FPL Analytics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
