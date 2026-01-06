'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import homeImage from '../../assets/home.png';

interface FinalCTAProps {
  fullHeight?: boolean;
}

export function FinalCTA({ fullHeight = false }: FinalCTAProps) {
  return (
    <section
      className={`relative overflow-hidden ${fullHeight ? 'h-screen flex items-center' : 'py-24 lg:py-32'}`}
      style={{
        backgroundImage: `url(${homeImage.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85" />

      {/* Animated gold orbs/particles */}
      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-[#d4af37]/30 to-transparent rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -50, 0],
          y: [0, 50, 0],
          scale: [1.2, 0.8, 1.2],
          opacity: [0.15, 0.4, 0.15]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-20 right-10 w-56 h-56 bg-gradient-to-tl from-[#d4af37]/25 to-transparent rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[#d4af37]/15 to-transparent rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -20, 20, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-[#d4af37]/40 to-transparent rounded-full blur-2xl"
      />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-[#d4af37]/60 rounded-full"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3
          }}
        />
      ))}

      {/* Decorative corner frame with gold */}
      <div className="absolute inset-6 md:inset-10 lg:inset-16 pointer-events-none z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="absolute top-0 left-0 w-20 h-20 md:w-28 md:h-28 border-t-2 border-l-2 border-[#d4af37]/50"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.1 }}
          viewport={{ once: true }}
          className="absolute top-0 right-0 w-20 h-20 md:w-28 md:h-28 border-t-2 border-r-2 border-[#d4af37]/50"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true }}
          className="absolute bottom-0 left-0 w-20 h-20 md:w-28 md:h-28 border-b-2 border-l-2 border-[#d4af37]/50"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          viewport={{ once: true }}
          className="absolute bottom-0 right-0 w-20 h-20 md:w-28 md:h-28 border-b-2 border-r-2 border-[#d4af37]/50"
        />
      </div>

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Animated badge */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.8 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-[#d4af37]/40 text-white px-6 py-3 rounded-full text-sm font-medium uppercase tracking-widest">
            <motion.span
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
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
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
        >
          <motion.span
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="block text-white"
          >
            Ready for an
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="block bg-gradient-to-r from-[#d4af37] via-[#f0d078] to-[#d4af37] bg-clip-text text-transparent bg-[length:200%_100%] animate-shimmer"
          >
            Unforgettable Experience?
          </motion.span>
        </motion.h2>

        {/* Animated subtext */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-lg sm:text-xl lg:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed"
        >
          Step into a world of sophistication. Premium cocktails, exquisite cuisine,
          and an ambiance that transforms every moment into a memory.
        </motion.p>

        {/* Feature stats with hover effects */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-8 sm:gap-12 mb-12"
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
              transition={{ duration: 0.5, delay: 0.9 + idx * 0.15 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1, y: -8 }}
              className="text-center px-4 cursor-default"
            >
              <motion.div
                animate={{
                  textShadow: ["0 0 10px rgba(212,175,55,0.3)", "0 0 30px rgba(212,175,55,0.6)", "0 0 10px rgba(212,175,55,0.3)"]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: idx * 0.5 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#d4af37] mb-1"
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
          transition={{ duration: 0.8, delay: 1.2 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/contact">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 25px 60px rgba(212,175,55,0.5)" }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-10 py-5 bg-[#d4af37] text-black rounded-full text-lg font-bold overflow-hidden transition-all duration-300 shadow-xl shadow-[#d4af37]/20"
            >
              <span className="relative z-10 flex items-center gap-3">
                Reserve Your Table
                <motion.span
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-xl"
                >
                  →
                </motion.span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#e8c252] to-[#d4af37] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.button>
          </Link>

          <Link href="/menu">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(212,175,55,0.15)", borderColor: "rgba(212,175,55,0.8)" }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-5 border-2 border-white/40 text-white rounded-full text-lg font-semibold bg-white/5 backdrop-blur-xl transition-all duration-300"
            >
              Explore Our Menu
            </motion.button>
          </Link>
        </motion.div>

        {/* Decorative animated line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.5 }}
          viewport={{ once: true }}
          className="mt-16 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent"
        />
      </div>
    </section>
  );
}
