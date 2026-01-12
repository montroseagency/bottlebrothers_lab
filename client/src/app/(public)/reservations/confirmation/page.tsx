'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Reservation } from '@/services/api';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get('id');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservation = async () => {
      if (!reservationId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch reservation details from the API
        const response = await fetch(`http://localhost:8000/api/reservations/${reservationId}/`);
        if (!response.ok) {
          throw new Error('Failed to fetch reservation');
        }
        const data = await response.json();
        setReservation(data);
      } catch (err: any) {
        console.error('Error fetching reservation:', err);
        setError(err.message || 'Failed to load reservation details');
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [reservationId]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/20 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your reservation...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/20 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-luxury p-8 md:p-12 text-center"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
                Reservation Confirmed!
              </h1>
              <p className="text-neutral-600 text-lg mb-8">
                Thank you for choosing Bottle Brothers. We're excited to host you!
              </p>

              {reservationId && (
                <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl p-8 mb-8">
                  <p className="text-neutral-600 mb-2">Your Confirmation Number</p>
                  <p className="font-mono text-3xl font-bold text-primary-600 tracking-wider">
                    {reservationId}
                  </p>
                </div>
              )}

              <div className="bg-neutral-50 rounded-xl p-6 mb-8 text-left">
                <h2 className="font-bold text-neutral-900 mb-4 text-xl">What's Next?</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-neutral-900">Check Your Email</p>
                      <p className="text-neutral-600 text-sm">We've sent a confirmation email with all the details</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-neutral-900">SMS Reminder</p>
                      <p className="text-neutral-600 text-sm">You'll receive a text reminder 24 hours before</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/" className="flex-1 px-6 py-4 border-2 border-primary-500 text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-colors text-center">
                  Back to Home
                </Link>
                <Link href="/menu" className="flex-1 px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold shadow-lg transition-all text-center">
                  View Menu
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/20 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-luxury p-8 md:p-12"
          >
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
                Reservation Confirmed!
              </h1>
              <p className="text-neutral-600 text-lg">
                Thank you for choosing Bottle Brothers. We're excited to host you!
              </p>
            </div>

            <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl p-6 mb-6 text-center">
              <p className="text-neutral-600 mb-2">Your Confirmation Code</p>
              <p className="font-mono text-2xl md:text-3xl font-bold text-primary-600 tracking-wider">
                {reservation.verification_code}
              </p>
            </div>

            <div className="bg-neutral-50 rounded-xl p-6 mb-6">
              <h2 className="font-bold text-neutral-900 mb-4 text-lg">Reservation Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">Date</p>
                  <p className="font-semibold text-neutral-900">{formatDate(reservation.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Time</p>
                  <p className="font-semibold text-neutral-900">{formatTime(reservation.time)}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Party Size</p>
                  <p className="font-semibold text-neutral-900">{reservation.party_size} Guests</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Status</p>
                  <p className="font-semibold text-green-600 capitalize">{reservation.status}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-xl p-6 mb-6">
              <h2 className="font-bold text-neutral-900 mb-4 text-lg">Contact Information</h2>
              <div className="space-y-2">
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
                {reservation.special_requests && (
                  <p className="text-neutral-700">
                    <span className="font-semibold">Special Requests:</span> {reservation.special_requests}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-4 mb-8">
              <h3 className="font-bold text-blue-900 mb-2">What's Next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• A confirmation email has been sent to {reservation.email}</li>
                <li>• You'll receive a reminder 24 hours before your reservation</li>
                <li>• Please arrive 10 minutes before your scheduled time</li>
                <li>• To modify or cancel, visit the reservation lookup page</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/" className="flex-1 px-6 py-4 border-2 border-primary-500 text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-colors text-center">
                Back to Home
              </Link>
              <Link href="/reservations/lookup" className="flex-1 px-6 py-4 border-2 border-neutral-300 text-neutral-700 rounded-xl font-bold hover:bg-neutral-50 transition-colors text-center">
                Manage Reservation
              </Link>
              <Link href="/menu" className="flex-1 px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold shadow-lg transition-all text-center">
                View Menu
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
