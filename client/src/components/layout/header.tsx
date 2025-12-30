// client/src/components/layout/Header.tsx - SUNLAKE-STYLE GLASS NAV (KEEP LINKS + BRAND)
'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const pathname = usePathname();
  const { t, i18n } = useTranslation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const languageDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    <Link
      href="/"
      onClick={handleMobileMenuClose}
      className="group flex items-center gap-3"
    >
      <div className="relative">
        <IconBrand
          className="w-9 h-9 text-accent-champagne-500 transition-transform duration-500 group-hover:scale-110"
          strokeWidth={1.2}
        />
        <div className="absolute inset-0 bg-accent-champagne-500 blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
      </div>
      <div className="flex flex-col leading-tight">
        <h1 className="text-lg font-display font-semibold text-luxury-white tracking-tight">
          Bottle Brothers
        </h1>
        <p className="text-[10px] text-accent-champagne-400 font-sans uppercase tracking-luxury-wide">
          Luxury Lounge
        </p>
      </div>
    </Link>
  );

  const NavIcon = ({
    children,
    active,
  }: {
    children: React.ReactNode;
    active: boolean;
  }) => (
    <span
      className={[
        'grid place-items-center w-7 h-7 rounded-lg transition-all duration-300',
        active
          ? 'bg-accent-champagne-500/15 text-accent-champagne-300'
          : 'bg-luxury-white/5 text-luxury-gray-300 group-hover:text-luxury-white',
      ].join(' ')}
    >
      {children}
    </span>
  );

  const NavigationItem = ({
    to,
    label,
    icon,
    isMobile = false,
  }: {
    to: string;
    label: React.ReactNode;
    icon: React.ReactNode;
    isMobile?: boolean;
  }) => {
    const active = isActive(to);

    if (isMobile) {
      return (
        <Link
          href={to}
          onClick={handleMobileMenuClose}
          className={[
            'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300',
            active
              ? 'bg-accent-champagne-500/15 text-accent-champagne-300'
              : 'text-luxury-gray-200 hover:bg-luxury-white/5 hover:text-luxury-white',
          ].join(' ')}
        >
          <NavIcon active={active}>{icon}</NavIcon>
          <span className="text-sm font-semibold tracking-wide uppercase">
            {label}
          </span>
        </Link>
      );
    }

    return (
      <Link
        href={to}
        className={[
          'group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl',
          'transition-all duration-300 select-none',
          active
            ? 'bg-accent-champagne-500/15 text-accent-champagne-300 border border-accent-champagne-500/20'
            : 'text-luxury-gray-200 hover:text-luxury-white hover:bg-luxury-white/5 border border-transparent hover:border-luxury-white/10',
        ].join(' ')}
      >
        <NavIcon active={active}>{icon}</NavIcon>

        <span className="text-[11px] font-semibold tracking-[0.16em] uppercase">
          {label}
        </span>

        {/* subtle active dot like your previous style */}
        {active && (
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-champagne-400" />
        )}
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
            const active = i18n.language === lang.code;

            return (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={[
                  'flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all duration-300',
                  active
                    ? 'bg-accent-champagne-500 text-luxury-black border-accent-champagne-500'
                    : 'bg-luxury-white/5 text-luxury-gray-200 border-luxury-white/10 hover:border-accent-champagne-500/40',
                ].join(' ')}
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
          onClick={() => setIsLanguageDropdownOpen((s) => !s)}
          className={[
            'inline-flex items-center gap-2 px-3 py-2 rounded-2xl',
            'bg-luxury-white/5 backdrop-blur-xl border border-luxury-white/10',
            'text-luxury-gray-200 hover:text-luxury-white hover:border-accent-champagne-500/30',
            'transition-all duration-300',
          ].join(' ')}
          aria-label="Language"
        >
          <span className="text-[11px] font-mono uppercase tracking-widest">
            {i18n.language}
          </span>
          <IconChevronDown
            className={[
              'w-3 h-3 transition-transform duration-300',
              isLanguageDropdownOpen ? 'rotate-180' : '',
            ].join(' ')}
          />
        </button>

        {isLanguageDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden bg-luxury-black/95 backdrop-blur-xl border border-luxury-white/10 shadow-luxury min-w-[160px]">
            {languages.map((lang) => {
              const Icon = lang.Icon;
              const active = i18n.language === lang.code;

              return (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={[
                    'w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200',
                    active
                      ? 'bg-accent-champagne-500 text-luxury-black'
                      : 'text-luxury-gray-200 hover:bg-luxury-white/5 hover:text-luxury-white',
                  ].join(' ')}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{lang.name}</span>
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
      href="/contact"
      onClick={isMobile ? handleMobileMenuClose : undefined}
      className={[
        'group inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl',
        'bg-accent-champagne-500 text-luxury-black hover:bg-accent-champagne-400',
        'border border-accent-champagne-600 transition-all duration-300',
        isMobile ? 'w-full py-3 px-4 text-sm' : 'px-5 py-2.5 text-[11px]',
      ].join(' ')}
    >
      <IconCalendar className="w-4 h-4" strokeWidth={1.5} />
      <span className="font-semibold uppercase tracking-[0.16em]">
        {t('nav.reserveTable')}
      </span>
      <div className="absolute inset-0 bg-luxury-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left opacity-5" />
    </Link>
  );

  return (
    <>
      {/* ✅ Sunlake-style: fixed, floating glass header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={[
              'mt-3 lg:mt-4',
              'rounded-3xl',
              'border',
              'transition-all duration-500',
              isScrolled
                ? 'bg-luxury-black/70 border-luxury-white/10 backdrop-blur-2xl shadow-luxury'
                : 'bg-luxury-black/50 border-luxury-white/10 backdrop-blur-xl',
            ].join(' ')}
          >
            <div className="flex items-center justify-between h-16 lg:h-20 px-4 sm:px-6">
              {/* Left: Logo */}
              <div className="flex-shrink-0">
                <Logo />
              </div>

              {/* Center: Desktop Glass Nav */}
              <nav className="hidden lg:flex items-center gap-2">
                <NavigationItem
                  to="/"
                  label={t('nav.home')}
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 10.5 12 3l9 7.5" />
                      <path d="M5 10v10h14V10" />
                    </svg>
                  }
                />
                <NavigationItem
                  to="/menu"
                  label={t('nav.menu')}
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 19h16" />
                      <path d="M6 17V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10" />
                      <path d="M9 9h6" />
                      <path d="M9 12h6" />
                    </svg>
                  }
                />
                <NavigationItem
                  to="/events"
                  label={t('nav.events')}
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 7V3" />
                      <path d="M16 7V3" />
                      <path d="M3 10h18" />
                      <path d="M5 7h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
                    </svg>
                  }
                />
                <NavigationItem
                  to="/gallery"
                  label={t('nav.gallery')}
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z" />
                      <path d="m4 16 4-4 3 3 5-5 4 4" />
                    </svg>
                  }
                />
                <NavigationItem
                  to="/contact"
                  label={t('nav.contact')}
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16v16H4z" />
                      <path d="m4 8 8 5 8-5" />
                    </svg>
                  }
                />
              </nav>

              {/* Right: Language + CTA + Mobile Toggle */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden lg:block">
                  <LanguageSelector />
                </div>
                <div className="hidden lg:block">
                  <ReservationButton />
                </div>

                <button
                  onClick={() => setIsMenuOpen((s) => !s)}
                  className="lg:hidden p-2 rounded-xl bg-luxury-white/5 border border-luxury-white/10 text-luxury-gray-200 hover:text-luxury-white hover:bg-luxury-white/10 transition"
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

            {/* Mobile Menu */}
            <div
              className={[
                'lg:hidden overflow-hidden transition-all duration-300 ease-in-out',
                isMenuOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0',
              ].join(' ')}
            >
              <div className="px-4 sm:px-6 pb-6">
                <div className="pt-4 border-t border-luxury-white/10">
                  <div className="space-y-2">
                    <NavigationItem
                      to="/"
                      label={t('nav.home')}
                      icon={
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 10.5 12 3l9 7.5" />
                          <path d="M5 10v10h14V10" />
                        </svg>
                      }
                      isMobile
                    />
                    <NavigationItem
                      to="/menu"
                      label={t('nav.menu')}
                      icon={
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 19h16" />
                          <path d="M6 17V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10" />
                          <path d="M9 9h6" />
                          <path d="M9 12h6" />
                        </svg>
                      }
                      isMobile
                    />
                    <NavigationItem
                      to="/events"
                      label={t('nav.events')}
                      icon={
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M8 7V3" />
                          <path d="M16 7V3" />
                          <path d="M3 10h18" />
                          <path d="M5 7h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
                        </svg>
                      }
                      isMobile
                    />
                    <NavigationItem
                      to="/gallery"
                      label={t('nav.gallery')}
                      icon={
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z" />
                          <path d="m4 16 4-4 3 3 5-5 4 4" />
                        </svg>
                      }
                      isMobile
                    />
                    <NavigationItem
                      to="/contact"
                      label={t('nav.contact')}
                      icon={
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 4h16v16H4z" />
                          <path d="m4 8 8 5 8-5" />
                        </svg>
                      }
                      isMobile
                    />
                  </div>

                  <div className="mt-5 pt-5 border-t border-luxury-white/10">
                    <div className="text-[10px] text-luxury-gray-400 mb-2 uppercase tracking-[0.22em]">
                      Language
                    </div>
                    <LanguageSelector isMobile />
                  </div>

                  <div className="mt-4">
                    <ReservationButton isMobile />
                  </div>
                </div>
              </div>
            </div>
            {/* End Mobile */}
          </div>
        </div>
      </header>

      {/* Backdrop for mobile */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-luxury-black/55 backdrop-blur-sm z-40 lg:hidden"
          onClick={handleMobileMenuClose}
        />
      )}
    </>
  );
};
