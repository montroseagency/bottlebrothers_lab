// client/src/pages/Menu.tsx - Premium Dark Luxury Menu
'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../services/api';
import type { MenuCategory, MenuItem, MenuSubcategory } from '../services/api';

interface SubcategoryWithItems extends MenuSubcategory {
  menu_items: MenuItem[];
}

interface CategoryWithItems extends MenuCategory {
  menu_items: MenuItem[];
  subcategories?: SubcategoryWithItems[];
}

// Helper to construct full image URL
const API_BASE = 'http://localhost:8000';
const getImageUrl = (url?: string): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${API_BASE}${url}`;
  }
  return `${API_BASE}/${url}`;
};

// ============================================
// CSS VARIABLES - Dark Luxury Theme
// ============================================
const cssVars = `
  :root {
    --menu-bg-primary: #0a0a0a;
    --menu-bg-secondary: #111111;
    --menu-bg-card: #161616;
    --menu-bg-elevated: #1a1a1a;
    --menu-bg-input: #0d0d0d;

    --menu-text-primary: #ffffff;
    --menu-text-secondary: #a3a3a3;
    --menu-text-muted: #666666;
    --menu-text-accent: #d4af37;

    --menu-border-subtle: rgba(255, 255, 255, 0.06);
    --menu-border-default: rgba(255, 255, 255, 0.1);
    --menu-border-hover: rgba(255, 255, 255, 0.15);
    --menu-border-active: rgba(212, 175, 55, 0.4);

    --menu-accent-gold: #d4af37;
    --menu-accent-gold-light: rgba(212, 175, 55, 0.15);
    --menu-accent-gold-hover: #e5c349;

    --menu-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
    --menu-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
    --menu-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
    --menu-shadow-glow: 0 0 20px rgba(212, 175, 55, 0.15);
  }
`;

// ============================================
// ANIMATION VARIANTS
// ============================================
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.3 }
  }
};

const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -8,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    transition: { duration: 0.15 }
  }
};

const shimmer = {
  hidden: { x: '-100%' },
  visible: {
    x: '100%',
    transition: { repeat: Infinity, duration: 1.5, ease: 'linear' }
  }
};

// ============================================
// PREMIUM SEARCH BAR COMPONENT
// ============================================
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultsCount: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, resultsCount }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isFocused && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur();
        setIsFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative w-full"
    >
      <div
        className={`
          relative overflow-hidden
          bg-[var(--menu-bg-input)]
          border rounded-lg
          transition-all duration-300
          ${isFocused
            ? 'border-[var(--menu-accent-gold)] shadow-[var(--menu-shadow-glow)]'
            : 'border-[var(--menu-border-default)] hover:border-[var(--menu-border-hover)]'
          }
        `}
      >
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className={`w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-[var(--menu-accent-gold)]' : 'text-[var(--menu-text-muted)]'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search menu..."
          aria-label="Search menu items"
          className="
            w-full pl-12 pr-24 py-4
            bg-transparent
            text-[var(--menu-text-primary)] text-[15px]
            placeholder:text-[var(--menu-text-muted)]
            focus:outline-none
          "
        />

        {/* Right side: Clear + Shortcut hint */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
          {value ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onChange('')}
              className="
                px-2 py-1
                text-[11px] font-medium uppercase tracking-wider
                text-[var(--menu-text-muted)] hover:text-[var(--menu-text-primary)]
                transition-colors duration-200
              "
              aria-label="Clear search"
            >
              Clear
            </motion.button>
          ) : (
            <span className="
              hidden sm:flex items-center gap-1
              px-2 py-1
              text-[11px] font-mono
              text-[var(--menu-text-muted)]
              bg-[var(--menu-bg-elevated)]
              border border-[var(--menu-border-subtle)]
              rounded
            ">
              /
            </span>
          )}
        </div>

        {/* Focus glow effect */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.03), transparent)',
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ============================================
// CATEGORY TABS COMPONENT
// ============================================
interface CategoryTabsProps {
  categories: CategoryWithItems[];
  activeCategory: string;
  onSelect: (categoryId: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeCategory, onSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const allCategories = [
    { id: 'all', name: 'All' },
    ...categories.map(cat => ({
      id: cat.category_type,
      name: cat.name,
    })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative"
    >
      <div
        ref={scrollRef}
        className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        role="tablist"
        aria-label="Menu categories"
      >
        {allCategories.map((cat, index) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * index }}
            onClick={() => onSelect(cat.id)}
            role="tab"
            aria-selected={activeCategory === cat.id}
            aria-controls={`panel-${cat.id}`}
            className={`
              relative px-5 py-2.5
              text-[13px] font-medium tracking-wide
              whitespace-nowrap
              rounded-lg
              transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-[var(--menu-accent-gold)] focus:ring-offset-2 focus:ring-offset-[var(--menu-bg-primary)]
              ${activeCategory === cat.id
                ? 'text-[var(--menu-bg-primary)] bg-[var(--menu-accent-gold)]'
                : 'text-[var(--menu-text-secondary)] hover:text-[var(--menu-text-primary)] hover:bg-[var(--menu-bg-elevated)]'
              }
            `}
          >
            {cat.name}

            {/* Active indicator glow */}
            {activeCategory === cat.id && (
              <motion.div
                layoutId="activeTabGlow"
                className="absolute inset-0 rounded-lg"
                style={{
                  boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
                }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================
// SORT DROPDOWN COMPONENT
// ============================================
interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' },
  ];

  const selected = options.find(o => o.value === value) || options[0];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Sort by: ${selected.label}`}
        className={`
          flex items-center gap-2 px-4 py-2.5
          text-[13px] font-medium
          bg-[var(--menu-bg-elevated)]
          border rounded-lg
          transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-[var(--menu-accent-gold)] focus:ring-offset-2 focus:ring-offset-[var(--menu-bg-primary)]
          ${isOpen
            ? 'border-[var(--menu-accent-gold)] text-[var(--menu-text-primary)]'
            : 'border-[var(--menu-border-default)] text-[var(--menu-text-secondary)] hover:border-[var(--menu-border-hover)] hover:text-[var(--menu-text-primary)]'
          }
        `}
      >
        <span className="text-[var(--menu-text-muted)]">Sort:</span>
        <span>{selected.label}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="
              absolute top-full right-0 mt-2 z-50
              min-w-[200px]
              bg-[var(--menu-bg-card)]
              border border-[var(--menu-border-default)]
              rounded-lg
              shadow-[var(--menu-shadow-lg)]
              overflow-hidden
            "
            role="listbox"
          >
            {options.map((option, index) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={value === option.value}
                className={`
                  w-full px-4 py-3
                  text-left text-[13px]
                  transition-all duration-200
                  ${value === option.value
                    ? 'bg-[var(--menu-accent-gold-light)] text-[var(--menu-accent-gold)]'
                    : 'text-[var(--menu-text-secondary)] hover:text-[var(--menu-text-primary)] hover:bg-[var(--menu-bg-elevated)]'
                  }
                `}
              >
                {option.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================
// RESULTS COUNT COMPONENT
// ============================================
const ResultsCount: React.FC<{ count: number }> = ({ count }) => (
  <motion.span
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-[12px] text-[var(--menu-text-muted)] tabular-nums"
  >
    {count} {count === 1 ? 'item' : 'items'}
  </motion.span>
);

// ============================================
// PREMIUM FILTER SECTION
// ============================================
interface FilterSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categories: CategoryWithItems[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  sortValue: string;
  onSortChange: (value: string) => void;
  resultsCount: number;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  searchQuery,
  onSearchChange,
  categories,
  activeCategory,
  onCategoryChange,
  sortValue,
  onSortChange,
  resultsCount,
}) => {
  return (
    <div className="sticky top-0 z-40 bg-[var(--menu-bg-primary)]/95 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Row 1: Search Bar */}
        <div className="pt-6 pb-4">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            resultsCount={resultsCount}
          />
        </div>

        {/* Row 2: Categories + Sort + Results Count */}
        <div className="pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Categories */}
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onSelect={onCategoryChange}
          />

          {/* Sort + Results Count */}
          <div className="flex items-center gap-4">
            <ResultsCount count={resultsCount} />
            <SortDropdown value={sortValue} onChange={onSortChange} />
          </div>
        </div>

        {/* Subtle divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="h-px bg-gradient-to-r from-transparent via-[var(--menu-border-default)] to-transparent"
        />
      </div>
    </div>
  );
};

// ============================================
// LOADING SKELETON
// ============================================
const MenuCardSkeleton = () => (
  <div className="
    w-full max-w-[320px]
    bg-[var(--menu-bg-card)]
    border border-[var(--menu-border-subtle)]
    rounded-lg
    overflow-hidden
  ">
    {/* Image skeleton */}
    <div className="relative h-40 bg-[var(--menu-bg-elevated)] overflow-hidden">
      <motion.div
        variants={shimmer}
        initial="hidden"
        animate="visible"
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
      />
    </div>
    <div className="p-5 space-y-4">
      <div className="flex items-baseline justify-between">
        <div className="h-5 w-32 bg-[var(--menu-bg-elevated)] rounded animate-pulse" />
        <div className="h-5 w-16 bg-[var(--menu-bg-elevated)] rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-[var(--menu-bg-elevated)] rounded animate-pulse" />
        <div className="h-3 w-4/5 bg-[var(--menu-bg-elevated)] rounded animate-pulse" />
      </div>
    </div>
  </div>
);

const LoadingState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="py-12"
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <MenuCardSkeleton />
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// ============================================
// MENU ITEM CARD
// ============================================
interface MenuItemCardProps {
  item: MenuItem;
  index: number;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, index }) => {
  const getTags = () => {
    const tags: string[] = [];
    if (item.is_featured) tags.push('Signature');
    if (item.tags?.includes('popular')) tags.push('Popular');
    if (item.tags?.includes('new')) tags.push('New');
    return tags.slice(0, 1);
  };

  const tag = getTags()[0];
  const imageUrl = getImageUrl(item.image_url);

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      transition={{ delay: index * 0.05 }}
      className="
        group
        w-full max-w-[320px]
        bg-[var(--menu-bg-card)]
        border border-[var(--menu-border-subtle)]
        hover:border-[var(--menu-border-hover)]
        rounded-lg
        overflow-hidden
        transition-all duration-500
        hover:shadow-[var(--menu-shadow-lg)]
      "
    >
      {/* Image */}
      {imageUrl && (
        <div className="relative h-44 overflow-hidden bg-[var(--menu-bg-elevated)]">
          <motion.img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
          />
          {/* Overlay gradient */}
          <div className="
            absolute inset-0
            bg-gradient-to-t from-[var(--menu-bg-card)] via-transparent to-transparent
            opacity-60
          " />

          {/* Tag badge */}
          {tag && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="
                absolute top-3 left-3
                px-3 py-1
                text-[10px] font-semibold uppercase tracking-wider
                text-[var(--menu-bg-primary)]
                bg-[var(--menu-accent-gold)]
                rounded
              "
            >
              {tag}
            </motion.span>
          )}
        </div>
      )}

      {/* Content */}
      <div className={`p-5 flex flex-col ${imageUrl ? 'min-h-[140px]' : 'min-h-[180px]'}`}>
        {/* Header: Name + Price */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="
            font-display text-[17px] leading-snug
            text-[var(--menu-text-primary)]
            group-hover:text-[var(--menu-accent-gold)]
            transition-colors duration-300
          ">
            {item.name}
          </h3>
          <span className="
            text-[16px] font-semibold tabular-nums
            text-[var(--menu-accent-gold)]
            flex-shrink-0
          ">
            {item.formatted_price}
          </span>
        </div>

        {/* Description */}
        {item.description && (
          <p className={`
            text-[13px] leading-relaxed
            text-[var(--menu-text-secondary)]
            ${imageUrl ? 'line-clamp-2' : 'line-clamp-3'}
            flex-grow
          `}>
            {item.description}
          </p>
        )}

        {/* Footer: Tag (if no image) + Variants */}
        <div className="mt-4 pt-4 border-t border-[var(--menu-border-subtle)]">
          <div className="flex items-center justify-between">
            {!imageUrl && tag ? (
              <span className="
                text-[10px] font-semibold tracking-widest uppercase
                text-[var(--menu-accent-gold)]
              ">
                {tag}
              </span>
            ) : (
              <span />
            )}

            {item.has_variants && item.variants && item.variants.length > 0 && (
              <span className="text-[11px] text-[var(--menu-text-muted)]">
                {item.variants.length} options
              </span>
            )}
          </div>

          {/* Variants list */}
          {item.has_variants && item.variants && item.variants.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {item.variants.slice(0, 3).map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-baseline justify-between text-[12px]"
                >
                  <span className="text-[var(--menu-text-muted)]">{variant.name}</span>
                  <span className="text-[var(--menu-text-secondary)] tabular-nums">${variant.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <motion.div
        className="h-[2px] bg-[var(--menu-accent-gold)]"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.4 }}
        style={{ transformOrigin: 'left' }}
      />
    </motion.article>
  );
};

// ============================================
// CATEGORY SECTION
// ============================================
interface CategorySectionProps {
  category: CategoryWithItems;
  startIndex: number;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, startIndex }) => {
  let itemIndex = startIndex;

  const allItems: MenuItem[] = [
    ...category.menu_items,
    ...(category.subcategories?.flatMap(sub => sub.menu_items) || [])
  ];

  if (allItems.length === 0) return null;

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="mb-16"
    >
      {/* Section Header */}
      <motion.div
        variants={fadeUp}
        className="mb-8"
      >
        <div className="flex items-center gap-6 mb-2">
          <h2 className="font-display text-2xl md:text-3xl text-[var(--menu-text-primary)] tracking-tight">
            {category.name}
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[var(--menu-border-default)] to-transparent" />
          <span className="text-[12px] text-[var(--menu-text-muted)] tabular-nums">
            {allItems.length} {allItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        {category.description && (
          <p className="text-[14px] text-[var(--menu-text-secondary)] max-w-xl">
            {category.description}
          </p>
        )}
      </motion.div>

      {/* Subcategories */}
      {category.subcategories && category.subcategories.length > 0 ? (
        <div className="space-y-12">
          {category.menu_items.length > 0 && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center sm:justify-items-start"
            >
              {category.menu_items.map((item) => {
                const idx = itemIndex++;
                return <MenuItemCard key={item.id} item={item} index={idx} />;
              })}
            </motion.div>
          )}

          {category.subcategories.map((subcategory) => {
            if (subcategory.menu_items.length === 0) return null;

            return (
              <motion.div
                key={subcategory.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-[15px] font-medium text-[var(--menu-text-secondary)] tracking-wide">
                    {subcategory.name}
                  </h3>
                  <div className="flex-1 h-px bg-[var(--menu-border-subtle)]" />
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center sm:justify-items-start"
                >
                  {subcategory.menu_items.map((item) => {
                    const idx = itemIndex++;
                    return <MenuItemCard key={item.id} item={item} index={idx} />;
                  })}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center sm:justify-items-start"
        >
          {category.menu_items.map((item) => {
            const idx = itemIndex++;
            return <MenuItemCard key={item.id} item={item} index={idx} />;
          })}
        </motion.div>
      )}
    </motion.section>
  );
};

// ============================================
// MOBILE FILTER SHEET
// ============================================
interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryWithItems[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  sortValue: string;
  onSortChange: (value: string) => void;
}

const MobileFilterSheet: React.FC<MobileFilterSheetProps> = ({
  isOpen,
  onClose,
  categories,
  activeCategory,
  onSelectCategory,
  sortValue,
  onSortChange,
}) => {
  const allCategories = [
    { id: 'all', name: 'All' },
    ...categories.map(cat => ({
      id: cat.category_type,
      name: cat.name,
    })),
  ];

  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <div className="bg-[var(--menu-bg-card)] border-t border-[var(--menu-border-default)] rounded-t-2xl">
              <div className="flex justify-center py-4">
                <div className="w-10 h-1 rounded-full bg-[var(--menu-border-hover)]" />
              </div>

              <div className="px-6 pb-10 max-h-[70vh] overflow-y-auto">
                {/* Categories */}
                <div className="mb-8">
                  <h3 className="text-[11px] font-semibold tracking-widest uppercase text-[var(--menu-text-muted)] mb-4">
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map((cat) => (
                      <motion.button
                        key={cat.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          onSelectCategory(cat.id);
                          onClose();
                        }}
                        className={`
                          px-4 py-2.5
                          text-[13px] font-medium
                          border rounded-lg
                          transition-all duration-200
                          ${activeCategory === cat.id
                            ? 'bg-[var(--menu-accent-gold)] border-[var(--menu-accent-gold)] text-[var(--menu-bg-primary)]'
                            : 'bg-transparent border-[var(--menu-border-default)] text-[var(--menu-text-secondary)]'
                          }
                        `}
                      >
                        {cat.name}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h3 className="text-[11px] font-semibold tracking-widest uppercase text-[var(--menu-text-muted)] mb-4">
                    Sort By
                  </h3>
                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onSortChange(option.value);
                          onClose();
                        }}
                        className={`
                          w-full px-4 py-3
                          text-left text-[14px]
                          border rounded-lg
                          transition-all duration-200
                          ${sortValue === option.value
                            ? 'bg-[var(--menu-accent-gold)] border-[var(--menu-accent-gold)] text-[var(--menu-bg-primary)]'
                            : 'bg-transparent border-[var(--menu-border-default)] text-[var(--menu-text-secondary)]'
                          }
                        `}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================
// EMPTY STATE
// ============================================
const EmptyState: React.FC<{ onReset: () => void }> = ({ onReset }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    className="flex flex-col items-center justify-center py-24 px-4"
  >
    <div className="text-center max-w-sm">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--menu-bg-elevated)] flex items-center justify-center"
      >
        <svg className="w-8 h-8 text-[var(--menu-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </motion.div>
      <h3 className="font-display text-xl text-[var(--menu-text-primary)] mb-3">
        No Items Found
      </h3>
      <p className="text-[14px] text-[var(--menu-text-secondary)] mb-8 leading-relaxed">
        We couldn't find any menu items matching your criteria.
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onReset}
        className="
          px-6 py-3
          text-[13px] font-medium
          text-[var(--menu-accent-gold)]
          border border-[var(--menu-accent-gold)]
          hover:bg-[var(--menu-accent-gold-light)]
          rounded-lg
          transition-all duration-200
        "
      >
        Reset Filters
      </motion.button>
    </div>
  </motion.div>
);

// ============================================
// MAIN MENU COMPONENT
// ============================================
const Menu: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortValue, setSortValue] = useState('recommended');
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const menuData = await apiClient.getPublicMenuByCategory();
      const categoriesWithItems = menuData.map(category => ({
        ...category,
        menu_items: category.menu_items ?? [],
        subcategories: (category.subcategories ?? []).map(sub => ({
          ...sub,
          menu_items: sub.menu_items ?? []
        }))
      }));
      setCategories(categoriesWithItems);

      const items: MenuItem[] = [];
      categoriesWithItems.forEach(cat => {
        items.push(...cat.menu_items);
        cat.subcategories?.forEach(sub => {
          items.push(...sub.menu_items);
        });
      });
      setAllItems(items);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch menu data:', err);
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const sortItems = (items: MenuItem[]) => {
    return [...items].sort((a, b) => {
      switch (sortValue) {
        case 'price_asc':
          return (parseFloat(String(a.price)) || 0) - (parseFloat(String(b.price)) || 0);
        case 'price_desc':
          return (parseFloat(String(b.price)) || 0) - (parseFloat(String(a.price)) || 0);
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default:
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      }
    });
  };

  const filteredCategories = useMemo(() => {
    let filtered = categories;

    if (activeCategory !== 'all') {
      filtered = filtered.filter(cat => cat.category_type === activeCategory);
    }

    const query = searchQuery.trim().toLowerCase();

    filtered = filtered.map(cat => {
      let directItems = cat.menu_items;
      if (query) {
        directItems = directItems.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
        );
      }
      directItems = sortItems(directItems);

      const filteredSubcategories = (cat.subcategories ?? []).map(sub => {
        let subItems = sub.menu_items;
        if (query) {
          subItems = subItems.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
          );
        }
        return {
          ...sub,
          menu_items: sortItems(subItems)
        };
      }).filter(sub => sub.menu_items.length > 0);

      return {
        ...cat,
        menu_items: directItems,
        subcategories: filteredSubcategories
      };
    });

    if (query) {
      filtered = filtered.filter(cat =>
        cat.menu_items.length > 0 ||
        (cat.subcategories?.some(sub => sub.menu_items.length > 0))
      );
    }

    return filtered;
  }, [categories, activeCategory, searchQuery, sortValue]);

  const totalItems = filteredCategories.reduce((acc, cat) => {
    const directItems = cat.menu_items.length;
    const subcategoryItems = (cat.subcategories ?? []).reduce((subAcc, sub) => subAcc + sub.menu_items.length, 0);
    return acc + directItems + subcategoryItems;
  }, 0);

  const handleReset = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setSortValue('recommended');
  };

  return (
    <>
      {/* Inject CSS Variables */}
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />

      <LayoutGroup>
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="min-h-screen bg-[var(--menu-bg-primary)]"
        >
          {/* Header */}
          <header className="pt-28 pb-8 px-4">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="max-w-6xl mx-auto text-center"
            >
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="
                  inline-block mb-4
                  text-[11px] font-semibold tracking-[0.3em] uppercase
                  text-[var(--menu-accent-gold)]
                "
              >
                {t('menu.badge', 'Our Selection')}
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-4xl md:text-5xl lg:text-6xl text-[var(--menu-text-primary)] tracking-tight mb-4"
              >
                {t('menu.title', 'Menu')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-[15px] text-[var(--menu-text-secondary)] max-w-lg mx-auto leading-relaxed"
              >
                {t('menu.description', 'Explore our curated selection of premium drinks and cuisine.')}
              </motion.p>
            </motion.div>
          </header>

          {/* Filter Section */}
          <FilterSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            sortValue={sortValue}
            onSortChange={setSortValue}
            resultsCount={totalItems}
          />

          {/* Main Content */}
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {loading && <LoadingState />}

            {error && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center py-16"
              >
                <p className="text-[14px] text-red-400 mb-4">{error}</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={fetchMenuData}
                  className="
                    px-5 py-2.5
                    text-[13px] text-red-400
                    border border-red-400/30
                    rounded-lg
                    hover:bg-red-400/10
                    transition-colors
                  "
                >
                  Try Again
                </motion.button>
              </motion.div>
            )}

            {!loading && !error && (
              <AnimatePresence mode="wait">
                {filteredCategories.length > 0 ? (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {filteredCategories.map((category, catIndex) => {
                      const startIndex = filteredCategories
                        .slice(0, catIndex)
                        .reduce((acc, cat) => acc + cat.menu_items.length, 0);
                      return (
                        <CategorySection
                          key={category.id}
                          category={category}
                          startIndex={startIndex}
                        />
                      );
                    })}
                  </motion.div>
                ) : (
                  <EmptyState onReset={handleReset} />
                )}
              </AnimatePresence>
            )}
          </main>

          {/* Mobile Filter Sheet */}
          <MobileFilterSheet
            isOpen={mobileFilterOpen}
            onClose={() => setMobileFilterOpen(false)}
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            sortValue={sortValue}
            onSortChange={setSortValue}
          />
        </motion.div>
      </LayoutGroup>
    </>
  );
};

export default Menu;
