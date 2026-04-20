// client/src/components/layout/Header.tsx - PREMIUM CENTERED PILL NAVIGATION
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  IconMenu,
  IconClose,
  IconCalendar,
} from '../ui/Icons';
import logoImage from '@/assets/sarajet-logo.png';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { t } = useTranslation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ===========================================
  // NAVBAR THEME LOGIC
  // ===========================================
  // Always dark navbar (black background, white text)
  const isDarkNavbar = true;

  const isActive = (path: string) => pathname === path;

  const handleMobileMenuClose = () => {
    setIsMenuOpen(false);
  };

  // ===========================================
  // COMPONENTS
  // ===========================================

  const Logo = () => (
    <Link
      href="/"
      onClick={handleMobileMenuClose}
      className={[
        'group flex items-center rounded-lg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
      ].join(' ')}
    >
      <div className="relative">
        <Image
          src={logoImage}
          alt="Sarajet Restaurant"
          width={180}
          height={60}
          className="h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105"
          priority
        />
      </div>
    </Link>
  );

  // Navigation Item Component
  const NavigationItem = ({
    to,
    label,
    isMobile = false,
  }: {
    to: string;
    label: React.ReactNode;
    isMobile?: boolean;
  }) => {
    const active = isActive(to);

    // Mobile menu is always dark background
    if (isMobile) {
      return (
        <Link
          href={to}
          onClick={handleMobileMenuClose}
          className={[
            'block px-4 py-3 rounded-xl transition-all duration-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-inset',
            active
              ? 'bg-white/15 text-white font-semibold'
              : 'text-white hover:bg-white/10 hover:text-white/90',
          ].join(' ')}
        >
          <span className={`text-sm tracking-wide ${active ? 'font-semibold' : 'font-medium'}`}>
            {label}
          </span>
          {active && (
            <span className="block h-0.5 w-8 bg-[#d4af37] mt-1 rounded-full" />
          )}
        </Link>
      );
    }

    // Desktop navigation
    return (
      <Link
        href={to}
        className={[
          'group relative px-5 py-2.5 rounded-full transition-all duration-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]',
          'focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
          isDarkNavbar
            ? [
                // Dark navbar - white text
                active ? 'bg-white/20 text-white' : 'text-white/90 hover:text-white hover:bg-white/10',
              ].join(' ')
            : [
                // Light navbar - dark text
                active ? 'bg-neutral-900/10 text-neutral-900' : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-900/5',
              ].join(' '),
        ].join(' ')}
        style={isDarkNavbar ? { textShadow: '0 1px 2px rgba(0,0,0,0.3)' } : undefined}
      >
        <span className={`text-[15px] tracking-wide ${active ? 'font-bold' : 'font-semibold'}`}>
          {label}
        </span>
        {/* Underline indicator */}
        <span
          className={[
            'absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300',
            isDarkNavbar ? 'bg-[#d4af37]' : 'bg-[#d4af37]',
            active ? 'w-8 opacity-100' : 'w-0 opacity-0 group-hover:w-6 group-hover:opacity-80',
          ].join(' ')}
        />
      </Link>
    );
  };

  // Reservation Button Component
  const ReservationButton = ({ isMobile = false }: { isMobile?: boolean }) => (
    <Link
      href="/reservations"
      onClick={isMobile ? handleMobileMenuClose : undefined}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full',
        'transition-all duration-300 shadow-lg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        isMobile
          ? 'w-full py-3.5 px-4 text-sm font-bold bg-[#d4af37] text-black hover:bg-[#e5c349]'
          : 'px-6 py-2.5 text-sm font-bold bg-[#d4af37] text-black hover:bg-[#e5c349]',
      ].join(' ')}
    >
      <IconCalendar className="w-4 h-4" strokeWidth={2} />
      <span className="tracking-wide">
        {t('nav.reserveTable')}
      </span>
    </Link>
  );

  // ===========================================
  // RENDER
  // ===========================================
  return (
    <>
      {/* Premium floating header */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        data-navbar-theme={isDarkNavbar ? 'dark' : 'light'}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          {/* Main navbar container */}
          <div
            className={[
              'flex items-center justify-between',
              'h-16 lg:h-[68px] px-4 lg:px-6',
              'rounded-full border transition-all duration-500',
              'bg-black/85 border-white/10 backdrop-blur-xl shadow-lg',
            ].join(' ')}
          >
            {/* Left: Logo */}
            <div className="flex-shrink-0">
              <Logo />
            </div>

            {/* Center: Premium Pill Navigation */}
            <nav className="hidden lg:flex items-center">
              <div
                className={[
                  'flex items-center gap-1 px-3 py-2 rounded-full backdrop-blur-sm border transition-all duration-300',
                  isDarkNavbar
                    ? 'bg-black/30 border-white/10'
                    : 'bg-neutral-100/80 border-neutral-200 shadow-sm',
                ].join(' ')}
              >
                <NavigationItem to="/" label={t('nav.home')} />
                <NavigationItem to="/menu" label={t('nav.menu')} />
                <NavigationItem to="/gallery" label={t('nav.gallery')} />
                <NavigationItem to="/contact" label={t('nav.contact')} />
              </div>
            </nav>

            {/* Right: CTA + Mobile Toggle */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:block">
                <ReservationButton />
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMenuOpen((s) => !s)}
                className={[
                  'lg:hidden p-3 rounded-full transition-all duration-300 backdrop-blur-sm border',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]',
                  'focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  isDarkNavbar
                    ? 'bg-black/30 border-white/20 text-white hover:bg-black/50'
                    : 'bg-white/80 border-neutral-200 text-neutral-700 hover:bg-white',
                ].join(' ')}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <IconClose className="w-5 h-5" strokeWidth={1.5} />
                ) : (
                  <IconMenu className="w-5 h-5" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu - Premium Panel (always dark) */}
          <div
            className={[
              'lg:hidden mt-2 rounded-2xl overflow-hidden',
              'bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10',
              'shadow-[0_16px_48px_rgba(0,0,0,0.5)]',
              'transition-all duration-300 ease-out',
              isMenuOpen
                ? 'max-h-[520px] opacity-100 translate-y-0'
                : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none',
            ].join(' ')}
          >
            <div className="p-5">
              {/* Nav Links */}
              <div className="space-y-1">
                <NavigationItem to="/" label={t('nav.home')} isMobile />
                <NavigationItem to="/menu" label={t('nav.menu')} isMobile />
                <NavigationItem to="/gallery" label={t('nav.gallery')} isMobile />
                <NavigationItem to="/contact" label={t('nav.contact')} isMobile />
              </div>

              {/* CTA Button */}
              <div className="mt-5">
                <ReservationButton isMobile />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={handleMobileMenuClose}
        />
      )}
    </>
  );
};
