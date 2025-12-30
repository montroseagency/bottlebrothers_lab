'use client';

import React from 'react';
import Link from 'next/link';
import { Event } from '@/lib/api';
import { motion } from 'framer-motion';

interface TonightsVibeProps {
  event: Event | null;
}

export function TonightsVibe({ event }: TonightsVibeProps) {
  if (!event) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 py-6"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
              </span>
              <span className="text-primary-300 text-sm font-semibold uppercase tracking-wider">
                Tonight's Vibe
              </span>
            </div>
            <h3 className="font-display text-3xl md:text-4xl text-white font-bold mb-2">
              {event.title}
            </h3>
            <p className="text-primary-200 text-lg">
              {event.formatted_time || `${event.start_time} - ${event.end_time}`} • {event.location}
            </p>
          </div>

          <Link
            href={`/events/${event.id}`}
            className="group px-8 py-3 bg-white text-primary-900 rounded-full font-semibold hover:bg-primary-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            View Details
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
