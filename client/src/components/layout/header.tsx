// client/src/components/layout/header.tsx - CLEAN LOGO VERSION
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MagneticButton } from '../ui/MagneticButton';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrollY(scrollPosition);
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper function to check if current route is active
  const isActive = (path: string) => location.pathname === path;

  // Close mobile menu when clicking on a link
  const handleMobileMenuClose = () => {
    setIsMenuOpen(false);
    setIsLanguageDropdownOpen(false);
  };

  // Language change handler
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLanguageDropdownOpen(false);
    if (isMenuOpen) handleMobileMenuClose();
  };

  // Get current language info
  const getCurrentLanguage = () => {
    const currentLang = i18n.language;
    const languages = {
      en: { flag: '🇺🇸', name: 'English', code: 'EN' },
      sq: { flag: '🇦🇱', name: 'Shqip', code: 'SQ' }
    };
    return languages[currentLang as keyof typeof languages] || languages.en;
  };

  const Logo = () => (
    <Link to="/" onClick={handleMobileMenuClose} className="group flex items-center space-x-3">
      {/* Simple Logo Icon */}
      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12">
        <svg 
          className="w-8 h-8 sm:w-10 sm:h-10 text-green-400 transition-all duration-300 group-hover:text-green-300 group-hover:scale-110" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
          />
        </svg>
      </div>
      
      {/* Logo Text */}
      <div className="flex flex-col">
        <h1 className="text-xl sm:text-2xl font-bold text-white group-hover:text-green-300 transition-colors duration-300">
          The Lounge
        </h1>
        <p className="text-xs text-green-300 font-medium uppercase tracking-wider hidden sm:block">
          Premium Dining
        </p>
      </div>
    </Link>
  );

  const NavigationItem = ({ to, children, isMobile = false }: { to: string; children: React.ReactNode; isMobile?: boolean }) => (
    <Link 
      to={to} 
      className={`relative transition-all duration-300 rounded-lg group ${
        isMobile 
          ? 'block w-full text-left px-3 py-2 text-sm hover:scale-[1.02]' 
          : 'inline-block px-4 py-3 text-sm rounded-xl'
      } ${
        isActive(to) 
          ? 'text-white bg-gradient-to-r from-green-600 to-green-700 shadow-md' 
          : 'text-stone-200 hover:text-white'
      }`}
      onClick={isMobile ? handleMobileMenuClose : undefined}
    >
      <span className="relative z-10 font-medium">{children}</span>
      
      {!isActive(to) && (
        <>
          <div className={`absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-700/10 ${isMobile ? 'rounded-lg' : 'rounded-xl'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          <div className={`absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 ${isMobile ? 'rounded-lg' : 'rounded-xl'} opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur`} />
        </>
      )}
      
      {/* Active indicator */}
      {isActive(to) && !isMobile && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      )}
    </Link>
  );

  const LanguageDropdown = ({ isMobile = false }: { isMobile?: boolean }) => {
    const currentLang = getCurrentLanguage();
    const languages = [
      { code: 'en', flag: '🇺🇸', name: 'English', shortName: 'EN' },
      { code: 'sq', flag: '🇦🇱', name: 'Shqip', shortName: 'SQ' }
    ];

    if (isMobile) {
      // Mobile: Show as compact toggle buttons
      return (
        <div className="w-full">
          <div className="text-xs text-white/70 mb-2 text-center font-medium">Language</div>
          <div className="flex space-x-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                  i18n.language === lang.code
                    ? 'bg-green-600 text-white shadow-md scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:scale-105'
                }`}
              >
                <span className="text-sm">{lang.flag}</span>
                <span className="font-semibold">{lang.shortName}</span>
                {i18n.language === lang.code && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Desktop: Show as dropdown
    return (
      <div className="relative" ref={languageDropdownRef}>
        <button
          onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/10"
          aria-expanded={isLanguageDropdownOpen}
          aria-haspopup="true"
        >
          <span className="text-base">{currentLang.flag}</span>
          <span>{currentLang.code}</span>
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Desktop Dropdown Menu */}
        {isLanguageDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-green-200/20 overflow-hidden z-50 min-w-[140px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-all duration-200 ${
                  i18n.language === lang.code
                    ? 'bg-green-600 text-white'
                    : 'text-gray-800 hover:bg-green-50 hover:text-green-800'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{lang.shortName}</span>
                  <span className="text-xs opacity-75">{lang.name}</span>
                </div>
                {i18n.language === lang.code && (
                  <div className="ml-auto">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const ReservationButton = ({ isMobile = false }) => (
    <MagneticButton className={`group relative bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 overflow-hidden ${
      isMobile ? 'w-full py-2.5 px-4 text-sm' : 'px-6 py-2.5 text-sm'
    }`}>
      <Link to="/contact" onClick={isMobile ? handleMobileMenuClose : undefined} className="relative z-10 flex items-center justify-center space-x-2">
        <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{t('nav.reserveTable')}</span>
      </Link>
      
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
    </MagneticButton>
  );

  const MobileMenuToggle = () => (
    <button
      onClick={() => {
        setIsMenuOpen(!isMenuOpen);
        setIsLanguageDropdownOpen(false);
      }}
      className="md:hidden relative p-2 text-stone-200 hover:text-white transition-colors focus:outline-none group"
      aria-label="Toggle mobile menu"
      aria-expanded={isMenuOpen}
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
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Logo />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              <NavigationItem to="/">{t('nav.home')}</NavigationItem>
              <NavigationItem to="/menu">{t('nav.menu')}</NavigationItem>
              <NavigationItem to="/events">{t('nav.events')}</NavigationItem>
              <NavigationItem to="/gallery">{t('nav.gallery')}</NavigationItem>
              <NavigationItem to="/contact">{t('nav.contact')}</NavigationItem>
            </nav>

            {/* Right side items */}
            <div className="flex items-center space-x-3">
              {/* Language Dropdown - Desktop */}
              <div className="hidden md:block">
                <LanguageDropdown />
              </div>
              
              {/* Reservation Button - Desktop */}
              <div className="hidden md:block">
                <ReservationButton />
              </div>

              {/* Mobile Menu Toggle */}
              <MobileMenuToggle />
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-80 opacity-100 visible overflow-y-auto' 
            : 'max-h-0 opacity-0 invisible overflow-hidden'
        }`}>
          <div className={`px-4 sm:px-6 lg:px-8 py-3 space-y-3 ${
            isScrolled 
              ? 'bg-black/95' 
              : 'bg-gradient-to-r from-green-900/95 to-green-800/90'
          } backdrop-blur-xl border-t border-green-600/20`}>
            
            {/* Navigation Links */}
            <div className="space-y-1">
              <NavigationItem to="/" isMobile>{t('nav.home')}</NavigationItem>
              <NavigationItem to="/menu" isMobile>{t('nav.menu')}</NavigationItem>
              <NavigationItem to="/events" isMobile>{t('nav.events')}</NavigationItem>
              <NavigationItem to="/gallery" isMobile>{t('nav.gallery')}</NavigationItem>
              <NavigationItem to="/contact" isMobile>{t('nav.contact')}</NavigationItem>
            </div>
            
            {/* Language Selector - Mobile */}
            <div>
              <LanguageDropdown isMobile />
            </div>
            
            {/* Reservation Button */}
            <div>
              <ReservationButton isMobile />
            </div>
            
            {/* Social Links */}
            <div className="pt-2 border-t border-green-600/20">
              <div className="text-xs text-white/60 mb-2 text-center font-medium">Follow Us</div>
              <div className="flex justify-center space-x-3">
                {[
                  { name: 'twitter', icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
                  { name: 'instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
                  { name: 'facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' }
                ].map((social) => (
                  <a
                    key={social.name}
                    href="#"
                    className="w-7 h-7 bg-green-600/20 rounded-full flex items-center justify-center text-green-400 hover:bg-green-600/30 hover:text-green-300 transition-all duration-300 hover:scale-110 border border-green-500/20"
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.icon} />
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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={handleMobileMenuClose}
        />
      )}
    </>
  );
};