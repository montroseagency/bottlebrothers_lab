// client/src/pages/Gallery.tsx - WITH TRANSLATIONS
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
// Import the GalleryItem type from your API service
import { GalleryItem } from '../services/api';
import { apiClient } from '../services/api';
import { MagneticButton } from '../components/ui/MagneticButton';

interface GalleryPageProps {}

export const GalleryPage: React.FC<GalleryPageProps> = () => {
  const { t } = useTranslation();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});

  const categories = [
    { value: 'all', label: t('gallery.categories.all') },
    { value: 'food', label: t('gallery.categories.food') },
    { value: 'interior', label: t('gallery.categories.interior') },
    { value: 'events', label: t('gallery.categories.events') },
    { value: 'cocktails', label: t('gallery.categories.cocktails') },
    { value: 'atmosphere', label: 'Atmosphere' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredItems(galleryItems);
    } else {
      setFilteredItems(galleryItems.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, galleryItems]);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      setError('');
      const items = await apiClient.getPublicGalleryItems();
      setGalleryItems(items);
      setFilteredItems(items);
    } catch (error) {
      setError('Failed to load gallery images. Please try again later.');
      console.error('Gallery fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = (itemId: string) => {
    setImageLoading(prev => ({ ...prev, [itemId]: false }));
  };

  const handleImageLoadStart = (itemId: string) => {
    setImageLoading(prev => ({ ...prev, [itemId]: true }));
  };

  const openModal = (item: GalleryItem) => {
    setSelectedImage(item);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  // Close modal with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    
    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedImage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-stone-900 to-green-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-green-50 relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-100 to-stone-200 py-16 sm:py-20 lg:py-32 xl:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 to-green-800/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4 sm:mb-6">
              {t('gallery.hero.badge')}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
              {t('gallery.hero.title.our')}
              <span className="block text-green-800">{t('gallery.hero.title.gallery')}</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
              {t('gallery.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 sm:px-0">
              <MagneticButton className="w-full sm:w-auto bg-green-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-green-900 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2">
                <Link to="/contact" className="block w-full text-center">{t('gallery.hero.buttons.bookVisit')}</Link>
              </MagneticButton>
              <MagneticButton className="w-full sm:w-auto border-2 border-green-800 text-green-800 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-green-800 hover:text-white transition-all duration-300">
                <Link to="/events" className="block w-full text-center">{t('gallery.hero.buttons.privateEvents')}</Link>
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 py-16 sm:py-20">
        {/* Filter Tabs */}
        <div className="max-w-6xl mx-auto mb-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const itemCount = category.value === 'all' 
                ? galleryItems.length 
                : galleryItems.filter(item => item.category === category.value).length;
              
              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    selectedCategory === category.value
                      ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                      : 'bg-white/80 text-green-800 border border-green-200 hover:bg-green-50 backdrop-blur-sm'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>{category.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedCategory === category.value
                        ? 'bg-white/20'
                        : 'bg-green-100'
                    }`}>
                      {itemCount}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-6xl mx-auto mb-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 mb-4">{t('common.error')}</p>
              <button
                onClick={fetchGalleryItems}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {t('common.tryAgain')}
              </button>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {filteredItems.length === 0 && !error ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <svg className="w-20 h-20 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">{t('gallery.noImages.title')}</h3>
              <p className="text-gray-500">
                {selectedCategory === 'all' 
                  ? t('gallery.noImages.subtitle')
                  : t('gallery.noImages.subtitle')
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl border border-stone-200 hover:border-green-300 transition-all duration-500 cursor-pointer ${
                    item.is_featured ? 'lg:col-span-2 lg:row-span-2' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                  onClick={() => openModal(item)}
                >
                  {/* Image Container */}
                  <div className={`relative overflow-hidden ${
                    item.is_featured ? 'h-96 lg:h-full' : 'h-64'
                  }`}>
                    {imageLoading[item.id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
                      </div>
                    )}
                    
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      onLoadStart={() => handleImageLoadStart(item.id)}
                      onLoad={() => handleImageLoad(item.id)}
                      loading="lazy"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Featured Badge */}
                    {item.is_featured && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          Featured
                        </span>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-600/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                        {categories.find(c => c.value === item.category)?.label}
                      </span>
                    </div>
                    
                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white font-bold text-lg mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        {item.title}
                      </h3>
                      <p className="text-gray-200 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200 line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    {/* Hover Icon */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-white mt-16 sm:mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
              <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
                {t('gallery.stats.badge')}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">
                {t('gallery.stats.title')}
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                {t('gallery.stats.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
              {[
                {
                  titleKey: 'interiorDesign',
                  descriptionKey: 'interiorDesign',
                  statKey: 'interiorDesign'
                },
                {
                  titleKey: 'culinaryArt',
                  descriptionKey: 'culinaryArt', 
                  statKey: 'culinaryArt'
                },
                {
                  titleKey: 'privateEvents',
                  descriptionKey: 'privateEvents',
                  statKey: 'privateEvents'
                }
              ].map((item, index) => (
                <div key={index} className="text-center p-6 sm:p-8 bg-stone-50 rounded-2xl shadow-lg border border-stone-200">
                  <div className="mb-6">
                    <div className="text-4xl sm:text-5xl font-bold text-green-800 mb-2">
                      {t(`gallery.stats.${item.statKey}.stat`)}
                    </div>
                    <div className="text-sm text-green-600 font-semibold uppercase tracking-wide">
                      {t(`gallery.stats.${item.statKey}.statLabel`)}
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                    {t(`gallery.stats.${item.titleKey}.title`)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t(`gallery.stats.${item.descriptionKey}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-green-800 to-green-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              {t('gallery.cta.title')}
            </h2>
            <p className="text-lg sm:text-xl text-green-100 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('gallery.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <MagneticButton className="w-full sm:w-auto bg-white text-green-800 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-stone-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                <Link to="/contact" className="block text-center">{t('gallery.cta.buttons.makeReservation')}</Link>
              </MagneticButton>
              <MagneticButton className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-white hover:text-green-800 transition-all duration-300">
                <Link to="/menu" className="block text-center">{t('gallery.cta.buttons.viewMenu')}</Link>
              </MagneticButton>
            </div>
          </div>
        </section>

        {/* Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4">
            <div className="relative max-w-6xl max-h-full w-full">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                aria-label={t('gallery.lightbox.close')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Image */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20">
                <div className="relative">
                  <img
                    src={selectedImage.image_url}
                    alt={selectedImage.title}
                    className="w-full max-h-[70vh] object-contain"
                  />
                </div>
                
                {/* Image Info */}
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-white mb-2">{selectedImage.title}</h2>
                      <span className="inline-block bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                        {categories.find(c => c.value === selectedImage.category)?.label}
                      </span>
                    </div>
                    {selectedImage.is_featured && (
                      <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed">{selectedImage.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Default export
export default GalleryPage;