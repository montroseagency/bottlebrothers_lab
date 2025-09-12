// components/layout/Header.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Helper function to check if current route is active
  const isActive = (path: string) => location.pathname === path;

  // Close mobile menu when clicking on a link
  const handleMobileMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="shadow-xl sticky top-0 z-50 bg-gradient-to-r from-green-800 to-green-700 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" onClick={handleMobileMenuClose}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-stone-100 hover:text-white transition-colors">
                    Verdant Lounge
                  </h1>
                </div>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive('/') 
                  ? 'text-white bg-green-900 shadow-lg' 
                  : 'text-stone-200 hover:text-white hover:bg-green-700/50'
              }`}
            >
              Home
            </Link>
            
            <Link 
              to="/menu" 
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive('/menu') 
                  ? 'text-white bg-green-900 shadow-lg' 
                  : 'text-stone-200 hover:text-white hover:bg-green-700/50'
              }`}
            >
              Menu
            </Link>
            
            <Link 
              to="/events" 
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive('/events') 
                  ? 'text-white bg-green-900 shadow-lg' 
                  : 'text-stone-200 hover:text-white hover:bg-green-700/50'
              }`}
            >
              Events
            </Link>
            
            <Link 
              to="/gallery" 
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive('/gallery') 
                  ? 'text-white bg-green-900 shadow-lg' 
                  : 'text-stone-200 hover:text-white hover:bg-green-700/50'
              }`}
            >
              Gallery
            </Link>
            
            <Link 
              to="/contact" 
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive('/contact') 
                  ? 'text-white bg-green-900 shadow-lg' 
                  : 'text-stone-200 hover:text-white hover:bg-green-700/50'
              }`}
            >
              Contact Us
            </Link>
          </nav>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Reservation Button - Hidden on small screens */}
            <div className="hidden md:block">
              <Link to="/contact">
                <button className="bg-stone-100 text-green-800 px-6 py-3 rounded-full text-sm font-semibold hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  Reserve Table
                </button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-stone-200 hover:text-white transition-colors focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-2 pt-2 pb-6 space-y-2 border-t border-green-600">
            <Link 
              to="/" 
              className={`block px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg ${
                isActive('/') 
                  ? 'bg-green-900 text-white' 
                  : 'text-stone-200 hover:bg-green-700/50 hover:text-white'
              }`}
              onClick={handleMobileMenuClose}
            >
              Home
            </Link>
            
            <Link 
              to="/menu" 
              className={`block px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg ${
                isActive('/menu') 
                  ? 'bg-green-900 text-white' 
                  : 'text-stone-200 hover:bg-green-700/50 hover:text-white'
              }`}
              onClick={handleMobileMenuClose}
            >
              Menu
            </Link>
            
            <Link 
              to="/events" 
              className={`block px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg ${
                isActive('/events') 
                  ? 'bg-green-900 text-white' 
                  : 'text-stone-200 hover:bg-green-700/50 hover:text-white'
              }`}
              onClick={handleMobileMenuClose}
            >
              Events
            </Link>
            
            <Link 
              to="/gallery" 
              className={`block px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg ${
                isActive('/gallery') 
                  ? 'bg-green-900 text-white' 
                  : 'text-stone-200 hover:bg-green-700/50 hover:text-white'
              }`}
              onClick={handleMobileMenuClose}
            >
              Gallery
            </Link>
            
            <Link 
              to="/contact" 
              className={`block px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg ${
                isActive('/contact') 
                  ? 'bg-green-900 text-white' 
                  : 'text-stone-200 hover:bg-green-700/50 hover:text-white'
              }`}
              onClick={handleMobileMenuClose}
            >
              Contact Us
            </Link>

            {/* Mobile Reservation Button */}
            <div className="pt-4">
              <Link to="/contact" onClick={handleMobileMenuClose}>
                <button className="w-full bg-stone-100 text-green-800 px-6 py-3 rounded-full text-sm font-semibold hover:bg-white transition-colors">
                  Reserve Table
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};