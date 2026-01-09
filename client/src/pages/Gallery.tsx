// client/src/pages/Gallery.tsx - Premium Editorial Gallery
//
// NEW GALLERY STRUCTURE:
// 1. Light warm off-white background (#F7F5F0) with charcoal text
// 2. Compact hero section (50vh max) with elegant typography
// 3. Filter controls row with category chips + optional sort dropdown
// 4. Controlled bento grid with repeatable 6-item rhythm pattern
// 5. Premium lightbox with keyboard nav, swipe support, fade+scale animations
// 6. Lazy loading with blur-up placeholders
// 7. Subtle staggered fade-in animations (respects prefers-reduced-motion)
// 8. Gold accent color (#C9A227) for interactive elements

'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GalleryItem } from '../services/api';
import { apiClient } from '../services/api';

// ============================================================================
// THEME CONSTANTS
// ============================================================================
const COLORS = {
  background: '#F7F5F0',
  backgroundAlt: '#EFECE5',
  text: '#1A1A1A',
  textMuted: '#6B6B6B',
  textLight: '#9A9A9A',
  gold: '#C9A227',
  goldHover: '#D4AF37',
  goldLight: '#E8D9A0',
  border: '#E5E2DB',
  borderLight: '#F0EDE6',
  white: '#FFFFFF',
};


// ============================================================================
// ANIMATION VARIANTS
// ============================================================================
const fadeInUp = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// ============================================================================
// SKELETON LOADER
// ============================================================================
const ImageSkeleton = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden rounded-[18px] bg-[#E8E5DE] ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent skeleton-shimmer" />
  </div>
);

// ============================================================================
// BLUR PLACEHOLDER IMAGE
// ============================================================================
const BlurImage = ({
  src,
  alt,
  className,
  priority = false,
  onLoad,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-[#E8E5DE] animate-pulse" />
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-[#E8E5DE] flex items-center justify-center">
          <svg className="w-8 h-8 text-[#C9A227]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// GALLERY TILE
// ============================================================================
const GalleryTile = ({
  item,
  index,
  onClick,
}: {
  item: GalleryItem;
  index: number;
  onClick: () => void;
}) => {
  return (
    <motion.article
      custom={index}
      variants={{
        hidden: { opacity: 0, y: 40, scale: 0.9 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer w-full"
      onClick={onClick}
    >
      <div className="relative w-full pt-[100%] overflow-hidden rounded-[18px] bg-[#E8E5DE] shadow-md hover:shadow-xl transition-shadow duration-300">
        <img
          src={item.image_url}
          alt={item.title || ''}
          loading={index < 6 ? 'eager' : 'lazy'}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>
    </motion.article>
  );
};

// ============================================================================
// LIGHTBOX MODAL
// ============================================================================
const Lightbox = ({
  item,
  items,
  currentIndex,
  onClose,
  onNavigate,
}: {
  item: GalleryItem;
  items: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Reset loading state when image changes
  useEffect(() => {
    setIsImageLoaded(false);
  }, [item.id]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate('next');
      if (e.key === 'ArrowLeft') onNavigate('prev');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate]);

  // Touch handlers for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) onNavigate('next');
    if (isRightSwipe) onNavigate('prev');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: 0.1 }}
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        aria-label="Close lightbox"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.button>

      {/* Navigation arrows */}
      {items.length > 1 && (
        <>
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.1 }}
            onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Previous image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: 0.1 }}
            onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Next image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </>
      )}

      {/* Image container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative max-w-[90vw] max-h-[85vh] z-40"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Loading spinner */}
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-white/20 border-t-[#C9A227] rounded-full animate-spin" />
          </div>
        )}

        {/* Image */}
        <motion.img
          key={item.id}
          src={item.image_url}
          alt={item.title}
          onLoad={() => setIsImageLoaded(true)}
          className={`max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl transition-opacity duration-300 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Caption area */}
        {(item.title || item.description) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 to-transparent rounded-b-xl"
          >
            {item.title && (
              <h2 className="text-white text-lg font-semibold mb-1">{item.title}</h2>
            )}
            {item.description && (
              <p className="text-white/70 text-sm line-clamp-2">{item.description}</p>
            )}
            {item.category && (
              <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-[#C9A227]/20 text-[#E8D9A0] text-xs font-medium capitalize">
                {item.category.replace('_', ' ')}
              </span>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Image counter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md"
      >
        <span className="text-white/80 text-sm font-medium">
          {currentIndex + 1} / {items.length}
        </span>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// MAIN GALLERY PAGE
// ============================================================================
export const GalleryPage: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fetch gallery items
  const fetchGalleryItems = useCallback(async () => {
    try {
      const items = await apiClient.getPublicGalleryItems();
      setGalleryItems(items);
      setError('');
    } catch (err) {
      setError('Failed to load gallery');
      console.error('Gallery fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGalleryItems();
  }, [fetchGalleryItems]);

  // Lightbox handlers
  const openLightbox = (item: GalleryItem, index: number) => {
    setSelectedItem(item);
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedItem(null);
    document.body.style.overflow = 'unset';
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? (selectedIndex + 1) % galleryItems.length
      : (selectedIndex - 1 + galleryItems.length) % galleryItems.length;
    setSelectedIndex(newIndex);
    setSelectedItem(galleryItems[newIndex]);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* ================================================================== */}
      {/* HERO SECTION - 50vh max */}
      {/* ================================================================== */}
      <section className="relative h-[50vh] min-h-[360px] max-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#EFECE5] to-[#F7F5F0]" />

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#C9A227]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#C9A227]/5 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-[#C9A227]/30 text-[#C9A227] text-xs font-semibold uppercase tracking-widest"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
            Our Gallery
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1A1A1A] mb-4 tracking-tight"
          >
            Moments of{' '}
            <span className="text-[#C9A227]">Elegance</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#6B6B6B] text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Step into our world of refined luxury and unforgettable experiences
          </motion.p>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-[#C9A227] to-transparent"
          />
        </div>
      </section>

      {/* ================================================================== */}
      {/* GALLERY GRID */}
      {/* ================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">{error}</span>
              <button
                onClick={fetchGalleryItems}
                className="ml-2 px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-sm font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 9 }).map((_, i) => (
              <ImageSkeleton
                key={i}
                className="aspect-[4/3]"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && galleryItems.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[#EFECE5] flex items-center justify-center">
              <svg className="w-10 h-10 text-[#C9A227]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
              Gallery Coming Soon
            </h3>
            <p className="text-[#6B6B6B] text-sm">
              Our curated collection is being prepared for you
            </p>
          </motion.div>
        )}

        {/* Gallery grid - Full cards */}
        {!loading && galleryItems.length > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {galleryItems.map((item, index) => (
              <GalleryTile
                key={item.id}
                item={item}
                index={index}
                onClick={() => openLightbox(item, index)}
              />
            ))}
          </motion.div>
        )}

        {/* Results count */}
        {!loading && galleryItems.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-[#9A9A9A] text-sm mt-10"
          >
            Showing {galleryItems.length} {galleryItems.length === 1 ? 'image' : 'images'}
          </motion.p>
        )}
      </section>

      {/* ================================================================== */}
      {/* LIGHTBOX */}
      {/* ================================================================== */}
      <AnimatePresence>
        {selectedItem && (
          <Lightbox
            item={selectedItem}
            items={galleryItems}
            currentIndex={selectedIndex}
            onClose={closeLightbox}
            onNavigate={navigateLightbox}
          />
        )}
      </AnimatePresence>

      {/* ================================================================== */}
      {/* GLOBAL STYLES */}
      {/* ================================================================== */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .skeleton-shimmer {
          animation: shimmer 1.5s infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .skeleton-shimmer {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default GalleryPage;
