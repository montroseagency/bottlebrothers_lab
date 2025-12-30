'use client';

import React, { useState } from 'react';
import { Event } from '@/lib/api';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface EventCardProps {
  event: Event;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/events/${event.id}`} className="block group">
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-luxury transition-all duration-500 hover:-translate-y-2">
          {/* Image */}
          <div className="relative h-64 overflow-hidden">
            {event.image && !imageError ? (
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <span className="text-8xl">🎉</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Event Type Badge */}
            {event.event_type === 'featured' && (
              <div className="absolute top-4 left-4">
                <span className="px-4 py-2 bg-primary-500 text-white rounded-full text-sm font-bold shadow-lg">
                  FEATURED
                </span>
              </div>
            )}

            {/* Status Badge */}
            {event.status && (
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  event.status === 'upcoming' ? 'bg-blue-500 text-white' :
                  event.status === 'active' ? 'bg-green-500 text-white' :
                  event.status === 'completed' ? 'bg-neutral-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {event.status.toUpperCase()}
                </span>
              </div>
            )}

            {/* Date Badge */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-600">
                  {new Date(event.start_date).getDate()}
                </p>
                <p className="text-xs font-semibold text-neutral-600 uppercase">
                  {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' })}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center gap-2 text-neutral-600 text-sm mb-3">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>{event.formatted_time || `${event.start_time} - ${event.end_time}`}</span>
            </div>

            <h3 className="font-display text-2xl font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {event.title}
            </h3>

            <p className="text-neutral-600 mb-4 line-clamp-2">
              {event.description}
            </p>

            {/* Event Info */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1 text-neutral-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{event.location}</span>
              </div>

              {event.capacity && (
                <div className="flex items-center gap-1 text-neutral-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span>{event.capacity} guests</span>
                </div>
              )}
            </div>

            {/* Recurring Info */}
            {event.recurring_type && event.recurring_type !== 'none' && (
              <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-700 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Recurring {event.recurring_type}
                  {event.recurring_days && ` • ${event.recurring_days}`}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <div>
                <span className="text-2xl font-bold text-primary-600">
                  {event.price_formatted || event.formatted_price || event.price_display || (event.price === '0.00' ? 'Free' : `$${event.price}`)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
                View Details
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
