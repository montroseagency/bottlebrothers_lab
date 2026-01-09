'use client';

import React, { useRef } from 'react';
import { MenuItem } from '@/lib/api';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface SignaturePicksProps {
  items: MenuItem[];
  fullHeight?: boolean;
}

export function SignaturePicks({ items, fullHeight = false }: SignaturePicksProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <section data-nav-theme="light" className={`bg-white overflow-hidden ${fullHeight ? 'min-h-screen flex items-center py-12 sm:py-0' : 'py-12 sm:py-20 lg:py-28'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 md:mb-12"
        >
          <span className="inline-block bg-primary-100 text-primary-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wide mb-3 sm:mb-4">
            Signature Picks
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-neutral-900 mb-3 sm:mb-4 md:mb-6">
            Culinary{' '}
            <span className="text-primary-600">Masterpieces</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-neutral-600 max-w-3xl mx-auto px-4">
            Handcrafted delights from our award-winning kitchen
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-1 sm:-translate-x-2 lg:-translate-x-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-luxury hover:shadow-luxury-lg hover:bg-primary-50 transition-all duration-300 flex items-center justify-center text-primary-600 hover:scale-110"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1 sm:translate-x-2 lg:translate-x-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-luxury hover:shadow-luxury-lg hover:bg-primary-50 transition-all duration-300 flex items-center justify-center text-primary-600 hover:scale-110"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Carousel */}
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-none w-64 sm:w-72 md:w-80 group"
              >
                <div className="bg-neutral-50 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-luxury transition-all duration-500 hover:-translate-y-2">
                  {/* Image */}
                  <div className="relative h-44 sm:h-52 md:h-64 overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center">
                        <span className="text-4xl sm:text-5xl md:text-6xl">🍽️</span>
                      </div>
                    )}
                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-wrap gap-1.5 sm:gap-2">
                        {item.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] sm:text-xs font-semibold text-primary-800"
                          >
                            {tag.replace('_', ' ').toUpperCase()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5 md:p-6">
                    <h3 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 mb-1.5 sm:mb-2 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-neutral-600 mb-3 sm:mb-4 line-clamp-2 text-xs sm:text-sm leading-relaxed">
                      {item.description}
                    </p>

                    {/* Dietary Info - hidden on very small screens */}
                    {item.dietary_info && item.dietary_info.length > 0 && (
                      <div className="hidden sm:flex flex-wrap gap-2 mb-4">
                        {item.dietary_info.slice(0, 3).map((info) => (
                          <span
                            key={info}
                            className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium"
                          >
                            {info.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-neutral-200">
                      <span className="font-display text-lg sm:text-xl md:text-2xl font-bold text-primary-600">
                        ${item.price}
                      </span>
                      <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-500 text-white rounded-full text-xs sm:text-sm font-semibold hover:bg-primary-600 transition-colors duration-300">
                        Order
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-6 sm:mt-8 md:mt-12"
        >
          <a
            href="/menu"
            className="inline-flex items-center gap-2 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 border-2 border-primary-500 text-primary-700 rounded-full text-sm sm:text-base font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300"
          >
            View Full Menu
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
