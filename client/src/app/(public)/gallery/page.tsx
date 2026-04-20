'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const GOLD = '#C4A35A';

const CATEGORIES = ['All', 'Interior', 'Food', 'Drinks', 'Events', 'Ambiance'] as const;
type Category = typeof CATEGORIES[number];

const GALLERY_ITEMS: { id: number; category: string; image: string; title: string; tall: boolean }[] = [];

const reduced = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [lightbox, setLightbox] = useState<typeof GALLERY_ITEMS[0] | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const filtered = activeCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(i => i.category === activeCategory);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const navigate = useCallback((dir: 'prev' | 'next') => {
    setLightbox(prev => {
      if (!prev) return prev;
      const idx = filtered.findIndex(i => i.id === prev.id);
      const next = dir === 'prev'
        ? (idx - 1 + filtered.length) % filtered.length
        : (idx + 1) % filtered.length;
      return filtered[next];
    });
  }, [filtered]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate('prev');
      if (e.key === 'ArrowRight') navigate('next');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, navigate, closeLightbox]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]" data-nav-theme="dark">

      {/* ── Page header ─────────────────────────────────── */}
      <header className="pt-28 sm:pt-36 pb-12 px-4 text-center">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 mb-4 font-medium">
            Sarajet Restaurant
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-white tracking-tight"
              style={{ textWrap: 'balance' } as React.CSSProperties}>
            Our Gallery
          </h1>
          <div className="w-10 h-px mx-auto mt-5" style={{ backgroundColor: GOLD }} />
          <p className="mt-6 text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
            Experience the atmosphere, cuisine, and unforgettable moments at Sarajet Restaurant
          </p>
        </motion.div>
      </header>

      {/* ── Filter tabs ─────────────────────────────────── */}
      <div className="flex justify-center px-4 mb-14">
        <nav
          aria-label="Gallery categories"
          className="flex items-center gap-0 overflow-x-auto scrollbar-hide"
        >
          {CATEGORIES.map((cat, i) => {
            const isActive = activeCategory === cat;
            return (
              <React.Fragment key={cat}>
                {i > 0 && (
                  <span className="w-px h-3 bg-neutral-700 flex-shrink-0 mx-1" aria-hidden="true" />
                )}
                <button
                  onClick={() => setActiveCategory(cat)}
                  className="relative flex-shrink-0 px-4 py-3 text-xs font-semibold tracking-[0.18em] uppercase transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] rounded-sm whitespace-nowrap"
                  style={{
                    color: isActive ? GOLD : '#737373',
                    focusVisibleRingColor: GOLD,
                  } as React.CSSProperties}
                  aria-pressed={isActive}
                >
                  {cat}
                  {/* Gold underline */}
                  <span
                    className="absolute bottom-1.5 left-4 right-4 h-px transition-opacity duration-200"
                    style={{
                      backgroundColor: GOLD,
                      opacity: isActive ? 1 : 0,
                    }}
                    aria-hidden="true"
                  />
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* ── Masonry grid ────────────────────────────────── */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 pb-24">
        <motion.div
          layout={!reduced}
          className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3"
        >
          <AnimatePresence>
            {filtered.map((item, index) => (
              <motion.div
                key={item.id}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
                className={`break-inside-avoid ${item.tall ? 'h-[420px]' : 'h-[260px]'}`}
              >
                <button
                  className="relative w-full h-full rounded-xl overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] block"
                  style={{ ['--tw-ring-color' as string]: GOLD }}
                  onClick={() => setLightbox(item)}
                  aria-label={`View ${item.title}`}
                >
                  {!imgErrors[item.id] ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      onError={() => setImgErrors(p => ({ ...p, [item.id]: true }))}
                      loading={index < 6 ? 'eager' : 'lazy'}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                      <svg className="w-8 h-8 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-hidden="true"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white font-semibold text-sm leading-snug">{item.title}</p>
                    <p className="text-[10px] tracking-[0.15em] uppercase mt-0.5" style={{ color: GOLD }}>
                      {item.category}
                    </p>
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-32">
            <p className="text-neutral-600 text-sm tracking-wide">No images in this category yet.</p>
          </div>
        )}
      </main>

      {/* ── Lightbox ────────────────────────────────────── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/97 z-50 flex items-center justify-center p-4"
            style={{ overscrollBehavior: 'contain' }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`Viewing ${lightbox.title}`}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              aria-label="Close gallery"
              className="absolute top-5 right-5 p-2.5 rounded-full bg-white/8 hover:bg-white/15 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 z-10"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Prev */}
            <button
              onClick={e => { e.stopPropagation(); navigate('prev'); }}
              aria-label="Previous image"
              className="absolute left-4 sm:left-6 p-2.5 rounded-full bg-white/8 hover:bg-white/15 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 z-10"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next */}
            <button
              onClick={e => { e.stopPropagation(); navigate('next'); }}
              aria-label="Next image"
              className="absolute right-4 sm:right-6 p-2.5 rounded-full bg-white/8 hover:bg-white/15 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 z-10"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Image */}
            <motion.div
              key={lightbox.id}
              initial={reduced ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="relative max-w-5xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative w-full h-full">
                <Image
                  src={lightbox.image}
                  alt={lightbox.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  priority
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-white font-semibold text-base">{lightbox.title}</p>
                <p className="text-[11px] tracking-[0.2em] uppercase mt-1" style={{ color: GOLD }}>
                  {lightbox.category}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
