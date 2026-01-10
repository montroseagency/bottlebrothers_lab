'use client';

import React from 'react';
import { Event } from '@/lib/api';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface UpcomingEventsProps {
  events: Event[];
  fullHeight?: boolean;
}

export function UpcomingEvents({ events, fullHeight = false }: UpcomingEventsProps) {
  if (events.length === 0) return null;

  const displayEvents = events.slice(0, 6);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    };
  };

  return (
    <section
      data-nav-theme="light"
      className={`relative overflow-hidden ${fullHeight ? 'min-h-screen flex items-center' : 'py-20 lg:py-28'}`}
      style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #fef9f3 50%, #fdf6ed 100%)' }}
    >

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 lg:mb-14"
        >
          {/* Left side */}
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-[0.2em] mb-2">
              What's On
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-1">
              Upcoming Events
            </h2>
            <p className="text-neutral-500 text-sm md:text-base">
              Experience unforgettable nights at Bottle Brothers
            </p>
          </div>

          {/* Right side - View all link */}
          <Link
            href="/events"
            className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
          >
            <span>View all events</span>
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
            >
              <Link href={`/events/${event.id}`} className="group block h-full">
                <article className="h-full bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-neutral-200 hover:-translate-y-1">
                  {/* Image Container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                    <Image
                      src={event.image || event.image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80'}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />

                    {/* Subtle gradient for legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                    {/* Date Badge */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-sm">
                        <p className="text-base font-bold text-neutral-900 leading-none">
                          {formatDate(event.start_date).day}
                        </p>
                        <p className="text-[10px] font-semibold text-neutral-500 tracking-wide mt-0.5">
                          {formatDate(event.start_date).month}
                        </p>
                      </div>
                    </div>

                    {/* Featured Badge */}
                    {event.event_type === 'featured' && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wide rounded-md">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Title */}
                    <h3 className="font-semibold text-neutral-900 text-base leading-snug mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors duration-200">
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="text-neutral-500 text-sm leading-relaxed line-clamp-2 mb-4">
                      {event.description}
                    </p>

                    {/* Meta + CTA Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                      {/* Time & Location */}
                      <div className="flex items-center gap-3 text-xs text-neutral-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {event.formatted_time || event.start_time}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1 truncate max-w-[100px]">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{event.location}</span>
                          </span>
                        )}
                      </div>

                      {/* Details CTA */}
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 group-hover:gap-1.5 transition-all duration-200">
                        Details
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
