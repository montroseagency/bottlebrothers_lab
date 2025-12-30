'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const TEAM_MEMBERS = [
  {
    name: 'Alessandro Rossi',
    role: 'Executive Chef',
    image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
    bio: '20+ years of culinary excellence in Mediterranean cuisine'
  },
  {
    name: 'Sofia Martinez',
    role: 'Head Mixologist',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    bio: 'Award-winning cocktail artist and spirits expert'
  },
  {
    name: 'Marcus Chen',
    role: 'General Manager',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    bio: 'Passionate about creating unforgettable guest experiences'
  },
  {
    name: 'Elena Popescu',
    role: 'Events Director',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    bio: 'Specialist in luxury events and VIP experiences'
  }
];

const VALUES = [
  {
    icon: '🌟',
    title: 'Excellence',
    description: 'We pursue perfection in every detail, from our cuisine to our service'
  },
  {
    icon: '🤝',
    title: 'Hospitality',
    description: 'Creating warm, welcoming experiences that make you feel like family'
  },
  {
    icon: '🎨',
    title: 'Innovation',
    description: 'Constantly evolving our menu and experiences to exceed expectations'
  },
  {
    icon: '🌍',
    title: 'Sustainability',
    description: 'Committed to local sourcing and environmentally responsible practices'
  }
];

const MILESTONES = [
  { year: '2018', title: 'Founded', description: 'Opened our doors in Tirana' },
  { year: '2019', title: 'Award Winning', description: 'Best New Restaurant Award' },
  { year: '2020', title: 'Expansion', description: 'Doubled our seating capacity' },
  { year: '2022', title: 'VIP Launch', description: 'Introduced exclusive VIP program' },
  { year: '2024', title: 'Excellence', description: 'Michelin recommendation' }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600"
          alt="Bottle Brothers Interior"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display text-5xl md:text-7xl font-bold mb-6"
            >
              Our Story
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto"
            >
              Where luxury meets authenticity in the heart of Tirana
            </motion.p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-luxury p-8 md:p-12 mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
              The Bottle Brothers Vision
            </h2>
            <div className="space-y-4 text-neutral-700 text-lg leading-relaxed">
              <p>
                Born from a passion for exceptional experiences, Bottle Brothers opened its doors in 2018
                with a simple yet ambitious vision: to create a space where luxury, authenticity, and
                community converge.
              </p>
              <p>
                Our founders, two brothers with a shared love for fine dining and vibrant nightlife,
                envisioned a venue that would redefine Tirana's social scene. They brought together
                world-class culinary expertise, innovative mixology, and an unwavering commitment to
                hospitality.
              </p>
              <p>
                Today, Bottle Brothers stands as a testament to their vision—a premier destination where
                every detail is crafted to perfection, every guest is treated like family, and every
                moment is designed to be unforgettable.
              </p>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { number: '50K+', label: 'Happy Guests' },
              { number: '200+', label: 'Signature Dishes' },
              { number: '1000+', label: 'Events Hosted' },
              { number: '4.9', label: 'Average Rating' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-center text-white shadow-lg"
              >
                <p className="text-4xl font-bold mb-2">{stat.number}</p>
                <p className="text-sm font-semibold opacity-90">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-12 text-center">
            Our Journey
          </h2>
          <div className="relative max-w-5xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary-200 hidden md:block" />

            <div className="space-y-12">
              {MILESTONES.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <p className="text-primary-600 font-bold text-xl mb-2">{milestone.year}</p>
                      <h3 className="font-bold text-neutral-900 text-lg mb-1">{milestone.title}</h3>
                      <p className="text-neutral-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-primary-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center flex-shrink-0 z-10">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-12 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-luxury transition-shadow duration-300"
              >
                <div className="text-6xl mb-4">{value.icon}</div>
                <h3 className="font-bold text-xl text-neutral-900 mb-3">{value.title}</h3>
                <p className="text-neutral-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-12 text-center">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM_MEMBERS.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-luxury transition-all duration-500 hover:-translate-y-2">
                  <div className="relative h-80 overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="font-bold text-xl mb-1">{member.name}</h3>
                      <p className="text-primary-300 font-semibold text-sm mb-2">{member.role}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-neutral-600 text-sm">{member.bio}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-luxury p-12 text-center text-white"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Experience the Bottle Brothers Difference
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join us for an unforgettable dining and entertainment experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservations"
              className="px-8 py-4 bg-white text-primary-600 rounded-xl font-bold hover:bg-neutral-100 transition-colors shadow-lg"
            >
              Make a Reservation
            </Link>
            <Link
              href="/menu"
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-colors"
            >
              View Our Menu
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
