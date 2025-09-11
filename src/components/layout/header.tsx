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
    <header className="shadow-lg sticky top-0 z-50 bg-green-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" onClick={handleMobileMenuClose}>
                <h1 className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
                  Lounge
                </h1>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                isActive('/') 
                  ? 'text-gray-800 border-b-2 border-gray-800' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Home
            </Link>
            
            <Link 
              to="/menu" 
              className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                isActive('/menu') 
                  ? 'text-gray-800 border-b-2 border-gray-800' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Menu
            </Link>
            
            <Link 
              to="/events" 
              className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                isActive('/events') 
                  ? 'text-gray-800 border-b-2 border-gray-800' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Events
            </Link>
            
            <Link 
              to="/gallery" 
              className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                isActive('/gallery') 
                  ? 'text-gray-800 border-b-2 border-gray-800' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Gallery
            </Link>
            
            <Link 
              to="/contact" 
              className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                isActive('/contact') 
                  ? 'text-gray-800 border-b-2 border-gray-800' 
                  : 'text-gray-700 hover:text-gray-900'
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
                <button className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors">
                  Make Reservation
                </button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-800 hover:text-gray-600 transition-colors focus:outline-none"
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
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-green-300">
            <Link 
              to="/" 
              className={`block px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive('/') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-700 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={handleMobileMenuClose}
            >
              Home
            </Link>
            
            <Link 
              to="/menu" 
              className={`block px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive('/menu') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-700 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={handleMobileMenuClose}
            >
              Menu
            </Link>
            
            <Link 
              to="/events" 
              className={`block px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive('/events') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-700 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={handleMobileMenuClose}
            >
              Events
            </Link>
            
            <Link 
              to="/gallery" 
              className={`block px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive('/gallery') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-700 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={handleMobileMenuClose}
            >
              Gallery
            </Link>
            
            <Link 
              to="/contact" 
              className={`block px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive('/contact') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-700 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={handleMobileMenuClose}
            >
              Contact Us
            </Link>

            {/* Mobile Reservation Button */}
            <div className="pt-2">
              <Link to="/contact" onClick={handleMobileMenuClose}>
                <button className="w-full bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors">
                  Make Reservation
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};