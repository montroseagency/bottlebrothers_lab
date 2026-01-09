// client/src/pages/Menu.tsx - Refined Premium Menu
'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
// REFINED ANIMATION VARIANTS - Slow & Elegant
// ============================================
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }
  }
};

// ============================================
// REFINED SEARCH BAR
// ============================================
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="w-full"
    >
      <div
        className={`
          relative flex items-center
          h-12 px-5
          bg-stone-50/80
          rounded-full
          border
          transition-all duration-500 ease-out
          ${isFocused
            ? 'border-stone-300 bg-white'
            : 'border-stone-200/60 hover:border-stone-200'
          }
        `}
      >
        <svg
          className="w-4 h-4 mr-3 text-stone-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search..."
          className="
            flex-1
            bg-transparent
            text-stone-800 text-[14px]
            placeholder:text-stone-400
            focus:outline-none
          "
        />

        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => onChange('')}
              className="ml-2 p-1 text-stone-400 hover:text-stone-600 transition-colors duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ============================================
// REFINED CATEGORY DROPDOWN
// ============================================
interface CategoryDropdownProps {
  categories: CategoryWithItems[];
  activeCategory: string;
  onSelect: (id: string) => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ categories, activeCategory, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allCategories = [
    { id: 'all', name: 'All' },
    ...categories.map(cat => ({
      id: cat.category_type,
      name: cat.name,
    })),
  ];

  const selectedCategory = allCategories.find(cat => cat.id === activeCategory) || allCategories[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative w-full sm:w-44"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full
          flex items-center justify-between
          h-12 px-5
          bg-stone-50/80
          border rounded-full
          transition-all duration-500 ease-out
          ${isOpen
            ? 'border-stone-300 bg-white'
            : 'border-stone-200/60 hover:border-stone-200'
          }
        `}
      >
        <span className="text-[14px] text-stone-700">
          {selectedCategory.name}
        </span>
        <svg
          className={`w-4 h-4 text-stone-400 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="
              absolute top-full left-0 right-0
              mt-2 z-50
              bg-white
              border border-stone-200
              rounded-xl
              shadow-lg shadow-stone-200/40
              overflow-hidden
            "
          >
            <div className="py-1">
              {allCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelect(cat.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full
                    px-5 py-2.5
                    text-left text-[14px]
                    transition-colors duration-300
                    ${activeCategory === cat.id
                      ? 'text-stone-900 bg-stone-50'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50/50'
                    }
                  `}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================
// REFINED PREMIUM MENU CARD
// ============================================
interface MenuCardProps {
  item: MenuItem;
}

const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const imageUrl = getImageUrl(item.image_url);
  const isSignature = item.is_featured;

  return (
    <motion.article
      variants={cardVariants}
      className="
        group
        w-full
        bg-white
        rounded-xl sm:rounded-2xl
        overflow-hidden
        transition-all duration-700 ease-out
        hover:shadow-lg hover:shadow-stone-100/60
      "
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        {imageUrl && (
          <div className="relative w-full sm:w-40 md:w-48 lg:w-52 h-36 sm:h-auto flex-shrink-0 overflow-hidden bg-stone-100">
            <img
              src={imageUrl}
              alt={item.name}
              className="
                w-full h-full object-cover
                transition-transform duration-1000 ease-out
                group-hover:scale-[1.03]
              "
            />
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col justify-center">
          {/* Signature indicator - subtle & editorial */}
          {isSignature && (
            <span className="
              inline-block mb-2 sm:mb-3
              text-[9px] sm:text-[10px] italic
              text-stone-400
              tracking-wide
            ">
              Signature
            </span>
          )}

          {/* Item Name - confident & clear */}
          <h3 className="
            text-[15px] sm:text-[17px] md:text-[18px] lg:text-[20px]
            font-normal
            text-stone-900
            tracking-tight
            leading-snug
            mb-1 sm:mb-2
          ">
            {item.name}
          </h3>

          {/* Description - calm & soft */}
          {item.description && (
            <p className="
              text-[11px] sm:text-[12px] md:text-[13px] leading-[1.6] sm:leading-[1.7]
              text-stone-400
              line-clamp-2
              mb-2 sm:mb-3
            ">
              {item.description}
            </p>
          )}

          {/* Price - lighter, less dominant */}
          <div className="mt-auto pt-1 sm:pt-2">
            <span className="
              text-[13px] sm:text-[14px]
              font-normal
              text-stone-500
              tabular-nums
            ">
              {item.formatted_price}
            </span>
          </div>

          {/* Variants - refined - hidden on mobile */}
          {item.has_variants && item.variants && item.variants.length > 0 && (
            <div className="hidden sm:block mt-4 pt-4 border-t border-stone-100">
              <div className="flex flex-wrap gap-x-4 md:gap-x-6 gap-y-2">
                {item.variants.slice(0, 3).map((variant) => (
                  <span
                    key={variant.id}
                    className="text-[11px] md:text-[12px] text-stone-400"
                  >
                    {variant.name} <span className="text-stone-300">·</span> ${variant.price}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
};

// ============================================
// REFINED CATEGORY SECTION
// ============================================
interface CategorySectionProps {
  category: CategoryWithItems;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category }) => {
  const allItems: MenuItem[] = [
    ...category.menu_items,
    ...(category.subcategories?.flatMap(sub => sub.menu_items) || [])
  ];

  if (allItems.length === 0) return null;

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      className="mb-20"
    >
      {/* Section Header */}
      <div className="flex items-center gap-6 mb-10">
        <h2 className="
          text-2xl sm:text-3xl
          font-semibold
          text-stone-800
          tracking-tight
        ">
          {category.name}
        </h2>
        <div className="flex-1 h-px bg-stone-200" />
      </div>

      {/* Items - Vertical Flow with breathing room */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-col gap-8"
      >
        {allItems.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </motion.div>
    </motion.section>
  );
};

// ============================================
// LOADING STATE
// ============================================
const LoadingState = () => (
  <div className="flex flex-col gap-8 py-12">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="w-full h-56 bg-stone-50 rounded-2xl animate-pulse"
        style={{ animationDelay: `${i * 150}ms` }}
      />
    ))}
  </div>
);

// ============================================
// EMPTY STATE
// ============================================
const EmptyState: React.FC<{ onReset: () => void }> = ({ onReset }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    className="flex flex-col items-center justify-center py-32"
  >
    <p className="text-[14px] text-stone-400 mb-6">
      No items found
    </p>
    <button
      onClick={onReset}
      className="
        text-[13px]
        text-stone-500
        hover:text-stone-700
        transition-colors duration-500
        underline underline-offset-4 decoration-stone-300
      "
    >
      Clear search
    </button>
  </motion.div>
);

// ============================================
// MAIN MENU COMPONENT
// ============================================
const Menu: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
    } catch (err) {
      console.error('Failed to fetch menu data:', err);
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
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

      const filteredSubcategories = (cat.subcategories ?? []).map(sub => {
        let subItems = sub.menu_items;
        if (query) {
          subItems = subItems.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
          );
        }
        return { ...sub, menu_items: subItems };
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
  }, [categories, activeCategory, searchQuery]);

  const handleReset = () => {
    setSearchQuery('');
    setActiveCategory('all');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] relative">
      {/* Subtle side gradients for depth */}
      <div
        className="fixed inset-y-0 left-0 w-[30%] pointer-events-none z-0"
        style={{
          background: 'linear-gradient(to right, rgba(250, 248, 246, 0.8) 0%, rgba(250, 248, 246, 0.4) 30%, transparent 100%)',
        }}
      />
      <div
        className="fixed inset-y-0 right-0 w-[30%] pointer-events-none z-0"
        style={{
          background: 'linear-gradient(to left, rgba(250, 248, 246, 0.8) 0%, rgba(250, 248, 246, 0.4) 30%, transparent 100%)',
        }}
      />

      {/* Soft ambient blur shapes - left side */}
      <div className="fixed top-[20%] -left-[10%] w-[35%] h-[40%] pointer-events-none z-0 opacity-[0.35]">
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(245, 241, 237, 0.9) 0%, rgba(250, 248, 246, 0.4) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>
      <div className="fixed top-[55%] -left-[5%] w-[25%] h-[30%] pointer-events-none z-0 opacity-[0.25]">
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(242, 238, 234, 0.8) 0%, rgba(250, 248, 246, 0.3) 50%, transparent 75%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* Soft ambient blur shapes - right side */}
      <div className="fixed top-[15%] -right-[8%] w-[30%] h-[35%] pointer-events-none z-0 opacity-[0.3]">
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(247, 244, 240, 0.85) 0%, rgba(250, 248, 246, 0.35) 45%, transparent 70%)',
            filter: 'blur(55px)',
          }}
        />
      </div>
      <div className="fixed top-[60%] -right-[12%] w-[32%] h-[38%] pointer-events-none z-0 opacity-[0.28]">
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(244, 240, 236, 0.8) 0%, rgba(250, 248, 246, 0.3) 50%, transparent 72%)',
            filter: 'blur(65px)',
          }}
        />
      </div>

      {/* Header Section */}
      <header className="relative z-10 pt-24 sm:pt-28 md:pt-36 pb-8 sm:pb-12 md:pb-16 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="max-w-xl mx-auto text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="
              text-2xl sm:text-3xl md:text-4xl
              font-light
              text-stone-800
              tracking-tight
              mb-2 sm:mb-3
            "
          >
            {t('menu.title', 'Menu')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="
              text-[12px] sm:text-[13px] md:text-[14px]
              text-stone-400
              font-light
            "
          >
            {t('menu.description', 'A curated selection')}
          </motion.p>
        </motion.div>
      </header>

      {/* Search & Filters */}
      <div className="sticky top-0 z-40 bg-[#FAFAF9]/95 backdrop-blur-xl relative">
        <div className="max-w-xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            <CategoryDropdown
              categories={categories}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />
          </div>
        </div>
        <div className="h-px bg-stone-200/40" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-xl mx-auto px-4 py-16">
        {loading && <LoadingState />}

        {error && (
          <div className="flex flex-col items-center py-20">
            <p className="text-[14px] text-stone-400 mb-4">{error}</p>
            <button
              onClick={fetchMenuData}
              className="
                text-[13px]
                text-stone-500
                hover:text-stone-700
                transition-colors duration-500
                underline underline-offset-4 decoration-stone-300
              "
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <AnimatePresence mode="wait">
            {filteredCategories.length > 0 ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {filteredCategories.map((category) => (
                  <CategorySection key={category.id} category={category} />
                ))}
              </motion.div>
            ) : (
              <EmptyState onReset={handleReset} />
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Footer spacing */}
      <div className="h-24" />
    </div>
  );
};

export default Menu;
