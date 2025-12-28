// client/src/pages/Events.tsx - FIXED BACKEND INTEGRATION
'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { Event } from '../services/api';
import { apiClient } from '../services/api';

const Events: React.FC = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch events from backend
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all public events
      const allEvents = await apiClient.getPublicEvents();
      
      // Separate featured event and regular events
      const featured = allEvents.find((event: Event) => event.is_featured && event.event_type === 'featured');
      const regularEvents = allEvents.filter((event: Event) => !event.is_featured || event.event_type !== 'featured');
      
      setFeaturedEvent(featured || null);
      setEvents(regularEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setError('Failed to load events. Please try again later.');
      // Fallback to default events if API fails
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
      description: 'An enchanting evening featuring smooth jazz performances by renowned local artists, perfectly paired with our sommelier\'s selection of premium wines and artisanal small plates.',
      image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
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
      duration_display: '7:00 PM - 11:00 PM'
    };

    const defaultEvents: Event[] = [
      {
        id: 'default-1',
        title: 'Live Acoustic Sessions',
        description: 'Intimate performances featuring emerging singer-songwriters and acoustic artists.',
        image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        event_type: 'recurring',
        status: 'upcoming',
        start_date: new Date().toISOString().split('T')[0],
        start_time: '20:00',
        end_time: '22:00',
        recurring_type: 'weekly',
        recurring_days: 'thursday',
        formatted_price: 'No Cover',
        location: 'Main Dining Hall',
        booking_required: false,
        is_featured: false,
        duration_display: '8:00 PM - 10:00 PM'
      },
      {
        id: 'default-2',
        title: 'Weekend DJ Sets',
        description: 'Dance the night away with curated playlists spanning genres from house to classic favorites.',
        image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        event_type: 'recurring',
        status: 'upcoming',
        start_date: new Date().toISOString().split('T')[0],
        start_time: '21:00',
        end_time: '02:00',
        recurring_type: 'weekly',
        recurring_days: 'friday,saturday',
        formatted_price: '$10 Cover',
        location: 'Main Dining Hall',
        booking_required: false,
        is_featured: false,
        duration_display: '9:00 PM - 2:00 AM'
      },
      {
        id: 'default-3',
        title: 'Mixology Masterclass',
        description: 'Learn the art of cocktail crafting from our expert bartenders in this hands-on workshop.',
        image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        event_type: 'recurring',
        status: 'upcoming',
        start_date: new Date().toISOString().split('T')[0],
        start_time: '18:00',
        end_time: '20:00',
        recurring_type: 'monthly',
        formatted_price: '$65 per person',
        location: 'Private Garden Room',
        booking_required: true,
        is_featured: false,
        duration_display: '6:00 PM - 8:00 PM'
      }
    ];

    setFeaturedEvent(defaultFeatured);
    setEvents(defaultEvents);
  };

  // Format recurring schedule display
  const getScheduleDisplay = (event: Event) => {
    if (event.recurring_type === 'weekly' && event.recurring_days) {
      const days = event.recurring_days.split(',');
      const dayNames = days.map(day => {
        const dayMap: {[key: string]: string} = {
          'monday': 'Monday',
          'tuesday': 'Tuesday', 
          'wednesday': 'Wednesday',
          'thursday': 'Thursday',
          'friday': 'Friday',
          'saturday': 'Saturday',
          'sunday': 'Sunday'
        };
        return dayMap[day.toLowerCase()] || day;
      });
      
      if (dayNames.length === 1) {
        return `Every ${dayNames[0]}`;
      } else if (dayNames.length === 2) {
        return `${dayNames.join(' & ')}`;
      } else {
        return `${dayNames.slice(0, -1).join(', ')} & ${dayNames[dayNames.length - 1]}`;
      }
    } else if (event.recurring_type === 'monthly') {
      return 'Monthly Event';
    } else {
      // For one-time events, show the actual date
      const eventDate = new Date(event.start_date);
      return eventDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-stone-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-xl">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-100 to-stone-200 py-16 sm:py-20 lg:py-32 xl:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 to-green-800/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4 sm:mb-6">
              {t('events.hero.badge')}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
              {t('events.hero.title.extraordinary')}
              <span className="block text-green-800">{t('events.hero.title.events')}</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
              {t('events.hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 sm:px-0">
              <Link href="/contact">
                <button className="w-full sm:w-auto bg-green-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-green-900 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2">
                  {t('events.hero.buttons.plan')}
                </button>
              </Link>
              <button className="w-full sm:w-auto border-2 border-green-800 text-green-800 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-green-800 hover:text-white transition-all duration-300">
                {t('events.hero.buttons.calendar')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Error State */}
      {error && (
        <section className="py-8 bg-red-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchEvents}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              {t('events.upcoming.badge')}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">
              {t('events.upcoming.title')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              {t('events.upcoming.subtitle')}
            </p>
          </div>

          <div className="space-y-8 sm:space-y-12">
            {/* Featured Event */}
            {featuredEvent && (
              <div className="bg-gradient-to-r from-green-800 to-green-700 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-1/2 order-2 lg:order-1">
                    <div className="aspect-w-16 aspect-h-9 lg:aspect-h-12">
                      <img 
                        src={featuredEvent.image_url || featuredEvent.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                        alt={featuredEvent.title}
                        className="w-full h-48 sm:h-64 lg:h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="lg:w-1/2 p-6 sm:p-8 lg:p-12 text-white flex flex-col justify-center order-1 lg:order-2">
                    <div className="inline-block bg-green-600 px-3 sm:px-4 py-2 rounded-full text-sm font-semibold mb-4 sm:mb-6 self-start">
                      Featured Event
                    </div>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                      {featuredEvent.title}
                    </h3>
                    <p className="text-green-100 mb-4 sm:mb-6 text-base sm:text-lg leading-relaxed">
                      {featuredEvent.description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 text-green-100 mb-4 sm:mb-6 text-sm sm:text-base">
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
                    
                    <Link href="/contact">
                      <button className="w-full sm:w-auto bg-white text-green-800 px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-stone-100 transition-colors self-start">
                        Reserve Your Spot - {featuredEvent.formatted_price}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Regular Events Grid */}
            {events.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
                {events.map((event) => (
                  <div key={event.id} className="group bg-stone-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-stone-200">
                    <div className="aspect-w-16 aspect-h-9">
                      <img 
                        src={event.image_url || event.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                        alt={event.title}
                        className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 sm:p-6 space-y-4">
                      <h4 className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-green-800 transition-colors duration-300">
                        {event.title}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {event.description}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          <p className="font-semibold text-green-800">{getScheduleDisplay(event)}</p>
                          <p>{event.duration_display}</p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <p className="text-green-800 font-bold text-sm sm:text-base">{event.formatted_price}</p>
                          {event.booking_required ? (
                            event.booking_url ? (
                              <a 
                                href={event.booking_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-green-800 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-green-900 transition-colors duration-300"
                              >
                                Book Now
                              </a>
                            ) : (
                              <Link href="/contact">
                                <button className="bg-green-800 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-green-900 transition-colors duration-300">
                                  Book Now
                                </button>
                              </Link>
                            )
                          ) : (
                            <span className="text-green-600 text-xs sm:text-sm font-medium">No Booking Required</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Events Message */}
            {!featuredEvent && events.length === 0 && !loading && !error && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Events Scheduled</h3>
                <p className="mt-1 text-sm text-gray-500">Check back soon for upcoming events!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Event Types Section (keeping existing functionality) */}
      <section className="py-16 sm:py-20 lg:py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Event Services
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">
              Perfect for Every Occasion
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              We transform your vision into reality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: "🎵",
                title: "Live Entertainment",
                description: "From intimate jazz quartets to acoustic soloists, we curate performances that enhance your dining experience without overwhelming conversation.",
                features: ["Professional sound system", "Intimate stage setting", "Diverse musical genres"]
              },
              {
                icon: "🏢",
                title: "Corporate Events",
                description: "Sophisticated venue perfect for business meetings, product launches, networking events, and corporate celebrations.",
                features: ["AV equipment available", "Private dining options", "Professional service team"]
              },
              {
                icon: "💝",
                title: "Private Celebrations",
                description: "Create unforgettable memories for birthdays, anniversaries, engagements, and other milestone occasions.",
                features: ["Customizable décor", "Personalized menus", "Dedicated event coordinator"]
              },
              {
                icon: "🍷",
                title: "Wine & Spirit Events",
                description: "Educational tastings, pairing dinners, and exclusive releases featuring premium wines and craft spirits.",
                features: ["Expert sommelier guidance", "Curated selections", "Food pairings included"]
              },
              {
                icon: "🎨",
                title: "Cultural Events",
                description: "Art exhibitions, book launches, poetry readings, and other cultural celebrations that enrich our community.",
                features: ["Gallery wall space", "Flexible seating", "Intimate atmosphere"]
              },
              {
                icon: "🌟",
                title: "Seasonal Celebrations",
                description: "Holiday parties, seasonal menu launches, and themed events that celebrate the changing seasons.",
                features: ["Seasonal decorations", "Special menus", "Festive atmosphere"]
              }
            ].map((eventType, index) => (
              <div key={index} className="group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-center mb-6 space-y-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-green-200 transition-colors duration-300">
                    <span className="text-2xl sm:text-3xl transform group-hover:scale-110 transition-transform duration-300">{eventType.icon}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-green-800 transition-colors duration-300">{eventType.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {eventType.description}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {eventType.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-800 rounded-full mr-3 flex-shrink-0"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-green-800 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Let's Create Something Extraordinary
          </h2>
          <p className="text-lg sm:text-xl text-green-100 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            Contact our events team to begin planning your perfect occasion
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <Link href="/contact">
              <button className="w-full sm:w-auto bg-white text-green-800 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-stone-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                Plan Your Event
              </button>
            </Link>
            <Link href="/menu">
              <button className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-white hover:text-green-800 transition-all duration-300">
                View Catering Menu
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;