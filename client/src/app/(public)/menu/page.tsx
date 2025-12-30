'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MenuFilters } from '@/components/menu/MenuFilters';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import { MenuItemModal } from '@/components/menu/MenuItemModal';
import { getMenuCategories, getMenuItems, MenuItem, MenuCategory } from '@/lib/api';

export default function MenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [categoriesData, itemsData] = await Promise.all([
          getMenuCategories(),
          getMenuItems({ is_available: true }),
        ]);
        setCategories(categoriesData);
        setAllItems(itemsData.results);
        setFilteredItems(itemsData.results);
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter items whenever filters change
  useEffect(() => {
    let filtered = [...allItems];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => {
        const category = typeof item.category === 'string' ? item.category : item.category.id;
        return category === selectedCategory;
      });
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Dietary filter
    if (selectedDietary.length > 0) {
      filtered = filtered.filter((item) =>
        selectedDietary.some((dietary) => item.dietary_info?.includes(dietary))
      );
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((item) =>
        selectedTags.some((tag) => item.tags?.includes(tag))
      );
    }

    setFilteredItems(filtered);
  }, [selectedCategory, searchTerm, selectedDietary, selectedTags, allItems]);

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
              <p className="mt-4 text-neutral-600">Loading menu...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Our <span className="text-primary-400">Menu</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-200 max-w-3xl mx-auto">
              Discover our carefully curated selection of culinary masterpieces
            </p>
          </motion.div>
        </div>
      </section>

      {/* Menu Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Tabs */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex gap-2 pb-4">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                All Items
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-white text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {category.icon && <span className="mr-2">{category.icon}</span>}
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <MenuFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedDietary={selectedDietary}
            onDietaryChange={setSelectedDietary}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-neutral-600">
              Showing <span className="font-semibold text-neutral-900">{filteredItems.length}</span> items
              {selectedCategory !== 'all' && (
                <span>
                  {' '}
                  in <span className="font-semibold text-neutral-900">{categories.find((c) => c.id === selectedCategory)?.name}</span>
                </span>
              )}
            </p>
          </div>

          {/* Menu Items Grid/List */}
          {filteredItems.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-6'
              }
            >
              {filteredItems.map((item) => (
                <MenuItemCard key={item.id} item={item} viewMode={viewMode} onSelect={handleItemClick} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">No items found</h3>
              <p className="text-neutral-600 mb-6">Try adjusting your filters or search term</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDietary([]);
                  setSelectedTags([]);
                  setSelectedCategory('all');
                }}
                className="px-6 py-3 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Item Detail Modal */}
      <MenuItemModal item={selectedItem} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
