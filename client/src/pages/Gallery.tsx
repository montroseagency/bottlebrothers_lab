// client/src/pages/Gallery.tsx - Premium Lounge Gallery
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import type { GalleryItem } from '../services/api';
import { apiClient } from '../services/api';

// Skeleton loader component
const ImageSkeleton = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 ${
      index % 5 === 0 ? 'row-span-2' : ''
    }`}
    style={{ minHeight: index % 5 === 0 ? '400px' : '200px' }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shimmer" />
  </motion.div>
);

// Individual gallery image component
const GalleryImage = ({
  item,
  index,
  onClick,
}: {
  item: GalleryItem;
  index: number;
  onClick: () => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  // Determine if this should be a featured (larger) item
  const isFeatured = item.is_featured || index % 7 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      style={{ scale }}
      className={`relative group cursor-pointer ${
        isFeatured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/30"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ y }}
      >
        {/* Loading skeleton */}
        <AnimatePresence>
          {!isLoaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-900"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shimmer" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image */}
        <motion.img
          src={item.image_url}
          alt={item.title}
          className={`w-full object-cover transition-transform duration-700 ${
            isFeatured ? 'h-[500px]' : 'h-[280px]'
          } ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
          style={{
            scale: isHovered ? 1.1 : 1,
            transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

        {/* Glassmorphism hover overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="absolute inset-0 backdrop-blur-[2px] bg-black/20" />

          {/* Content card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10 text-center px-6"
          >
            <div className="inline-block px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
              <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
              {item.category && (
                <span className="text-amber-300/90 text-sm font-medium uppercase tracking-wider">
                  {item.category}
                </span>
              )}
            </div>

            {/* View icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mt-4 w-12 h-12 mx-auto rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Featured badge */}
        {item.is_featured && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute top-4 left-4"
          >
            <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold uppercase tracking-wider shadow-lg shadow-amber-500/30">
              Featured
            </span>
          </motion.div>
        )}

        {/* Bottom gradient info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: index * 0.08 + 0.2 }}
          className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500"
        >
          <div className="flex items-end justify-between">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <p className="text-white/80 text-sm line-clamp-2">{item.description}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Lightbox Modal Component
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

  useEffect(() => {
    setIsImageLoaded(false);
  }, [item.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate('next');
      if (e.key === 'ArrowLeft') onNavigate('prev');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ backdropFilter: 'blur(0px)' }}
        animate={{ backdropFilter: 'blur(20px)' }}
        exit={{ backdropFilter: 'blur(0px)' }}
        className="absolute inset-0 bg-black/90"
      />

      {/* Close button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ delay: 0.2 }}
        onClick={onClose}
        className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.button>

      {/* Navigation arrows */}
      {items.length > 1 && (
        <>
          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ delay: 0.2 }}
            onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ delay: 0.2 }}
            onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </>
      )}

      {/* Image counter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
      >
        <span className="text-white/80 text-sm font-medium">
          {currentIndex + 1} / {items.length}
        </span>
      </motion.div>

      {/* Image container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative max-w-[90vw] max-h-[85vh] z-40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading skeleton */}
        <AnimatePresence>
          {!isImageLoaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.img
          key={item.id}
          src={item.image_url}
          alt={item.title}
          className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          onLoad={() => setIsImageLoaded(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: isImageLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Image info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl"
        >
          <h2 className="text-white text-2xl font-bold mb-2">{item.title}</h2>
          {item.description && (
            <p className="text-white/70 text-sm max-w-2xl">{item.description}</p>
          )}
          {item.category && (
            <span className="inline-block mt-3 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium uppercase tracking-wider border border-amber-500/30">
              {item.category}
            </span>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Main Gallery Page Component
export const GalleryPage: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const headerY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

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

    // Poll for new images every 30 seconds
    const interval = setInterval(fetchGalleryItems, 30000);
    return () => clearInterval(interval);
  }, [fetchGalleryItems]);

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
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-stone-800/30 rounded-full blur-[200px]" />
      </div>

      {/* Header */}
      <motion.header
        style={{ y: headerY, opacity: headerOpacity }}
        className="relative pt-32 pb-16 px-4 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-2 mb-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium uppercase tracking-widest">
            Our Gallery
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Moments of
            <span className="block bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              Elegance
            </span>
          </h1>
          <p className="text-stone-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Step into our world of refined luxury and unforgettable experiences
          </p>
        </motion.div>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-12 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
        />
      </motion.header>

      {/* Gallery Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
              <button
                onClick={fetchGalleryItems}
                className="ml-2 px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ImageSkeleton key={index} index={index} />
            ))}
          </div>
        ) : galleryItems.length === 0 && !error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-stone-800/50 flex items-center justify-center">
              <svg className="w-12 h-12 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Gallery Coming Soon</h3>
            <p className="text-stone-500">Our curated collection is being prepared for you</p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[280px]"
          >
            <AnimatePresence mode="popLayout">
              {galleryItems.map((item, index) => (
                <GalleryImage
                  key={item.id}
                  item={item}
                  index={index}
                  onClick={() => openLightbox(item, index)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
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

      {/* CSS for skeleton shimmer */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .skeleton-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default GalleryPage;
