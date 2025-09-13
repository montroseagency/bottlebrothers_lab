// client/src/pages/Gallery.tsx - LIGHT THEME VERSION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PremiumHero } from '../components/ui/PremiumHero';
import { GlassmorphicCard } from '../components/ui/GlassmorphicCard';
import { MagneticButton } from '../components/ui/MagneticButton';
import { ParticleField } from '../components/ui/ParticleField';
import { FloatingReservation } from '../components/ui/FloatingReservation';
import { ScrollProgressBar } from '../components/ui/ScrollProgressBar';

const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  const categories = [
    { id: 'all', name: 'All Photos', count: 16 },
    { id: 'interior', name: 'Interior', count: 4 },
    { id: 'food', name: 'Cuisine', count: 4 },
    { id: 'cocktails', name: 'Cocktails', count: 4 },
    { id: 'events', name: 'Events', count: 4 }
  ];

  const galleryImages = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Elegant dining room with warm lighting',
      category: 'interior',
      title: 'Main Dining Area',
      description: 'Our signature dining space with living walls',
      size: 'large'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Truffle arancini appetizer',
      category: 'food',
      title: 'Truffle Arancini',
      description: 'Crispy risotto spheres with black truffle',
      size: 'medium'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Artisanal cocktail with herbs',
      category: 'cocktails',
      title: 'Garden Smash Cocktail',
      description: 'Hendrick\'s gin with fresh garden herbs',
      size: 'tall'
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Private dining room setup',
      category: 'interior',
      title: 'Private Dining Room',
      description: 'Intimate space for special occasions',
      size: 'medium'
    },
    {
      id: 5,
      src: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Pan-seared salmon dish',
      category: 'food',
      title: 'Wild Atlantic Salmon',
      description: 'Cedar plank salmon with seasonal vegetables',
      size: 'medium'
    },
    {
      id: 6,
      src: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Smoky old fashioned cocktail',
      category: 'cocktails',
      title: 'Smoky Old Fashioned',
      description: 'Rye whiskey with applewood smoke',
      size: 'medium'
    },
    {
      id: 7,
      src: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Corporate event setup',
      category: 'events',
      title: 'Corporate Event',
      description: 'Professional gatherings with style',
      size: 'wide'
    },
    {
      id: 8,
      src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Charcuterie board presentation',
      category: 'food',
      title: 'Artisanal Charcuterie',
      description: 'Curated selection of house-cured meats',
      size: 'medium'
    }
  ];

  const filteredImages = selectedCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(image => image.category === selectedCategory);

  // Intersection Observer for staggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setTimeout(() => {
              setVisibleItems(prev => new Set([...prev, index]));
            }, index * 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    const items = document.querySelectorAll('[data-gallery-item]');
    items.forEach(item => observer.observe(item));

    return () => observer.disconnect();
  }, [filteredImages]);

  const ImageCard = ({ image, index }: { image: any; index: number }) => {
    const getSizeClasses = () => {
      switch (image.size) {
        case 'large':
          return 'md:col-span-2 md:row-span-2 h-96 md:h-full';
        case 'wide':
          return 'md:col-span-2 h-64';
        case 'tall':
          return 'md:row-span-2 h-80 md:h-full';
        default:
          return 'h-64';
      }
    };

    return (
      <div
        data-index={index}
        data-gallery-item
        className={`group relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-700 hover:scale-[1.02] hover:z-10 shadow-lg hover:shadow-2xl ${getSizeClasses()} ${
          visibleItems.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        onClick={() => setLightboxImage(image.src)}
      >
        <img 
          src={image.src} 
          alt={image.alt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="absolute bottom-6 left-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <h3 className="font-bold text-lg mb-1">{image.title}</h3>
            <p className="text-green-300 text-sm mb-2">{image.description}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-300">
              <span className="px-2 py-1 bg-black/30 rounded-full">{image.category}</span>
            </div>
          </div>
          
          <div className="absolute top-6 right-6 w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-green-600/80">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>
        
        {/* Category indicator */}
        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span className="bg-green-600/90 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
            {image.category}
          </span>
        </div>
      </div>
    );
  };

  const Lightbox = () => {
    if (!lightboxImage) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setLightboxImage(null)}
      >
        <div className="relative max-w-4xl max-h-[90vh]">
          <img 
            src={lightboxImage} 
            alt="Gallery image" 
            className="w-full h-full object-contain rounded-2xl"
          />
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute -top-12 right-0 text-white hover:text-green-400 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-stone-50 min-h-screen">
      <ScrollProgressBar 
        position="top" 
        style="animated" 
        showPercentage 
        sections={['Gallery', 'Categories', 'Highlights']} 
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-100 to-stone-200 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 to-green-800/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-6">
              Visual Journey
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
              Our
              <span className="block text-green-800">Gallery</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
              Step into our world through these carefully curated moments. Discover the ambiance, artistry, and experiences that define Lounge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <button className="bg-green-800 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-900 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2">
                  Book Your Visit
                </button>
              </Link>
              <Link to="/events">
                <button className="border-2 border-green-800 text-green-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-800 hover:text-white transition-all duration-300">
                  Private Events
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Category Filters */}
      <section className="py-8 bg-white sticky top-20 z-40 border-b border-stone-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <MagneticButton
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`group relative px-8 py-4 rounded-2xl text-sm font-medium transition-all duration-300 overflow-hidden ${
                  selectedCategory === category.id
                    ? 'bg-green-800 text-white shadow-lg scale-105'
                    : 'bg-stone-100 text-gray-700 hover:bg-green-50 hover:text-green-800 hover:scale-105 border border-stone-200'
                }`}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>{category.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    selectedCategory === category.id ? 'bg-white/20' : 'bg-green-100 text-green-700'
                  }`}>
                    {category.count}
                  </span>
                </span>
                
                {selectedCategory !== category.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                )}
              </MagneticButton>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry Gallery Grid */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-max">
            {filteredImages.map((image, index) => (
              <ImageCard key={`${selectedCategory}-${image.id}`} image={image} index={index} />
            ))}
          </div>
          
          {filteredImages.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🖼️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No images in this category</h3>
              <p className="text-gray-600">Try selecting a different category to explore our gallery.</p>
            </div>
          )}
        </div>
      </section>

      {/* Gallery Stats */}
      <section className="py-12 sm:py-16 lg:py-20 bg-stone-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block bg-green-100 text-green-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wide mb-3 sm:mb-4">
              Our Spaces
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
              Experience Our Spaces
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Each corner of Lounge has been designed to create memorable moments and foster meaningful connections.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
                title: "Interior Design",
                description: "Biophilic design elements blend seamlessly with modern luxury, creating an atmosphere that's both sophisticated and naturally calming.",
                stat: "25+",
                statLabel: "Design Elements"
              },
              {
                icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
                title: "Culinary Art",
                description: "Our dishes are crafted not just for taste, but as visual masterpieces that celebrate the beauty of natural ingredients.",
                stat: "50+",
                statLabel: "Signature Dishes"
              },
              {
                icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
                title: "Private Events",
                description: "From intimate celebrations to corporate gatherings, our flexible spaces transform to match your vision perfectly.",
                stat: "120",
                statLabel: "Max Capacity"
              }
            ].map((item, index) => (
              <div key={index} className="p-6 sm:p-8 text-center bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-stone-200">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  {item.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-xs sm:text-sm">
                  {item.description}
                </p>
                <div className="border-t border-stone-200 pt-3 sm:pt-4">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{item.stat}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">{item.statLabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-green-800 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Create Your Own Memories?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join us at Lounge and become part of our story. Every visit creates new moments worth capturing.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <MagneticButton className="bg-white text-green-800 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-stone-100 transition-all duration-300 shadow-xl hover:shadow-2xl">
              <Link to="/contact">Make a Reservation</Link>
            </MagneticButton>
            <MagneticButton className="border-2 border-white text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white hover:text-green-800 transition-all duration-300">
              <Link to="/menu">View Our Menu</Link>
            </MagneticButton>
          </div>
        </div>
      </section>

      <FloatingReservation position="bottom-right" style="compact" showAfterScroll={400} />
      <Lightbox />
    </div>
  );
};

export default Gallery;