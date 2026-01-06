'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const slidesPerView = 2;
  const totalSlides = Math.ceil(reviews.length / slidesPerView);

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

  // Get current reviews to display
  const getCurrentReviews = () => {
    const start = currentIndex * slidesPerView;
    return reviews.slice(start, start + slidesPerView);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
    }),
  };

  return (
    <section className={`bg-[#0a0a0a] relative overflow-hidden ${fullHeight ? 'h-screen flex items-center' : 'py-20 lg:py-28'}`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#d4af37]/5 rounded-full blur-3xl" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] px-4 py-2 rounded-full text-sm font-medium uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
            Testimonials
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            What Our <span className="bg-gradient-to-r from-[#d4af37] via-[#f0d078] to-[#d4af37] bg-clip-text text-transparent">Guests</span> Say
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
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
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-20 w-12 h-12 bg-[#161616] border border-neutral-800 rounded-full flex items-center justify-center text-white hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-black transition-all duration-300 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-20 w-12 h-12 bg-[#161616] border border-neutral-800 rounded-full flex items-center justify-center text-white hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-black transition-all duration-300 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Cards Container */}
          <div className="overflow-hidden px-4">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {getCurrentReviews().map((review, idx) => (
                  <motion.div
                    key={review.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="group"
                  >
                    {/* Wide Card */}
                    <div className="relative bg-[#161616] border border-neutral-800 rounded-2xl p-6 lg:p-8 hover:border-[#d4af37]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                      {/* Quote mark */}
                      <div className="absolute top-4 right-6 text-6xl lg:text-7xl font-serif text-[#d4af37]/10 select-none pointer-events-none leading-none">
                        "
                      </div>

                      {/* Content Layout - Horizontal */}
                      <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                        {/* Left: Avatar & Info */}
                        <div className="flex items-center lg:items-start gap-4 lg:flex-col lg:min-w-[120px]">
                          {/* Avatar */}
                          <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-[#d4af37] to-[#a6814d] flex items-center justify-center text-black font-bold text-lg lg:text-xl flex-shrink-0">
                            {review.name.split(' ').map(n => n[0]).join('')}
                          </div>

                          {/* Stars - Mobile */}
                          <div className="flex gap-0.5 lg:hidden">
                            {[...Array(review.rating)].map((_, i) => (
                              <svg key={i} className="w-4 h-4 text-[#d4af37] fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>

                        {/* Right: Review Content */}
                        <div className="flex-1">
                          {/* Stars - Desktop */}
                          <div className="hidden lg:flex gap-0.5 mb-3">
                            {[...Array(review.rating)].map((_, i) => (
                              <svg key={i} className="w-4 h-4 text-[#d4af37] fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>

                          {/* Review Text */}
                          <p className="text-neutral-300 text-base lg:text-lg leading-relaxed mb-4 relative z-10">
                            "{review.text}"
                          </p>

                          {/* Author Info */}
                          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                            <div>
                              <p className="font-semibold text-white text-base">{review.name}</p>
                              <p className="text-sm text-neutral-500">{review.role} · {review.city}</p>
                            </div>

                            {/* Verified Badge */}
                            <div className="flex items-center gap-1.5 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] px-3 py-1 rounded-full text-xs font-medium">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Verified
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
                    ? 'w-8 h-2 bg-[#d4af37]'
                    : 'w-2 h-2 bg-neutral-700 hover:bg-neutral-600'
                }`}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-6 max-w-xs mx-auto">
            <div className="h-0.5 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#d4af37] to-[#f0d078]"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentIndex + 1) / totalSlides) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 mt-12 pt-8 border-t border-neutral-800"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-[#d4af37]">4.9</div>
            <div className="flex gap-0.5 justify-center my-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-[#d4af37] fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-neutral-500 text-sm">Google Rating</p>
          </div>
          <div className="h-12 w-px bg-neutral-800 hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-bold text-[#d4af37]">500+</div>
            <p className="text-neutral-500 text-sm mt-1">Happy Reviews</p>
          </div>
          <div className="h-12 w-px bg-neutral-800 hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-bold text-[#d4af37]">98%</div>
            <p className="text-neutral-500 text-sm mt-1">Would Recommend</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
