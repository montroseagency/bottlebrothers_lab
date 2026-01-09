'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import home2 from '../../assets/home2.png';
import home3 from '../../assets/home3.png';
import home4 from '../../assets/home4.png';
import home5 from '../../assets/home5.png';

// Animation variants for text directions
const slideFromLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const slideFromRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

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
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const paragraphAnimation = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

interface OurStoryProps {
  fullHeight?: boolean;
}

export function OurStory({ fullHeight = false }: OurStoryProps) {
  return (
    <section data-nav-theme="light" className={`relative overflow-hidden bg-neutral-50 ${fullHeight ? 'min-h-screen flex items-center py-16 sm:py-0' : 'py-16 sm:py-20 lg:py-32'}`}>
      {/* Parallax Background Images */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary-500 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-primary-400 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div className="space-y-4 sm:space-y-6">
            <div className="overflow-hidden">
              {/* Badge slides from left */}
              <motion.span
                className="inline-block bg-primary-100 text-primary-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wide mb-3 sm:mb-4"
                variants={slideFromLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                Our Story
              </motion.span>

              {/* Title with split animation */}
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-4 sm:mb-6">
                {/* "A Legacy of" slides from left */}
                <motion.span
                  className="inline-block"
                  variants={slideFromLeft}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  A Legacy of{' '}
                </motion.span>
                {/* "Excellence" slides from right */}
                <motion.span
                  className="inline-block text-primary-600"
                  variants={slideFromRight}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  Excellence
                </motion.span>
              </h2>
            </div>

            {/* Paragraphs with staggered blur-fade animation */}
            <motion.div
              className="space-y-3 sm:space-y-4 text-sm sm:text-base lg:text-lg text-neutral-700 leading-relaxed"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.p variants={paragraphAnimation}>
                Since our founding, <strong>Bottle Brothers</strong> has been more than just a lounge—it's a destination where
                luxury meets comfort, and every visit becomes a cherished memory.
              </motion.p>
              <motion.p variants={paragraphAnimation} className="hidden sm:block">
                Our commitment to excellence is reflected in every detail, from our carefully curated menu
                to our world-class service. We believe in creating experiences that transcend the ordinary.
              </motion.p>
              <motion.p variants={paragraphAnimation} className="hidden md:block">
                Step into a world where sophistication meets warmth, where every cocktail tells a story,
                and where you're not just a guest—you're family.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 pt-4 sm:pt-6">
              {[
                { number: '10+', label: 'Years' },
                { number: '50K+', label: 'Guests' },
                { number: '100+', label: 'Cocktails' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-600 mb-0.5 sm:mb-1">
                    {stat.number}
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-neutral-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Images */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative mt-4 lg:mt-0"
          >
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="relative h-28 sm:h-40 md:h-52 lg:h-64 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-luxury">
                  <Image
                    src={home2}
                    alt="Bottle Brothers"
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="relative h-20 sm:h-32 md:h-40 lg:h-48 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-luxury">
                  <Image
                    src={home3}
                    alt="Bottle Brothers Lounge"
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3 md:space-y-4 pt-3 sm:pt-6 md:pt-8">
                <div className="relative h-20 sm:h-32 md:h-40 lg:h-48 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-luxury">
                  <Image
                    src={home4}
                    alt="Bottle Brothers Interior"
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="relative h-28 sm:h-40 md:h-52 lg:h-64 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-luxury">
                  <Image
                    src={home5}
                    alt="Bottle Brothers Experience"
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>

            {/* Decorative Element - hidden on mobile */}
            <div className="hidden sm:block absolute -top-6 -right-6 w-24 h-24 border-4 border-primary-400 rounded-full opacity-30" />
            <div className="hidden sm:block absolute -bottom-6 -left-6 w-32 h-32 bg-primary-500 rounded-full blur-2xl opacity-20" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
