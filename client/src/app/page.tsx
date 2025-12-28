'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FloatingReservation } from '@/components/ui/FloatingReservation'
import { MagneticButton } from '@/components/ui/MagneticButton'

export default function Home() {
  const { t } = useTranslation()

  return (
    <>
      <Header />
      <div className="bg-stone-50 min-h-screen">
        {/* Hero Section with Background Image */}
        <section className="relative h-screen overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/hero-bg.png)',
              filter: 'brightness(0.7)'
            }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Animated Welcome Text */}
          <div className="relative h-full flex items-center justify-center z-10">
            <div className="text-center px-4">
              <h1 className="welcome-text text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6">
                Welcome to
                <span className="block mt-4 bg-gradient-to-r from-green-400 via-green-300 to-emerald-400 bg-clip-text text-transparent">
                  Bottle Brothers
                </span>
              </h1>
              <p className="subtitle-text text-xl sm:text-2xl md:text-3xl text-gray-200 font-light">
                Experience the Art of Fine Dining
              </p>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </section>

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes glow {
            0%, 100% {
              text-shadow: 0 0 20px rgba(74, 222, 128, 0.5),
                           0 0 30px rgba(74, 222, 128, 0.3),
                           0 0 40px rgba(74, 222, 128, 0.2);
            }
            50% {
              text-shadow: 0 0 30px rgba(74, 222, 128, 0.8),
                           0 0 50px rgba(74, 222, 128, 0.5),
                           0 0 60px rgba(74, 222, 128, 0.3);
            }
          }

          .welcome-text {
            animation: fadeInDown 1.2s ease-out;
          }

          .welcome-text span {
            animation: glow 3s ease-in-out infinite;
          }

          .subtitle-text {
            animation: fadeInUp 1.5s ease-out 0.3s both;
          }
        `}</style>

        {/* Premium Split-Layout Section */}
        <section className="premium-split-section relative w-full min-h-screen flex flex-col lg:flex-row">
          {/* Left Side - Image */}
          <div className="relative w-full lg:w-[45%] h-[50vh] lg:h-screen">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(/lounge-image.png)',
              }}
            />
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
          </div>

          {/* Right Side - Content */}
          <div className="relative w-full lg:w-[55%] bg-white flex items-center justify-center px-8 sm:px-12 lg:px-16 py-20 lg:py-0">
            <div className="max-w-md text-center lg:text-left fade-in-content">
              <h2 className="welcome-heading text-4xl sm:text-5xl lg:text-6xl font-semibold mb-6 tracking-wider">
                WELCOME TO SHISHA
              </h2>
              <p className="welcome-subtext text-base sm:text-lg text-gray-600 font-light leading-relaxed">
                A boutique lounge experience located in the heart of the city.
              </p>
            </div>
          </div>
        </section>

        <style jsx>{`
          @keyframes fadeInContent {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .fade-in-content {
            animation: fadeInContent 1s ease-out 0.3s both;
          }

          .welcome-heading {
            font-family: 'Playfair Display', 'Inter', sans-serif;
            letter-spacing: 0.1em;
            color: #1a1a1a;
            line-height: 1.2;
          }

          .welcome-subtext {
            color: #4a5568;
          }

          @media (max-width: 1024px) {
            .premium-split-section {
              min-height: auto;
            }
          }
        `}</style>

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
                { icon: "🌿", titleKey: "naturalAmbiance", descriptionKey: "naturalAmbiance" },
                { icon: "🍸", titleKey: "artisanalCocktails", descriptionKey: "artisanalCocktails" },
                { icon: "🎵", titleKey: "curatedEntertainment", descriptionKey: "curatedEntertainment" },
                { icon: "🍃", titleKey: "sustainableCuisine", descriptionKey: "sustainableCuisine" },
                { icon: "🎉", titleKey: "exclusiveEvents", descriptionKey: "exclusiveEvents" },
                { icon: "⭐", titleKey: "personalizedService", descriptionKey: "personalizedService" }
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

                  <div className="flex justify-center text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>

                  <p className="text-gray-700 italic text-base sm:text-lg leading-relaxed text-center">
                    "{t(`home.testimonials.${testimonialKey}.text`)}"
                  </p>

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
                <Link href="/contact" className="block text-center">{t('home.cta.reserveTable')}</Link>
              </MagneticButton>
              <MagneticButton className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-white hover:text-green-800 transition-all duration-300">
                <Link href="/events" className="block text-center">{t('home.cta.exploreEvents')}</Link>
              </MagneticButton>
            </div>
          </div>
        </section>

        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 group">
          <MagneticButton className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 sm:px-6 sm:py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:from-green-500 hover:to-green-600">
            <Link href="/contact" className="flex items-center space-x-1 sm:space-x-2">
              <span className="font-semibold text-sm sm:text-base">{t('home.floating.reserve')}</span>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Link>
          </MagneticButton>
        </div>
      </div>
      <Footer />
      <FloatingReservation position="bottom-right" style="compact" />
    </>
  )
}
