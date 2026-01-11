// client/src/components/ui/FloatingReservation.tsx
'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MagneticButton } from './MagneticButton';

interface FloatingReservationProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showAfterScroll?: number;
  style?: 'compact' | 'expanded' | 'widget';
}

export const FloatingReservation: React.FC<FloatingReservationProps> = ({
  position = 'bottom-right',
  showAfterScroll = 300,
  style = 'compact'
}) => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [quickReservation, setQuickReservation] = useState({
    date: '',
    time: '',
    guests: '2'
  });

  // Hide on contact page
  const isContactPage = pathname?.includes('/contact');

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > showAfterScroll);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll]);

  // Don't render on contact page
  if (isContactPage) {
    return null;
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-24 right-6';
      case 'top-left':
        return 'top-24 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };

  const CompactReservation = () => (
    <div className="group">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <MagneticButton 
          className={`relative bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden ${
            isExpanded ? 'px-6 py-4' : 'px-8 py-4'
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-semibold">Reserve</span>
            <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          
          {/* Glow effect */}
          <div className={`absolute -inset-1 bg-gradient-to-r from-green-600 to-green-700 rounded-full blur-sm opacity-25 group-hover:opacity-40 transition-opacity duration-500 ${isHovered ? 'animate-pulse' : ''}`} />
        </MagneticButton>
      </div>

      {/* Expanded Quick Form */}
      <div className={`absolute ${position.includes('bottom') ? 'bottom-16' : 'top-16'} ${position.includes('right') ? 'right-0' : 'left-0'} transition-all duration-500 transform ${
        isExpanded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-white backdrop-blur-md border border-gray-300 rounded-2xl p-6 shadow-2xl min-w-80">
          <h3 className="text-black font-semibold mb-4 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Quick Reservation
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-black/80 text-sm mb-1">Date</label>
                <input
                  type="date"
                  value={quickReservation.date}
                  onChange={(e) => setQuickReservation({...quickReservation, date: e.target.value})}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-black placeholder-gray-500 focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-black/80 text-sm mb-1">Time</label>
                <select
                  value={quickReservation.time}
                  onChange={(e) => setQuickReservation({...quickReservation, time: e.target.value})}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-black focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-colors"
                >
                  <option value="">Time</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="20:00">8:00 PM</option>
                  <option value="21:00">9:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-black/80 text-sm mb-1">Guests</label>
              <select
                value={quickReservation.guests}
                onChange={(e) => setQuickReservation({...quickReservation, guests: e.target.value})}
                className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-black focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-colors"
              >
                {[...Array(8)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              {quickReservation.date && quickReservation.time ? (
                <MagneticButton className="flex-1 bg-black hover:bg-neutral-800 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  <Link
                    href={`/reservations?date=${quickReservation.date}&time=${quickReservation.time}&guests=${quickReservation.guests}`}
                    className="block w-full text-center"
                  >
                    Book Now
                  </Link>
                </MagneticButton>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg font-medium cursor-not-allowed opacity-60"
                >
                  Select Date & Time
                </button>
              )}
              <button
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 border border-gray-300 text-black/80 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const WidgetReservation = () => (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center">
          <span className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></span>
          Reserve Your Table
        </h3>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          <span className="text-green-400 text-sm font-medium">Available</span>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <input
            type="date"
            placeholder="Select Date"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all">
            <option value="">Time</option>
            <option value="17:00">5:00 PM</option>
            <option value="19:00">7:00 PM</option>
            <option value="21:00">9:00 PM</option>
          </select>
          <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all">
            <option value="2">2 Guests</option>
            <option value="4">4 Guests</option>
            <option value="6">6 Guests</option>
          </select>
        </div>
      </div>
      
      <MagneticButton className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
        <Link href="/contact" className="flex items-center justify-center space-x-2">
          <span>Reserve Now</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </MagneticButton>
      
      <div className="flex items-center justify-center mt-4 text-white/60 text-sm">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Secure & Instant
      </div>
    </div>
  );

  return (
    <div className={`fixed ${getPositionClasses()} z-50 transition-all duration-700 transform ${
      isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95 pointer-events-none'
    }`}>
      {style === 'widget' ? <WidgetReservation /> : <CompactReservation />}
      
      {/* Social Proof Indicator */}
      <div className={`absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse ${
        style === 'widget' ? 'block' : 'hidden'
      }`}>
        <span className="flex items-center">
          <span className="w-1 h-1 bg-white rounded-full mr-1 animate-ping"></span>
          3 booking now
        </span>
      </div>
    </div>
  );
};