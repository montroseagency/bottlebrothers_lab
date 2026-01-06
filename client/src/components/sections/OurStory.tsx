'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface OurStoryProps {
  fullHeight?: boolean;
}

export function OurStory({ fullHeight = false }: OurStoryProps) {
  return (
    <section className={`relative overflow-hidden bg-neutral-50 ${fullHeight ? 'h-screen flex items-center' : 'py-20 lg:py-32'}`}>
      {/* Parallax Background Images */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary-500 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-primary-400 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div>
              <span className="inline-block bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
                Our Story
              </span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
                A Legacy of{' '}
                <span className="text-primary-600">Excellence</span>
              </h2>
            </div>

            <div className="space-y-4 text-lg text-neutral-700 leading-relaxed">
              <p>
                Since our founding, <strong>Bottle Brothers</strong> has been more than just a lounge—it's a destination where
                luxury meets comfort, and every visit becomes a cherished memory.
              </p>
              <p>
                Our commitment to excellence is reflected in every detail, from our carefully curated menu
                to our world-class service. We believe in creating experiences that transcend the ordinary.
              </p>
              <p>
                Step into a world where sophistication meets warmth, where every cocktail tells a story,
                and where you're not just a guest—you're family.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6">
              {[
                { number: '10+', label: 'Years of Excellence' },
                { number: '50K+', label: 'Happy Guests' },
                { number: '100+', label: 'Signature Cocktails' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-neutral-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Images */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-luxury">
                  <Image
                    src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80"
                    alt="Cocktails"
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-luxury">
                  <Image
                    src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80"
                    alt="Lounge Interior"
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-luxury">
                  <Image
                    src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"
                    alt="Restaurant Interior"
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-luxury">
                  <Image
                    src="https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80"
                    alt="Fine Dining"
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute -top-6 -right-6 w-24 h-24 border-4 border-primary-400 rounded-full opacity-30" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary-500 rounded-full blur-2xl opacity-20" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
