'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import home2Bg from '@/assets/home2.png';

interface Review {
  name: string;
  role: string;
  city: string;
  rating: number;
  text: string;
  avatar?: string;
}

const reviews: Review[] = [
  {
    name: 'Sarah Johnson',
    role: 'Private Dining',
    city: 'Tirana',
    rating: 5,
    text: 'An absolutely divine experience. The attention to detail in every dish is remarkable. Bottle Brothers has redefined luxury dining in the city.',
  },
  {
    name: 'Michael Chen',
    role: 'VIP Member',
    city: 'Durrës',
    rating: 5,
    text: 'The ambiance is unmatched. Every visit feels like a special occasion. The cocktails are works of art and the service is impeccable.',
  },
  {
    name: 'Emma Rodriguez',
    role: 'Corporate Event',
    city: 'Tirana',
    rating: 5,
    text: 'Hosted my company event here and it was flawless. The team went above and beyond to make everything perfect. Highly recommended!',
  },
  {
    name: 'David Thompson',
    role: 'Anniversary Dinner',
    city: 'Vlorë',
    rating: 5,
    text: 'Been coming here for years and it never disappoints. The quality is consistent, the staff remembers your name, and the vibe is always perfect.',
  },
  {
    name: 'Ana Kelmendi',
    role: 'Birthday Celebration',
    city: 'Tirana',
    rating: 5,
    text: 'The best place in town for special occasions. The staff made my birthday unforgettable with their personalized service and stunning presentation.',
  },
  {
    name: 'James Wilson',
    role: 'Business Meeting',
    city: 'Shkodër',
    rating: 5,
    text: 'Perfect venue for high-end business meetings. The private rooms are elegant and the service is discreet yet attentive. Impressed every client.',
  },
];

interface ReviewsCarouselProps {
  fullHeight?: boolean;
}

export function ReviewsCarousel({ fullHeight = false }: ReviewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const totalSlides = reviews.length;

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -500 : 500,
      opacity: 0,
    }),
  };

  const currentReview = reviews[currentIndex];

  return (
    <section data-nav-theme="dark" className={`relative overflow-hidden ${fullHeight ? 'min-h-screen flex items-center py-12 sm:py-0' : 'py-12 sm:py-20 lg:py-28'}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={home2Bg}
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 md:mb-12"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 border border-white/20 text-white/80 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium uppercase tracking-widest mb-3 sm:mb-4">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full" />
            Testimonials
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
            What Our Guests Say
          </h2>
          <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            Discover why discerning guests choose Bottle Brothers for their most memorable moments.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 lg:-translate-x-16 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-neutral-900 transition-all duration-300"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 lg:translate-x-16 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-neutral-900 transition-all duration-300"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Single Card Container */}
          <div className="overflow-hidden px-4">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                className="w-full"
              >
                {/* Single Review Card */}
                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 lg:p-10">
                  {/* Quote mark */}
                  <div className="absolute top-6 right-8 text-7xl lg:text-8xl font-serif text-white/20 select-none pointer-events-none leading-none">
                    "
                  </div>

                  {/* Content Layout */}
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-white flex items-center justify-center text-neutral-900 font-bold text-xl lg:text-2xl mb-4">
                      {currentReview.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    {/* Stars */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(currentReview.rating)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Review Text */}
                    <p className="text-white text-lg lg:text-xl leading-relaxed mb-6 relative z-10 max-w-2xl">
                      "{currentReview.text}"
                    </p>

                    {/* Author Info */}
                    <div>
                      <p className="font-semibold text-white text-lg">{currentReview.name}</p>
                      <p className="text-sm text-white/60">{currentReview.role} · {currentReview.city}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center items-center gap-2 mt-8">
            {[...Array(totalSlides)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx
                    ? 'w-8 h-2 bg-white'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
