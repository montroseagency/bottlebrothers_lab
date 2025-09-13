// src/pages/Menu.tsx - PROFESSIONAL RESPONSIVE VERSION
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Menu: React.FC = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: t('all'), icon: '🍽️' },
    { id: 'appetizers', name: t('appetizers'), icon: '🥗' },
    { id: 'mains', name: t('mains'), icon: '🍖' },
    { id: 'cocktails', name: t('cocktails'), icon: '🍸' },
    { id: 'wine', name: t('wine'), icon: '🍷' },
    { id: 'desserts', name: t('desserts'), icon: '🍰' }
  ];

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
            {categories.map((category) => (
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

      {/* Appetizers Section - Enhanced Responsive Cards */}
      <section className={`py-16 sm:py-20 lg:py-24 bg-stone-50 ${activeCategory !== 'all' && activeCategory !== 'appetizers' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">{t('appetizers')}</h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              {t('appetizersSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[
              {
                name: "Truffle Arancini",
                description: "Crispy risotto spheres infused with black truffle, served with roasted garlic aioli and fresh microgreens",
                price: "$18",
                image: "https://images.unsplash.com/photo-1551782450-17144efb9c50?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                tags: ["Vegetarian", "Chef's Signature"]
              },
              {
                name: "Seared Sea Scallops",
                description: "Pan-seared diver scallops with cauliflower purée, crispy pancetta, and aged balsamic reduction",
                price: "$24",
                image: "https://images.unsplash.com/photo-1563379091139-54f4eb468ced?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                tags: ["Gluten Free", "Sustainable Sourced"]
              },
              {
                name: "Artisanal Charcuterie",
                description: "Curated selection of house-cured meats, artisanal cheeses, seasonal preserves, and toasted sourdough",
                price: "$32",
                image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                tags: ["House Made", "Serves 2-3 people"]
              },
              {
                name: "Yellowfin Tuna Tartare",
                description: "Fresh yellowfin tuna with avocado mousse, cucumber pearls, sesame glass, and citrus ponzu",
                price: "$21",
                image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                tags: ["Fresh Daily", "Sashimi Grade"]
              }
            ].map((item, index) => (
              <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={item.image}
                    alt={item.name}
                    className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-green-800 transition-colors duration-300 mb-2">{item.name}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-green-800 font-bold text-lg sm:text-xl flex-shrink-0">{item.price}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Courses Section - Enhanced Layout */}
      <section className={`py-16 sm:py-20 lg:py-24 bg-white ${activeCategory !== 'all' && activeCategory !== 'mains' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">{t('mains')}</h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              {t('mainsSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[
              {
                name: "Wagyu Beef Tenderloin",
                description: "8oz A5 wagyu with roasted bone marrow, heritage vegetables, and burgundy wine reduction",
                price: "$68",
                image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                tags: ["Premium", "🏆 Signature Experience"]
              },
              {
                name: "Wild Atlantic Salmon",
                description: "Cedar plank salmon with quinoa tabbouleh, roasted asparagus, and lemon herb butter",
                price: "$34",
                image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                tags: ["Omega-3 Rich", "Wild Caught"]
              },
              {
                name: "Herb-Crusted Rack of Lamb",
                description: "New Zealand lamb with rosemary crust, ratatouille terrine, fondant potato, and mint chimichurri",
                price: "$44",
                image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                tags: ["Grass Fed", "Free Range"]
              },
              {
                name: "Maine Lobster Ravioli",
                description: "House-made pasta filled with Maine lobster in saffron cream sauce with fresh summer herbs",
                price: "$39",
                image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                tags: ["House Made", "Fresh Pasta"]
              }
            ].map((item, index) => (
              <div key={index} className="group bg-stone-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-stone-200">
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={item.image}
                    alt={item.name}
                    className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-green-800 transition-colors duration-300 mb-2">{item.name}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-green-800 font-bold text-lg sm:text-xl flex-shrink-0">{item.price}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cocktails Section - Enhanced Grid */}
      <section className={`py-16 sm:py-20 lg:py-24 bg-stone-50 ${activeCategory !== 'all' && activeCategory !== 'cocktails' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">{t('cocktails')}</h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              {t('cocktailsSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: "Garden Smash",
                description: "Hendrick's gin, elderflower, cucumber, fresh basil, lime",
                price: "$16",
                image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                icon: "🌿"
              },
              {
                name: "Smoky Sage Old Fashioned",
                description: "Rye whiskey, sage honey, orange bitters, applewood smoke",
                price: "$18",
                image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                icon: "🥃"
              },
              {
                name: "Lavender Moon",
                description: "Gin, lavender syrup, lemon, egg white, dried lavender",
                price: "$17",
                image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                icon: "🌙"
              },
              {
                name: "Blood Orange Negroni",
                description: "Gin, Campari, sweet vermouth, fresh blood orange",
                price: "$16",
                image: "https://images.unsplash.com/photo-1544145775-112b4ac1cd83?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                icon: "🍊"
              },
              {
                name: "Spiced Pear Martini",
                description: "Vodka, pear liqueur, cinnamon, lemon, cardamom foam",
                price: "$17",
                image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                icon: "🍸"
              },
              {
                name: "Mezcal Verde",
                description: "Mezcal, lime, agave, jalapeño, cilantro, chili salt",
                price: "$19",
                image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                icon: "🌶️"
              }
            ].map((cocktail, index) => (
              <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={cocktail.image}
                    alt={cocktail.name}
                    className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="text-center space-y-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-green-200 transition-colors duration-300">
                      <span className="text-xl sm:text-2xl transform group-hover:scale-110 transition-transform duration-300">{cocktail.icon}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-green-800 transition-colors duration-300">{cocktail.name}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                      {cocktail.description}
                    </p>
                    <span className="text-green-800 font-bold text-lg sm:text-xl">{cocktail.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wine & Spirits Section - Enhanced Two-Column Layout */}
      <section className={`py-16 sm:py-20 lg:py-24 bg-white ${activeCategory !== 'all' && activeCategory !== 'wine' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">{t('wine')}</h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              {t('wineSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            
            {/* Wine by Glass */}
            <div className="bg-stone-50 rounded-2xl p-6 sm:p-8 border border-stone-200">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">{t('byGlass')}</h3>
              <div className="space-y-4 sm:space-y-6">
                {[
                  {
                    name: "Domaine de la Côte Chardonnay",
                    region: "Santa Barbara County, CA 2021",
                    price: "$18",
                    description: "Crisp, mineral-driven with citrus notes"
                  },
                  {
                    name: "Château Margaux",
                    region: "Bordeaux, France 2018",
                    price: "$28",
                    description: "Full-bodied with dark fruit and tannins"
                  },
                  {
                    name: "Barolo Brunate",
                    region: "Piedmont, Italy 2017",
                    price: "$22",
                    description: "Complex with cherry, earth, and spice"
                  },
                  {
                    name: "Dom Pérignon",
                    region: "Champagne, France 2012",
                    price: "$35",
                    description: "Elegant bubbles with toasted brioche"
                  }
                ].map((wine, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow border border-stone-100">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-sm sm:text-base mb-1">{wine.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{wine.region}</p>
                        <p className="text-xs text-gray-500">{wine.description}</p>
                      </div>
                      <span className="text-green-800 font-bold text-base sm:text-lg self-start sm:ml-4">{wine.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Spirits */}
            <div className="bg-stone-50 rounded-2xl p-6 sm:p-8 border border-stone-200">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">{t('premiumSpirits')}</h3>
              <div className="space-y-4 sm:space-y-6">
                {[
                  {
                    name: "Macallan 25 Year",
                    type: "Single Malt Scotch Whisky",
                    price: "$85",
                    description: "Rich, complex with dried fruits and spice"
                  },
                  {
                    name: "Hennessy Paradis",
                    type: "Extra Cognac",
                    price: "$65",
                    description: "Smooth, floral with hints of honey"
                  },
                  {
                    name: "Clase Azul Ultra",
                    type: "Premium Añejo Tequila",
                    price: "$45",
                    description: "Silky, complex with agave and vanilla"
                  },
                  {
                    name: "Beluga Gold Line",
                    type: "Premium Vodka",
                    price: "$28",
                    description: "Exceptionally smooth and pure"
                  }
                ].map((spirit, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow border border-stone-100">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-sm sm:text-base mb-1">{spirit.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{spirit.type}</p>
                        <p className="text-xs text-gray-500">{spirit.description}</p>
                      </div>
                      <span className="text-green-800 font-bold text-base sm:text-lg self-start sm:ml-4">{spirit.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desserts Section - Enhanced Card Layout */}
      <section className={`py-16 sm:py-20 lg:py-24 bg-stone-50 ${activeCategory !== 'all' && activeCategory !== 'desserts' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">{t('desserts')}</h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              {t('dessertsSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[
              {
                name: "Dark Chocolate Soufflé",
                description: "Warm chocolate soufflé with vanilla bean ice cream and raspberry coulis",
                price: "$14",
                image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                tag: "House Favorite"
              },
              {
                name: "Lavender Crème Brûlée",
                description: "Classic French custard infused with lavender honey and torched sugar crust",
                price: "$12",
                image: "https://images.unsplash.com/photo-1536303006682-2ee36ba49592?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                tag: "Chef's Special"
              },
              {
                name: "Seasonal Fruit Tarte",
                description: "Almond pastry cream tart with fresh seasonal fruits and apricot glaze",
                price: "$11",
                image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                tag: "Seasonal"
              },
              {
                name: "Espresso Tiramisu",
                description: "Traditional Italian dessert with house-made mascarpone and espresso-soaked ladyfingers",
                price: "$13",
                image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                tag: "Classic"
              }
            ].map((dessert, index) => (
              <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={dessert.image}
                    alt={dessert.name}
                    className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-green-800 transition-colors duration-300 mb-2">{dessert.name}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {dessert.description}
                      </p>
                    </div>
                    <span className="text-green-800 font-bold text-lg sm:text-xl flex-shrink-0">{dessert.price}</span>
                  </div>
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs sm:text-sm">{dessert.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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