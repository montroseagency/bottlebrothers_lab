// client/src/pages/Events.tsx - CLEAN BACKEND + PREMIUM UI + ANIMATIONS
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import type { Event } from '../services/api';
import { apiClient } from '../services/api';
import { motion, type Variants } from 'framer-motion';
import eventImage from '../assets/event.png';
import event1Image from '../assets/event1.png';
import e1Image from '../assets/e1.png';
import e2Image from '../assets/e2.png';
import e3Image from '../assets/e3.png';

const Events: React.FC = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Smooth-scroll anchor
  const upcomingRef = useRef<HTMLDivElement | null>(null);

  // Night vibes scroll section
  const [activeNight, setActiveNight] = useState<'fri' | 'sat' | 'sun'>('fri');
  const nightSectionRef = useRef<HTMLDivElement | null>(null);
  const friRef = useRef<HTMLDivElement | null>(null);
  const satRef = useRef<HTMLDivElement | null>(null);
  const sunRef = useRef<HTMLDivElement | null>(null);

  const nightImages = {
    fri: e1Image,
    sat: e2Image,
    sun: e3Image,
  };

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
  // Night vibes scroll observer
  // -----------------------------------
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-night');
          if (id === 'fri' || id === 'sat' || id === 'sun') {
            setActiveNight(id);
          }
        }
      });
    }, options);

    const refs = [friRef.current, satRef.current, sunRef.current];
    refs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading events...</p>
          <p className="text-neutral-400 text-sm mt-2">Fetching latest updates</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* HERO - with events.png */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: `url(${eventImage.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Lighter overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/30 text-white px-6 py-3 rounded-full text-sm font-medium uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-white" />
              {t('events.hero.badge')}
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="block text-white drop-shadow-2xl">
              {t('events.hero.title.extraordinary')}
            </span>
            <span className="block text-white">
              {t('events.hero.title.events')}
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('events.hero.description')}
          </p>

          {/* Buttons - bigger, white, no animations */}
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link href="/contact" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-white text-neutral-900 px-10 py-5 rounded-full font-bold text-xl shadow-xl hover:bg-neutral-100 transition-colors duration-300">
                {t('events.hero.buttons.plan')}
              </button>
            </Link>

            <button
              onClick={() => upcomingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="w-full sm:w-auto border-2 border-white text-white px-10 py-5 rounded-full font-bold text-xl bg-white/10 backdrop-blur-xl hover:bg-white hover:text-neutral-900 transition-colors duration-300"
            >
              {t('events.hero.buttons.calendar')}
            </button>
          </div>
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
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/30 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              <span className="w-2 h-2 rounded-full bg-white" />
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
                <div className="relative flex flex-col lg:flex-row lg:min-h-[420px]">
                  <div className="lg:w-1/2 order-2 lg:order-1 lg:absolute lg:inset-y-0 lg:left-0">
                    <div className="relative h-64 sm:h-80 lg:h-full">
                      <img
                        src={getImage(
                          featuredEvent,
                          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                        )}
                        alt={featuredEvent.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    </div>
                  </div>

                  <div className="lg:w-1/2 lg:ml-auto p-6 sm:p-8 lg:p-12 text-white flex flex-col justify-center order-1 lg:order-2">
                    <div className="inline-flex items-center gap-2 bg-white/20 border border-white/40 backdrop-blur-xl px-3 sm:px-4 py-2 rounded-full text-sm font-semibold mb-5 self-start text-white">
                      <span className="w-2 h-2 rounded-full bg-white" />
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
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{getScheduleDisplay(featuredEvent)}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{featuredEvent.duration_display}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                      <Link href="/contact">
                        <button className="w-full sm:w-auto bg-white text-black px-8 sm:px-10 py-4 rounded-full font-bold text-lg hover:bg-neutral-100 transition-colors shadow-xl">
                          Reserve Your Spot {featuredEvent.formatted_price ? `- ${featuredEvent.formatted_price}` : ''}
                        </button>
                      </Link>

                      {featuredEvent.location ? (
                        <div className="inline-flex items-center gap-2 text-neutral-300 text-sm bg-white/5 border border-neutral-700 px-4 py-3 rounded-full backdrop-blur-xl">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                {events.map((event) => {
                  const hasVideo = event.video_status === 'completed' && event.video_webm_url;
                  return (
                  <motion.article
                    key={event.id}
                    variants={softCard}
                    className="group bg-[#161616] rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-neutral-800"
                  >
                    <div className="relative h-64 sm:h-80 lg:h-full">
                      {hasVideo ? (
                        <video
                          src={event.video_webm_url}
                          className="w-full h-44 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <img
                          src={getImage(
                            event,
                            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
                          )}
                          alt={event.title}
                          className="w-full h-44 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent opacity-90" />
                      {/* Video badge */}
                      {hasVideo && (
                        <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                          Video
                        </div>
                      )}
                    </div>

                    <div className="p-5 sm:p-6 space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-lg sm:text-xl font-bold text-white group-hover:text-white transition-colors duration-300">
                          {event.title}
                        </h4>
                        <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3">{event.description}</p>
                      </div>

                      <div className="pt-1 space-y-2">
                        <div className="flex items-start gap-2 text-sm text-neutral-300">
                          <svg className="w-4 h-4 mt-0.5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="font-semibold text-white">{getScheduleDisplay(event)}</p>
                            <p className="text-neutral-400">{event.duration_display}</p>
                          </div>
                        </div>

                        {event.location ? (
                          <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8c0 7-7.5 13-7.5 13S4.5 15 4.5 8a7.5 7.5 0 1115 0z" />
                            </svg>
                            <span>{event.location}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-white font-bold text-sm sm:text-base">{event.formatted_price}</p>

                        {event.booking_required ? (
                          event.booking_url ? (
                            <a
                              href={event.booking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white text-black px-4 py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-neutral-100 transition-colors duration-300"
                            >
                              Book Now
                            </a>
                          ) : (
                            <Link href="/contact">
                              <button className="bg-white text-black px-4 py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-neutral-100 transition-colors duration-300">
                                Book Now
                              </button>
                            </Link>
                          )
                        ) : (
                          <span className="text-white text-xs sm:text-sm font-semibold bg-white/10 px-3 py-2 rounded-full border border-white/30">
                            No Booking Required
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );})}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* The Experience Section */}
      <section className="bg-white py-20 sm:py-28 lg:py-32">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={event1Image}
                  alt="Luxury lounge experience"
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>

              {/* Secondary Image - Overlapping */}
              <div className="absolute -bottom-8 -right-4 lg:-right-8 w-2/5 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <Image
                  src={eventImage}
                  alt="Premium ambiance"
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>

            {/* Right - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:pl-4"
            >
              {/* Label */}
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-[0.25em] mb-4">
                The Experience
              </p>

              {/* Headline */}
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight mb-6">
                Where Elegance Meets{' '}
                <span className="text-neutral-600">Unforgettable Nights</span>
              </h2>

              {/* Description */}
              <p className="text-neutral-500 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
                Step into a world of refined taste — handcrafted cocktails, warm ambiance, and moments designed to be remembered.
              </p>

              {/* CTA Link */}
              <Link
                href="/reservations"
                className="group inline-flex items-center gap-2 text-neutral-900 font-medium hover:text-amber-600 transition-colors duration-200"
              >
                <span>Reserve a table</span>
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Night Vibes - Dark Immersive Section */}
      <section ref={nightSectionRef} className="relative bg-[#0a0a0a] py-20 lg:py-0 overflow-hidden">
        {/* Ambient Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gradient orbs */}
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Layout */}
          <div className="lg:hidden">
            {/* Mobile Day Selector */}
            <div className="flex items-center justify-center gap-6 mb-8">
              {(['fri', 'sat', 'sun'] as const).map((day, idx) => (
                <React.Fragment key={day}>
                  <button
                    onClick={() => setActiveNight(day)}
                    className={`text-sm font-semibold uppercase tracking-wider transition-all duration-300 ${
                      activeNight === day
                        ? 'text-amber-400'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {day === 'fri' ? 'Friday' : day === 'sat' ? 'Saturday' : 'Sunday'}
                  </button>
                  {idx < 2 && <span className="text-neutral-700">·</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Mobile Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl mb-8 ring-1 ring-white/10">
              {(['fri', 'sat', 'sun'] as const).map((day) => (
                <div
                  key={day}
                  className={`absolute inset-0 transition-all duration-500 ease-out ${
                    activeNight === day ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'
                  }`}
                >
                  <Image
                    src={nightImages[day]}
                    alt={`${day} night`}
                    fill
                    className="object-cover"
                  />
                  {/* Cinematic overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60" />
                </div>
              ))}
            </div>

            {/* Mobile Text */}
            <div className="text-center">
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-[0.25em] mb-3">
                Night Vibes
              </p>
              <h2 className="font-display text-2xl font-bold text-white leading-tight mb-3">
                Every Night Has Its Own Story
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6 max-w-xs mx-auto">
                From electric Fridays to soulful Sundays — discover the rhythm that moves you.
              </p>
              <Link
                href="/reservations"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-full transition-all duration-300 shadow-lg shadow-amber-500/20"
              >
                <span>Reserve your night</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Desktop Layout - Scroll-based */}
          <div className="hidden lg:flex lg:gap-20 relative">
            {/* Left Column - Sticky Text + Timeline */}
            <div className="w-[400px] flex-shrink-0">
              <div className="sticky top-32">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Label */}
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-[0.25em] mb-5">
                    Night Vibes
                  </p>

                  {/* Headline */}
                  <h2 className="font-display text-4xl xl:text-5xl font-bold text-white leading-[1.1] mb-5">
                    Every Night Has<br />
                    <span className="text-neutral-500">Its Own Story</span>
                  </h2>

                  {/* Description */}
                  <p className="text-neutral-400 text-base leading-relaxed mb-10 max-w-[340px]">
                    From electric Fridays to soulful Sundays — discover the rhythm that moves you.
                  </p>

                  {/* Vertical Timeline */}
                  <div className="relative pl-5 mb-12">
                    {/* Vertical Line */}
                    <div className="absolute left-0 top-2 bottom-2 w-px bg-neutral-800" />

                    {/* Day Items */}
                    {(['fri', 'sat', 'sun'] as const).map((day) => (
                      <button
                        key={day}
                        onClick={() => setActiveNight(day)}
                        className="relative flex items-center py-4 group w-full text-left"
                      >
                        {/* Dot with glow */}
                        <span
                          className={`absolute -left-[6px] w-3 h-3 rounded-full transition-all duration-300 ${
                            activeNight === day
                              ? 'bg-amber-400 shadow-lg shadow-amber-400/50'
                              : 'bg-neutral-700 group-hover:bg-neutral-600'
                          }`}
                        />
                        {/* Label */}
                        <span
                          className={`ml-6 text-sm font-semibold uppercase tracking-[0.15em] transition-all duration-300 ${
                            activeNight === day
                              ? 'text-white'
                              : 'text-neutral-600 group-hover:text-neutral-400'
                          }`}
                        >
                          {day === 'fri' ? 'Friday' : day === 'sat' ? 'Saturday' : 'Sunday'}
                        </span>
                        {/* Active indicator */}
                        {activeNight === day && (
                          <span className="ml-3 text-xs text-amber-400/80 font-medium">
                            {day === 'fri' ? 'Electric Energy' : day === 'sat' ? 'Peak Nights' : 'Smooth Sessions'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Link
                    href="/reservations"
                    className="group inline-flex items-center gap-3 px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-full transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-400/30"
                  >
                    <span>Reserve your night</span>
                    <svg
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Right Column - Scroll Content with Sticky Image */}
            <div className="flex-1 relative">
              {/* Sticky Image Container */}
              <div className="sticky top-32 z-10 pointer-events-none">
                <div className="relative w-full max-w-[480px] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 ml-auto">
                  {/* All Images - Crossfade */}
                  {(['fri', 'sat', 'sun'] as const).map((day) => (
                    <div
                      key={day}
                      className={`absolute inset-0 transition-all duration-500 ease-out ${
                        activeNight === day
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-[1.03]'
                      }`}
                    >
                      <Image
                        src={nightImages[day]}
                        alt={`${day === 'fri' ? 'Friday' : day === 'sat' ? 'Saturday' : 'Sunday'} night atmosphere`}
                        fill
                        className="object-cover"
                        priority={day === 'fri'}
                      />
                    </div>
                  ))}

                  {/* Cinematic gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/30 via-transparent to-transparent" />

                  {/* Day label on image */}
                  <div className="absolute bottom-5 left-5">
                    <span className="text-white text-xs font-medium uppercase tracking-wider drop-shadow-md">
                      {activeNight === 'fri' ? 'Friday Nights' : activeNight === 'sat' ? 'Saturday Nights' : 'Sunday Sessions'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scroll Trigger Zones - These create the scrollable height */}
              <div className="relative -mt-[60vh]">
                <div
                  ref={friRef}
                  data-night="fri"
                  className="h-[70vh] flex items-center justify-center"
                />
                <div
                  ref={satRef}
                  data-night="sat"
                  className="h-[70vh] flex items-center justify-center"
                />
                <div
                  ref={sunRef}
                  data-night="sun"
                  className="h-[70vh] flex items-center justify-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
 
    </div>
  );
};

export default Events;
