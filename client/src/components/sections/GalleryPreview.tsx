'use client';

import React from 'react';
import { GalleryItem } from '@/lib/api';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface GalleryPreviewProps {
  items: GalleryItem[];
  fullHeight?: boolean;
}

export function GalleryPreview({ items, fullHeight = false }: GalleryPreviewProps) {
  if (items.length === 0) return null;

  return (
    <section className={`bg-neutral-50 overflow-hidden ${fullHeight ? 'h-screen flex items-center' : 'py-20 lg:py-28'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
            Gallery
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
            Moments That{' '}
            <span className="text-primary-600">Matter</span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            A glimpse into the experiences that make Bottle Brothers unforgettable
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="break-inside-avoid"
            >
              <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-luxury transition-all duration-500 cursor-pointer">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={item.image || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80'}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="font-display text-xl font-bold text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-neutral-300 text-sm line-clamp-2">
                        {item.description}
                      </p>
                      <span className="inline-block mt-3 px-3 py-1 bg-primary-500/80 backdrop-blur-sm text-white rounded-full text-xs font-semibold">
                        {item.category.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-primary-500 text-primary-700 rounded-full font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300"
          >
            Explore Full Gallery
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
