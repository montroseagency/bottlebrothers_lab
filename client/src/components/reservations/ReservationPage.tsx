import React, { useState } from 'react';
import  { ReservationForm } from './ReservationForm';
import { ReservationSuccess } from './ReservationSuccess';
import { ReservationLookup } from './ReservationLookup';
import type { Reservation } from '../../services/api';

export const ReservationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'lookup'>('new');
  const [successReservation, setSuccessReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState<string>('');

  const handleReservationSuccess = (reservation: Reservation) => {
    setSuccessReservation(reservation);
    setError('');
  };

  const handleReservationError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccessReservation(null);
  };

  const handleNewReservation = () => {
    setSuccessReservation(null);
    setError('');
    setActiveTab('new');
  };

  if (successReservation) {
    return (
      <div className="min-h-screen bg-stone-50 py-20">
        <ReservationSuccess
          reservation={successReservation}
          onNewReservation={handleNewReservation}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Reserve Your Table
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience exceptional dining in an atmosphere that celebrates the harmony of luxury and natural beauty.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-6 py-3 rounded-md font-medium transition-colors duration-300 ${
                activeTab === 'new'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              New Reservation
            </button>
            <button
              onClick={() => setActiveTab('lookup')}
              className={`px-6 py-3 rounded-md font-medium transition-colors duration-300 ${
                activeTab === 'lookup'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Find Existing Reservation
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'new' ? (
          <ReservationForm
            onSuccess={handleReservationSuccess}
            onError={handleReservationError}
          />
        ) : (
          <ReservationLookup />
        )}
      </div>
    </div>
  );
};