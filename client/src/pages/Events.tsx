// client/src/pages/Events.tsx - CLEAN BACKEND + PREMIUM UI + ANIMATIONS
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { Event } from '../services/api';
import { apiClient } from '../services/api';
import { motion, type Variants } from 'framer-motion';

const HERO_BG =
  "https://media.istockphoto.com/id/1298329918/photo/birthday-celebratory-toast-with-string-lights-and-champagne-silhouettes.jpg?s=612x612&w=0&k=20&c=PaDeMR5-r0NdlxghuVF9tRqR5XkCdNdTzxrkofv0Syk=";

const OCCASION_BG =
  "https://media.istockphoto.com/id/1806011581/photo/overjoyed-happy-young-people-dancing-jumping-and-singing-during-concert-of-favorite-group.jpg?s=612x612&w=0&k=20&c=cMFdhX403-yKneupEN-VWSfFdy6UWf1H0zqo6QBChP4=";

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
      icon: '1',
      title: 'Live Entertainment',
      description:
        'From intimate jazz quartets to acoustic soloists, we curate performances that enhance your dining experience without overwhelming conversation.',
      features: ['Professional sound system', 'Intimate stage setting', 'Diverse musical genres'],
    },
    {
      icon: '2',
      title: 'Corporate Events',
      description:
        'Sophisticated venue perfect for business meetings, product launches, networking events, and corporate celebrations.',
      features: ['AV equipment available', 'Private dining options', 'Professional service team'],
    },
    {
      icon: '3',
      title: 'Private Celebrations',
      description:
        'Create unforgettable memories for birthdays, anniversaries, engagements, and other milestone occasions.',
      features: ['Customizable décor', 'Personalized menus', 'Dedicated event coordinator'],
    },
    {
      icon: '4',
      title: 'Wine & Spirit Events',
      description:
        'Educational tastings, pairing dinners, and exclusive releases featuring premium wines and craft spirits.',
      features: ['Expert sommelier guidance', 'Curated selections', 'Food pairings included'],
    },
    {
      icon: '5',
      title: 'Cultural Events',
      description:
        'Art exhibitions, book launches, poetry readings, and other cultural celebrations that enrich our community.',
      features: ['Gallery wall space', 'Flexible seating', 'Intimate atmosphere'],
    },
    {
      icon: '6',
      title: 'Seasonal Celebrations',
      description:
        'Holiday parties, seasonal menu launches, and themed events that celebrate the changing seasons.',
      features: ['Seasonal decorations', 'Special menus', 'Festive atmosphere'],
    },
  ];

  const leftColumn = occasionItems.slice(0, 3);
  const rightColumn = occasionItems.slice(3);

  // -----------------------------------
  // Loading UI
  // -----------------------------------
  if (loading) {
    return (
      <div className="bg-stone-50 min-h-screen flex items-center justify-center">
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-xl">Loading events...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching latest updates</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* HERO */}
      <section
        className="relative bg-center bg-cover bg-no-repeat py-16 sm:py-20 lg:py-40 xl:py-48 text-white overflow-hidden"
        style={{ backgroundImage: `url('${HERO_BG}')` }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/45 via-black/30 to-green-900/30" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 56 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: 'easeOut' }}>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/15 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-300" />
              {t('events.hero.badge')}
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight drop-shadow-2xl">
              {t('events.hero.title.extraordinary')}
              <span className="block bg-gradient-to-r from-green-200 via-green-100 to-white bg-clip-text text-transparent">
                {t('events.hero.title.events')}
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-white/85 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t('events.hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-white text-green-900 px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-stone-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5">
                  {t('events.hero.buttons.plan')}
                </button>
              </Link>

              <button
                onClick={() => upcomingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="w-full sm:w-auto border-2 border-white/80 text-white px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-green-900 transition-all duration-300 bg-white/10 backdrop-blur-xl"
              >
                {t('events.hero.buttons.calendar')}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <section className="py-8 bg-red-50 border-y border-red-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial="hidden" animate="show" variants={fadeUp} className="inline-flex flex-col items-center gap-3">
              <p className="text-red-700 font-medium">{error}</p>
              <button onClick={fetchEvents} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition-colors shadow-md">
                Try Again
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* UPCOMING */}
      <section ref={upcomingRef} className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-120px' }}
            variants={stagger}
            className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto"
          >
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              <span className="w-2 h-2 rounded-full bg-green-700" />
              {t('events.upcoming.badge')}
            </motion.span>

            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">
              {t('events.upcoming.title')}
            </motion.h2>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-gray-600 leading-relaxed">
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
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-stone-200"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-900 via-green-800 to-green-700" />
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
                    <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 backdrop-blur-xl px-3 sm:px-4 py-2 rounded-full text-sm font-semibold mb-5 self-start">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      Featured Event
                    </div>

                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 drop-shadow">
                      {featuredEvent.title}
                    </h3>

                    <p className="text-green-50/90 mb-6 text-base sm:text-lg leading-relaxed">
                      {featuredEvent.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-green-50/90 mb-7 text-sm sm:text-base">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{getScheduleDisplay(featuredEvent)}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{featuredEvent.duration_display}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                      <Link href="/contact">
                        <button className="w-full sm:w-auto bg-white text-green-900 px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-stone-100 transition-colors shadow-lg">
                          Reserve Your Spot {featuredEvent.formatted_price ? `- ${featuredEvent.formatted_price}` : ''}
                        </button>
                      </Link>

                      {featuredEvent.location ? (
                        <div className="inline-flex items-center gap-2 text-green-50/90 text-sm bg-white/10 border border-white/15 px-4 py-3 rounded-full backdrop-blur-xl">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-stone-200"
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
                        <h4 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-green-800 transition-colors duration-300">
                          {event.title}
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{event.description}</p>
                      </div>

                      <div className="pt-1 space-y-2">
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <svg className="w-4 h-4 mt-0.5 text-green-800 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="font-semibold text-green-900">{getScheduleDisplay(event)}</p>
                            <p className="text-gray-600">{event.duration_display}</p>
                          </div>
                        </div>

                        {event.location ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8c0 7-7.5 13-7.5 13S4.5 15 4.5 8a7.5 7.5 0 1115 0z" />
                            </svg>
                            <span>{event.location}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-green-900 font-bold text-sm sm:text-base">{event.formatted_price}</p>

                        {event.booking_required ? (
                          event.booking_url ? (
                            <a
                              href={event.booking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-green-800 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-green-900 transition-colors duration-300 shadow-sm"
                            >
                              Book Now
                            </a>
                          ) : (
                            <Link href="/contact">
                              <button className="bg-green-800 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-green-900 transition-colors duration-300 shadow-sm">
                                Book Now
                              </button>
                            </Link>
                          )
                        ) : (
                          <span className="text-green-700 text-xs sm:text-sm font-semibold bg-green-50 px-3 py-2 rounded-full border border-green-100">
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

      {/* ✅ FIXED: Perfect for Every Occasion (NO CARDS, 2 COLUMNS, ANIMATED TEXT) */}
      <section
        className="relative py-20 sm:py-24 lg:py-28 text-white overflow-hidden"
        style={{
          backgroundImage: `url('${OCCASION_BG}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Premium overlays */}
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-black/70" />

        {/* soft glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-28 -right-24 w-[28rem] h-[28rem] bg-green-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-120px' }}
            variants={stagger}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/15 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-green-300" />
              Event Services
            </motion.span>

            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-2xl"
            >
              Perfect for Every Occasion
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-4 text-base sm:text-lg text-white/80 leading-relaxed max-w-3xl mx-auto"
            >
              We transform your vision into reality — with curated entertainment, premium service,
              and a setting designed for unforgettable nights.
            </motion.p>
          </motion.div>

          {/* Two-column layout (no cards) */}
          <div className="mt-12 sm:mt-14 lg:mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
              {/* LEFT COLUMN */}
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-120px' }}
                variants={stagger}
                className="space-y-10"
              >
                {leftColumn.map((item, idx) => (
                  <motion.div key={idx} variants={leftIn} className="relative">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl flex items-center justify-center shadow-sm">
                        <span className="text-xl">{item.icon}</span>
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-white/75 text-sm sm:text-base leading-relaxed">
                          {item.description}
                        </p>

                        <ul className="mt-4 space-y-2">
                          {item.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-300 flex-shrink-0" />
                              <span className="leading-relaxed">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* subtle separator */}
                    <div className="mt-8 h-px w-full bg-white/10" />
                  </motion.div>
                ))}
              </motion.div>

              {/* RIGHT COLUMN */}
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-120px' }}
                variants={stagger}
                className="space-y-10"
              >
                {rightColumn.map((item, idx) => (
                  <motion.div key={idx} variants={rightIn} className="relative">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl flex items-center justify-center shadow-sm">
                        <span className="text-xl">{item.icon}</span>
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-white/75 text-sm sm:text-base leading-relaxed">
                          {item.description}
                        </p>

                        <ul className="mt-4 space-y-2">
                          {item.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-300 flex-shrink-0" />
                              <span className="leading-relaxed">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8 h-px w-full bg-white/10" />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Bottom actions */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-120px' }}
              variants={fadeUp}
              className="mt-10 sm:mt-12 flex flex-col sm:flex-row justify-center items-center gap-4"
            >
              <Link href="/contact" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-white text-green-900 px-8 py-3 rounded-full text-base sm:text-lg font-semibold hover:bg-stone-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5">
                  Plan Your Celebration
                </button>
              </Link>
              <Link href="/menu" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto border-2 border-white/80 text-white px-8 py-3 rounded-full text-base sm:text-lg font-semibold hover:bg-white hover:text-green-900 transition-all duration-300 bg-white/10 backdrop-blur-xl">
                  View Event Menu
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
 
    </div>
  );
};

export default Events;
