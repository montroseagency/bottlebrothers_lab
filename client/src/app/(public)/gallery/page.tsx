'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const GALLERY_CATEGORIES = [
  { id: 'All', label: 'All', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { id: 'Interior', label: 'Interior', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'Food', label: 'Food', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  { id: 'Drinks', label: 'Drinks', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'Events', label: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'Ambiance', label: 'Ambiance', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
];

const GALLERY_ITEMS = [
  { id: 1, category: 'Interior', image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800', title: 'Luxury Lounge Area', tall: false },
  { id: 2, category: 'Drinks', image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800', title: 'Signature Cocktails', tall: true },
  { id: 3, category: 'Food', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', title: 'Gourmet Dishes', tall: false },
  { id: 4, category: 'Events', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800', title: 'Live DJ Performance', tall: true },
  { id: 5, category: 'Interior', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', title: 'VIP Section', tall: false },
  { id: 6, category: 'Drinks', image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', title: 'Premium Cocktails', tall: false },
  { id: 7, category: 'Food', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', title: 'Fine Dining', tall: true },
  { id: 8, category: 'Ambiance', image: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800', title: 'Evening Atmosphere', tall: false },
  { id: 9, category: 'Events', image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800', title: 'Special Celebrations', tall: false },
  { id: 10, category: 'Interior', image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800', title: 'Bar Counter', tall: true },
  { id: 11, category: 'Drinks', image: 'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=800', title: 'Wine Selection', tall: false },
  { id: 12, category: 'Food', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', title: 'Appetizers', tall: false },
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxImage, setLightboxImage] = useState<typeof GALLERY_ITEMS[0] | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const filteredImages = selectedCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === selectedCategory);

  const selectedCategoryData = GALLERY_CATEGORIES.find(c => c.id === selectedCategory);

  const handleImageError = (id: number) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!lightboxImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === lightboxImage.id);
    const newIndex = direction === 'prev'
      ? currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1
      : currentIndex < filteredImages.length - 1 ? currentIndex + 1 : 0;
    setLightboxImage(filteredImages[newIndex]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5f0] via-[#f5f1ea] to-[#ebe5db] py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-[#3d3428] mb-4">
            Our Gallery
          </h1>
          <p className="text-[#6b5d4d] text-lg max-w-2xl mx-auto">
            Experience the atmosphere, cuisine, and unforgettable moments at Bottle Brothers
          </p>
        </div>

        {/* Premium Filter Navigation */}
        <div className="flex justify-center mb-14">
          <nav className="inline-flex items-center gap-1.5 px-2 py-2 bg-[#d4c4b0]/40 backdrop-blur-sm rounded-full border border-[#c9b89d]/30">
            {GALLERY_CATEGORIES.map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 text-sm font-medium tracking-wide rounded-full transition-all duration-250 ease-out ${
                    isActive
                      ? 'bg-[#f5f0e8] text-[#5c4d3c] shadow-sm'
                      : 'text-[#7a6b5a] hover:bg-[#e8dfd2]/50 hover:text-[#5c4d3c]'
                  }`}
                >
                  <svg
                    className={`w-4 h-4 transition-colors duration-250 ${isActive ? 'text-[#8b7355]' : 'text-[#9a8b7a]'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={category.icon} />
                  </svg>
                  <span>{category.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <motion.div layout className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          <AnimatePresence>
            {filteredImages.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`break-inside-avoid group cursor-pointer ${item.tall ? 'h-96' : 'h-64'}`}
                onClick={() => setLightboxImage(item)}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-luxury transition-all duration-500 hover:-translate-y-2">
                  {!imageErrors[item.id] ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={() => handleImageError(item.id)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <span className="text-6xl">🖼️</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-white font-bold text-lg mb-1">{item.title}</p>
                      <p className="text-white/80 text-sm">{item.category}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors z-10"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
              className="absolute left-6 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors z-10"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
              className="absolute right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors z-10"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={lightboxImage.image}
                  alt={lightboxImage.title}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <h3 className="text-white font-bold text-2xl mb-2">{lightboxImage.title}</h3>
                <p className="text-white/80">{lightboxImage.category}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
