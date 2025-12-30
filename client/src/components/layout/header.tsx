// client/src/components/layout/Header.tsx - LUXURY REDESIGN
'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  IconMenu,
  IconClose,
  IconChevronDown,
  IconBrand,
  IconCalendar,
  IconLanguageEN,
  IconLanguageSQ,
} from '../ui/Icons';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { t, i18n } = useTranslation();
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleMobileMenuClose = () => {
    setIsMenuOpen(false);
    setIsLanguageDropdownOpen(false);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLanguageDropdownOpen(false);
    if (isMenuOpen) handleMobileMenuClose();
  };

  const Logo = () => (
    <Link href="/" onClick={handleMobileMenuClose} className="group flex items-center space-x-3">
      <div className="relative">
        <IconBrand className="w-9 h-9 text-accent-champagne-500 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.2} />
        <div className="absolute inset-0 bg-accent-champagne-500 blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
      </div>
      <div className="flex flex-col">
        <h1 className="text-lg font-display font-semibold text-luxury-white tracking-tight">
          Bottle Brothers
        </h1>
        <p className="text-[10px] text-accent-champagne-400 font-sans uppercase tracking-luxury-wide">
          Luxury Lounge
        </p>
      </div>
    </Link>
  );

  const NavigationItem = ({ to, children, isMobile = false }: { to: string; children: React.ReactNode; isMobile?: boolean }) => (
    <Link
      href={to}
      className={`
        relative group transition-all duration-300
        ${isMobile
          ? 'block w-full px-0 py-3 text-sm border-b border-luxury-gray-800'
          : 'inline-block px-4 py-2 text-sm'
        }
        ${isActive(to)
          ? 'text-accent-champagne-400'
          : 'text-luxury-gray-300 hover:text-luxury-white'
        }
      `}
      onClick={isMobile ? handleMobileMenuClose : undefined}
    >
      <span className="relative z-10 font-medium tracking-wide uppercase text-xs">
        {children}
      </span>
      {isActive(to) && !isMobile && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent-champagne-400" />
      )}
      {!isActive(to) && (
        <span className="absolute bottom-0 left-0 w-0 h-px bg-accent-champagne-400 group-hover:w-full transition-all duration-300" />
      )}
    </Link>
  );

  const LanguageSelector = ({ isMobile = false }: { isMobile?: boolean }) => {
    const languages = [
      { code: 'en', name: 'English', Icon: IconLanguageEN },
      { code: 'sq', name: 'Shqip', Icon: IconLanguageSQ }
    ];

    if (isMobile) {
      return (
        <div className="flex space-x-2 pt-2">
          {languages.map((lang) => {
            const Icon = lang.Icon;
            return (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`
                  flex-1 flex items-center justify-center space-x-2 px-4 py-2.5
                  border transition-all duration-300
                  ${i18n.language === lang.code
                    ? 'bg-accent-champagne-500 text-luxury-black border-accent-champagne-500'
                    : 'bg-luxury-gray-900 text-luxury-gray-300 border-luxury-gray-700 hover:border-accent-champagne-500/50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-mono uppercase tracking-wider">
                  {lang.code}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="relative" ref={languageDropdownRef}>
        <button
          onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
          className="
            flex items-center space-x-2 px-3 py-2
            bg-luxury-gray-900/50 backdrop-blur-sm
            border border-luxury-gray-700
            text-luxury-gray-300 hover:text-luxury-white hover:border-accent-champagne-500/50
            transition-all duration-300
          "
        >
          <span className="text-xs font-mono uppercase tracking-wider">
            {i18n.language}
          </span>
          <IconChevronDown className={`w-3 h-3 transition-transform duration-300 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isLanguageDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 bg-luxury-gray-950 border border-luxury-gray-700 shadow-luxury overflow-hidden min-w-[140px]">
            {languages.map((lang) => {
              const Icon = lang.Icon;
              return (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 text-sm transition-all duration-200
                    ${i18n.language === lang.code
                      ? 'bg-accent-champagne-500 text-luxury-black'
                      : 'text-luxury-gray-300 hover:bg-luxury-gray-800 hover:text-luxury-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{lang.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const ReservationButton = ({ isMobile = false }) => (
    <Link
      href="/contact"
      onClick={isMobile ? handleMobileMenuClose : undefined}
      className={`
        group relative inline-flex items-center justify-center space-x-2 overflow-hidden
        bg-accent-champagne-500 text-luxury-black
        hover:bg-accent-champagne-400
        border border-accent-champagne-600
        transition-all duration-300
        ${isMobile ? 'w-full py-3 px-4 text-sm' : 'px-6 py-2.5 text-xs'}
      `}
    >
      <IconCalendar className="w-4 h-4" strokeWidth={1.5} />
      <span className="font-medium uppercase tracking-wider">{t('nav.reserveTable')}</span>
      <div className="absolute inset-0 bg-luxury-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left opacity-5" />
    </Link>
  );

  return (
    <>
      <header className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${isScrolled
          ? 'bg-luxury-black/95 backdrop-blur-xl border-b border-luxury-gray-800'
          : 'bg-luxury-black/80 backdrop-blur-md'
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1">
              <NavigationItem to="/">{t('nav.home')}</NavigationItem>
              <NavigationItem to="/menu">{t('nav.menu')}</NavigationItem>
              <NavigationItem to="/events">{t('nav.events')}</NavigationItem>
              <NavigationItem to="/gallery">{t('nav.gallery')}</NavigationItem>
              <NavigationItem to="/contact">{t('nav.contact')}</NavigationItem>
            </nav>

            {/* Right side items */}
            <div className="flex items-center space-x-3">
              {/* Language Selector - Desktop */}
              <div className="hidden lg:block">
                <LanguageSelector />
              </div>

              {/* Reservation Button - Desktop */}
              <div className="hidden lg:block">
                <ReservationButton />
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-luxury-gray-300 hover:text-luxury-white transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <IconClose className="w-6 h-6" strokeWidth={1.5} />
                ) : (
                  <IconMenu className="w-6 h-6" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`
          lg:hidden transition-all duration-300 ease-in-out
          ${isMenuOpen
            ? 'max-h-screen opacity-100 visible'
            : 'max-h-0 opacity-0 invisible'
          }
        `}>
          <div className="px-4 sm:px-6 py-6 bg-luxury-gray-950 border-t border-luxury-gray-800 space-y-4">
            {/* Navigation Links */}
            <nav className="space-y-0">
              <NavigationItem to="/" isMobile>{t('nav.home')}</NavigationItem>
              <NavigationItem to="/menu" isMobile>{t('nav.menu')}</NavigationItem>
              <NavigationItem to="/events" isMobile>{t('nav.events')}</NavigationItem>
              <NavigationItem to="/gallery" isMobile>{t('nav.gallery')}</NavigationItem>
              <NavigationItem to="/contact" isMobile>{t('nav.contact')}</NavigationItem>
            </nav>

            {/* Language Selector */}
            <div className="pt-4 border-t border-luxury-gray-800">
              <div className="text-[10px] text-luxury-gray-500 mb-2 uppercase tracking-luxury-wide">Language</div>
              <LanguageSelector isMobile />
            </div>

            {/* Reservation Button */}
            <div className="pt-2">
              <ReservationButton isMobile />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-luxury-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={handleMobileMenuClose}
        />
      )}
    </>
  );
};
