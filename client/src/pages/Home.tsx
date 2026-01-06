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
import homeImage from "../assets/home.png";

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
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* Hero Section with Animation - Dark Theme */}
      <section className="relative bg-[#0a0a0a] py-16 sm:py-20 lg:py-32 xl:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 via-transparent to-[#d4af37]/5"></div>

        {/* Dark morphing background */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-[#d4af37]/10 to-[#d4af37]/5 rounded-full blur-3xl"
            style={{
              left: `${20 + mousePosition.x * 0.1}%`,
              top: `${10 + mousePosition.y * 0.1}%`,
              transform: `scale(${1 + mousePosition.x * 0.001})`,
              transition: 'all 1s ease-out'
            }}
          />
          <div
            className="absolute w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-[#d4af37]/8 to-[#d4af37]/3 rounded-full blur-2xl"
            style={{
              right: `${15 + mousePosition.y * 0.05}%`,
              bottom: `${20 + mousePosition.x * 0.05}%`,
              transform: `scale(${1.2 - mousePosition.y * 0.001})`,
              transition: 'all 0.8s ease-out'
            }}
          />
        </div>

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
                <span className="text-white block sm:inline">
                  {t('home.hero.welcome')}
                </span>
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-[#d4af37] via-[#e8c252] to-[#d4af37] bg-clip-text text-transparent">
                  {t('home.hero.lounge')}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-lg sm:text-xl md:text-2xl text-neutral-400 mb-10 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0"
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
              <MagneticButton className="w-full sm:w-auto bg-[#d4af37] text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#c9a432] transition-all duration-300 shadow-xl hover:shadow-[#d4af37]/30 transform hover:-translate-y-2">
                <Link href="/contact" className="block w-full text-center">
                  {t('home.hero.reserveExperience')}
                </Link>
              </MagneticButton>

              <MagneticButton className="w-full sm:w-auto border-2 border-[#d4af37] text-[#d4af37] px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#d4af37] hover:text-black transition-all duration-300 shadow-md">
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
          <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-[#d4af37] rounded-full flex justify-center">
            <div className="w-1 h-2 sm:h-3 bg-[#d4af37] rounded-full mt-2 animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* Shisha Experience Section */}
      <ShishaExperience />

      {/* About Section - Dark Theme */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
              About Us
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              A Premium Experience
            </h2>
            <p className="text-lg text-neutral-400 leading-relaxed">
              Discover a sanctuary of refined taste where exceptional drinks, exquisite cuisine, and atmospheric ambiance converge to create unforgettable moments.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features - Dark Theme */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#161616]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Premium Drinks', desc: 'Handcrafted cocktails and premium spirits curated by our expert mixologists' },
              { title: 'Fine Dining', desc: 'Exquisite dishes prepared with the finest ingredients by our culinary team' },
              { title: 'Live Entertainment', desc: 'World-class performances in an intimate and sophisticated setting' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-8 text-center"
              >
                <h3 className="text-xl font-bold text-[#d4af37] mb-3">{item.title}</h3>
                <p className="text-neutral-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Immersive Background Experience */}
      <section
        className="relative py-32 sm:py-40 lg:py-52 overflow-hidden"
        style={{ backgroundImage: `url(${homeImage.src})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
      >
        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

        {/* Animated gold particles/orbs */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#d4af37]/30 to-transparent rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1.1, 0.9, 1.1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 right-20 w-48 h-48 bg-gradient-to-tl from-[#d4af37]/25 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.35, 0.15]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-[#d4af37]/15 to-transparent rounded-full blur-3xl"
        />

        {/* Main content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Animated badge */}
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-full text-sm font-medium uppercase tracking-widest">
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-[#d4af37]"
              />
              Premium Lounge Experience
            </span>
          </motion.div>

          {/* Main heading with staggered animation */}
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="block text-white"
            >
              Ready for an
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="block bg-gradient-to-r from-[#d4af37] via-[#f0d078] to-[#d4af37] bg-clip-text text-transparent"
            >
              Unforgettable Experience?
            </motion.span>
          </motion.h2>

          {/* Animated subtext */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            viewport={{ once: true }}
            className="text-lg sm:text-xl lg:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Step into a world of sophistication. Premium cocktails, exquisite cuisine,
            and an ambiance that transforms every moment into a memory.
          </motion.p>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-12"
          >
            {[
              { label: "Craft Cocktails", value: "50+" },
              { label: "Years of Excellence", value: "10" },
              { label: "VIP Events", value: "100+" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + idx * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="text-center px-4"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 + idx * 0.15 }}
                  viewport={{ once: true }}
                  className="text-3xl sm:text-4xl font-bold text-[#d4af37] mb-1"
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-white/60 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(212,175,55,0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-10 py-4 bg-[#d4af37] text-black rounded-full text-lg font-bold overflow-hidden transition-all duration-300 shadow-xl"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Reserve Your Table
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#e8c252] to-[#d4af37] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </motion.button>
            </Link>

            <Link href="/menu">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-4 border-2 border-white/40 text-white rounded-full text-lg font-semibold bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-[#d4af37]/60"
              >
                Explore Our Menu
              </motion.button>
            </Link>
          </motion.div>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.5 }}
            viewport={{ once: true }}
            className="mt-16 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"
          />
        </div>
      </section>

      {/* Floating Reservation Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 group">
        <Link href="/contact">
          <button className="bg-[#d4af37] text-black p-4 rounded-full shadow-lg hover:bg-[#c9a432] transition-all duration-300 hover:shadow-[#d4af37]/40">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
