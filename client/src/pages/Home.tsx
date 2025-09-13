// client/src/pages/Home.tsx - PROFESSIONAL RESPONSIVE VERSION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GlassmorphicCard } from '../components/ui/GlassmorphicCard';
import { MagneticButton } from '../components/ui/MagneticButton';
import { ParticleField } from '../components/ui/ParticleField';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const MorphingBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-green-400/10 to-green-600/10 rounded-full blur-3xl"
        style={{
          left: `${20 + mousePosition.x * 0.1}%`,
          top: `${10 + mousePosition.y * 0.1}%`,
          transform: `scale(${1 + mousePosition.x * 0.001})`,
          transition: 'all 1s ease-out'
        }}
      />
      <div 
        className="absolute w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-green-300/8 to-green-500/8 rounded-full blur-2xl"
        style={{
          right: `${15 + mousePosition.y * 0.05}%`,
          bottom: `${20 + mousePosition.x * 0.05}%`,
          transform: `scale(${1.2 - mousePosition.y * 0.001})`,
          transition: 'all 0.8s ease-out'
        }}
      />
    </div>
  );

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Enhanced Hero Section - Mobile First */}
      <section className="relative bg-gradient-to-br from-stone-100 to-stone-200 py-16 sm:py-20 lg:py-32 xl:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 to-green-800/5"></div>
        <MorphingBackground />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-8 sm:mb-12">
              <h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 leading-tight"
                style={{ transform: `translateY(${scrollY * -0.1}px)` }}
              >
                <span className="text-gray-800 block sm:inline">{t('home.hero.welcome')}</span>
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 bg-clip-text text-transparent">
                  {t('home.hero.lounge')}
                </span>
              </h1>
              <p 
                className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0"
                style={{ transform: `translateY(${scrollY * -0.15}px)` }}
              >
                {t('home.hero.subtitle')}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 sm:px-0">
              <MagneticButton className="w-full sm:w-auto bg-green-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-green-900 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2">
                <Link to="/contact" className="block w-full text-center">{t('home.hero.reserveExperience')}</Link>
              </MagneticButton>
              
              <MagneticButton className="w-full sm:w-auto border-2 border-green-800 text-green-800 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-green-800 hover:text-white transition-all duration-300">
                <Link to="/menu" className="block w-full text-center">{t('home.hero.discoverMenu')}</Link>
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-green-600 rounded-full flex justify-center">
            <div className="w-1 h-2 sm:h-3 bg-green-600 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* About Section - Enhanced Responsive Grid */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 items-center">
            
            {/* Text Content */}
            <div className="order-2 lg:order-1 space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
                  {t('home.about.badge')}
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
                  {t('home.about.title')}
                </h2>
              </div>
              
              <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-gray-600 leading-relaxed">
                <p>{t('home.about.description1')}</p>
                <p>{t('home.about.description2')}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <MagneticButton className="w-full sm:w-auto bg-green-800 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-900 transition-all duration-300 shadow-lg">
                  <Link to="/gallery" className="block text-center">{t('home.about.viewSpace')}</Link>
                </MagneticButton>
                <MagneticButton className="w-full sm:w-auto border border-green-800 text-green-800 px-6 py-3 rounded-full font-semibold hover:bg-green-50 transition-all duration-300">
                  <Link to="/events" className="block text-center">{t('home.about.privateEvents')}</Link>
                </MagneticButton>
              </div>
            </div>
            
            {/* Image */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
                <div className="aspect-w-16 aspect-h-12 sm:aspect-h-10">
                  <img 
                    src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Lounge Interior"
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                  />
                </div>
                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-green-800 text-white p-3 sm:p-4 rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold">5+</div>
                    <div className="text-xs sm:text-sm opacity-90">{t('home.about.stats.years')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              {t('home.features.badge')}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">
              {t('home.features.title')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              {t('home.features.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: "🌿",
                titleKey: "naturalAmbiance",
                descriptionKey: "naturalAmbiance"
              },
              {
                icon: "🍸",
                titleKey: "artisanalCocktails",
                descriptionKey: "artisanalCocktails"
              },
              {
                icon: "🎵",
                titleKey: "curatedEntertainment",
                descriptionKey: "curatedEntertainment"
              },
              {
                icon: "🍃",
                titleKey: "sustainableCuisine",
                descriptionKey: "sustainableCuisine"
              },
              {
                icon: "🎉",
                titleKey: "exclusiveEvents",
                descriptionKey: "exclusiveEvents"
              },
              {
                icon: "⭐",
                titleKey: "personalizedService",
                descriptionKey: "personalizedService"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 sm:p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-stone-200"
              >
                <div className="text-center space-y-4">
                  <div className="text-3xl sm:text-4xl transform group-hover:scale-125 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                    {t(`home.features.${feature.titleKey}.title`)}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {t(`home.features.${feature.descriptionKey}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              {t('home.testimonials.badge')}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">
              {t('home.testimonials.title')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              {t('home.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {['testimonial1', 'testimonial2', 'testimonial3'].map((testimonialKey, index) => (
              <div key={index} className="p-6 sm:p-8 bg-stone-50 rounded-2xl shadow-lg border border-stone-200 hover:shadow-xl transition-all duration-300 space-y-6">
                
                {/* Stars */}
                <div className="flex justify-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 italic text-base sm:text-lg leading-relaxed text-center">
                  "{t(`home.testimonials.${testimonialKey}.text`)}"
                </p>

                {/* Author */}
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm sm:text-base">
                      {t(`home.testimonials.${testimonialKey}.author`).split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-gray-800 font-semibold text-sm sm:text-base">
                      {t(`home.testimonials.${testimonialKey}.author`)}
                    </p>
                    <p className="text-green-600 text-xs sm:text-sm">
                      {t(`home.testimonials.${testimonialKey}.role`)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-green-800 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-lg sm:text-xl text-green-100 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('home.cta.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <MagneticButton className="w-full sm:w-auto bg-white text-green-800 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-stone-100 transition-all duration-300 shadow-xl hover:shadow-2xl">
              <Link to="/contact" className="block text-center">{t('home.cta.reserveTable')}</Link>
            </MagneticButton>
            <MagneticButton className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-white hover:text-green-800 transition-all duration-300">
              <Link to="/events" className="block text-center">{t('home.cta.exploreEvents')}</Link>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* Floating Reservation Button - Responsive */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 group">
        <MagneticButton className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 sm:px-6 sm:py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:from-green-500 hover:to-green-600">
          <Link to="/contact" className="flex items-center space-x-1 sm:space-x-2">
            <span className="font-semibold text-sm sm:text-base">{t('home.floating.reserve')}</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </Link>
        </MagneticButton>
      </div>
    </div>
  );
};

export default Home;