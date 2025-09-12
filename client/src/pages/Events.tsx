// src/pages/Events.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Events: React.FC = () => {
  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-100 to-stone-200 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 to-green-800/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-6">
              Memorable Occasions
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
              Extraordinary
              <span className="block text-green-800">Events</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
              From intimate gatherings to grand celebrations, Lounge provides the perfect setting for life's most meaningful moments. Experience world-class hospitality in an atmosphere of natural elegance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <button className="bg-green-800 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-900 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2">
                  Plan Your Event
                </button>
              </Link>
              <button className="border-2 border-green-800 text-green-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-800 hover:text-white transition-all duration-300">
                View Calendar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              What's Coming
            </span>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Upcoming Events
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join us for these carefully curated experiences that celebrate culture, cuisine, and community.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Featured Event */}
            <div className="lg:col-span-2 bg-gradient-to-r from-green-800 to-green-700 rounded-3xl overflow-hidden shadow-2xl">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2">
                  <img 
                    src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Jazz and Wine Night"
                    className="w-full h-64 lg:h-full object-cover"
                  />
                </div>
                <div className="lg:w-1/2 p-8 lg:p-12 text-white flex flex-col justify-center">
                  <div className="inline-block bg-green-600 px-4 py-2 rounded-full text-sm font-semibold mb-6 self-start">
                    Featured Event
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold mb-4">Jazz & Wine Evening</h3>
                  <p className="text-green-100 mb-6 text-lg leading-relaxed">
                    An enchanting evening featuring smooth jazz performances by renowned local artists, perfectly paired with our sommelier's selection of premium wines and artisanal small plates.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 text-green-100 mb-6">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Friday, December 15th
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      7:00 PM - 11:00 PM
                    </div>
                  </div>
                  <button className="bg-white text-green-800 px-8 py-3 rounded-full font-semibold hover:bg-stone-100 transition-colors self-start">
                    Reserve Your Spot - $45
                  </button>
                </div>
              </div>
            </div>

            {/* Regular Events */}
            {[
              {
                title: "Live Acoustic Sessions",
                description: "Intimate performances featuring emerging singer-songwriters and acoustic artists.",
                schedule: "Every Thursday",
                time: "8:00 PM - 10:00 PM",
                price: "No Cover",
                image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              },
              {
                title: "Weekend DJ Sets",
                description: "Dance the night away with curated playlists spanning genres from house to classic favorites.",
                schedule: "Friday & Saturday",
                time: "9:00 PM - 2:00 AM",
                price: "$10 Cover",
                image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              },
              {
                title: "Mixology Masterclass",
                description: "Learn the art of cocktail crafting from our expert bartenders in this hands-on workshop.",
                schedule: "First Wednesday",
                time: "6:00 PM - 8:00 PM",
                price: "$65 per person",
                image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              },
              {
                title: "Wine Appreciation Evening",
                description: "Guided tasting of exceptional wines paired with specially selected appetizers.",
                schedule: "Second Tuesday",
                time: "7:30 PM - 9:30 PM",
                price: "$55 per person",
                image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              }
            ].map((event, index) => (
              <div key={index} className="bg-stone-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-stone-200">
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-3">{event.title}</h4>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <p className="font-semibold text-green-800">{event.schedule}</p>
                      <p>{event.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-800 font-bold mb-2">{event.price}</p>
                      <button className="bg-green-800 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-900 transition-colors">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Event Types
            </span>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Occasions We Celebrate
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our versatile spaces and experienced team transform to accommodate every type of gathering and celebration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎵",
                title: "Live Entertainment",
                description: "From intimate jazz quartets to acoustic soloists, we curate performances that enhance your dining experience without overwhelming conversation.",
                features: ["Professional sound system", "Intimate stage setting", "Diverse musical genres"]
              },
              {
                icon: "🏢",
                title: "Corporate Events",
                description: "Sophisticated venue perfect for business meetings, product launches, networking events, and corporate celebrations.",
                features: ["AV equipment available", "Private dining options", "Professional service team"]
              },
              {
                icon: "💝",
                title: "Private Celebrations",
                description: "Create unforgettable memories for birthdays, anniversaries, engagements, and other milestone occasions.",
                features: ["Customizable décor", "Personalized menus", "Dedicated event coordinator"]
              },
              {
                icon: "🍷",
                title: "Wine & Spirit Events",
                description: "Educational tastings, pairing dinners, and exclusive releases featuring premium wines and craft spirits.",
                features: ["Expert sommelier guidance", "Curated selections", "Food pairings included"]
              },
              {
                icon: "🎨",
                title: "Cultural Events",
                description: "Art exhibitions, book launches, poetry readings, and other cultural celebrations that enrich our community.",
                features: ["Gallery wall space", "Flexible seating", "Intimate atmosphere"]
              },
              {
                icon: "🌟",
                title: "Seasonal Celebrations",
                description: "Holiday parties, seasonal menu launches, and themed events that celebrate the changing seasons.",
                features: ["Seasonal decorations", "Special menus", "Festive atmosphere"]
              }
            ].map((eventType, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">{eventType.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{eventType.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {eventType.description}
                  </p>
                </div>
                <div className="space-y-2">
                  {eventType.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-800 rounded-full mr-3"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Private Events Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1519671845924-1fd18db430b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Private Event Space"
                  className="w-full h-96 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-green-800 text-white p-6 rounded-2xl shadow-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-sm opacity-90">Events Hosted</div>
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-6">
                Private Events
              </span>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Your Vision, Our Expertise
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Transform your special occasion into an extraordinary experience with our private event services. Our dedicated events team collaborates with you to create a personalized celebration that reflects your unique style and exceeds every expectation.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  "Bespoke menu creation with our executive chef",
                  "Personalized cocktail and wine pairings",
                  "Custom décor and ambiance design",
                  "Dedicated event coordinator and service team",
                  "Professional audio/visual equipment",
                  "Flexible space configurations up to 120 guests"
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-800 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <p className="text-gray-700">{feature}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact">
                  <button className="bg-green-800 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-900 transition-all duration-300 shadow-lg">
                    Plan Your Event
                  </button>
                </Link>
                <button className="border-2 border-green-800 text-green-800 px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-50 transition-all duration-300">
                  Download Brochure
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Venue Spaces */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Our Spaces
            </span>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Versatile Venues for Every Occasion
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From intimate gatherings to grand celebrations, our thoughtfully designed spaces adapt to your vision.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Main Dining Hall",
                capacity: "Up to 80 guests",
                description: "Our signature space featuring soaring ceilings, living walls, and ambient lighting perfect for larger celebrations and corporate events.",
                image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                features: ["Stage area for entertainment", "Full bar service", "Flexible seating arrangements"]
              },
              {
                name: "Private Garden Room",
                capacity: "Up to 35 guests",
                description: "An intimate space with floor-to-ceiling windows overlooking our herb garden, ideal for smaller gatherings and business meetings.",
                image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                features: ["Garden views", "Private entrance", "Built-in AV system"]
              },
              {
                name: "Rooftop Terrace",
                capacity: "Up to 50 guests",
                description: "Open-air elegance with city views and retractable canopy, perfect for cocktail receptions and seasonal celebrations.",
                image: "https://images.unsplash.com/photo-1551218370-daa71ba0c4d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                features: ["City skyline views", "Weather protection", "Outdoor bar setup"]
              }
            ].map((space, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={space.image}
                    alt={space.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{space.name}</h3>
                    <p className="text-green-800 font-semibold">{space.capacity}</p>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                    {space.description}
                  </p>
                  <div className="space-y-2">
                    {space.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-800 rounded-full mr-3"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-green-800 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Create Something Extraordinary?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Whether it's an intimate celebration or a grand occasion, let us help you create memories that will last a lifetime.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/contact">
              <button className="bg-white text-green-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-stone-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                Start Planning Today
              </button>
            </Link>
            <Link to="/menu">
              <button className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-green-800 transition-all duration-300">
                Explore Catering Options
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;