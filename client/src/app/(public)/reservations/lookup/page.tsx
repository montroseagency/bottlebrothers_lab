'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LookupPage() {
  const [searchType, setSearchType] = useState<'email' | 'confirmation'>('confirmation');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [reservation, setReservation] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    try {
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock reservation data
      setReservation({
        confirmationNumber: confirmationNumber || 'BBTEST123',
        date: '2025-01-15',
        time: '7:00 PM',
        partySize: 4,
        status: 'confirmed',
        firstName: 'John',
        lastName: 'Doe',
        email: email || 'john@example.com',
        phone: '+1 (555) 123-4567'
      });
    } catch (error) {
      console.error('Error searching reservation:', error);
      alert('Reservation not found. Please check your details and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/20 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Find Your Reservation
            </h1>
            <p className="text-neutral-600 text-lg">
              Look up your reservation using your confirmation number or email
            </p>
          </div>

          {!reservation ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-luxury p-8"
            >
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setSearchType('confirmation')}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                    searchType === 'confirmation'
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  Confirmation Number
                </button>
                <button
                  onClick={() => setSearchType('email')}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                    searchType === 'email'
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  Email Address
                </button>
              </div>

              <form onSubmit={handleSearch} className="space-y-6">
                {searchType === 'confirmation' ? (
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Confirmation Number
                    </label>
                    <input
                      type="text"
                      value={confirmationNumber}
                      onChange={(e) => setConfirmationNumber(e.target.value.toUpperCase())}
                      placeholder="BB1234567"
                      required
                      className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-lg"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                      className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:shadow-glow transition-all duration-300 disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Find Reservation'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/reservations" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                  Make a New Reservation →
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-luxury p-8"
            >
              <div className="flex items-center justify-between mb-6 pb-6 border-b">
                <div>
                  <h2 className="font-display text-2xl font-bold text-neutral-900">
                    Reservation Details
                  </h2>
                  <p className="text-neutral-600">Confirmation: {reservation.confirmationNumber}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  reservation.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {reservation.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-6 mb-8">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Date</p>
                      <p className="font-semibold text-neutral-900">
                        {new Date(reservation.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Time</p>
                      <p className="font-semibold text-neutral-900">{reservation.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Party Size</p>
                      <p className="font-semibold text-neutral-900">{reservation.partySize} Guests</p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-xl p-6">
                  <h3 className="font-bold text-neutral-900 mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <p className="text-neutral-700">
                      <span className="font-semibold">Name:</span> {reservation.firstName} {reservation.lastName}
                    </p>
                    <p className="text-neutral-700">
                      <span className="font-semibold">Email:</span> {reservation.email}
                    </p>
                    <p className="text-neutral-700">
                      <span className="font-semibold">Phone:</span> {reservation.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setReservation(null)}
                  className="flex-1 px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-colors"
                >
                  Search Again
                </button>
                <button className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg transition-all">
                  Cancel Reservation
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
