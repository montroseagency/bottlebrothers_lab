'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient, ReservationFormData } from '@/services/api';

interface ReservationData {
  // Step 1: Date & Time
  date: string;
  time: string;

  // Step 2: Party Size & Occasion
  partySize: number;
  occasion: string;

  // Step 3: Guest Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Step 4: Special Requests
  specialRequests: string;
  dietaryRestrictions: string[];
  seatingPreference: string;
}

const OCCASIONS = [
  'Birthday',
  'Anniversary',
  'Business Meeting',
  'Date Night',
  'Celebration',
  'Just Dining',
  'Other'
];

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut Allergy',
  'Other'
];

const SEATING_PREFERENCES = [
  'No Preference',
  'Window Seat',
  'Quiet Area',
  'Bar Area',
  'Outdoor/Patio',
  'VIP Section'
];

export default function ReservationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservationData, setReservationData] = useState<ReservationData>({
    date: '',
    time: '',
    partySize: 2,
    occasion: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    dietaryRestrictions: [],
    seatingPreference: 'No Preference'
  });

  // Pre-fill form from URL query parameters (from Quick Reservation)
  // and auto-skip to step 3 (personal info) if all data is provided
  useEffect(() => {
    const dateParam = searchParams.get('date');
    const timeParam = searchParams.get('time');
    const guestsParam = searchParams.get('guests');

    if (dateParam && timeParam && guestsParam) {
      // All data provided - pre-fill and skip to step 3 (personal info)
      setReservationData(prev => ({
        ...prev,
        date: dateParam,
        time: convertTimeToDisplay(timeParam),
        partySize: parseInt(guestsParam)
      }));
      setCurrentStep(3); // Skip to personal info step
    } else if (dateParam || timeParam || guestsParam) {
      // Partial data - just pre-fill
      setReservationData(prev => ({
        ...prev,
        date: dateParam || prev.date,
        time: timeParam ? convertTimeToDisplay(timeParam) : prev.time,
        partySize: guestsParam ? parseInt(guestsParam) : prev.partySize
      }));
    }
  }, [searchParams]);

  // Convert 24h time format (17:00) to display format (5:00 PM)
  const convertTimeToDisplay = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    if (isNaN(hours)) return time24;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const totalSteps = 5;

  const updateData = (updates: Partial<ReservationData>) => {
    setReservationData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert time from "7:00 PM" format to "19:00" format for API
      const convertTime = (timeStr: string): string => {
        const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!match) return timeStr;
        let hours = parseInt(match[1]);
        const minutes = match[2];
        const period = match[3].toUpperCase();
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
      };

      // Prepare API data
      const apiData: ReservationFormData = {
        first_name: reservationData.firstName,
        last_name: reservationData.lastName,
        email: reservationData.email,
        phone: reservationData.phone,
        date: reservationData.date,
        time: convertTime(reservationData.time),
        party_size: reservationData.partySize,
        occasion: reservationData.occasion || undefined,
        special_requests: reservationData.specialRequests || undefined,
        dietary_restrictions: reservationData.dietaryRestrictions.length > 0
          ? reservationData.dietaryRestrictions.join(', ')
          : undefined,
      };

      // Call the API
      const result = await apiClient.createReservation(apiData);

      // Redirect to confirmation page with reservation ID
      router.push(`/reservations/confirmation?id=${result.id}`);
    } catch (err: any) {
      console.error('Error submitting reservation:', err);
      setError(err.message || 'Failed to submit reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDietaryRestriction = (restriction: string) => {
    setReservationData(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }));
  };

  // Generate available time slots
  const timeSlots = [
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
    '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
    '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM'
  ];

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return reservationData.date && reservationData.time;
      case 2:
        return reservationData.partySize > 0;
      case 3:
        return reservationData.firstName && reservationData.lastName &&
               reservationData.email && reservationData.phone;
      case 4:
        return true; // Optional step
      case 5:
        return true; // Review step
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/20 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Reserve Your Table
          </h1>
          <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
            Book your experience at Bottle Brothers in just a few simple steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-4">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                      step < currentStep
                        ? 'bg-green-500 text-white'
                        : step === currentStep
                        ? 'bg-primary-500 text-white shadow-glow'
                        : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    {step < currentStep ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  <span className={`text-xs mt-2 hidden sm:block ${
                    step === currentStep ? 'text-primary-600 font-semibold' : 'text-neutral-500'
                  }`}>
                    {step === 1 && 'Date & Time'}
                    {step === 2 && 'Party Size'}
                    {step === 3 && 'Your Info'}
                    {step === 4 && 'Preferences'}
                    {step === 5 && 'Review'}
                  </span>
                </div>
                {step < totalSteps && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                      step < currentStep ? 'bg-green-500' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-luxury p-8 md:p-12">
            <AnimatePresence mode="wait">
              {/* Step 1: Date & Time */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-display text-3xl font-bold text-neutral-900 mb-6">
                    Select Date & Time
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-3">
                        Reservation Date *
                      </label>
                      <input
                        type="date"
                        value={reservationData.date}
                        onChange={(e) => updateData({ date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-4 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-3">
                        Preferred Time *
                      </label>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => updateData({ time: slot })}
                            className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                              reservationData.time === slot
                                ? 'bg-primary-500 text-white shadow-lg scale-105'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-primary-100 hover:text-primary-700'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Party Size & Occasion */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-display text-3xl font-bold text-neutral-900 mb-6">
                    Party Details
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-3">
                        Number of Guests *
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => updateData({ partySize: Math.max(1, reservationData.partySize - 1) })}
                          className="w-14 h-14 rounded-full bg-neutral-200 hover:bg-neutral-300 font-bold text-2xl transition-colors"
                        >
                          −
                        </button>
                        <div className="flex-1 text-center">
                          <span className="text-5xl font-bold text-primary-600">
                            {reservationData.partySize}
                          </span>
                          <p className="text-neutral-600 mt-1">
                            {reservationData.partySize === 1 ? 'Guest' : 'Guests'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateData({ partySize: Math.min(20, reservationData.partySize + 1) })}
                          className="w-14 h-14 rounded-full bg-neutral-200 hover:bg-neutral-300 font-bold text-2xl transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-3">
                        What's the Occasion? (Optional)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {OCCASIONS.map((occasion) => (
                          <button
                            key={occasion}
                            type="button"
                            onClick={() => updateData({ occasion })}
                            className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                              reservationData.occasion === occasion
                                ? 'bg-primary-500 text-white shadow-lg'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-primary-100 hover:text-primary-700'
                            }`}
                          >
                            {occasion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Guest Details */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-display text-3xl font-bold text-neutral-900 mb-6">
                    Your Information
                  </h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={reservationData.firstName}
                          onChange={(e) => updateData({ firstName: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="John"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={reservationData.lastName}
                          onChange={(e) => updateData({ lastName: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={reservationData.email}
                        onChange={(e) => updateData({ email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={reservationData.phone}
                        onChange={(e) => updateData({ phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Special Requests */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-display text-3xl font-bold text-neutral-900 mb-6">
                    Preferences & Special Requests
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-3">
                        Seating Preference
                      </label>
                      <select
                        value={reservationData.seatingPreference}
                        onChange={(e) => updateData({ seatingPreference: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {SEATING_PREFERENCES.map((pref) => (
                          <option key={pref} value={pref}>{pref}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-3">
                        Dietary Restrictions
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {DIETARY_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => toggleDietaryRestriction(option)}
                            className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                              reservationData.dietaryRestrictions.includes(option)
                                ? 'bg-primary-500 text-white shadow-lg'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-primary-100'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Special Requests or Notes
                      </label>
                      <textarea
                        value={reservationData.specialRequests}
                        onChange={(e) => updateData({ specialRequests: e.target.value })}
                        rows={5}
                        className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        placeholder="Any special requests, allergies, or other notes we should know about..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Review & Confirm */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-display text-3xl font-bold text-neutral-900 mb-6">
                    Review Your Reservation
                  </h2>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl p-6">
                      <h3 className="font-bold text-neutral-900 mb-4 text-lg">Reservation Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-neutral-600">Date</p>
                          <p className="font-semibold text-neutral-900">
                            {new Date(reservationData.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600">Time</p>
                          <p className="font-semibold text-neutral-900">{reservationData.time}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600">Party Size</p>
                          <p className="font-semibold text-neutral-900">
                            {reservationData.partySize} {reservationData.partySize === 1 ? 'Guest' : 'Guests'}
                          </p>
                        </div>
                        {reservationData.occasion && (
                          <div>
                            <p className="text-sm text-neutral-600">Occasion</p>
                            <p className="font-semibold text-neutral-900">{reservationData.occasion}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-neutral-50 rounded-xl p-6">
                      <h3 className="font-bold text-neutral-900 mb-4 text-lg">Contact Information</h3>
                      <div className="space-y-2">
                        <p className="text-neutral-700">
                          <span className="font-semibold">Name:</span> {reservationData.firstName} {reservationData.lastName}
                        </p>
                        <p className="text-neutral-700">
                          <span className="font-semibold">Email:</span> {reservationData.email}
                        </p>
                        <p className="text-neutral-700">
                          <span className="font-semibold">Phone:</span> {reservationData.phone}
                        </p>
                      </div>
                    </div>

                    <div className="bg-neutral-50 rounded-xl p-6">
                      <h3 className="font-bold text-neutral-900 mb-4 text-lg">Preferences</h3>
                      <div className="space-y-2">
                        <p className="text-neutral-700">
                          <span className="font-semibold">Seating:</span> {reservationData.seatingPreference}
                        </p>
                        {reservationData.dietaryRestrictions.length > 0 && (
                          <p className="text-neutral-700">
                            <span className="font-semibold">Dietary:</span> {reservationData.dietaryRestrictions.join(', ')}
                          </p>
                        )}
                        {reservationData.specialRequests && (
                          <p className="text-neutral-700">
                            <span className="font-semibold">Special Requests:</span> {reservationData.specialRequests}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-4">
                      <p className="text-sm text-blue-800">
                        By confirming this reservation, you agree to our cancellation policy.
                        Please cancel at least 24 hours in advance if your plans change.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="flex-1 px-6 py-4 border-2 border-neutral-300 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-colors"
                >
                  Back
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="flex-1 px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm Reservation'}
                </button>
              )}
            </div>

            {/* Lookup Link */}
            <div className="text-center mt-6">
              <Link
                href="/reservations/lookup"
                className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
              >
                Already have a reservation? Look it up →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
