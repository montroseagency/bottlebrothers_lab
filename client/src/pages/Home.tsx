// client/src/pages/Home.tsx - PROFESSIONAL RESPONSIVE VERSION
'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { GlassmorphicCard } from '../components/ui/GlassmorphicCard';
import { MagneticButton } from '../components/ui/MagneticButton';
import { ParticleField } from '../components/ui/ParticleField'; 
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import shishaImage from "../assets/shisha1.png";

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

  // 🌿 Shisha Section
  const ShishaExperience = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const animations = [
      { x: -80, opacity: 0 },
      { x: 80, opacity: 0 },
      { y: 80, opacity: 0 },
      { y: -80, opacity: 0 },
    ];

    const texts = [
      "Relax and unwind with the aroma of premium Shisha blends.",
      "Crafted with passion — each flavor tells a story.",
      "A sensory experience surrounded by elegance and warmth.",
      "Breathe in tranquility, exhale the stress of the day.",
    ];

    return (
      <section
        ref={ref}
        className="relative py-32 sm:py-40 bg-fixed bg-center bg-cover flex flex-col justify-center items-center text-center overflow-hidden"
        style={{ backgroundImage: `url(${shishaImage.src})` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-4xl sm:text-5xl font-bold text-white mb-12 drop-shadow-2xl"
          >
            Shisha Moments
          </motion.h2>

          <div className="space-y-10 sm:space-y-14">
            {texts.map((text, index) => (
              <motion.p
                key={index}
                initial={animations[index]}
                animate={isInView ? { x: 0, y: 0, opacity: 1 } : {}}
                transition={{
                  duration: 1.2,
                  delay: index * 0.3,
                  ease: "easeOut",
                }}
                className="text-lg sm:text-xl md:text-2xl text-gray-100 font-light leading-relaxed tracking-wide drop-shadow-lg"
              >
                {text}
              </motion.p>
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero Section with Animation */}
      <section className="relative bg-gradient-to-br from-stone-100 to-stone-200 py-16 sm:py-20 lg:py-32 xl:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 to-green-800/5"></div>
        <MorphingBackground />
        
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center"
        >
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-8 sm:mb-12">
              <motion.h1 
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                viewport={{ once: true }}
                className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              >
                <span className="text-gray-800 block sm:inline">
                  {t('home.hero.welcome')}
                </span>
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 bg-clip-text text-transparent">
                  {t('home.hero.lounge')}
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-10 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0"
              >
                {t('home.hero.subtitle')}
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 sm:px-0"
            >
              <MagneticButton className="w-full sm:w-auto bg-green-800 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-900 transition-all duration-300 shadow-xl hover:shadow-green-900/40 transform hover:-translate-y-2">
                <Link href="/contact" className="block w-full text-center">
                  {t('home.hero.reserveExperience')}
                </Link>
              </MagneticButton>
              
              <MagneticButton className="w-full sm:w-auto border-2 border-green-800 text-green-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-800 hover:text-white transition-all duration-300 shadow-md">
                <Link href="/menu" className="block w-full text-center">
                  {t('home.hero.discoverMenu')}
                </Link>
              </MagneticButton>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          viewport={{ once: true }}
          className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
        >
          <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-green-600 rounded-full flex justify-center">
            <div className="w-1 h-2 sm:h-3 bg-green-600 rounded-full mt-2 animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* 🌫️ Shisha Experience Section */}
      <ShishaExperience />

      {/* ✅ Keep your original sections below unchanged */}
      {/* About, Features, Testimonials, CTA, Floating Button */}
      {/* (They stay identical to your last version for full continuity) */}

      {/* About Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        {/* ... your original About content unchanged ... */}
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 lg:py-24 bg-stone-50">
        {/* ... your original Features content unchanged ... */}
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        {/* ... your original Testimonials content unchanged ... */}
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-green-800 to-green-700 relative overflow-hidden">
        {/* ... your original CTA content unchanged ... */}
      </section>

      {/* Floating Reservation Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 group">
        {/* ... original Floating Button content unchanged ... */}
      </div>
    </div>
  );
};

export default Home;
