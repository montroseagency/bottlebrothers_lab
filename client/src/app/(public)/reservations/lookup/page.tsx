'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { apiClient, Reservation } from '@/services/api';

export default function LookupPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError(null);
    setReservations([]);

    try {
      const results = await apiClient.lookupReservation(email, phone);
      setReservations(results);
      setHasSearched(true);
    } catch (err: any) {
      console.error('Error searching reservation:', err);
      setError(err.message || 'Failed to find reservation. Please check your details and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCancel = async (reservationId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    setCancellingId(reservationId);
    try {
      await apiClient.cancelReservation(reservationId);
      // Update local state to reflect cancellation
      setReservations(prev =>
        prev.map(r =>
          r.id === reservationId ? { ...r, status: 'cancelled' as const } : r
        )
      );
    } catch (err: any) {
      console.error('Error cancelling reservation:', err);
      alert(err.message || 'Failed to cancel reservation. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    // Handle both "19:00" and "7:00 PM" formats
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'seated':
        return 'bg-purple-100 text-purple-700';
      case 'no_show':
        return 'bg-neutral-100 text-neutral-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const resetSearch = () => {
    setReservations([]);
    setHasSearched(false);
    setError(null);
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
              Look up your reservation using your email and phone number
            </p>
          </div>

          {!hasSearched ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-luxury p-8"
            >
              <form onSubmit={handleSearch} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Email Address *
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

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required
                    className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
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
              className="space-y-6"
            >
              {reservations.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-luxury p-8 text-center">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h2 className="font-display text-xl font-bold text-neutral-900 mb-2">
                    No Reservations Found
                  </h2>
                  <p className="text-neutral-600 mb-6">
                    We couldn't find any reservations matching your email and phone number.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={resetSearch}
                      className="px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-colors"
                    >
                      Search Again
                    </button>
                    <Link
                      href="/reservations"
                      className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold shadow-lg transition-all text-center"
                    >
                      Make a Reservation
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold text-neutral-900">
                      Your Reservations ({reservations.length})
                    </h2>
                    <button
                      onClick={resetSearch}
                      className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                    >
                      Search Again
                    </button>
                  </div>

                  {reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="bg-white rounded-2xl shadow-luxury p-6"
                    >
                      <div className="flex items-center justify-between mb-4 pb-4 border-b">
                        <div>
                          <p className="text-sm text-neutral-600">Reservation ID</p>
                          <p className="font-mono font-bold text-neutral-900">{reservation.id}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(reservation.status)}`}>
                          {reservation.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>

                      <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl p-4 mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-neutral-600 mb-1">Date</p>
                            <p className="font-semibold text-neutral-900">
                              {formatDate(reservation.date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-600 mb-1">Time</p>
                            <p className="font-semibold text-neutral-900">{formatTime(reservation.time)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-600 mb-1">Party Size</p>
                            <p className="font-semibold text-neutral-900">{reservation.party_size} Guests</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-neutral-50 rounded-xl p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <p className="text-neutral-700">
                            <span className="font-semibold">Name:</span> {reservation.first_name} {reservation.last_name}
                          </p>
                          <p className="text-neutral-700">
                            <span className="font-semibold">Email:</span> {reservation.email}
                          </p>
                          <p className="text-neutral-700">
                            <span className="font-semibold">Phone:</span> {reservation.phone}
                          </p>
                          {reservation.occasion && (
                            <p className="text-neutral-700">
                              <span className="font-semibold">Occasion:</span> {reservation.occasion}
                            </p>
                          )}
                        </div>
                        {reservation.special_requests && (
                          <p className="text-neutral-700 mt-2 text-sm">
                            <span className="font-semibold">Special Requests:</span> {reservation.special_requests}
                          </p>
                        )}
                      </div>

                      {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancel(reservation.id)}
                          disabled={cancellingId === reservation.id}
                          className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-50"
                        >
                          {cancellingId === reservation.id ? 'Cancelling...' : 'Cancel Reservation'}
                        </button>
                      )}
                    </div>
                  ))}
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
