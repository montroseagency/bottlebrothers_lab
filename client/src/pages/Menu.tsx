// client/src/pages/Menu.tsx - DYNAMIC VERSION WITH API INTEGRATION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../services/api';
import type { MenuCategory, MenuItem } from '../services/api';

interface CategoryWithItems extends MenuCategory {
  menu_items: MenuItem[];
}

const Menu: React.FC = () => {
  const { t } = useTranslation();
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
      setCategories(
        menuData.map(category => ({
          ...category,
          menu_items: category.menu_items ?? []
        }))
      );
      setError(null);
    } catch (error) {
      console.error('Failed to fetch menu data:', error);
      setError('Failed to load menu. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const categoryMap = {
    'appetizers': { name: t('appetizers'), icon: '🥗' },
    'mains': { name: t('mains'), icon: '🍖' },
    'cocktails': { name: t('cocktails'), icon: '🍸' },
    'wine': { name: t('wine'), icon: '🍷' },
    'desserts': { name: t('desserts'), icon: '🍰' },
    'beverages': { name: t('beverages'), icon: '☕' },
    'specials': { name: t('specials'), icon: '⭐' },
  };

  const dynamicCategories = [
    { id: 'all', name: t('all'), icon: '🍽️' },
    ...categories.map(category => ({
      id: category.category_type,
      name: categoryMap[category.category_type as keyof typeof categoryMap]?.name || category.name,
      icon: category.icon || categoryMap[category.category_type as keyof typeof categoryMap]?.icon || '🍴'
    }))
  ];

  const getDisplayName = (item: MenuItem) => item.name;
  const getDisplayDescription = (item: MenuItem) => item.description;
  const getDisplayPrice = (item: MenuItem) => item.formatted_price;

  const getDietaryBadges = (item: MenuItem) => {
    const badges = [];
    if (item.dietary_info.includes('vegetarian')) badges.push('Vegetarian');
    if (item.dietary_info.includes('vegan')) badges.push('Vegan');
    if (item.dietary_info.includes('gluten_free')) badges.push('Gluten Free');
    if (item.dietary_info.includes('dairy_free')) badges.push('Dairy Free');
    return badges;
  };

  const getTagBadges = (item: MenuItem) => {
    const tagMap = {
      'signature': "Chef's Signature",
      'popular': 'Popular Choice',
      'new': 'New Item',
      'seasonal': 'Seasonal',
      'house_made': 'House Made',
      'locally_sourced': 'Locally Sourced',
      'organic': 'Organic',
      'sustainable': 'Sustainably Sourced',
      'premium': 'Premium'
    };
    return item.tags.map(tag => tagMap[tag as keyof typeof tagMap] || tag);
  };

  if (loading) {
    return (
      <div className="bg-stone-50 min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-stone-100 to-stone-200 py-16 sm:py-20 lg:py-32 xl:py-40">
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 to-green-800/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-5xl mx-auto">
              <div className="animate-pulse">
                <div className="h-4 bg-green-200 rounded-full w-32 mx-auto mb-6"></div>
                <div className="h-16 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
                <div className="h-8 bg-gray-200 rounded w-full mx-auto mb-10"></div>
                <div className="flex justify-center space-x-4">
                  <div className="h-12 bg-green-200 rounded-full w-32"></div>
                  <div className="h-12 bg-gray-200 rounded-full w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Loading Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="text-gray-600">Loading our delicious menu...</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-stone-50 min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-stone-100 to-stone-200 py-16 sm:py-20 lg:py-32 xl:py-40">
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 to-green-800/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-5xl mx-auto">
              <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4 sm:mb-6">
                {t('menu.badge')}
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
                {t('menu.title')}
                <span className="block text-green-800">{t('menu.menu')}</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
                {t('menu.subtitle')}
              </p>
            </div>
          </div>
        </section>
        
        {/* Error Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-lg mx-auto">
                <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Menu</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchMenuData}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero Section - Mobile First */}
      <section className="relative bg-gradient-to-br from-stone-100 to-stone-200 py-16 sm:py-20 lg:py-32 xl:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 to-green-800/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4 sm:mb-6">
              {t('menu.badge')}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
              {t('menu.title')}
              <span className="block text-green-800">{t('menu.menu')}</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
              {t('menu.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 sm:px-0">
              <Link to="/contact">
                <button className="w-full sm:w-auto bg-green-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-green-900 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2">
                  {t('menu.reserveTable')}
                </button>
              </Link>
              <button className="w-full sm:w-auto border-2 border-green-800 text-green-800 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-green-800 hover:text-white transition-all duration-300">
                {t('menu.winePairings')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Categories - Enhanced Sticky Navigation */}
      <section className="py-4 sm:py-6 lg:py-8 bg-white sticky top-16 sm:top-20 z-40 shadow-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4">
            {dynamicCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-1 sm:space-x-2 ${
                  activeCategory === category.id
                    ? 'bg-green-800 text-white shadow-lg scale-105'
                    : 'bg-stone-100 text-green-800 hover:bg-green-100 hover:scale-105'
                }`}
              >
                <span className="text-base sm:text-lg">{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Menu Sections */}
      {categories.map((category) => (
        <section 
          key={category.id}
          className={`py-16 sm:py-20 lg:py-24 ${
            category.category_type === 'appetizers' || category.category_type === 'cocktails' || category.category_type === 'desserts' 
              ? 'bg-stone-50' 
              : 'bg-white'
          } ${
            activeCategory !== 'all' && activeCategory !== category.category_type ? 'hidden' : ''
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center justify-center space-x-3">
                <span className="text-4xl">{category.icon}</span>
                <span>{category.name}</span>
              </h2>
              {category.description && (
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                  {category.description}
                </p>
              )}
            </div>

            <div className={`grid ${
              category.category_type === 'cocktails' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : category.category_type === 'wine'
                  ? 'grid-cols-1 lg:grid-cols-2'
                  : 'grid-cols-1 md:grid-cols-2'
            } gap-6 sm:gap-8`}>
              {category.menu_items.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`group rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden ${
                    category.category_type === 'appetizers' || category.category_type === 'desserts'
                      ? 'bg-white'
                      : category.category_type === 'cocktails'
                        ? 'bg-white'
                        : category.category_type === 'wine'
                          ? 'bg-stone-50 border border-stone-200'
                          : 'bg-stone-50 border border-stone-200'
                  }`}
                >
                  {/* Image for non-wine items */}
                  {category.category_type !== 'wine' && item.image_url && (
                    <div className="aspect-w-16 aspect-h-9">
                      <img 
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Hide image if it fails to load
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className={`p-4 sm:p-6 space-y-4 ${
                    category.category_type === 'cocktails' && !item.image_url ? 'text-center' : ''
                  }`}>
                    {/* Cocktail icon for items without images */}
                    {category.category_type === 'cocktails' && !item.image_url && (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-green-200 transition-colors duration-300">
                        <span className="text-xl sm:text-2xl transform group-hover:scale-110 transition-transform duration-300">🍸</span>
                      </div>
                    )}

                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-green-800 transition-colors duration-300 mb-2">
                          {getDisplayName(item)}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {getDisplayDescription(item)}
                        </p>
                        
                        {/* Ingredients for wine */}
                        {item.ingredients && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            {item.ingredients}
                          </p>
                        )}
                        
                        {/* Allergens */}
                        {item.allergens && (
                          <p className="text-xs text-red-600 mt-1">
                            <strong>Allergens:</strong> {item.allergens}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <span className="text-green-800 font-bold text-lg sm:text-xl flex-shrink-0">
                          {getDisplayPrice(item)}
                        </span>
                        
                        {/* Variants for wine */}
                        {item.has_variants && item.variants && item.variants.length > 0 && (
                          <div className="text-right">
                            {item.variants.map((variant) => (
                              <div key={variant.id} className="text-sm text-gray-600">
                                <span className="font-medium">{variant.name}:</span> ${variant.price}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Tags and Dietary Info */}
                    <div className="flex flex-wrap gap-2">
                      {getDietaryBadges(item).map((badge, badgeIndex) => (
                        <span key={badgeIndex} className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                          {badge}
                        </span>
                      ))}
                      {getTagBadges(item).map((badge, badgeIndex) => (
                        <span key={badgeIndex} className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                          {badge}
                        </span>
                      ))}
                      {item.is_featured && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    
                    {/* Additional Info */}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      {item.calories && (
                        <span>{item.calories} cal</span>
                      )}
                      {item.preparation_time && (
                        <span>Prep: {item.preparation_time}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Empty State */}
      {categories.length === 0 && (
        <section className="py-16 sm:py-20 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-lg mx-auto">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Menu Coming Soon</h3>
                <p className="text-gray-600">Our culinary team is crafting an amazing menu experience for you.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action - Enhanced Responsive */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-green-800 to-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            {t('ctaTitle')}
          </h2>
          <p className="text-lg sm:text-xl text-green-100 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <Link to="/contact">
              <button className="w-full sm:w-auto bg-white text-green-800 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-stone-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                {t('reserve')}
              </button>
            </Link>
            <Link to="/events">
              <button className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-white hover:text-green-800 transition-all duration-300">
                {t('privateDining')}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Menu;