// client/src/components/layout/Footer.tsx - TRANSLATED VERSION
'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { MagneticButton } from '../ui/MagneticButton';
import { ParticleField } from '../ui/ParticleField';

export const Footer: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isNewsletterExpanded, setIsNewsletterExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate newsletter signup
    setNewsletterStatus('success');
    setTimeout(() => {
      setNewsletterStatus('idle');
      setEmail('');
      setIsNewsletterExpanded(false);
    }, 3000);
  };

  const SocialIcon = ({ icon, href, label }: { icon: string; href: string; label: string }) => (
    <MagneticButton className="group">
      <a
        href={href}
        aria-label={label}
        className="relative w-12 h-12 bg-gradient-to-br from-green-600/20 to-green-700/10 backdrop-blur-sm border border-green-500/20 rounded-2xl flex items-center justify-center text-green-400 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 overflow-hidden"
      >
        <span className="relative z-10 text-lg">{icon}</span>
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
      </a>
    </MagneticButton>
  );

  const QuickLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
      href={to}
      className="group relative text-stone-300 hover:text-white transition-all duration-300 text-sm py-2 block"
    >
      <span className="relative z-10 flex items-center">
        <span className="w-0 group-hover:w-3 h-0.5 bg-green-400 mr-0 group-hover:mr-2 transition-all duration-300" />
        {children}
      </span>
    </Link>
  );

  const ContactCard = ({ icon, title, content, action }: { 
    icon: React.ReactNode; 
    title: string; 
    content: string | React.ReactNode; 
    action?: { text: string; href: string } 
  }) => (
    <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-green-500/30 transition-all duration-500 overflow-hidden">
      <div className="relative z-10">
        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
          {icon}
        </div>
        <h4 className="font-bold text-white mb-2 text-lg">{title}</h4>
        <div className="text-stone-300 mb-4 leading-relaxed">
          {content}
        </div>
        {action && (
          <MagneticButton className="text-green-400 hover:text-green-300 font-medium text-sm flex items-center space-x-1 group-hover:space-x-2 transition-all duration-300">
            <a href={action.href} className="flex items-center space-x-1">
              <span>{action.text}</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </MagneticButton>
        )}
      </div>
      
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-green-400/5 transform scale-0 group-hover:scale-100 transition-transform duration-500 origin-center rounded-2xl" />
    </div>
  );

  return (
    <footer className="relative bg-gradient-to-br from-black via-stone-900 to-green-900/20 border-t border-green-600/20 mt-auto overflow-hidden">
      <ParticleField particleCount={20} color="bg-green-400" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center shadow-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-green-500 rounded-3xl blur opacity-30 animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{t('footer.title')}</h3>
                <p className="text-green-300 font-medium">{t('footer.subtitle')}</p>
              </div>
            </div>
            
            <p className="text-stone-300 text-lg leading-relaxed max-w-lg">
              {t('footer.description')}
            </p>
            
            {/* Newsletter Signup */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <h4 className="text-white font-semibold">{t('footer.stayConnected')}</h4>
              </div>
              
              <div className={`transition-all duration-500 ${isNewsletterExpanded ? 'max-h-40' : 'max-h-12'} overflow-hidden`}>
                {!isNewsletterExpanded ? (
                  <MagneticButton 
                    onClick={() => setIsNewsletterExpanded(true)}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-2xl hover:bg-white/20 transition-all duration-300 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-stone-300">{t('footer.joinNewsletter')}</span>
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </MagneticButton>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                    <div className="flex space-x-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all"
                        required
                      />
                      <MagneticButton className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-2xl transition-colors font-medium">
                        <button type="submit" className="bg-transparent border-none outline-none p-0 m-0 w-full h-full">
                          {t('footer.newsletter.join')}
                        </button>
                      </MagneticButton>
                    </div>
                    {newsletterStatus === 'success' && (
                      <div className="flex items-center space-x-2 text-green-400 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{t('footer.newsletter.welcome')}</span>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-white flex items-center">
              <span className="w-1 h-6 bg-green-400 rounded-full mr-3" />
              {t('footer.quickLinks')}
            </h4>
            <nav className="space-y-1">
              <QuickLink to="/">{t('nav.home')}</QuickLink>
              <QuickLink to="/menu">{t('nav.menu')}</QuickLink>
              <QuickLink to="/events">{t('nav.events')}</QuickLink>
              <QuickLink to="/gallery">{t('nav.gallery')}</QuickLink>
              <QuickLink to="/contact">{t('nav.contact')}</QuickLink>
            </nav>
            
            <div className="pt-4">
              <h5 className="text-white font-semibold mb-3">{t('footer.services')}</h5>
              <div className="space-y-1">
                <QuickLink to="/events">{t('footer.privateEvents')}</QuickLink>
                <QuickLink to="/menu">Catering</QuickLink>
                <QuickLink to="/contact">Corporate Bookings</QuickLink>
              </div>
            </div>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-white flex items-center">
              <span className="w-1 h-6 bg-green-400 rounded-full mr-3" />
              {t('footer.visitUs')}
            </h4>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600/20 rounded-lg flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="text-stone-300">
                  <div className="font-medium text-white mb-1">{t('footer.address')}</div>
                  <div>123 Olive Grove Avenue<br/>Downtown District<br/>City, State 12345</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600/20 rounded-lg flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                </div>
                <div className="text-stone-300">
                  <div className="font-medium text-white mb-1">{t('footer.phone')}</div>
                  <a href="tel:+15551234567" className="hover:text-green-400 transition-colors">(555) 123-4567</a>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600/20 rounded-lg flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="text-stone-300">
                  <div className="font-medium text-white mb-1">{t('footer.hours')}</div>
                  <div>Mon-Thu: 5PM-12AM<br/>Fri-Sat: 5PM-2AM<br/>Sun: 6PM-11PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <ContactCard
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
            title={t('footer.reservations')}
            content="Call us directly for same-day bookings and special requests"
            action={{ text: "Call Now", href: "tel:+15551234567" }}
          />
          
          <ContactCard
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            title={t('footer.privateEvents')}
            content="Transform your special occasion into an extraordinary experience"
            action={{ text: "Learn More", href: "/events" }}
          />
          
          <ContactCard
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            title={t('footer.stayUpdated')}
            content={
              <div>
                <div className="text-stone-300">Get exclusive offers and event invitations</div>
                <div className="text-green-400 font-medium mt-1">
                  Current time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            }
            action={{ text: "Contact Us", href: "/contact" }}
          />
        </div>

        {/* Social Media */}
        <div className="flex justify-center space-x-6 mb-12">
          <SocialIcon icon="𝕏" href="#" label="Twitter" />
          <SocialIcon icon="📷" href="#" label="Instagram" />
          <SocialIcon icon="👤" href="#" label="Facebook" />
          <SocialIcon icon="🎵" href="#" label="TikTok" />
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-green-600/20 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-stone-400 text-sm text-center md:text-left">
            <p>© 2024  {t('footer.title')}. All rights reserved.</p>
            <p className="text-xs mt-1">Crafted with care for exceptional experiences.</p>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <a href="#" className="text-stone-400 hover:text-green-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-stone-400 hover:text-green-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-stone-400 hover:text-green-400 transition-colors">Accessibility</a>
          </div>
        </div>

        {/* Reservation CTA */}
        <div className="text-center mt-8">
          <MagneticButton className="bg-gradient-to-r from-green-600 to-green-700 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:shadow-green-600/25 transition-all duration-300 group overflow-hidden">
            <Link href="/contact" className="relative z-10 flex items-center space-x-3">
              <span>{t('footer.experienceTonight')}</span>
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </MagneticButton>
        </div>
      </div>
    </footer>
  );
};