'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { Moment } from '@/lib/api';

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

interface OurBestMomentsProps {
  moments: Moment[];
  fullHeight?: boolean;
}

export function OurBestMoments({ moments, fullHeight = false }: OurBestMomentsProps) {
  if (moments.length === 0) return null;

  return (
    <section
      data-nav-theme="dark"
      className={`relative overflow-hidden bg-neutral-900 ${fullHeight ? 'min-h-screen flex flex-col justify-center py-8 sm:py-12' : 'py-12 sm:py-16 lg:py-28'}`}
    >
      {/* Subtle background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-neutral-700/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-neutral-600/20 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-12 md:pt-16">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-4 sm:mb-6 lg:mb-10"
        >
          <motion.span
            className="inline-block text-neutral-400 text-[10px] sm:text-xs md:text-sm font-medium tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-2 sm:mb-3"
            variants={fadeUp}
          >
            Gallery
          </motion.span>
          <motion.h2
            className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 sm:mb-4"
            variants={fadeUp}
          >
            Our Best Moments
          </motion.h2>
          <motion.p
            className="text-xs sm:text-sm md:text-base lg:text-lg text-neutral-300 max-w-2xl mx-auto px-2"
            variants={fadeUp}
          >
            Capturing the essence of luxury and elegance
          </motion.p>
        </motion.div>

        {/* Moments Grid - More compact on mobile */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6"
        >
          {moments.slice(0, 6).map((moment, index) => (
            <motion.div
              key={moment.id}
              variants={scaleIn}
              className={`group relative overflow-hidden rounded-lg sm:rounded-xl shadow-lg ${
                index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
              }`}
            >
              <div className={`relative ${
                index === 0 ? 'aspect-square sm:aspect-auto sm:h-full min-h-[120px] sm:min-h-[250px] md:min-h-[300px]' : 'aspect-square min-h-[100px] sm:min-h-[140px]'
              } overflow-hidden`}>
                {moment.image_url ? (
                  <Image
                    src={moment.image_url}
                    alt={moment.title || 'Moment'}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-700 flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content on hover */}
                {(moment.title || moment.description) && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    {moment.title && (
                      <h3 className="font-display text-sm sm:text-base md:text-lg font-semibold text-white mb-0.5 sm:mb-1">
                        {moment.title}
                      </h3>
                    )}
                    {moment.description && (
                      <p className="text-xs sm:text-sm text-neutral-200 line-clamp-2 hidden sm:block">
                        {moment.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex justify-center mt-6 sm:mt-8 md:mt-12"
        >
          <Link
            href="/reservations"
            className="inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white text-neutral-900 rounded-full text-sm sm:text-base font-semibold hover:bg-neutral-100 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Be Our Next Moment
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
