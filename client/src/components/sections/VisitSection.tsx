'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface VisitSectionProps {
  fullHeight?: boolean;
}

export function VisitSection({ fullHeight = false }: VisitSectionProps) {
  // Staggered fade-in animation for text
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const fadeUpItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <section className={`relative overflow-hidden bg-neutral-900 ${fullHeight ? 'h-screen' : 'py-32'}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/shisha1.png"
          alt="Visit Bottle Brothers"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Text Elements */}
      <div className="relative h-full w-full">
        {/* Top Left */}
        <motion.div
          className="absolute top-[15%] left-[8%] md:left-[10%]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white"
            variants={fadeUpItem}
          >
            VISIT
          </motion.h2>
          <motion.div
            className="mt-2 h-1 w-20 bg-amber-500"
            variants={fadeUpItem}
          />
        </motion.div>

        {/* Top Right */}
        <motion.div
          className="absolute top-[12%] right-[8%] md:right-[12%] text-right"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.p
            className="text-amber-400 text-sm md:text-base uppercase tracking-[0.3em] mb-2"
            variants={fadeUpItem}
          >
            Experience
          </motion.p>
          <motion.h3
            className="font-serif text-2xl md:text-4xl text-white italic"
            variants={fadeUpItem}
          >
            Exquisite Flavors
          </motion.h3>
        </motion.div>

        {/* Center */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        >
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white">
            US
          </h2>
        </motion.div>

        {/* Bottom Left */}
        <motion.div
          className="absolute bottom-[15%] left-[8%] md:left-[15%]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.p
            className="text-white/70 text-sm md:text-base uppercase tracking-widest mb-2"
            variants={fadeUpItem}
          >
            Open Daily
          </motion.p>
          <motion.p
            className="font-display text-2xl md:text-3xl text-white font-semibold"
            variants={fadeUpItem}
          >
            5 PM — 2 AM
          </motion.p>
        </motion.div>

        {/* Bottom Right */}
        <motion.div
          className="absolute bottom-[12%] right-[8%] md:right-[10%] text-right"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.p
            className="text-amber-400 text-xs md:text-sm uppercase tracking-[0.2em] mb-3"
            variants={fadeUpItem}
          >
            Location
          </motion.p>
          <motion.p
            className="font-serif text-xl md:text-2xl text-white leading-relaxed"
            variants={fadeUpItem}
          >
            Rruga Dëshmorët<br />
            Tirana, Albania
          </motion.p>
          <motion.a
            href="/contact"
            className="inline-block mt-4 px-6 py-2 border border-amber-500 text-amber-400 text-sm uppercase tracking-wider hover:bg-amber-500 hover:text-black transition-all duration-300"
            variants={fadeUpItem}
          >
            Get Directions
          </motion.a>
        </motion.div>
      </div>

      {/* Bottom Break/Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="flex items-center justify-center gap-4 pb-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/50" />
          <div className="w-2 h-2 rotate-45 border border-amber-500/50" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/50" />
        </div>
      </div>
    </section>
  );
}
