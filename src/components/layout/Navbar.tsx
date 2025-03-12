'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/player-stats', label: 'Player Stats' },
    { href: '/fixtures', label: 'Fixtures' },
    { href: '/ai-recommendations', label: 'AI Recommendations' },
    { href: '/live-updates', label: 'Live Updates' },
  ];

  return (
    <nav className="bg-[var(--fpl-purple-dark)] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-white">
                FPL Analytics
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === link.href
                      ? 'border-[var(--fpl-cyan)] text-white'
                      : 'border-transparent text-gray-300 hover:text-white hover:border-[var(--fpl-blue)]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-[var(--fpl-purple)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--fpl-cyan)]"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                pathname === link.href
                  ? 'border-[var(--fpl-cyan)] text-white bg-[var(--fpl-purple)]'
                  : 'border-transparent text-gray-300 hover:bg-[var(--fpl-purple-dark)] hover:border-[var(--fpl-blue)] hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
