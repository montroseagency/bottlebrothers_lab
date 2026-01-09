'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import homeImage from '../../assets/home1.png';

// Animation variants for text directions
const slideFromLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const slideFromRight = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }
  }
};

// Word-by-word animation for subtitle
const subtitleContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.6
    }
  }
};

const wordAnimation = {
  hidden: { opacity: 0, y: 20, rotateX: -90 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

export function HeroSection() {
  const subtitleWords = "Where every moment becomes a masterpiece".split(" ");

  return (
    <section className="relative h-screen overflow-hidden" data-nav-theme="dark">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${homeImage.src})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center z-10">
        <div className="text-center px-4 sm:px-6 max-w-5xl mx-auto">
          {/* Main Title with directional animations */}
          <h1 className="font-display text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 overflow-hidden">
            {/* "Experience" slides in from left */}
            <motion.span
              className="block"
              variants={slideFromLeft}
              initial="hidden"
              animate="visible"
            >
              Experience
            </motion.span>

            {/* "Luxury Dining" slides in from right */}
            <motion.span
              className="block mt-1 sm:mt-2 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent"
              variants={slideFromRight}
              initial="hidden"
              animate="visible"
            >
              Luxury Dining
            </motion.span>
          </h1>

          {/* Subtitle with word-by-word animation */}
          <motion.p
            className="text-base sm:text-xl md:text-2xl lg:text-3xl text-gray-200 font-light mb-8 sm:mb-12 flex flex-wrap justify-center gap-x-1.5 sm:gap-x-2 md:gap-x-3 px-2"
            variants={subtitleContainer}
            initial="hidden"
            animate="visible"
            style={{ perspective: 1000 }}
          >
            {subtitleWords.map((word, index) => (
              <motion.span
                key={index}
                variants={wordAnimation}
                className="inline-block"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {word}
              </motion.span>
            ))}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
          >
            <Link
              href="/reservations"
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary-500 text-white rounded-full text-base sm:text-lg font-semibold hover:bg-primary-600 transition-all duration-300 shadow-glow hover:shadow-glow-lg hover:scale-105 text-center"
            >
              Reserve Your Table
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/menu"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-neutral-900 rounded-full text-base sm:text-lg font-semibold hover:bg-neutral-100 transition-all duration-300 text-center shadow-lg"
            >
              Explore Menu
            </Link>
          </motion.div>
        </div>
      </div>

    </section>
  );
}
