// src/pages/Events.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Events: React.FC = () => {
  return (
    <div className="bg-yellow-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-yellow-50 to-amber-100 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
              Unforgettable
              <span className="block text-amber-800">Events</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
              From intimate gatherings to grand celebrations, our lounge provides the perfect backdrop for every special occasion. Experience world-class entertainment and exceptional service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <button className="bg-amber-800 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-amber-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Book Private Event
                </button>
              </Link>
              <button className="border-2 border-amber-800 text-amber-800 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-amber-800 hover:text-white transition-all duration-300">
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
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Upcoming Events
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't miss out on our exciting lineup of entertainment and special events.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Featured Event */}
            <div className="bg-gradient-to-r from-amber-800 to-amber-900 rounded-2xl p-8 text-white lg:col-span-2">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-6 md:mb-0">
                  <div className="inline-block bg-amber-600 px-3 py-1 rounded-full text-sm font-medium mb-4">
                    Featured Event
                  </div>
                  <h3 className="text-3xl font-bold mb-2">Jazz & Wine Night</h3>
                  <p className="text-amber-100 mb-4 max-w-2xl">
                    An evening of smooth jazz performances featuring renowned local artists, paired with our finest wine selection and gourmet small plates.
                  </p>
                  <div className="flex items-center space-x-6 text-amber-100">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Friday, September 20th
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      7:00 PM - 11:00 PM
                    </div>
                  </div>
                </div>
                <button className="bg-white text-amber-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap">
                  Reserve Seats
                </button>
              </div>
            </div>

            {/* Regular Events */}
            <div className="bg-yellow-50 rounded-xl p-6 border border-amber-200">
              <h4 className="text-xl font-bold text-gray-800 mb-2">Live DJ Night</h4>
              <p className="text-gray-600 mb-4">
                Dance the night away with our resident DJ spinning the latest hits and classic favorites.
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Every Saturday</p>
                  <p>9:00 PM - 2:00 AM</p>
                </div>
                <button className="bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-900 transition-colors">
                  Get Tickets
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 border border-amber-200">
              <h4 className="text-xl font-bold text-gray-800 mb-2">Cocktail Workshop</h4>
              <p className="text-gray-600 mb-4">
                Learn the art of mixology from our expert bartenders in this hands-on experience.
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">September 25th</p>
                  <p>6:00 PM - 8:00 PM</p>
                </div>
                <button className="bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-900 transition-colors">
                  Join Class
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 border border-amber-200">
              <h4 className="text-xl font-bold text-gray-800 mb-2">Wine Tasting</h4>
              <p className="text-gray-600 mb-4">
                Explore exceptional wines from around the world with our sommelier-guided tasting.
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">October 2nd</p>
                  <p>7:30 PM - 9:30 PM</p>
                </div>
                <button className="bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-900 transition-colors">
                  Book Now
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 border border-amber-200">
              <h4 className="text-xl font-bold text-gray-800 mb-2">Acoustic Sessions</h4>
              <p className="text-gray-600 mb-4">
                Intimate acoustic performances featuring local singer-songwriters and emerging artists.
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Every Thursday</p>
                  <p>8:00 PM - 10:00 PM</p>
                </div>
                <button className="bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-900 transition-colors">
                  Reserve Table
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className="py-20 bg-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Types of Events We Host
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our versatile space and experienced team can accommodate a wide variety of events and celebrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Live Music</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                From jazz ensembles to acoustic solo acts, we regularly feature talented musicians creating the perfect ambiance.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Corporate Events</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Professional atmosphere perfect for business meetings, networking events, and corporate celebrations.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Private Parties</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Celebrate birthdays, anniversaries, and special milestones in our elegant private dining areas.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Wine & Spirits</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Educational tastings and pairing events featuring premium wines, craft spirits, and expert guidance.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Themed Nights</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Special themed events and holiday celebrations that bring our community together for unique experiences.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Workshops</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Interactive classes covering mixology, wine appreciation, and culinary arts in an intimate setting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Private Events Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Host Your Private Event
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Make your special occasion truly memorable with our private event services. Our dedicated events team will work with you to create a personalized experience that exceeds your expectations.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-amber-800 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-gray-700">Customized menu and beverage packages</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-amber-800 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-gray-700">Dedicated event coordinator</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-amber-800 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-gray-700">Audio/visual equipment available</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-amber-800 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-gray-700">Flexible seating arrangements</p>
                </div>
              </div>

              <Link to="/contact">
                <button className="bg-amber-800 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-amber-900 transition-colors shadow-lg">
                  Plan Your Event
                </button>
              </Link>
            </div>

            <div className="bg-amber-100 rounded-2xl p-8 h-96 flex flex-col justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-amber-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Capacity Information</h3>
                <div className="space-y-2 text-gray-700">
                  <p><span className="font-semibold">Main Dining:</span> Up to 80 guests</p>
                  <p><span className="font-semibold">Private Room:</span> Up to 30 guests</p>
                  <p><span className="font-semibold">Full Venue:</span> Up to 120 guests</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-amber-800 to-amber-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Join Us for an Event?
          </h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Whether it's a special celebration or a regular night out, we have something exciting happening every week.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <button className="bg-white text-amber-800 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                Book Event Space
              </button>
            </Link>
            <Link to="/menu">
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-amber-800 transition-colors">
                View Menu
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;