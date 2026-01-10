'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { getMyReservations } from '@/lib/api/clientAuth';

interface Reservation {
  id: string;
  date: string;
  time: string;
  party_size: number;
  status: string;
  occasion: string | null;
  special_requests: string | null;
  verification_code: string;
  created_at: string;
}

type FilterType = 'upcoming' | 'past' | 'cancelled' | 'all';

export default function ReservationsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const { user } = useClientAuth();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(searchParams.get('action') === 'new');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState({
    date: '',
    time: '',
    guests: 2,
    seating: 'inside' as 'inside' | 'outside' | 'vip',
    notes: '',
    occasion: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  const loadReservations = useCallback(async () => {
    setLoading(true);
    try {
      const apiFilter = filter === 'cancelled' ? 'all' : filter;
      const response = await getMyReservations(apiFilter as 'all' | 'upcoming' | 'past');
      if (response.success && response.reservations) {
        let data = response.reservations as Reservation[];
        if (filter === 'cancelled') {
          data = data.filter(r => r.status === 'cancelled');
        }
        setReservations(data);
      }
    } catch {
      // Handle error
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'sq' ? 'sq-AL' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    // Simulate API call - in real app, this would call the backend
    await new Promise(resolve => setTimeout(resolve, 1500));

    setCreateLoading(false);
    setCreateSuccess(true);

    setTimeout(() => {
      setShowCreateModal(false);
      setCreateSuccess(false);
      setCreateForm({
        date: '',
        time: '',
        guests: 2,
        seating: 'inside',
        notes: '',
        occasion: '',
      });
      loadReservations();
    }, 2000);
  };

  const generateICS = (reservation: Reservation) => {
    const startDate = new Date(`${reservation.date}T${reservation.time}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//The Lounge//Reservation//EN
BEGIN:VEVENT
UID:${reservation.verification_code}@thelounge.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Reservation at The Lounge
DESCRIPTION:Reservation for ${reservation.party_size} guests${reservation.occasion ? ` - ${reservation.occasion}` : ''}\\nConfirmation: ${reservation.verification_code}
LOCATION:The Lounge
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reservation-${reservation.verification_code}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'all', label: 'All' },
  ];

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  const occasions = [
    'Birthday', 'Anniversary', 'Business Meeting', 'Date Night', 'Celebration', 'Other'
  ];

  // Skeleton loader
  const SkeletonRow = () => (
    <div className="bg-white rounded-xl border border-gray-200/50 p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gray-200 rounded-xl" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-20" />
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-500">Manage your table bookings</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Reservation
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 ${
              filter === f.key
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                : 'bg-white/80 text-gray-600 hover:bg-gray-100 border border-gray-200/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reservations List */}
      <div className="space-y-3">
        {loading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : reservations.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Reservations Found</h3>
            <p className="text-gray-500 mb-4">
              {filter === 'upcoming' ? "You don't have any upcoming reservations." : `No ${filter} reservations.`}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl"
            >
              Make a Reservation
            </button>
          </div>
        ) : (
          reservations.map((reservation) => (
            <div
              key={reservation.id}
              onClick={() => {
                setSelectedReservation(reservation);
                setShowDetailDrawer(true);
              }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex flex-col items-center justify-center text-amber-700">
                  <span className="text-lg font-bold leading-none">
                    {new Date(reservation.date).getDate()}
                  </span>
                  <span className="text-xs uppercase">
                    {new Date(reservation.date).toLocaleDateString('en', { month: 'short' })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{formatDate(reservation.date)}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{formatTime(reservation.time)}</span>
                    <span>{reservation.party_size} guests</span>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                  {reservation.status}
                </span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Reservation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">New Reservation</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {createSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Reservation Requested!</h3>
                <p className="text-gray-500">We&apos;ll confirm your booking shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateReservation} className="p-6 space-y-5">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={createForm.date}
                    onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <select
                    required
                    value={createForm.time}
                    onChange={(e) => setCreateForm({ ...createForm, time: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, guests: Math.max(1, createForm.guests - 1) })}
                      className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-2xl font-bold text-gray-900 w-12 text-center">{createForm.guests}</span>
                    <button
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, guests: Math.min(20, createForm.guests + 1) })}
                      className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Seating Preference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seating Preference</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['inside', 'outside', 'vip'] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setCreateForm({ ...createForm, seating: option })}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          createForm.seating === option
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Occasion */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Occasion (Optional)</label>
                  <select
                    value={createForm.occasion}
                    onChange={(e) => setCreateForm({ ...createForm, occasion: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select occasion</option>
                    {occasions.map((occ) => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                  <textarea
                    rows={3}
                    placeholder="Any dietary requirements, accessibility needs, or special requests..."
                    value={createForm.notes}
                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Request Reservation'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Reservation Detail Drawer */}
      {showDetailDrawer && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowDetailDrawer(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Reservation Details</h2>
              <button
                onClick={() => setShowDetailDrawer(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Code */}
              <div className="flex items-center justify-between">
                <span className={`px-4 py-1.5 text-sm font-medium rounded-full ${getStatusColor(selectedReservation.status)}`}>
                  {selectedReservation.status.charAt(0).toUpperCase() + selectedReservation.status.slice(1)}
                </span>
                <span className="text-sm font-mono text-gray-500">#{selectedReservation.verification_code}</span>
              </div>

              {/* Date Card */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-amber-600 mb-1">
                  {new Date(selectedReservation.date).getDate()}
                </div>
                <div className="text-lg font-medium text-gray-900">
                  {new Date(selectedReservation.date).toLocaleDateString(locale === 'sq' ? 'sq-AL' : 'en-US', {
                    weekday: 'long',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                <div className="text-2xl font-semibold text-gray-700 mt-2">
                  {formatTime(selectedReservation.time)}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Guests</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedReservation.party_size}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Occasion</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedReservation.occasion || '-'}</p>
                </div>
              </div>

              {/* Special Requests */}
              {selectedReservation.special_requests && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Special Requests</h3>
                  <p className="text-gray-600 bg-gray-50 rounded-xl p-4">{selectedReservation.special_requests}</p>
                </div>
              )}

              {/* QR Code Placeholder */}
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Show this QR code when you arrive</p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => generateICS(selectedReservation)}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Add to Calendar
                </button>

                {selectedReservation.status !== 'cancelled' && selectedReservation.status !== 'completed' && (
                  <button
                    className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors"
                  >
                    Cancel Reservation
                  </button>
                )}
              </div>

              {/* Booking Info */}
              <div className="text-xs text-gray-400 text-center pt-4 border-t border-gray-100">
                Booked on {new Date(selectedReservation.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
