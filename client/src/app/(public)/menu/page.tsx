'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getMenuCategories, getMenuItems, MenuItem, MenuCategory } from '@/lib/api';

const GOLD = '#C4A35A';

const DIETARY_ABBR: Record<string, string> = {
  vegetarian: 'V',
  vegan: 'VG',
  gluten_free: 'GF',
  dairy_free: 'DF',
  nut_free: 'NF',
  halal: 'HL',
  keto: 'KT',
};

// ─── Menu Item Card ───────────────────────────────────────────────────────────
function MenuCard({ item }: { item: MenuItem }) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = item.image_url || (item as any).image;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100 hover:shadow-md hover:border-neutral-200 transition-all duration-300"
    >
      {/* Left — image */}
      <div className="relative w-36 sm:w-44 md:w-52 flex-shrink-0 min-h-[140px]">
        {imgSrc && !imgError ? (
          <Image
            src={imgSrc}
            alt={item.name}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Right — content */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-semibold text-neutral-900 leading-snug mb-1.5 truncate">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed line-clamp-2 mb-3">
              {item.description}
            </p>
          )}
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col gap-1.5">
            <span className="font-serif text-lg sm:text-xl font-semibold tabular-nums" style={{ color: GOLD }}>
              {item.formatted_price || `$${Number(item.price).toFixed(2)}`}
            </span>
            {item.dietary_info && item.dietary_info.length > 0 && (
              <div className="flex flex-wrap gap-1" aria-label="Dietary information">
                {item.dietary_info.slice(0, 4).map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide border"
                    style={{ color: GOLD, borderColor: `${GOLD}55`, backgroundColor: `${GOLD}10` }}
                    title={d.replace('_', ' ')}
                  >
                    {DIETARY_ABBR[d] ?? d.slice(0, 2).toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            aria-label={`Add ${item.name}`}
            className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 transition-opacity"
            style={{ backgroundColor: GOLD }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex bg-white rounded-2xl overflow-hidden border border-neutral-100 animate-pulse">
          <div className="w-44 flex-shrink-0 bg-neutral-100 min-h-[140px]" />
          <div className="flex-1 p-5 space-y-3">
            <div className="h-4 bg-neutral-100 rounded w-2/3" />
            <div className="h-3 bg-neutral-100 rounded w-full" />
            <div className="h-3 bg-neutral-100 rounded w-4/5" />
            <div className="h-5 bg-neutral-100 rounded w-20 mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [catsData, itemsData] = await Promise.all([
          getMenuCategories(),
          getMenuItems({ is_available: true }),
        ]);
        setCategories(catsData || []);
        const items: MenuItem[] = (itemsData as any)?.results ?? itemsData ?? [];
        setAllItems(items);
      } catch {
        setError('Unable to load the menu. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Category pills — only categories that have at least one item
  const catPills = useMemo(() => {
    const usedCatIds = new Set(
      allItems.map((item) =>
        typeof item.category === 'string' ? item.category : (item.category as any)?.id
      )
    );
    const pills = [{ id: 'all', name: 'All' }];
    categories.forEach((c) => {
      if (usedCatIds.has(c.id)) pills.push({ id: c.id, name: c.name });
    });
    return pills;
  }, [allItems, categories]);

  // Filtered items
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allItems.filter((item) => {
      const catId = typeof item.category === 'string' ? item.category : (item.category as any)?.id;
      const matchesCat = activeCat === 'all' || catId === activeCat;
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description ?? '').toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [allItems, activeCat, search]);

  // Group by category name for display
  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    filtered.forEach((item) => {
      const catId = typeof item.category === 'string' ? item.category : (item.category as any)?.id;
      const catName = categories.find((c) => c.id === catId)?.name ?? 'Other';
      const existing = map.get(catName) ?? [];
      map.set(catName, [...existing, item]);
    });
    return map;
  }, [filtered, categories]);

  return (
    <div className="min-h-screen bg-white" data-nav-theme="light">

      {/* Page header */}
      <header className="pt-24 sm:pt-32 pb-10 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-neutral-900 tracking-tight">
            Our Menu
          </h1>
          <div className="w-10 h-px mx-auto mt-5" style={{ backgroundColor: GOLD }} />
        </motion.div>
      </header>

      {/* Sticky search + category filters */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-neutral-100 px-4 py-3">
        <div className="max-w-3xl mx-auto space-y-3">

          {/* Search */}
          <div className="relative">
            <label htmlFor="menu-search" className="sr-only">Search menu items</label>
            <input
              id="menu-search"
              type="search"
              name="menu-search"
              autoComplete="off"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes…"
              className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{ '--tw-ring-color': GOLD } as React.CSSProperties}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category pills */}
          {catPills.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
              {catPills.map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setActiveCat(pill.id)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2"
                  style={
                    activeCat === pill.id
                      ? { backgroundColor: GOLD, color: '#fff' }
                      : { backgroundColor: '#f5f5f4', color: '#57534e' }
                  }
                >
                  {pill.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-8 pb-24">

        {loading && <Skeleton />}

        {error && !loading && (
          <div className="flex flex-col items-center py-24 text-center">
            <p className="text-neutral-500 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm font-medium underline underline-offset-4 hover:opacity-70 transition-opacity"
              style={{ color: GOLD }}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-24 text-center"
              >
                <p className="text-neutral-400 text-sm">
                  {search ? `No dishes found for "${search}"` : 'No items available.'}
                </p>
                {search && (
                  <button
                    onClick={() => { setSearch(''); setActiveCat('all'); }}
                    className="mt-3 text-sm font-medium underline underline-offset-4 hover:opacity-70 transition-opacity"
                    style={{ color: GOLD }}
                  >
                    Clear filters
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {[...grouped.entries()].map(([catName, items]) => (
                  <section key={catName} className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
                        {catName}
                      </h2>
                      <div className="flex-1 h-px bg-neutral-100" />
                    </div>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {items.map((item) => (
                          <MenuCard key={item.id} item={item} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </section>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      <div className="flex justify-center pb-12">
        <div className="w-8 h-px" style={{ backgroundColor: `${GOLD}60` }} />
      </div>
    </div>
  );
}
