// src/pages/Gallery.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Photos' },
    { id: 'interior', name: 'Interior' },
    { id: 'food', name: 'Cuisine' },
    { id: 'cocktails', name: 'Cocktails' },
    { id: 'events', name: 'Events' }
  ];

  const galleryImages = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Elegant dining room with warm lighting',
      category: 'interior',
      title: 'Main Dining Area'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Truffle arancini appetizer',
      category: 'food',
      title: 'Truffle Arancini'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Artisanal cocktail with herbs',
      category: 'cocktails',
      title: 'Garden Smash Cocktail'
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Private dining room setup',
      category: 'interior',
      title: 'Private Dining Room'
    },
    {
      id: 5,
      src: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Pan-seared salmon dish',
      category: 'food',
      title: 'Wild Atlantic Salmon'
    },
    {
      id: 6,
      src: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Smoky old fashioned cocktail',
      category: 'cocktails',
      title: 'Smoky Old Fashioned'
    },
    {
      id: 7,
      src: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Corporate event setup',
      category: 'events',
      title: 'Corporate Event'
    },
    {
      id: 8,
      src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Charcuterie board presentation',
      category: 'food',
      title: 'Artisanal Charcuterie'
    },
    {
      id: 9,
      src: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Elegant martini glass',
      category: 'cocktails',
      title: 'Spiced Pear Martini'
    },
    {
      id: 10,
      src: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Bar area with pendant lights',
      category: 'interior',
      title: 'Artisan Bar'
    },
    {
      id: 11,
      src: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Tiramisu dessert',
      category: 'food',
      title: 'Classic Tiramisu'
    },
    {
      id: 12,
      src: 'https://images.unsplash.com/photo-1519671845924-1fd18db430b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Wedding celebration',
      category: 'events',
      title: 'Wedding Celebration'
    },
    {
      id: 13,
      src: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Chocolate soufflé',
      category: 'food',
      title: 'Dark Chocolate Soufflé'
    },
    {
      id: 14,
      src: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Mezcal cocktail with lime',
      category: 'cocktails',
      title: 'Mezcal Verde'
    },
    {
      id: 15,
      src: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Live music performance',
      category: 'events',
      title: 'Live Jazz Performance'
    },
    {
      id: 16,
      src: 'https://images.unsplash.com/photo-1551218370-daa71ba0c4d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Outdoor terrace seating',
      category: 'interior',
      title: 'Garden Terrace'
    }
  ];

  const filteredImages = selectedCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(image => image.category === selectedCategory);

  return (
    <div className="bg-stone-50 min-h-screen">
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
              Step into our world through these carefully curated moments. Discover the ambiance, artistry, and experiences that define Verdant Lounge.
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

      {/* Category Filters */}
      <section className="py-8 bg-white sticky top-20 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-green-800 text-white shadow-lg scale-105'
                    : 'bg-stone-100 text-green-800 hover:bg-green-100 hover:scale-105'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                  index % 5 === 0 || index % 5 === 3 
                    ? 'md:col-span-2 md:row-span-2' 
                    : ''
                }`}
              >
                <div className="aspect-w-1 aspect-h-1">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                      index % 5 === 0 || index % 5 === 3 
                        ? 'h-96 md:h-full' 
                        : 'h-64'
                    }`}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">{image.title}</h3>
                    <p className="text-sm opacity-90 capitalize">{image.category}</p>
                  </div>
                  <div className="absolute top-6 right-6">
                    <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Highlights */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Highlights
            </span>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Experience Our Spaces
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each corner of Verdant Lounge has been designed to create memorable moments and foster meaningful connections.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-stone-50 rounded-2xl p-8 text-center border border-stone-200">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Interior Design</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Biophilic design elements blend seamlessly with modern luxury, creating an atmosphere that's both sophisticated and naturally calming.
              </p>
              <div className="text-2xl font-bold text-green-800">25+</div>
              <div className="text-sm text-gray-500">Unique Design Elements</div>
            </div>

            <div className="bg-stone-50 rounded-2xl p-8 text-center border border-stone-200">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Culinary Art</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our dishes are crafted not just for taste, but as visual masterpieces that celebrate the beauty of natural ingredients.
              </p>
              <div className="text-2xl font-bold text-green-800">50+</div>
              <div className="text-sm text-gray-500">Signature Dishes</div>
            </div>

            <div className="bg-stone-50 rounded-2xl p-8 text-center border border-stone-200">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Private Events</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                From intimate celebrations to corporate gatherings, our flexible spaces transform to match your vision perfectly.
              </p>
              <div className="text-2xl font-bold text-green-800">120</div>
              <div className="text-sm text-gray-500">Maximum Capacity</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-green-800 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Create Your Own Memories?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join us at Verdant Lounge and become part of our story. Every visit creates new moments worth capturing.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/contact">
              <button className="bg-white text-green-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-stone-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                Make a Reservation
              </button>
            </Link>
            <Link to="/menu">
              <button className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-green-800 transition-all duration-300">
                View Our Menu
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;