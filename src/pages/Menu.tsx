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
    <div className="bg-yellow-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-yellow-50 to-amber-100 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
              Our
              <span className="block text-amber-800">Menu</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
              Discover our carefully curated selection of gourmet dishes, craft cocktails, and premium wines. Each item is prepared with the finest ingredients and expert attention to detail.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <button className="bg-amber-800 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-amber-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Make Reservation
                </button>
              </Link>
              <button className="border-2 border-amber-800 text-amber-800 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-amber-800 hover:text-white transition-all duration-300">
                View Wine List
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-12 bg-white sticky top-16 z-40 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeCategory === category.id
                    ? 'bg-amber-800 text-white shadow-lg'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
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
      <section className={`py-20 bg-yellow-50 ${activeCategory !== 'all' && activeCategory !== 'appetizers' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Appetizers & Small Plates</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Perfect for sharing or starting your culinary journey with us.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Truffle Arancini</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Crispy risotto balls filled with truffle mushrooms, served with roasted garlic aioli and microgreens
                  </p>
                </div>
                <span className="text-amber-800 font-bold text-lg ml-4">$16</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full mr-2">Vegetarian</span>
                <span>🌟 Chef's Favorite</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Seared Scallops</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Pan-seared diver scallops with cauliflower purée, pancetta crisps, and balsamic reduction
                  </p>
                </div>
                <span className="text-amber-800 font-bold text-lg ml-4">$22</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2">Gluten Free</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Charcuterie Board</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Selection of artisanal meats, aged cheeses, seasonal fruits, nuts, and housemade preserves
                  </p>
                </div>
                <span className="text-amber-800 font-bold text-lg ml-4">$28</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span>Serves 2-3 people</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Tuna Tartare</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Fresh yellowfin tuna with avocado, cucumber, sesame seeds, and ponzu dressing on crispy wonton
                  </p>
                </div>
                <span className="text-amber-800 font-bold text-lg ml-4">$19</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full mr-2">Fresh</span>
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
              Expertly prepared dishes featuring the finest seasonal ingredients.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-yellow-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-amber-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Wagyu Beef Tenderloin</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    8oz A5 wagyu with roasted bone marrow, seasonal vegetables, and red wine jus
                  </p>
                </div>
                <span className="text-amber-800 font-bold text-lg ml-4">$65</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full mr-2">Premium</span>
                <span>🏆 Signature Dish</span>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-amber-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Pan-Seared Salmon</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Atlantic salmon with quinoa pilaf, roasted asparagus, and lemon herb butter
                  </p>
                </div>
                <span className="text-amber-800 font-bold text-lg ml-4">$32</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2">Omega-3 Rich</span>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-amber-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Rack of Lamb</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Herb-crusted New Zealand lamb with ratatouille, fondant potato, and mint chimichurri
                  </p>
                </div>
                <span className="text-amber-800 font-bold text-lg ml-4">$42</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full mr-2">Grass Fed</span>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-amber-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Lobster Ravioli</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Handmade pasta filled with Maine lobster in a light saffron cream sauce with fresh herbs
                  </p>
                </div>
                <span className="text-amber-800 font-bold text-lg ml-4">$38</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full mr-2">House Made</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cocktails Section */}
      <section className={`py-20 bg-yellow-50 ${activeCategory !== 'all' && activeCategory !== 'cocktails' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Craft Cocktails</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Artfully crafted cocktails using premium spirits and house-made ingredients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🍸</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Smoky Old Fashioned</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Bourbon, maple syrup, orange bitters, smoked with applewood
                </p>
                <span className="text-amber-800 font-bold text-lg">$16</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🍹</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Garden Gimlet</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Hendrick's gin, elderflower, cucumber, fresh basil, lime
                </p>
                <span className="text-amber-800 font-bold text-lg">$14</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🥃</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Spiced Pear Martini</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Vodka, pear liqueur, cinnamon, lemon, cardamom foam
                </p>
                <span className="text-amber-800 font-bold text-lg">$15</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🍊</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Blood Orange Negroni</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Gin, Campari, sweet vermouth, fresh blood orange
                </p>
                <span className="text-amber-800 font-bold text-lg">$16</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🌿</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Lavender Bee's Knees</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Gin, honey syrup, lemon, lavender, egg white
                </p>
                <span className="text-amber-800 font-bold text-lg">$15</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔥</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Mezcal Paloma</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Mezcal, grapefruit, lime, agave, chili salt rim
                </p>
                <span className="text-amber-800 font-bold text-lg">$17</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wine & Spirits Section */}
      <section className={`py-20 bg-white ${activeCategory !== 'all' && activeCategory !== 'wine' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Wine & Spirits</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Carefully curated selection of wines and premium spirits from around the world.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Wine by Glass */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Wine by the Glass</h3>
              <div className="space-y-4">
                <div className="bg-yellow-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800">Château Margaux</h4>
                      <p className="text-sm text-gray-600">Bordeaux, France 2018</p>
                    </div>
                    <span className="text-amber-800 font-bold">$22</span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800">Kendall-Jackson Chardonnay</h4>
                      <p className="text-sm text-gray-600">California, USA 2020</p>
                    </div>
                    <span className="text-amber-800 font-bold">$14</span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800">Barolo Brunate</h4>
                      <p className="text-sm text-gray-600">Piedmont, Italy 2017</p>
                    </div>
                    <span className="text-amber-800 font-bold">$18</span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800">Moët & Chandon</h4>
                      <p className="text-sm text-gray-600">Champagne, France NV</p>
                    </div>
                    <span className="text-amber-800 font-bold">$16</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Spirits */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Premium Spirits</h3>
              <div className="space-y-4">
                <div className="bg-yellow-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800">Macallan 18</h4>
                      <p className="text-sm text-gray-600">Single Malt Scotch</p>
                    </div>
                    <span className="text-amber-800 font-bold">$45</span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800">Hennessy XO</h4>
                      <p className="text-sm text-gray-600">Cognac</p>
                    </div>
                    <span className="text-amber-800 font-bold">$38</span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800">Clase Azul Reposado</h4>
                      <p className="text-sm text-gray-600">Premium Tequila</p>
                    </div>
                    <span className="text-amber-800 font-bold">$28</span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800">Grey Goose</h4>
                      <p className="text-sm text-gray-600">Premium Vodka</p>
                    </div>
                    <span className="text-amber-800 font-bold">$16</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desserts Section */}
      <section className={`py-20 bg-yellow-50 ${activeCategory !== 'all' && activeCategory !== 'desserts' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Desserts</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sweet endings to complete your perfect dining experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Chocolate Lava Cake</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Warm dark chocolate cake with molten center, vanilla ice cream, and berry compote
                  </p>
                </div>
                <span className="text-amber-800 font-bold text-lg ml-4">$12</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full mr-2">House Favorite</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Crème Brûlée Trio</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Classic vanilla, lavender honey, and espresso crème brûlée with candied orange
                  </p>
                </div>
                <span className="text-amber-800 font-bold text-lg ml-4">$14</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full mr-2">Chef's Special</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Tiramisu</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Traditional Italian dessert with espresso-soaked ladyfingers and mascarpone cream
                  </p>
                </div>
                <span className="text-amber-800 font-bold text-lg ml-4">$11</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full mr-2">Classic</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Seasonal Fruit Tart</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Almond pastry cream tart topped with fresh seasonal fruits and apricot glaze
                  </p>
                </div>
                <span className="text-amber-800 font-bold text-lg ml-4">$10</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2">Seasonal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-amber-800 to-amber-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience Our Menu?
          </h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Join us for an unforgettable dining experience. Reserve your table today and discover why our guests keep coming back.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <button className="bg-white text-amber-800 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                Make Reservation
              </button>
            </Link>
            <Link to="/events">
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-amber-800 transition-colors">
                View Events
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Menu;