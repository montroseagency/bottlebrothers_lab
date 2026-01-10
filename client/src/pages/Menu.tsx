// client/src/pages/Menu.tsx - Luxury Lounge Menu
'use client'

import React, { useState, useEffect, useMemo } from 'react';
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

// ============================================
// LUXURY LOUNGE MENU ITEM
// ============================================
interface LoungeMenuItemProps {
  name: string;
  price: string;
  description?: string;
  note?: string;
}

const LoungeMenuItem: React.FC<LoungeMenuItemProps> = ({ name, price, description, note }) => {
  return (
    <div className="group py-3">
      {/* Name and Price with dotted leader */}
      <div className="flex items-baseline gap-2">
        <span className="text-[15px] sm:text-[16px] font-medium text-stone-800 group-hover:text-stone-600 transition-colors duration-300 whitespace-nowrap">
          {name}
        </span>
        <span className="flex-1 border-b border-dotted border-stone-300 mx-1 mb-1" />
        <span className="text-[14px] sm:text-[15px] font-normal text-stone-600 tabular-nums whitespace-nowrap">
          {price}
        </span>
      </div>
      {/* Description */}
      {description && (
        <p className="text-[12px] sm:text-[13px] text-stone-400 mt-1 leading-relaxed">
          {description}
        </p>
      )}
      {/* Note (e.g., for shisha) */}
      {note && (
        <p className="text-[11px] text-stone-400 mt-1 italic">
          {note}
        </p>
      )}
    </div>
  );
};

// ============================================
// LUXURY LOUNGE MENU SECTION
// ============================================
interface LoungeMenuSectionProps {
  title: string;
  items: MenuItem[];
}

const LoungeMenuSection: React.FC<LoungeMenuSectionProps> = ({ title, items }) => {
  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-12 sm:mb-16"
    >
      {/* Section Title */}
      <h2 className="text-[11px] sm:text-[12px] font-medium tracking-[0.2em] text-[#C4A35A] uppercase mb-6 sm:mb-8">
        {title}
      </h2>

      {/* Items */}
      <div className="space-y-1">
        {items.map((item) => (
          <LoungeMenuItem
            key={item.id}
            name={item.name}
            price={item.formatted_price}
            description={item.description}
          />
        ))}
      </div>
    </motion.div>
  );
};

// ============================================
// LOADING STATE
// ============================================
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-32">
    <div className="w-8 h-8 border-2 border-stone-200 border-t-[#C4A35A] rounded-full animate-spin" />
    <p className="text-[13px] text-stone-400 mt-4">Loading menu...</p>
  </div>
);

// ============================================
// EMPTY STATE
// ============================================
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-32"
  >
    <p className="text-[14px] text-stone-400">
      No menu items available
    </p>
  </motion.div>
);

// ============================================
// MAIN LUXURY LOUNGE MENU
// ============================================
const Menu: React.FC = () => {
  const { t } = useTranslation();
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

  // Helper to check if category has any items
  const categoryHasItems = (cat: CategoryWithItems): boolean => {
    return cat.menu_items.length > 0 ||
           (cat.subcategories?.some(sub => sub.menu_items.length > 0) ?? false);
  };

  // Group categories into left and right columns (only categories with items)
  const { leftColumn, rightColumn } = useMemo(() => {
    const left: CategoryWithItems[] = [];
    const right: CategoryWithItems[] = [];

    // Left column keywords (cocktails, spirits, drinks, beer, mocktails)
    const leftKeywords = ['cocktail', 'spirit', 'beverage', 'drink', 'beer', 'mocktail', 'whiskey', 'vodka', 'gin', 'rum', 'tequila'];
    // Right column keywords (wine, shisha, food)
    const rightKeywords = ['wine', 'shisha', 'food', 'appetizer', 'main', 'dessert', 'starter', 'side', 'salad', 'soup', 'cheese', 'mezze', 'rose', 'rosé', 'sparkling', 'champagne'];

    // Only include categories that have items
    const categoriesWithItems = categories.filter(categoryHasItems);

    categoriesWithItems.forEach(cat => {
      const type = cat.category_type?.toLowerCase() || '';
      const name = cat.name?.toLowerCase() || '';
      const searchText = `${type} ${name}`;

      if (leftKeywords.some(k => searchText.includes(k))) {
        left.push(cat);
      } else if (rightKeywords.some(k => searchText.includes(k))) {
        right.push(cat);
      } else {
        // Default to right column for uncategorized
        right.push(cat);
      }
    });

    return { leftColumn: left, rightColumn: right };
  }, [categories]);

  // Get all items from a category including subcategories
  const getAllItems = (category: CategoryWithItems): MenuItem[] => {
    const items = [...category.menu_items];
    category.subcategories?.forEach(sub => {
      items.push(...sub.menu_items);
    });
    return items;
  };

  const hasAnyItems = categories.some(cat =>
    cat.menu_items.length > 0 || cat.subcategories?.some(sub => sub.menu_items.length > 0)
  );

  return (
    <div className="min-h-screen bg-[#FEFCF9]">
      {/* Header */}
      <header className="pt-28 sm:pt-32 md:pt-40 pb-12 sm:pb-16 md:pb-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-5xl mx-auto text-center"
        >
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-stone-800 tracking-tight">
            {t('menu.title', 'Menu')}
          </h1>
          <div className="w-12 h-px bg-[#C4A35A] mx-auto mt-6" />
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 sm:px-8 md:px-12 pb-24 sm:pb-32">
        {loading && <LoadingState />}

        {error && (
          <div className="flex flex-col items-center py-20">
            <p className="text-[14px] text-stone-400 mb-4">{error}</p>
            <button
              onClick={fetchMenuData}
              className="text-[13px] text-stone-500 hover:text-stone-700 transition-colors duration-300 underline underline-offset-4 decoration-stone-300"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <AnimatePresence mode="wait">
            {hasAnyItems ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Two-column layout when both columns have items */}
                {leftColumn.length > 0 && rightColumn.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                    {/* Left Column */}
                    <div className="lg:pr-8 lg:border-r lg:border-stone-200/60">
                      {leftColumn.map((category) => (
                        <LoungeMenuSection
                          key={category.id}
                          title={category.name}
                          items={getAllItems(category)}
                        />
                      ))}
                    </div>

                    {/* Right Column */}
                    <div className="lg:pl-8">
                      {rightColumn.map((category) => (
                        <LoungeMenuSection
                          key={category.id}
                          title={category.name}
                          items={getAllItems(category)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Single column centered layout when only one column has items */
                  <div className="max-w-2xl mx-auto">
                    {[...leftColumn, ...rightColumn].map((category) => (
                      <LoungeMenuSection
                        key={category.id}
                        title={category.name}
                        items={getAllItems(category)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <EmptyState />
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Subtle footer decoration */}
      <div className="flex justify-center pb-16">
        <div className="w-8 h-px bg-[#C4A35A]/40" />
      </div>
    </div>
  );
};

export default Menu;
