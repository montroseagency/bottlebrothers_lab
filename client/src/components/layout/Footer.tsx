// client/src/components/layout/Footer.tsx - LUXURY REDESIGN
'use client'

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  IconLocation,
  IconPhone,
  IconMail,
  IconClock,
  IconTwitter,
  IconInstagram,
  IconFacebook,
  IconLinkedIn,
  IconBrand,
  IconArrowRight,
} from '../ui/Icons';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const QuickLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
      href={to}
      className="group flex items-center space-x-2 text-luxury-gray-400 hover:text-accent-champagne-400 transition-colors duration-300 text-sm"
    >
      <span className="w-0 h-px bg-accent-champagne-400 group-hover:w-3 transition-all duration-300" />
      <span>{children}</span>
    </Link>
  );

  const SocialLink = ({ href, Icon, label }: { href: string; Icon: React.FC<any>; label: string }) => (
    <a
      href={href}
      aria-label={label}
      className="
        group relative w-10 h-10 flex items-center justify-center
        bg-luxury-gray-900 border border-luxury-gray-700
        text-luxury-gray-400 hover:text-accent-champagne-400 hover:border-accent-champagne-500/50
        transition-all duration-300
      "
    >
      <Icon className="w-5 h-5 relative z-10" />
      <div className="absolute inset-0 bg-accent-champagne-500/10 transform scale-0 group-hover:scale-100 transition-transform duration-300" />
    </a>
  );

  const ContactInfo = ({ Icon, title, children }: {
    Icon: React.FC<any>;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 w-10 h-10 bg-luxury-gray-900 border border-luxury-gray-700 flex items-center justify-center">
        <Icon className="w-5 h-5 text-accent-champagne-500" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-luxury-gray-500 uppercase tracking-luxury-wide mb-1">{title}</div>
        <div className="text-sm text-luxury-gray-300">{children}</div>
      </div>
    </div>
  );

  return (
    <footer className="relative bg-luxury-black border-t border-luxury-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Brand & About */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center space-x-3">
              <IconBrand className="w-10 h-10 text-accent-champagne-500" strokeWidth={1.2} />
              <div>
                <h3 className="text-lg font-display font-semibold text-luxury-white">
                  Bottle Brothers
                </h3>
                <p className="text-[10px] text-accent-champagne-400 uppercase tracking-luxury-wide">
                  Luxury Lounge
                </p>
              </div>
            </div>
            <p className="text-sm text-luxury-gray-400 leading-relaxed">
              {t('footer.description')}
            </p>
            {/* Social Links */}
            <div className="flex items-center space-x-3">
              <SocialLink href="#" Icon={IconTwitter} label="Twitter" />
              <SocialLink href="#" Icon={IconInstagram} label="Instagram" />
              <SocialLink href="#" Icon={IconFacebook} label="Facebook" />
              <SocialLink href="#" Icon={IconLinkedIn} label="LinkedIn" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs text-luxury-gray-500 uppercase tracking-luxury-wide">
              {t('footer.quickLinks')}
            </h4>
            <nav className="space-y-2.5">
              <QuickLink to="/">{t('nav.home')}</QuickLink>
              <QuickLink to="/menu">{t('nav.menu')}</QuickLink>
              <QuickLink to="/events">{t('nav.events')}</QuickLink>
              <QuickLink to="/gallery">{t('nav.gallery')}</QuickLink>
              <QuickLink to="/contact">{t('nav.contact')}</QuickLink>
            </nav>
          </div>

          {/* Services */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs text-luxury-gray-500 uppercase tracking-luxury-wide">
              {t('footer.services')}
            </h4>
            <nav className="space-y-2.5">
              <QuickLink to="/events">{t('footer.privateEvents')}</QuickLink>
              <QuickLink to="/menu">Catering Services</QuickLink>
              <QuickLink to="/contact">Corporate Bookings</QuickLink>
              <QuickLink to="/events">VIP Memberships</QuickLink>
              <QuickLink to="/contact">Event Planning</QuickLink>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs text-luxury-gray-500 uppercase tracking-luxury-wide">
              {t('footer.visitUs')}
            </h4>
            <div className="space-y-4">
              <ContactInfo Icon={IconLocation} title={t('footer.address')}>
                123 Olive Grove Avenue<br />
                Downtown District<br />
                City, State 12345
              </ContactInfo>
              <ContactInfo Icon={IconPhone} title={t('footer.phone')}>
                <a href="tel:+15551234567" className="hover:text-accent-champagne-400 transition-colors">
                  (555) 123-4567
                </a>
              </ContactInfo>
              <ContactInfo Icon={IconMail} title="Email">
                <a href="mailto:info@bottlebrothers.com" className="hover:text-accent-champagne-400 transition-colors">
                  info@bottlebrothers.com
                </a>
              </ContactInfo>
              <ContactInfo Icon={IconClock} title={t('footer.hours')}>
                Mon-Thu: 5PM-12AM<br />
                Fri-Sat: 5PM-2AM<br />
                Sun: 6PM-11PM
              </ContactInfo>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-12 border-t border-luxury-gray-800">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-semibold text-luxury-white">
                {t('footer.stayConnected')}
              </h3>
              <p className="text-sm text-luxury-gray-400">
                Subscribe to receive exclusive offers and event invitations
              </p>
            </div>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your.email@example.com"
                className="
                  flex-1 px-4 py-3 bg-luxury-gray-900 border border-luxury-gray-700
                  text-luxury-white placeholder-luxury-gray-500
                  focus:border-accent-champagne-500 focus:outline-none
                  transition-colors duration-300
                "
                required
              />
              <button
                type="submit"
                className="
                  group px-6 py-3 bg-accent-champagne-500 text-luxury-black
                  hover:bg-accent-champagne-400 border border-accent-champagne-600
                  transition-all duration-300 flex items-center justify-center space-x-2
                "
              >
                <span className="text-sm font-medium uppercase tracking-wider">Subscribe</span>
                <IconArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-luxury-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm">
            <div className="text-luxury-gray-500 text-center md:text-left">
              <p>© {currentYear} Bottle Brothers. All rights reserved.</p>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="#" className="text-luxury-gray-500 hover:text-accent-champagne-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-luxury-gray-500 hover:text-accent-champagne-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-luxury-gray-500 hover:text-accent-champagne-400 transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="py-8 border-t border-luxury-gray-800">
          <Link
            href="/contact"
            className="
              group mx-auto flex items-center justify-center space-x-3 w-full sm:w-auto
              px-8 py-4 bg-accent-champagne-500 text-luxury-black
              hover:bg-accent-champagne-400 border border-accent-champagne-600
              transition-all duration-300
            "
          >
            <span className="font-display text-lg font-semibold tracking-wide">
              {t('footer.experienceTonight')}
            </span>
            <IconArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" strokeWidth={2} />
          </Link>
        </div>
      </div>

      {/* Decorative gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent-champagne-500/50 to-transparent" />
    </footer>
  );
};
