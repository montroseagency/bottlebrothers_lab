// client/src/components/layout/header.tsx - ENHANCED VERSION
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MagneticButton } from '../ui/MagneticButton';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrollY(scrollPosition);
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper function to check if current route is active
  const isActive = (path: string) => location.pathname === path;

  // Close mobile menu when clicking on a link
  const handleMobileMenuClose = () => {
    setIsMenuOpen(false);
  };

  const Logo = () => (
    <Link to="/" onClick={handleMobileMenuClose} className="group">
      <div className="flex items-center space-x-3 transform transition-all duration-300 group-hover:scale-105">
        <div className="relative w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-green-400/25 transition-all duration-300">
          <svg className="w-7 h-7 text-white transform transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-green-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent group-hover:from-green-300 group-hover:to-white transition-all duration-300">
            Demo
          </h1>
          <p className="text-xs text-green-300 font-medium uppercase tracking-wider">Lounge</p>
        </div>
      </div>
    </Link>
  );

  const NavigationItem = ({ to, children, isMobile = false }: { to: string; children: React.ReactNode; isMobile?: boolean }) => (
    <Link 
      to={to} 
      className={`relative px-4 py-3 text-sm font-medium transition-all duration-300 rounded-xl group ${
        isMobile 
          ? 'block w-full text-left' 
          : 'inline-block'
      } ${
        isActive(to) 
          ? 'text-white bg-gradient-to-r from-green-600 to-green-700 shadow-lg shadow-green-600/25' 
          : 'text-stone-200 hover:text-white'
      }`}
      onClick={isMobile ? handleMobileMenuClose : undefined}
    >
      <span className="relative z-10">{children}</span>
      
      {!isActive(to) && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-700/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur" />
        </>
      )}
      
      {/* Active indicator */}
      {isActive(to) && !isMobile && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      )}
    </Link>
  );

  const ReservationButton = ({ isMobile = false }) => (
    <MagneticButton className={`group relative bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300 overflow-hidden ${
      isMobile ? 'w-full py-4 px-6' : 'px-8 py-3'
    }`}>
      <Link to="/contact" onClick={isMobile ? handleMobileMenuClose : undefined} className="relative z-10 flex items-center justify-center space-x-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>Reserve Table</span>
      </Link>
      
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
    </MagneticButton>
  );

  const MobileMenuToggle = () => (
    <button
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      className="md:hidden relative p-3 text-stone-200 hover:text-white transition-colors focus:outline-none group"
      aria-label="Toggle mobile menu"
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <span className={`block h-0.5 w-6 bg-current transform transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-0.5' : ''}`} />
        <span className={`block h-0.5 w-6 bg-current mt-1 transform transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
        <span className={`block h-0.5 w-6 bg-current mt-1 transform transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-0.5' : ''}`} />
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-green-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-black/90 backdrop-blur-xl border-b border-green-600/20 shadow-2xl shadow-black/50' 
          : 'bg-gradient-to-r from-green-900/80 to-green-800/60 backdrop-blur-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div 
                className="flex-shrink-0 transform transition-all duration-300"
                style={{ transform: `translateY(${scrollY * -0.05}px)` }}
              >
                <Logo />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              <NavigationItem to="/">Home</NavigationItem>
              <NavigationItem to="/menu">Menu</NavigationItem>
              <NavigationItem to="/events">Events</NavigationItem>
              <NavigationItem to="/gallery">Gallery</NavigationItem>
              <NavigationItem to="/contact">Contact</NavigationItem>
            </nav>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <ReservationButton />
              </div>

              <MobileMenuToggle />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
          }`}>
            <div className="pt-4 border-t border-green-600/20">
              <div className="space-y-2">
                <NavigationItem to="/" isMobile>Home</NavigationItem>
                <NavigationItem to="/menu" isMobile>Menu</NavigationItem>
                <NavigationItem to="/events" isMobile>Events</NavigationItem>
                <NavigationItem to="/gallery" isMobile>Gallery</NavigationItem>
                <NavigationItem to="/contact" isMobile>Contact</NavigationItem>
              </div>
              
              <div className="mt-6">
                <ReservationButton isMobile />
              </div>
              
              {/* Social links */}
              <div className="flex justify-center space-x-4 mt-6 pt-4 border-t border-green-600/20">
                {['twitter', 'instagram', 'facebook'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center text-green-400 hover:bg-green-600/30 hover:text-green-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu backdrop */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};