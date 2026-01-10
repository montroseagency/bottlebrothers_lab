// client/src/components/layout/Header.tsx - PREMIUM CENTERED PILL NAVIGATION
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  IconMenu,
  IconClose,
  IconChevronDown,
  IconCalendar,
  IconLanguageEN,
  IconLanguageSQ,
} from '../ui/Icons';
import {
  extractLocale,
  buildLocalePath,
  setLocaleCookie,
  type Locale,
} from '@/lib/locale';
import logoImage from '@/assets/logo.png';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { t, i18n } = useTranslation();

  // Get current locale from URL
  const currentLocale = extractLocale(pathname) || 'sq';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkSection, setIsDarkSection] = useState(true); // Start with dark (hero)

  const languageDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Detect section theme based on data-nav-theme attribute
  useEffect(() => {
    const sections = document.querySelectorAll('[data-nav-theme]');
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the section that is most visible at the top of viewport
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const theme = entry.target.getAttribute('data-nav-theme');
            setIsDarkSection(theme === 'dark');
          }
        }
      },
      {
        rootMargin: '-80px 0px -80% 0px', // Trigger when section is near the top
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build locale-prefixed paths
  const localePath = (path: string) => `/${currentLocale}${path === '/' ? '' : path}`;

  const isActive = (path: string) => pathname === path || pathname === localePath(path);

  const handleMobileMenuClose = () => {
    setIsMenuOpen(false);
    setIsLanguageDropdownOpen(false);
  };

  const changeLanguage = (lng: string) => {
    if (lng === currentLocale) return;

    // Set cookie for persistence
    setLocaleCookie(lng as Locale);

    // Navigate to new locale URL
    const newPath = buildLocalePath(pathname, lng as Locale);
    router.push(newPath);

    setIsLanguageDropdownOpen(false);
    if (isMenuOpen) handleMobileMenuClose();
  };

  const Logo = () => (
    <Link
      href={localePath('/')}
      onClick={handleMobileMenuClose}
      className="group flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-lg"
    >
      <div className="relative">
        <Image
          src={logoImage}
          alt="Bottle Brothers"
          width={180}
          height={60}
          className="h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105"
          priority
        />
      </div>
    </Link>
  );

  // Premium pill nav item - white text with elegant hover/active states
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

    return (
      <Link
        href={to}
        className={[
          'group relative px-4 py-2 rounded-full transition-all duration-300',
          'text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
          active
            ? 'bg-white/15'
            : 'hover:text-white/85 hover:bg-white/5',
        ].join(' ')}
      >
        <span className={`text-[13px] tracking-[0.02em] ${active ? 'font-semibold' : 'font-medium'}`}>
          {label}
        </span>
        {/* Underline indicator */}
        <span
          className={[
            'absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-[#d4af37] rounded-full transition-all duration-300',
            active
              ? 'w-6 opacity-100'
              : 'w-0 opacity-0 group-hover:w-4 group-hover:opacity-70',
          ].join(' ')}
        />
      </Link>
    );
  };

  const LanguageSelector = ({ isMobile = false }: { isMobile?: boolean }) => {
    const languages = [
      { code: 'en', name: 'English', Icon: IconLanguageEN },
      { code: 'sq', name: 'Shqip', Icon: IconLanguageSQ },
    ];

    if (isMobile) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {languages.map((lang) => {
            const Icon = lang.Icon;
            const active = currentLocale === lang.code;

            return (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={[
                  'flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all duration-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-inset',
                  active
                    ? 'bg-white text-neutral-900 border-white font-semibold'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/15',
                ].join(' ')}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium uppercase tracking-wider">
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
          onClick={() => setIsLanguageDropdownOpen((s) => !s)}
          className={[
            'inline-flex items-center gap-1.5 px-3 py-2 rounded-full',
            'transition-all duration-300',
            'bg-white/5 border border-white/10 text-white hover:text-white/85 hover:bg-white/10',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
          ].join(' ')}
          aria-label="Language"
        >
          <span className="text-[13px] font-medium uppercase">
            {currentLocale}
          </span>
          <IconChevronDown
            className={[
              'w-3.5 h-3.5 transition-transform duration-300',
              isLanguageDropdownOpen ? 'rotate-180' : '',
            ].join(' ')}
          />
        </button>

        {isLanguageDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden backdrop-blur-xl shadow-xl min-w-[140px] bg-[#1a1a1a]/95 border border-white/10">
            {languages.map((lang) => {
              const Icon = lang.Icon;
              const active = currentLocale === lang.code;

              return (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={[
                    'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-inset',
                    active
                      ? 'bg-[#d4af37] text-neutral-900 font-semibold'
                      : 'text-white hover:bg-white/10 hover:text-white/90',
                  ].join(' ')}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{lang.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const ReservationButton = ({ isMobile = false }: { isMobile?: boolean }) => (
    <Link
      href={localePath('/reservations')}
      onClick={isMobile ? handleMobileMenuClose : undefined}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full',
        'transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        isMobile
          ? 'w-full py-3.5 px-4 text-sm font-semibold bg-white text-neutral-900 hover:bg-neutral-100'
          : 'px-5 py-2.5 text-[13px] font-semibold bg-white text-neutral-900 hover:bg-neutral-100',
      ].join(' ')}
    >
      <IconCalendar className="w-4 h-4" strokeWidth={1.5} />
      <span className="tracking-wide">
        {t('nav.reserveTable')}
      </span>
    </Link>
  );

  return (
    <>
      {/* Premium floating header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div
            className={[
              'flex items-center justify-between',
              'h-16 lg:h-[68px] px-4 lg:px-6',
              'rounded-full',
              'border transition-all duration-500',
              isScrolled
                ? isDarkSection
                  ? 'bg-black/80 border-white/10 backdrop-blur-xl shadow-lg'
                  : 'bg-white/90 border-neutral-200 backdrop-blur-xl shadow-lg'
                : 'bg-transparent border-transparent',
            ].join(' ')}
          >
            {/* Left: Logo */}
            <div className="flex-shrink-0">
              <Logo />
            </div>

            {/* Center: Premium Pill Navigation */}
            <nav className="hidden lg:flex items-center">
              <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-transparent border border-transparent">
                <NavigationItem
                  to={localePath('/')}
                  label={t('nav.home')}
                />
                <NavigationItem
                  to={localePath('/menu')}
                  label={t('nav.menu')}
                />
                <NavigationItem
                  to={localePath('/events')}
                  label={t('nav.events')}
                />
                <NavigationItem
                  to={localePath('/gallery')}
                  label={t('nav.gallery')}
                />
                <NavigationItem
                  to={localePath('/contact')}
                  label={t('nav.contact')}
                />
                <NavigationItem
                  to={localePath('/account')}
                  label={t('nav.account', 'Account')}
                />
              </div>
            </nav>

            {/* Right: Language + CTA + Mobile Toggle */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:block">
                <LanguageSelector />
              </div>
              <div className="hidden lg:block">
                <ReservationButton />
              </div>

              <button
                onClick={() => setIsMenuOpen((s) => !s)}
                className="lg:hidden p-2.5 rounded-full transition-all duration-300 bg-white/5 border border-white/10 text-white hover:text-white/85 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
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

          {/* Mobile Menu - Premium Panel */}
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
                <NavigationItem
                  to={localePath('/')}
                  label={t('nav.home')}
                  isMobile
                />
                <NavigationItem
                  to={localePath('/menu')}
                  label={t('nav.menu')}
                  isMobile
                />
                <NavigationItem
                  to={localePath('/events')}
                  label={t('nav.events')}
                  isMobile
                />
                <NavigationItem
                  to={localePath('/gallery')}
                  label={t('nav.gallery')}
                  isMobile
                />
                <NavigationItem
                  to={localePath('/contact')}
                  label={t('nav.contact')}
                  isMobile
                />
                <NavigationItem
                  to={localePath('/account')}
                  label={t('nav.account', 'Account')}
                  isMobile
                />
              </div>

              {/* Language Section */}
              <div className="mt-5 pt-5 border-t border-white/20">
                <div className="text-[11px] text-white/70 mb-3 uppercase tracking-[0.15em] font-medium">
                  Language
                </div>
                <LanguageSelector isMobile />
              </div>

              {/* CTA Button */}
              <div className="mt-5">
                <ReservationButton isMobile />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop for mobile */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={handleMobileMenuClose}
        />
      )}
    </>
  );
};
