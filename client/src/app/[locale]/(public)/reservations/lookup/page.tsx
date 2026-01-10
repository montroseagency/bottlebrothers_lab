'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Reservation {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  party_size: number;
  occasion: string | null;
  special_requests: string | null;
  status: string;
  verification_code: string;
}

export default function ReservationLookupPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // Pre-fill from URL params
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setVerificationCode(code);
    }
  }, [searchParams]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setReservation(null);

    try {
      const response = await fetch(`${API_BASE_URL}/reservations/lookup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verification_code: verificationCode,
          email: email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setReservation(data.reservation);
      } else {
        setError(data.message || 'Reservation not found');
      }
    } catch {
      setError('Failed to look up reservation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!reservation) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/reservations/cancel/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verification_code: verificationCode,
          email: email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCancelSuccess(true);
        setReservation(null);
        setShowCancelConfirm(false);
      } else {
        setError(data.message || 'Failed to cancel reservation');
      }
    } catch {
      setError('Failed to cancel reservation');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('sq-AL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="max-w-lg mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('reservations.lookup.title', 'Find Your Reservation')}
          </h1>
          <p className="text-gray-400">
            {t('reservations.lookup.subtitle', 'Enter your reservation code and email to view details')}
          </p>
        </div>

        {cancelSuccess ? (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 text-center">
            <svg
              className="w-16 h-16 text-green-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="text-xl font-semibold text-white mb-2">
              {t('reservations.lookup.cancelled', 'Reservation Cancelled')}
            </h2>
            <p className="text-gray-300">
              {t('reservations.lookup.cancelledMessage', 'Your reservation has been cancelled. A confirmation email has been sent.')}
            </p>
          </div>
        ) : !reservation ? (
          <form onSubmit={handleLookup} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('reservations.lookup.code', 'Reservation Code')}
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC12345"
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg
                    text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500
                    focus:border-transparent uppercase tracking-wider text-center text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('reservations.lookup.email', 'Email Address')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg
                    text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500
                    focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black
                  font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? t('common.loading', 'Loading...') : t('reservations.lookup.search', 'Find Reservation')}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    {t('reservations.lookup.reservationCode', 'Reservation Code')}
                  </p>
                  <p className="text-2xl font-bold text-white tracking-wider">
                    {reservation.verification_code}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(
                    reservation.status
                  )}`}
                >
                  {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">{t('reservations.name', 'Name')}</p>
                  <p className="text-white font-medium">
                    {reservation.first_name} {reservation.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">{t('reservations.partySize', 'Party Size')}</p>
                  <p className="text-white font-medium">{reservation.party_size} {t('reservations.guests', 'guests')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">{t('reservations.date', 'Date')}</p>
                  <p className="text-white font-medium">{formatDate(reservation.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">{t('reservations.time', 'Time')}</p>
                  <p className="text-white font-medium">{formatTime(reservation.time)}</p>
                </div>
              </div>

              {reservation.occasion && (
                <div>
                  <p className="text-sm text-gray-400">{t('reservations.occasion', 'Occasion')}</p>
                  <p className="text-white font-medium capitalize">{reservation.occasion}</p>
                </div>
              )}

              {reservation.special_requests && (
                <div>
                  <p className="text-sm text-gray-400">{t('reservations.specialRequests', 'Special Requests')}</p>
                  <p className="text-white">{reservation.special_requests}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {reservation.status === 'confirmed' && (
              <div className="p-6 border-t border-gray-700">
                {showCancelConfirm ? (
                  <div className="space-y-4">
                    <p className="text-center text-gray-300">
                      {t('reservations.lookup.confirmCancel', 'Are you sure you want to cancel this reservation?')}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1 py-2 border border-gray-600 text-gray-300
                          rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        {t('common.no', 'No, Keep It')}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white
                          rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isLoading ? t('common.loading', 'Loading...') : t('common.yes', 'Yes, Cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full py-2 border border-red-500/50 text-red-400
                      rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    {t('reservations.lookup.cancelReservation', 'Cancel Reservation')}
                  </button>
                )}
              </div>
            )}

            {/* Back button */}
            <div className="p-6 pt-0">
              <button
                onClick={() => {
                  setReservation(null);
                  setError(null);
                }}
                className="w-full py-2 text-gray-400 hover:text-white transition-colors"
              >
                {t('reservations.lookup.searchAnother', 'Search for another reservation')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
