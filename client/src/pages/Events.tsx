// client/src/pages/Events.tsx - CLEAN BACKEND + PREMIUM UI + ANIMATIONS
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { Event } from '../services/api';
import { apiClient } from '../services/api';
import { motion, type Variants } from 'framer-motion';
import eventsImage from '../assets/events.png';

const Events: React.FC = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Smooth-scroll anchor
  const upcomingRef = useRef<HTMLDivElement | null>(null);

  // -----------------------------------
  // Animations (premium, subtle)
  // -----------------------------------
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 26 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } },
  };

  const stagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
  };

  const leftIn: Variants = {
    hidden: { opacity: 0, x: -26, y: 10 },
    show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.85, ease: 'easeOut' } },
  };

  const rightIn: Variants = {
    hidden: { opacity: 0, x: 26, y: 10 },
    show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.85, ease: 'easeOut' } },
  };

  const softCard: Variants = {
    hidden: { opacity: 0, y: 18, scale: 0.99 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.75, ease: 'easeOut' } },
  };

  // -----------------------------------
  // Fetch events
  // -----------------------------------
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const allEvents = await apiClient.getPublicEvents();

      const featured = allEvents.find(
        (event: Event) => event.is_featured && event.event_type === 'featured'
      );
      const regularEvents = allEvents.filter(
        (event: Event) => !event.is_featured || event.event_type !== 'featured'
      );

      setFeaturedEvent(featured || null);
      setEvents(regularEvents);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events. Please try again later.');
      setDefaultEvents();
    } finally {
      setLoading(false);
    }
  };

  // Fallback default events
  const setDefaultEvents = () => {
    const defaultFeatured: Event = {
      id: 'default-featured',
      title: 'Jazz & Wine Evening',
      description:
        "An enchanting evening featuring smooth jazz performances by renowned local artists, perfectly paired with our sommelier's selection of premium wines and artisanal small plates.",
      image_url:
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      event_type: 'featured',
      status: 'upcoming',
      start_date: '2024-12-15',
      start_time: '19:00',
      end_time: '23:00',
      recurring_type: 'none',
      formatted_price: '$45',
      location: 'Main Dining Hall',
      booking_required: true,
      is_featured: true,
      duration_display: '7:00 PM - 11:00 PM',
    };

    const today = new Date().toISOString().split('T')[0];

    const defaultEvents: Event[] = [
      {
        id: 'default-1',
        title: 'Live Acoustic Sessions',
        description: 'Intimate performances featuring emerging singer-songwriters and acoustic artists.',
        image_url:
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        event_type: 'recurring',
        status: 'upcoming',
        start_date: today,
        start_time: '20:00',
        end_time: '22:00',
        recurring_type: 'weekly',
        recurring_days: 'thursday',
        formatted_price: 'No Cover',
        location: 'Main Dining Hall',
        booking_required: false,
        is_featured: false,
        duration_display: '8:00 PM - 10:00 PM',
      },
      {
        id: 'default-2',
        title: 'Weekend DJ Sets',
        description:
          'Dance the night away with curated playlists spanning genres from house to classic favorites.',
        image_url:
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        event_type: 'recurring',
        status: 'upcoming',
        start_date: today,
        start_time: '21:00',
        end_time: '02:00',
        recurring_type: 'weekly',
        recurring_days: 'friday,saturday',
        formatted_price: '$10 Cover',
        location: 'Main Dining Hall',
        booking_required: false,
        is_featured: false,
        duration_display: '9:00 PM - 2:00 AM',
      },
      {
        id: 'default-3',
        title: 'Mixology Masterclass',
        description: 'Learn the art of cocktail crafting from our expert bartenders in this hands-on workshop.',
        image_url:
          'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        event_type: 'recurring',
        status: 'upcoming',
        start_date: today,
        start_time: '18:00',
        end_time: '20:00',
        recurring_type: 'monthly',
        formatted_price: '$65 per person',
        location: 'Private Garden Room',
        booking_required: true,
        is_featured: false,
        duration_display: '6:00 PM - 8:00 PM',
      },
    ];

    setFeaturedEvent(defaultFeatured);
    setEvents(defaultEvents);
  };

  // Format recurring schedule display
  const getScheduleDisplay = (event: Event) => {
    if (event.recurring_type === 'weekly' && event.recurring_days) {
      const days = event.recurring_days.split(',');
      const dayMap: { [key: string]: string } = {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',
      };
      const dayNames = days.map((day) => dayMap[day.toLowerCase()] || day);

      if (dayNames.length === 1) return `Every ${dayNames[0]}`;
      if (dayNames.length === 2) return `${dayNames.join(' & ')}`;
      return `${dayNames.slice(0, -1).join(', ')} & ${dayNames[dayNames.length - 1]}`;
    }

    if (event.recurring_type === 'monthly') return 'Monthly Event';

    const eventDate = new Date(event.start_date);
    return eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const getImage = (event: Event, fallback: string) =>
    (event as any).image_url || (event as any).image || fallback;

  // -----------------------------------
  // Content from your old cards (kept)
  // -----------------------------------
  const occasionItems = [
    {
      title: 'Live Entertainment',
      description:
        'From intimate jazz quartets to acoustic soloists, we curate performances that enhance your dining experience without overwhelming conversation.',
      features: ['Professional sound system', 'Intimate stage setting', 'Diverse musical genres'],
      gradient: 'from-purple-500/20 to-pink-500/20',
    },
    {
      title: 'Corporate Events',
      description:
        'Sophisticated venue perfect for business meetings, product launches, networking events, and corporate celebrations.',
      features: ['AV equipment available', 'Private dining options', 'Professional service team'],
      gradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      title: 'Private Celebrations',
      description:
        'Create unforgettable memories for birthdays, anniversaries, engagements, and other milestone occasions.',
      features: ['Customizable décor', 'Personalized menus', 'Dedicated event coordinator'],
      gradient: 'from-rose-500/20 to-orange-500/20',
    },
    {
      title: 'Wine & Spirit Events',
      description:
        'Educational tastings, pairing dinners, and exclusive releases featuring premium wines and craft spirits.',
      features: ['Expert sommelier guidance', 'Curated selections', 'Food pairings included'],
      gradient: 'from-amber-500/20 to-yellow-500/20',
    },
    {
      title: 'Cultural Events',
      description:
        'Art exhibitions, book launches, poetry readings, and other cultural celebrations that enrich our community.',
      features: ['Gallery wall space', 'Flexible seating', 'Intimate atmosphere'],
      gradient: 'from-emerald-500/20 to-teal-500/20',
    },
    {
      title: 'Seasonal Celebrations',
      description:
        'Holiday parties, seasonal menu launches, and themed events that celebrate the changing seasons.',
      features: ['Seasonal decorations', 'Special menus', 'Festive atmosphere'],
      gradient: 'from-indigo-500/20 to-violet-500/20',
    },
  ];

  // -----------------------------------
  // Loading UI
  // -----------------------------------
  if (loading) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#d4af37] mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading events...</p>
          <p className="text-neutral-400 text-sm mt-2">Fetching latest updates</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* HERO - with events.png and animations */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: `url(${eventsImage.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

        {/* Animated gold orbs */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-[#d4af37]/30 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1.1, 0.9, 1.1],
            opacity: [0.15, 0.4, 0.15]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 right-20 w-56 h-56 bg-gradient-to-tl from-[#d4af37]/25 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-[#d4af37]/15 to-transparent rounded-full blur-3xl"
        />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-[#d4af37]/70 rounded-full"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.3, 0.9, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4
            }}
          />
        ))}

        {/* Decorative corner frames */}
        <div className="absolute inset-8 md:inset-16 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute top-0 left-0 w-20 h-20 md:w-28 md:h-28 border-t-2 border-l-2 border-[#d4af37]/40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="absolute top-0 right-0 w-20 h-20 md:w-28 md:h-28 border-t-2 border-r-2 border-[#d4af37]/40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="absolute bottom-0 left-0 w-20 h-20 md:w-28 md:h-28 border-b-2 border-l-2 border-[#d4af37]/40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="absolute bottom-0 right-0 w-20 h-20 md:w-28 md:h-28 border-b-2 border-r-2 border-[#d4af37]/40"
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Animated badge */}
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-[#d4af37]/40 text-white px-6 py-3 rounded-full text-sm font-medium uppercase tracking-widest mb-6">
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-[#d4af37]"
              />
              {t('events.hero.badge')}
            </span>
          </motion.div>

          {/* Main heading with staggered animation */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="block text-white drop-shadow-2xl"
            >
              {t('events.hero.title.extraordinary')}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="block bg-gradient-to-r from-[#d4af37] via-[#f0d078] to-[#d4af37] bg-clip-text text-transparent"
            >
              {t('events.hero.title.events')}
            </motion.span>
          </motion.h1>

          {/* Animated description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg sm:text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            {t('events.hero.description')}
          </motion.p>

          {/* Animated buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link href="/contact" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(212,175,55,0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-[#d4af37] text-black px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all duration-300"
              >
                {t('events.hero.buttons.plan')}
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-2 inline-block"
                >
                  →
                </motion.span>
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(212,175,55,0.15)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => upcomingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="w-full sm:w-auto border-2 border-[#d4af37]/50 text-white px-8 py-4 rounded-full font-semibold text-lg bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-[#d4af37]"
            >
              {t('events.hero.buttons.calendar')}
            </motion.button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-6 h-10 border-2 border-[#d4af37]/50 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-3 bg-[#d4af37] rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <section className="py-8 bg-red-900/20 border-y border-red-900/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial="hidden" animate="show" variants={fadeUp} className="inline-flex flex-col items-center gap-3">
              <p className="text-red-400 font-medium">{error}</p>
              <button onClick={fetchEvents} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition-colors shadow-md">
                Try Again
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* UPCOMING */}
      <section ref={upcomingRef} className="py-16 sm:py-20 lg:py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-120px' }}
            variants={stagger}
            className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto"
          >
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
              {t('events.upcoming.badge')}
            </motion.span>

            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
              {t('events.upcoming.title')}
            </motion.h2>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-neutral-400 leading-relaxed">
              {t('events.upcoming.subtitle')}
            </motion.p>
          </motion.div>

          <div className="space-y-10 sm:space-y-12">
            {/* FEATURED */}
            {featuredEvent && (
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-120px' }}
                variants={fadeUp}
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-neutral-800"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#161616] via-[#1a1a1a] to-[#161616]" />
                <div className="relative flex flex-col lg:flex-row">
                  <div className="lg:w-1/2 order-2 lg:order-1">
                    <div className="relative">
                      <img
                        src={getImage(
                          featuredEvent,
                          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                        )}
                        alt={featuredEvent.title}
                        className="w-full h-56 sm:h-72 lg:h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    </div>
                  </div>

                  <div className="lg:w-1/2 p-6 sm:p-8 lg:p-12 text-white flex flex-col justify-center order-1 lg:order-2">
                    <div className="inline-flex items-center gap-2 bg-[#d4af37]/20 border border-[#d4af37]/40 backdrop-blur-xl px-3 sm:px-4 py-2 rounded-full text-sm font-semibold mb-5 self-start text-[#d4af37]">
                      <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                      Featured Event
                    </div>

                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-white">
                      {featuredEvent.title}
                    </h3>

                    <p className="text-neutral-300 mb-6 text-base sm:text-lg leading-relaxed">
                      {featuredEvent.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-300 mb-7 text-sm sm:text-base">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{getScheduleDisplay(featuredEvent)}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{featuredEvent.duration_display}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                      <Link href="/contact">
                        <button className="w-full sm:w-auto bg-[#d4af37] text-black px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-[#c9a432] transition-colors shadow-lg">
                          Reserve Your Spot {featuredEvent.formatted_price ? `- ${featuredEvent.formatted_price}` : ''}
                        </button>
                      </Link>

                      {featuredEvent.location ? (
                        <div className="inline-flex items-center gap-2 text-neutral-300 text-sm bg-white/5 border border-neutral-700 px-4 py-3 rounded-full backdrop-blur-xl">
                          <svg className="w-4 h-4 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8c0 7-7.5 13-7.5 13S4.5 15 4.5 8a7.5 7.5 0 1115 0z" />
                          </svg>
                          <span>{featuredEvent.location}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* REGULAR EVENTS GRID */}
            {events.length > 0 && (
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-140px' }}
                variants={stagger}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8"
              >
                {events.map((event) => (
                  <motion.article
                    key={event.id}
                    variants={softCard}
                    className="group bg-[#161616] rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-neutral-800"
                  >
                    <div className="relative">
                      <img
                        src={getImage(
                          event,
                          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
                        )}
                        alt={event.title}
                        className="w-full h-44 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent opacity-90" />
                    </div>

                    <div className="p-5 sm:p-6 space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#d4af37] transition-colors duration-300">
                          {event.title}
                        </h4>
                        <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3">{event.description}</p>
                      </div>

                      <div className="pt-1 space-y-2">
                        <div className="flex items-start gap-2 text-sm text-neutral-300">
                          <svg className="w-4 h-4 mt-0.5 text-[#d4af37] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="font-semibold text-[#d4af37]">{getScheduleDisplay(event)}</p>
                            <p className="text-neutral-400">{event.duration_display}</p>
                          </div>
                        </div>

                        {event.location ? (
                          <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <svg className="w-4 h-4 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8c0 7-7.5 13-7.5 13S4.5 15 4.5 8a7.5 7.5 0 1115 0z" />
                            </svg>
                            <span>{event.location}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-[#d4af37] font-bold text-sm sm:text-base">{event.formatted_price}</p>

                        {event.booking_required ? (
                          event.booking_url ? (
                            <a
                              href={event.booking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-[#d4af37] text-black px-4 py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-[#c9a432] transition-colors duration-300"
                            >
                              Book Now
                            </a>
                          ) : (
                            <Link href="/contact">
                              <button className="bg-[#d4af37] text-black px-4 py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-[#c9a432] transition-colors duration-300">
                                Book Now
                              </button>
                            </Link>
                          )
                        ) : (
                          <span className="text-[#d4af37] text-xs sm:text-sm font-semibold bg-[#d4af37]/10 px-3 py-2 rounded-full border border-[#d4af37]/30">
                            No Booking Required
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Perfect for Every Occasion - Gold Luxury Style */}
      <section
        className="relative py-20 sm:py-24 lg:py-32 text-white overflow-hidden"
        style={{
          backgroundImage: `url(${eventsImage.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/75 to-black/85" />

        {/* Subtle gold ambient glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(212,175,55,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.4) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto mb-14"
          >
            <span className="inline-flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] px-5 py-2.5 rounded-full text-sm font-semibold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
              Event Services
            </span>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="text-white">Perfect for Every</span>
              <br />
              <span className="bg-gradient-to-r from-[#d4af37] via-[#f0d078] to-[#d4af37] bg-clip-text text-transparent">
                Occasion
              </span>
            </h2>

            <p className="text-lg sm:text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
              We transform your vision into reality — with curated entertainment, premium service,
              and a setting designed for unforgettable nights.
            </p>
          </motion.div>

          {/* Cards Grid - No hover animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {occasionItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group"
              >
                {/* Card */}
                <div className="relative bg-[#161616] border border-neutral-800 rounded-2xl p-6 sm:p-8 h-full hover:border-[#d4af37]/40 transition-colors duration-300">
                  {/* Top gold accent line */}
                  <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-[#d4af37] transition-colors duration-300">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-neutral-400 text-sm sm:text-base leading-relaxed mb-5">
                    {item.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2.5">
                    {item.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm text-neutral-400"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-14 sm:mt-16 flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Link href="/contact">
              <button className="w-full sm:w-auto bg-[#d4af37] text-black px-10 py-4 rounded-full text-lg font-semibold shadow-xl hover:bg-[#c9a432] transition-all duration-300">
                Plan Your Celebration
                <span className="ml-2 inline-block">→</span>
              </button>
            </Link>
            <Link href="/menu">
              <button className="w-full sm:w-auto border-2 border-[#d4af37]/40 text-white px-10 py-4 rounded-full text-lg font-semibold bg-white/5 backdrop-blur-xl hover:bg-[#d4af37]/10 hover:border-[#d4af37]/60 transition-all duration-300">
                View Event Menu
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
 
    </div>
  );
};

export default Events;
