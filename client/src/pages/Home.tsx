// client/src/pages/Home.tsx - FIXED VERSION
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
        className="absolute w-96 h-96 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full blur-3xl"
        style={{
          left: `${20 + mousePosition.x * 0.1}%`,
          top: `${10 + mousePosition.y * 0.1}%`,
          transform: `scale(${1 + mousePosition.x * 0.001})`,
          transition: 'all 1s ease-out'
        }}
      />
      <div 
        className="absolute w-64 h-64 bg-gradient-to-br from-amber-400/15 to-orange-500/15 rounded-full blur-2xl"
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
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-stone-900 to-green-900 py-20 lg:py-32 overflow-hidden">
        <MorphingBackground />
        <ParticleField particleCount={30} color="bg-green-300" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            <div className="mb-8">
              <h1 
                className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
                style={{ transform: `translateY(${scrollY * -0.1}px)` }}
              >
                <span className="text-white">{t('home.hero.welcome')}</span>
                <br />
                <span className="bg-gradient-to-r from-green-400 via-green-500 to-emerald-400 bg-clip-text text-transparent animate-pulse">
                  {t('home.hero.lounge')}
                </span>
              </h1>
              <p 
                className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
                style={{ transform: `translateY(${scrollY * -0.15}px)` }}
              >
                {t('home.hero.subtitle')}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <MagneticButton 
                className="group bg-transparent border-2 border-green-400 px-8 py-4 rounded-full overflow-hidden hover:shadow-2xl hover:shadow-green-400/25 transition-all duration-500"
              >
                <Link to="/contact" className="relative z-10 font-semibold text-green-400 group-hover:text-black transition-colors duration-500">
                  {t('home.hero.reserveExperience')}
                </Link>
                <div className="absolute inset-0 bg-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </MagneticButton>
              
              <MagneticButton className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-full font-semibold hover:from-green-500 hover:to-green-600 transition-all duration-300 shadow-xl hover:shadow-2xl">
                <Link to="/menu">{t('home.hero.discoverMenu')}</Link>
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-green-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-green-400 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* About Section with Glassmorphism */}
      <section className="py-20 bg-gradient-to-br from-stone-900 via-green-900/20 to-black relative overflow-hidden">
        <ParticleField particleCount={15} color="bg-green-400" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="mb-6">
                <span className="inline-block bg-green-400/20 text-green-300 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide backdrop-blur-sm">
                  {t('home.about.badge')}
                </span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-6">
                {t('home.about.title')}
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                {t('home.about.description1')}
              </p>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                {t('home.about.description2')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <MagneticButton className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-500 transition-all duration-300 shadow-lg">
                  <Link to="/gallery">{t('home.about.viewSpace')}</Link>
                </MagneticButton>
                <MagneticButton className="border border-green-400 text-green-400 px-6 py-3 rounded-full font-semibold hover:bg-green-400/10 transition-all duration-300">
                  <Link to="/events">{t('home.about.privateEvents')}</Link>
                </MagneticButton>
              </div>
            </div>
            
            <div className="relative">
              <GlassmorphicCard className="overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Lounge Interior"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute bottom-4 right-4 bg-green-600/90 text-white p-4 rounded-xl backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold">5+</div>
                    <div className="text-sm opacity-90">{t('home.about.stats.years')}</div>
                  </div>
                </div>
              </GlassmorphicCard>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              {t('home.features.badge')}
            </span>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <GlassmorphicCard
                key={index}
                className="p-8 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-500"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4 transform hover:scale-125 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {t(`home.features.${feature.titleKey}.title`)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t(`home.features.${feature.descriptionKey}.description`)}
                  </p>
                </div>
              </GlassmorphicCard>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="py-20 bg-gradient-to-br from-green-900 to-black relative overflow-hidden">
        <ParticleField particleCount={20} color="bg-green-300" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block bg-green-400/20 text-green-300 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide backdrop-blur-sm mb-4">
              {t('home.testimonials.badge')}
            </span>
            <h2 className="text-4xl font-bold text-white mb-4">
              {t('home.testimonials.title')}
            </h2>
            <p className="text-xl text-gray-300">
              {t('home.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['testimonial1', 'testimonial2', 'testimonial3'].map((testimonialKey, index) => (
              <GlassmorphicCard key={index} className="p-8">
                <div className="flex items-center mb-6">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-200 mb-6 italic text-lg">
                  "{t(`home.testimonials.${testimonialKey}.text`)}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center mr-4">
                    <span className="text-black font-semibold">
                      {t(`home.testimonials.${testimonialKey}.author`).split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {t(`home.testimonials.${testimonialKey}.author`)}
                    </p>
                    <p className="text-green-300 text-sm">
                      {t(`home.testimonials.${testimonialKey}.role`)}
                    </p>
                  </div>
                </div>
              </GlassmorphicCard>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action */}
      <section className="py-20 bg-gradient-to-r from-green-800 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <ParticleField particleCount={25} color="bg-green-300" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('home.cta.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <MagneticButton className="bg-white text-green-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-stone-100 transition-all duration-300 shadow-xl hover:shadow-2xl">
              <Link to="/contact">{t('home.cta.reserveTable')}</Link>
            </MagneticButton>
            <MagneticButton className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-green-800 transition-all duration-300">
              <Link to="/events">{t('home.cta.exploreEvents')}</Link>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* Floating Reservation Button */}
      <div className="fixed bottom-8 right-8 z-50 group">
        <MagneticButton className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:from-green-500 hover:to-green-600">
          <Link to="/contact" className="flex items-center space-x-2">
            <span className="font-semibold">{t('home.floating.reserve')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </Link>
        </MagneticButton>
      </div>
    </div>
  );
};

export default Home;