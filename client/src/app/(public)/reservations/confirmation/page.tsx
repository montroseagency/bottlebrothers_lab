'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ConfirmationPage() {
  const reservationNumber = 'BB' + Math.random().toString(36).substring(2, 9).toUpperCase();

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

            <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl p-8 mb-8">
              <p className="text-neutral-600 mb-2">Your Confirmation Number</p>
              <p className="font-mono text-3xl font-bold text-primary-600 tracking-wider">
                {reservationNumber}
              </p>
            </div>

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
