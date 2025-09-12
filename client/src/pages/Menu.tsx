// src/pages/Menu.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Menu: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Items', icon: '🍽️' },
    { id: 'appetizers', name: 'Appetizers', icon: '🥗' },
    { id: 'mains', name: 'Main Courses', icon: '🍖' },
    { id: 'cocktails', name: 'Cocktails', icon: '🍸' },
    { id: 'wine', name: 'Wine & Spirits', icon: '🍷' },
    { id: 'desserts', name: 'Desserts', icon: '🍰' }
  ];

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-100 to-stone-200 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 to-green-800/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-6">
              Culinary Excellence
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
              Our Curated
              <span className="block text-green-800">Menu</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
              Discover our thoughtfully crafted selection of sustainable cuisine, artisanal cocktails, and premium wines. Every dish tells a story of local sourcing, creative innovation, and timeless flavor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <button className="bg-green-800 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-900 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2">
                  Reserve Your Table
                </button>
              </Link>
              <button className="border-2 border-green-800 text-green-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-800 hover:text-white transition-all duration-300">
                Wine Pairings
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-8 bg-white sticky top-20 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeCategory === category.id
                    ? 'bg-green-800 text-white shadow-lg scale-105'
                    : 'bg-stone-100 text-green-800 hover:bg-green-100 hover:scale-105'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Appetizers Section */}
      <section className={`py-20 bg-stone-50 ${activeCategory !== 'all' && activeCategory !== 'appetizers' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Small Plates & Appetizers</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Artfully crafted starters that awaken your palate and set the stage for an exceptional dining experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src="https://images.unsplash.com/photo-1551782450-17144efb9c50?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Truffle Arancini"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Truffle Arancini</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Crispy risotto spheres infused with black truffle, served with roasted garlic aioli and fresh microgreens
                    </p>
                  </div>
                  <span className="text-green-800 font-bold text-lg ml-4">$18</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full mr-2">Vegetarian</span>
                  <span className="text-yellow-500">⭐ Chef's Signature</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src="https://images.unsplash.com/photo-1563379091139-54f4eb468ced?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Seared Scallops"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Seared Sea Scallops</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Pan-seared diver scallops with cauliflower purée, crispy pancetta, and aged balsamic reduction
                    </p>
                  </div>
                  <span className="text-green-800 font-bold text-lg ml-4">$24</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full mr-2">Gluten Free</span>
                  <span className="text-gray-500">Sustainable Sourced</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Artisanal Charcuterie"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Artisanal Charcuterie</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Curated selection of house-cured meats, artisanal cheeses, seasonal preserves, and toasted sourdough
                    </p>
                  </div>
                  <span className="text-green-800 font-bold text-lg ml-4">$32</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full mr-2">House Made</span>
                  <span className="text-gray-500">Serves 2-3 people</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Tuna Tartare"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Yellowfin Tuna Tartare</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Fresh yellowfin tuna with avocado mousse, cucumber pearls, sesame glass, and citrus ponzu
                    </p>
                  </div>
                  <span className="text-green-800 font-bold text-lg ml-4">$21</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full mr-2">Fresh Daily</span>
                  <span className="text-gray-500">Sashimi Grade</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Courses Section */}
      <section className={`py-20 bg-white ${activeCategory !== 'all' && activeCategory !== 'mains' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Main Courses</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Masterfully prepared entrées celebrating the finest seasonal ingredients and innovative culinary techniques.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-stone-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-stone-200">
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Wagyu Beef"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Wagyu Beef Tenderloin</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      8oz A5 wagyu with roasted bone marrow, heritage vegetables, and burgundy wine reduction
                    </p>
                  </div>
                  <span className="text-green-800 font-bold text-lg ml-4">$68</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full mr-2">Premium</span>
                  <span className="text-yellow-500">🏆 Signature Experience</span>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-stone-200">
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Atlantic Salmon"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Wild Atlantic Salmon</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Cedar plank salmon with quinoa tabbouleh, roasted asparagus, and lemon herb butter
                    </p>
                  </div>
                  <span className="text-green-800 font-bold text-lg ml-4">$34</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full mr-2">Omega-3 Rich</span>
                  <span className="text-gray-500">Wild Caught</span>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-stone-200">
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Rack of Lamb"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Herb-Crusted Rack of Lamb</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      New Zealand lamb with rosemary crust, ratatouille terrine, fondant potato, and mint chimichurri
                    </p>
                  </div>
                  <span className="text-green-800 font-bold text-lg ml-4">$44</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full mr-2">Grass Fed</span>
                  <span className="text-gray-500">Free Range</span>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-stone-200">
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src="https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Lobster Ravioli"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Maine Lobster Ravioli</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      House-made pasta filled with Maine lobster in saffron cream sauce with fresh summer herbs
                    </p>
                  </div>
                  <span className="text-green-800 font-bold text-lg ml-4">$39</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full mr-2">House Made</span>
                  <span className="text-gray-500">Fresh Pasta</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cocktails Section */}
      <section className={`py-20 bg-stone-50 ${activeCategory !== 'all' && activeCategory !== 'cocktails' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Artisanal Cocktails</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Handcrafted libations featuring house-infused spirits, garden-fresh herbs, and innovative flavor combinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={cocktail.image}
                    alt={cocktail.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">{cocktail.icon}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">{cocktail.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {cocktail.description}
                    </p>
                    <span className="text-green-800 font-bold text-xl">{cocktail.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wine & Spirits Section */}
      <section className={`py-20 bg-white ${activeCategory !== 'all' && activeCategory !== 'wine' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Wine & Premium Spirits</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A thoughtfully curated collection of exceptional wines and rare spirits from renowned vineyards and distilleries worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Wine by Glass */}
            <div className="bg-stone-50 rounded-2xl p-8 border border-stone-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Wine by the Glass</h3>
              <div className="space-y-6">
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
                  <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-stone-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-1">{wine.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{wine.region}</p>
                        <p className="text-xs text-gray-500">{wine.description}</p>
                      </div>
                      <span className="text-green-800 font-bold text-lg ml-4">{wine.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Spirits */}
            <div className="bg-stone-50 rounded-2xl p-8 border border-stone-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Premium Spirits</h3>
              <div className="space-y-6">
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
                  <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-stone-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-1">{spirit.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{spirit.type}</p>
                        <p className="text-xs text-gray-500">{spirit.description}</p>
                      </div>
                      <span className="text-green-800 font-bold text-lg ml-4">{spirit.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desserts Section */}
      <section className={`py-20 bg-stone-50 ${activeCategory !== 'all' && activeCategory !== 'desserts' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Sweet Conclusions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Exquisite desserts crafted to provide the perfect finale to your culinary journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={dessert.image}
                    alt={dessert.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{dessert.name}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {dessert.description}
                      </p>
                    </div>
                    <span className="text-green-800 font-bold text-lg ml-4">{dessert.price}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">{dessert.tag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-green-800 to-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Embark on This Culinary Journey?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Reserve your table today and discover why our thoughtfully crafted menu has become the talk of the city.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <button className="bg-white text-green-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-stone-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                Reserve Your Table
              </button>
            </Link>
            <Link to="/events">
              <button className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-green-800 transition-all duration-300">
                Private Dining
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Menu;