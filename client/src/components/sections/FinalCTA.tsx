'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function FinalCTA() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1920&q=80)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/80 to-neutral-900/90" />
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Ready for an{' '}
            <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent">
              Unforgettable
            </span>{' '}
            Experience?
          </h2>
          <p className="text-xl sm:text-2xl text-neutral-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Reserve your table today and discover why Bottle Brothers is the city's premier luxury destination
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/reservations"
              className="group px-10 py-5 bg-primary-500 text-white rounded-full text-lg font-bold hover:bg-primary-600 transition-all duration-300 shadow-glow-lg hover:shadow-glow hover:scale-105"
            >
              Reserve Your Table
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-2">→</span>
            </Link>
            <Link
              href="/contact"
              className="px-10 py-5 border-2 border-white text-white rounded-full text-lg font-bold hover:bg-white hover:text-neutral-900 transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-12 border-t border-white/20"
          >
            <div className="text-center">
              <div className="flex gap-1 justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-primary-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-white/80 text-sm">4.9/5 on Google</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-400 mb-1">Award Winner</p>
              <p className="text-white/80 text-sm">Best Lounge 2024</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-400 mb-1">50,000+</p>
              <p className="text-white/80 text-sm">Happy Guests</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 border-4 border-primary-500/20 rounded-full blur-sm" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl" />
    </section>
  );
}
